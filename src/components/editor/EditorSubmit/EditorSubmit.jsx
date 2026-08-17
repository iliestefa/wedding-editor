import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import {
  PayPalScriptProvider,
  PayPalButtons,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";
import { useEditor } from "../../../context/EditorContext";
import { sendPurchaseEmail, publishToWeddingsApi, updateWeddingApi } from "../../../services/editorService";
import { loadDraftIdentity } from "../../../services/draftIdentity";
import { trackPurchase } from "../../../utils/analyticsEvents";
import { PAYPAL_CLIENT_ID, PUBLISH_PRICE_USD } from "../../../constants/editorConstants";
import "./EditorSubmit.scss";

const STEP = {
  READY: "ready",
  PROCESSING: "processing",
  SUCCESS: "success",
  ERROR: "error",
};

// Área de pago: monta los botones SOLO cuando el SDK ya terminó de cargar.
// Montarlos durante la carga (sumado al doble montaje de React en dev) hace
// que el iframe de PayPal a veces aborte su render y quede en blanco hasta
// el siguiente remontaje — el bug de "sale el precio pero no el botón".
const PayPalArea = ({ createOrder, onApprove, onError }) => {
  const [{ isPending, isRejected, isResolved }] = usePayPalScriptReducer();
  if (isPending) {
    return <p className="editor-submit__paypal-note">Cargando métodos de pago…</p>;
  }
  if (isRejected) {
    return (
      <p className="editor-submit__error-msg">
        No se pudieron cargar los botones de pago. Revisa tu conexión y recarga la página.
      </p>
    );
  }
  if (!isResolved) return null;
  return (
    <PayPalButtons
      style={{ layout: "vertical", label: "pay" }}
      createOrder={createOrder}
      onApprove={onApprove}
      onError={onError}
    />
  );
};

PayPalArea.propTypes = {
  createOrder: PropTypes.func.isRequired,
  onApprove:   PropTypes.func.isRequired,
  onError:     PropTypes.func.isRequired,
};

// Vive dentro del step "Publicar" del editor: la pareja ya llegó acá a
// propósito, así que no hay un botón intermedio — se valida el formulario
// y, si está completo, se muestra directo el precio + botón de PayPal.
// isRepublish=true → la boda ya estaba activa (se llegó por el link de
// editar) y la pareja cambió algo: acá se actualiza gratis, sin PayPal.
const EditorSubmit = ({ onSuccess, isRepublish }) => {
  const { data, templateSlug, clearSavedProgress } = useEditor();
  const [step, setStep] = useState(STEP.READY);
  const [payError, setPayError] = useState("");
  // Si la página vuelve del back-forward cache del navegador, los iframes
  // de PayPal quedan muertos — subir esta key remonta el área de pago.
  const [sdkKey, setSdkKey] = useState(0);

  useEffect(() => {
    const onPageShow = (e) => {
      if (e.persisted) setSdkKey((k) => k + 1);
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  const validate = () => {
    const missing = [];
    if (!data.brideName.trim()) missing.push("Nombre de la novia");
    if (!data.groomName.trim()) missing.push("Nombre del novio");
    if (!data.weddingDateIso.trim()) missing.push("Fecha de la boda");
    // El lugar de ceremonia solo existe en modo "lugares distintos" — los
    // modos "mismo lugar" y "solo recepción" usan únicamente la recepción.
    const eventsMode = data.eventsMode ?? "separate";
    if (eventsMode === "separate" && !data.ceremonyVenueName.trim()) {
      missing.push("Lugar de la ceremonia");
    }
    if (!data.receptionVenueName.trim()) missing.push("Lugar de la recepción");
    // El número de WhatsApp del RSVP no bloquea la publicación: sin número,
    // los botones de confirmar abren WhatsApp genérico (selector de contacto).
    return missing;
  };

  const missingFields = validate();

  const buildEditLink = (slug, token) =>
    token
      ? `${window.location.origin}${import.meta.env.BASE_URL}?template=${templateSlug}&draft=${slug}.${token}`
      : null;

  // Boda ya activa + cambios sin pago: actualiza directo con el mismo
  // slug/token que ya demuestran que es la pareja dueña (sin PayPal).
  const handleUpdate = async () => {
    setStep(STEP.PROCESSING);
    try {
      const identity = loadDraftIdentity(templateSlug);
      if (!identity?.slug || !identity?.token) {
        throw new Error("No se encontró tu invitación publicada en este dispositivo.");
      }
      const updated = await updateWeddingApi(data, identity);
      clearSavedProgress();
      setStep(STEP.SUCCESS);
      onSuccess?.({ ...updated, editLink: buildEditLink(identity.slug, identity.token) });
    } catch (err) {
      setPayError(err?.message || "No se pudo actualizar la invitación.");
      setStep(STEP.ERROR);
    }
  };

  const createOrder = (_data, actions) =>
    actions.order.create({
      // Producto digital: sin esto PayPal pide dirección de envío además
      // de la de facturación (dos veces la misma dirección, sin sentido acá).
      application_context: { shipping_preference: "NO_SHIPPING" },
      purchase_units: [
        {
          description: `Invitación digital — ${data.brideName} & ${data.groomName}`,
          amount: { value: PUBLISH_PRICE_USD, currency_code: "USD" },
        },
      ],
    });

  // El pago ya está aprobado por el pagador acá — igual el engine vuelve a
  // verificarlo server-to-server contra PayPal antes de guardar/activar nada.
  // Entre esto y el SUCCESS hay 3 llamadas de red seguidas (capturar el pago,
  // publicar en el engine, mandar el email) — sin un estado intermedio la
  // pareja se queda mirando el botón de PayPal sin saber si pasa algo.
  const handleApprove = async (_data, actions) => {
    setStep(STEP.PROCESSING);
    try {
      const capture = await actions.order.capture();
      const orderId = capture.id;

      // Si venían de un borrador guardado, el engine reutiliza ese mismo
      // slug en vez de crear una boda duplicada.
      const identity = loadDraftIdentity(templateSlug);
      const published = await publishToWeddingsApi(data, templateSlug, orderId, {
        draftSlug: identity?.slug ?? null,
        draftToken: identity?.token ?? null,
      });
      // El mismo token sigue sirviendo para volver a editar después de
      // publicado — se lo pasamos a PublishedInfo, no se borra.
      const editToken = identity?.token ?? published?.editToken;
      const editLink = buildEditLink(published.slug, editToken);

      // Email a la pareja con sus links (el CC a Wedya configurado en el
      // template hace de aviso interno de venta): va al correo que dejaron
      // al guardar borrador o, si publicaron de corrido, al de PayPal.
      const coupleEmail = identity?.email || published?.payerEmail || "";
      if (coupleEmail) {
        await sendPurchaseEmail({
          email: coupleEmail,
          coupleNames: `${data.brideName} & ${data.groomName}`,
          publicLink: published.previewUrl,
          sheetLink: published.sheetUrl,
          editLink,
        }).catch(() => {
          // El pago y la publicación ya se confirmaron; si este email falla
          // no le mostramos un error de pago a la pareja — los links igual
          // quedan visibles en el dialog de confirmación.
        });
      }

      clearSavedProgress();
      // Pixel de compra: se dispara recién cuando el engine confirmó el pago
      // contra PayPal (no al aprobar en el popup) — con el orderId real.
      trackPurchase({
        value: Number(PUBLISH_PRICE_USD),
        currency: "USD",
        templateSlug,
        orderId,
      });
      setStep(STEP.SUCCESS);
      onSuccess?.({ ...published, editLink });
    } catch (err) {
      const msg = String(err?.message ?? "");
      // Popup cerrado durante la captura: acá sí es ambiguo si el cobro
      // alcanzó a pasar — mensaje claro en vez del error técnico en inglés.
      setPayError(
        /window closed/i.test(msg)
          ? "La ventana de PayPal se cerró antes de terminar. Si el cobro aparece en tu cuenta, escríbenos; si no, intenta de nuevo."
          : msg || "No se pudo confirmar el pago.",
      );
      setStep(STEP.ERROR);
    }
  };

  if (step === STEP.SUCCESS) {
    // Pago nuevo: el dialog de confirmación (con las URLs) lo muestra
    // EditorLayout, acá no va nada más. Actualización de una boda ya
    // publicada: confirmación breve en el lugar del botón.
    if (!isRepublish) return null;
    return (
      <div className="editor-submit editor-submit--repeat">
        <p className="editor-submit__saved-msg">Cambios guardados ✓</p>
      </div>
    );
  }

  if (missingFields.length > 0) {
    return (
      <div className="editor-submit">
        <ul className="editor-submit__errors">
          <li className="editor-submit__errors-title">
            Completa estos campos antes de {isRepublish ? "actualizar" : "publicar"}:
          </li>
          {missingFields.map((f) => (
            <li key={f}>— {f}</li>
          ))}
        </ul>
      </div>
    );
  }

  if (isRepublish) {
    // PublishedInfo (arriba, ver EditorPanel) ya cuenta que está publicada
    // — acá solo va el botón para guardar cambios, sin repetir el mensaje.
    return (
      <div className="editor-submit editor-submit--repeat">
        {step === STEP.ERROR && (
          <p className="editor-submit__error-msg">Error: {payError}</p>
        )}
        {step === STEP.PROCESSING ? (
          <div className="editor-submit__processing">
            <span className="editor-submit__spinner" aria-hidden="true" />
            <p className="editor-submit__processing-text">
              Guardando los cambios de tu invitación…
            </p>
          </div>
        ) : (
          <button type="button" className="editor-submit__update-btn" onClick={handleUpdate}>
            Guardar cambios
          </button>
        )}
      </div>
    );
  }

  const processing = step === STEP.PROCESSING;

  return (
    <div className="editor-submit">
      {step === STEP.ERROR && (
        <p className="editor-submit__error-msg">Error: {payError}</p>
      )}

      {processing && (
        <div className="editor-submit__processing">
          <span className="editor-submit__spinner" aria-hidden="true" />
          <p className="editor-submit__processing-text">
            Confirmando tu pago y publicando tu invitación…
          </p>
          <p className="editor-submit__processing-hint">
            Esto toma unos segundos, no cierres esta ventana.
          </p>
        </div>
      )}

      {PAYPAL_CLIENT_ID ? (
        // OJO: los botones de PayPal se OCULTAN con CSS durante el
        // procesamiento, nunca se desmontan — si se desmontan a mitad de
        // actions.order.capture(), el SDK pierde el canal con su popup y
        // el pago muere con "Window closed before response".
        <div key={sdkKey} className={processing ? "editor-submit__paypal-hidden" : undefined}>
          <PayPalScriptProvider
            options={{
              clientId: PAYPAL_CLIENT_ID,
              currency: "USD",
              intent: "capture",
              locale: "es_EC",
            }}
          >
            <PayPalArea
              createOrder={createOrder}
              onApprove={handleApprove}
              onError={(err) => {
                // El popup se cerró a mitad de camino (equivale a cancelar,
                // no se cobró nada) — se vuelve al inicio sin mensaje de error.
                if (/window closed/i.test(String(err?.message ?? ""))) {
                  setStep(STEP.READY);
                  return;
                }
                setPayError(err?.message || "Error al procesar el pago.");
                setStep(STEP.ERROR);
              }}
            />
          </PayPalScriptProvider>
        </div>
      ) : (
        <p className="editor-submit__error-msg">
          El pago no está configurado. Contacta a Wedya para publicar tu invitación.
        </p>
      )}
    </div>
  );
};

EditorSubmit.propTypes = {
  onSuccess: PropTypes.func,
  isRepublish: PropTypes.bool,
};

EditorSubmit.defaultProps = {
  onSuccess: null,
  isRepublish: false,
};

export default EditorSubmit;

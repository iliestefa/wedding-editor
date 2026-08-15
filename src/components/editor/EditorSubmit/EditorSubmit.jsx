import PropTypes from "prop-types";
import { useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useEditor } from "../../../context/EditorContext";
import { sendEditorData, publishToWeddingsApi } from "../../../services/editorService";
import { trackOrderSubmitted } from "../../../utils/analyticsEvents";
import {
  PAYPAL_CLIENT_ID,
  PUBLISH_PRICE_USD,
  PUBLISH_PRICE_REGULAR_USD,
} from "../../../constants/editorConstants";
import "./EditorSubmit.scss";

const STEP = {
  FORM: "form",
  PAYING: "paying",
  SUCCESS: "success",
  ERROR: "error",
};

const EditorSubmit = ({ onSuccess }) => {
  const { data, templateSlug, clearSavedProgress } = useEditor();
  const [step, setStep] = useState(STEP.FORM);
  const [errors, setErrors] = useState([]);
  const [payError, setPayError] = useState("");

  const validate = () => {
    const missing = [];
    if (!data.brideName.trim()) missing.push("Nombre de la novia");
    if (!data.groomName.trim()) missing.push("Nombre del novio");
    if (!data.weddingDateIso.trim()) missing.push("Fecha de la boda");
    if (!data.ceremonyVenueName.trim()) missing.push("Lugar de la ceremonia");
    if (!data.receptionVenueName.trim()) missing.push("Lugar de la recepción");
    // Sin número, el botón de confirmar por WhatsApp no puede armar el link
    if (data.rsvpType === "whatsapp" && !(data.rsvpWhatsapp ?? "").trim()) {
      missing.push("Número de WhatsApp para confirmaciones (sección RSVP)");
    }
    return missing;
  };

  // "Publicar" solo valida y abre el paso de pago — nada se guarda todavía.
  const handleOpenPayment = () => {
    const missing = validate();
    if (missing.length > 0) {
      setErrors(missing);
      return;
    }
    setErrors([]);
    setPayError("");
    setStep(STEP.PAYING);
  };

  const createOrder = (_data, actions) =>
    actions.order.create({
      purchase_units: [
        {
          description: `Invitación digital — ${data.brideName} & ${data.groomName}`,
          amount: { value: PUBLISH_PRICE_USD, currency_code: "USD" },
        },
      ],
    });

  // El pago ya está aprobado por el pagador acá — igual el engine vuelve a
  // verificarlo server-to-server contra PayPal antes de guardar/activar nada.
  const handleApprove = async (_data, actions) => {
    try {
      const capture = await actions.order.capture();
      const orderId = capture.id;

      const published = await publishToWeddingsApi(data, templateSlug, orderId);
      await sendEditorData(data, { templateSlug, published }).catch(() => {
        // El pago y la publicación ya se confirmaron; si el email de aviso
        // falla, no le mostramos un error de pago a la pareja por eso.
      });

      clearSavedProgress();
      trackOrderSubmitted({ templateSlug });
      setStep(STEP.SUCCESS);
      onSuccess?.(published);
    } catch (err) {
      setPayError(err?.message || "No se pudo confirmar el pago.");
      setStep(STEP.ERROR);
    }
  };

  if (step === STEP.SUCCESS) {
    // El dialog de confirmación (con las URLs) lo muestra EditorLayout — este
    // componente no renderiza nada más una vez publicado.
    return null;
  }

  return (
    <div className="editor-submit">
      {errors.length > 0 && (
        <ul className="editor-submit__errors">
          <li className="editor-submit__errors-title">
            Completa estos campos obligatorios:
          </li>
          {errors.map((e) => (
            <li key={e}>— {e}</li>
          ))}
        </ul>
      )}

      {step === STEP.FORM && (
        <>
          <div className="editor-submit__price">
            <span className="editor-submit__price-regular">
              ${PUBLISH_PRICE_REGULAR_USD}
            </span>
            <span className="editor-submit__price-offer">${PUBLISH_PRICE_USD} USD</span>
          </div>
          <button
            className="editor-submit__btn"
            onClick={handleOpenPayment}
          >
            Publicar
          </button>
        </>
      )}

      {(step === STEP.PAYING || step === STEP.ERROR) && PAYPAL_CLIENT_ID && (
        <div className="editor-submit__paypal">
          {step === STEP.ERROR && (
            <p className="editor-submit__error-msg">Error: {payError}</p>
          )}
          <PayPalScriptProvider
            options={{ clientId: PAYPAL_CLIENT_ID, currency: "USD", intent: "capture" }}
          >
            <PayPalButtons
              style={{ layout: "vertical", label: "pay" }}
              createOrder={createOrder}
              onApprove={handleApprove}
              onCancel={() => setStep(STEP.FORM)}
              onError={(err) => {
                setPayError(err?.message || "Error al procesar el pago.");
                setStep(STEP.ERROR);
              }}
            />
          </PayPalScriptProvider>
          <button
            type="button"
            className="editor-submit__cancel-btn"
            onClick={() => setStep(STEP.FORM)}
          >
            Volver al editor
          </button>
        </div>
      )}

      {(step === STEP.PAYING || step === STEP.ERROR) && !PAYPAL_CLIENT_ID && (
        <p className="editor-submit__error-msg">
          El pago no está configurado. Contacta a Wedya para publicar tu invitación.
        </p>
      )}
    </div>
  );
};

EditorSubmit.propTypes = {
  onSuccess: PropTypes.func,
};

EditorSubmit.defaultProps = {
  onSuccess: null,
};

export default EditorSubmit;

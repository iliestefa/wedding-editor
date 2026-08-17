import emailjs from "@emailjs/browser";
import {
  EMAILJS_SERVICE_ID,
  EMAILJS_DRAFT_TEMPLATE_ID,
  EMAILJS_PURCHASE_TEMPLATE_ID,
  EMAILJS_PUBLIC_KEY,
  WEDDINGS_API,
} from "../constants/editorConstants";

// ─── Borradores ("Guardar y continuar luego") ────────────────────────────────

// Guarda (o actualiza) el borrador en el engine. Con identity {slug, token}
// actualiza ese mismo registro; si el engine ya no lo encuentra (borrado,
// publicado…), reintenta creando uno nuevo para no trabar a la pareja.
export const saveDraftToWeddingsApi = async (
  weddingData,
  templateSlug,
  { slug = null, token = null, email = null } = {},
) => {
  if (!WEDDINGS_API) throw new Error("El guardado no está configurado.");

  const post = async (payload) => {
    const res = await fetch(`${WEDDINGS_API}/api/invitations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.json().catch(() => null);
  };

  const base = { templateSlug, data: weddingData, email };
  let result = await post(slug && token ? { ...base, slug, token } : base);
  if (!result?.ok && slug && token) {
    result = await post(base); // identidad vieja inválida → borrador nuevo
  }
  if (!result?.ok) {
    throw new Error(result?.error || "No se pudo guardar el borrador.");
  }
  return { slug: result.slug, draftToken: result.draftToken };
};

// Consulta el estado de una invitación por el link "continuar editando"
// (?draft=slug.token) — sirve tanto si sigue como borrador (status inactive,
// para cargar sus datos en el editor) como si ya fue publicada (status
// active, con publicUrl/sheetUrl listos para mostrar directo sin editor).
export const fetchStatusFromWeddingsApi = async (slug, token) => {
  if (!WEDDINGS_API || !slug || !token) return null;
  try {
    const res = await fetch(
      `${WEDDINGS_API}/api/invitations/status?slug=${encodeURIComponent(slug)}&token=${encodeURIComponent(token)}`,
    );
    const result = await res.json();
    return result?.ok ? result : null;
  } catch {
    return null;
  }
};

// Email a la pareja con su link para retomar. Requiere un template propio de
// EmailJS (VITE_EMAILJS_DRAFT_TEMPLATE_ID) — sin él, se omite en silencio y
// el link solo se muestra en pantalla.
export const sendDraftLinkEmail = async ({ email, coupleNames, draftLink }) => {
  if (!EMAILJS_SERVICE_ID || !EMAILJS_DRAFT_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    return false;
  }
  await emailjs.send(
    EMAILJS_SERVICE_ID,
    EMAILJS_DRAFT_TEMPLATE_ID,
    { to_email: email, couple_names: coupleNames, draft_link: draftLink },
    EMAILJS_PUBLIC_KEY,
  );
  return true;
};

// Email a la pareja con los links de su invitación recién publicada (sitio,
// RSVP y edición). Requiere su template de EmailJS
// (VITE_EMAILJS_PURCHASE_TEMPLATE_ID) — sin él se omite en silencio y los
// links solo se muestran en el dialog de confirmación.
export const sendPurchaseEmail = async ({
  email,
  coupleNames,
  publicLink,
  sheetLink,
  editLink,
}) => {
  if (!EMAILJS_SERVICE_ID || !EMAILJS_PURCHASE_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    return false;
  }

  // La fila de RSVP solo existe cuando hay hoja de respuestas (RSVP por
  // formulario); por WhatsApp no hay link. EmailJS no soporta condicionales
  // en el template, así que la fila viaja ya armada como HTML — el template
  // la inserta con {{{rsvp_block}}} (triple llave = sin escapar) dentro del
  // card de enlaces, con los mismos estilos de las otras filas.
  const rsvpBlock = sheetLink
    ? `<div style="font-family:'Lato','Helvetica Neue',Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:1px;color:#a88b78;text-transform:uppercase;padding-top:14px;">
        Respuestas de sus invitados (RSVP)
      </div>
      <div style="font-family:'Lato','Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;line-height:1.5;padding-top:3px;word-break:break-all;">
        <a href="${sheetLink}" target="_blank" style="color:#8a6a2f;">${sheetLink}</a>
      </div>`
    : "";

  await emailjs.send(
    EMAILJS_SERVICE_ID,
    EMAILJS_PURCHASE_TEMPLATE_ID,
    {
      to_email: email,
      couple_names: coupleNames,
      public_link: publicLink,
      edit_link: editLink ?? "",
      rsvp_block: rsvpBlock,
    },
    EMAILJS_PUBLIC_KEY,
  );
  return true;
};

// Confirma el pago (orderId de PayPal ya aprobado por el pagador) y publica
// la invitación: el engine verifica el pago contra PayPal server-to-server,
// y si es válido guarda + activa la boda + arma la hoja de RSVP. A diferencia
// del guardado viejo (borrador sin pagar), acá SÍ propagamos el error — si el
// pago no se puede verificar, el editor debe saberlo y avisarle a la pareja.
export const publishToWeddingsApi = async (
  weddingData,
  templateSlug,
  orderId,
  { draftSlug = null, draftToken = null } = {},
) => {
  if (!WEDDINGS_API) throw new Error("El servicio de publicación no está configurado.");

  const res = await fetch(`${WEDDINGS_API}/api/invitations/publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ templateSlug, data: weddingData, orderId, draftSlug, draftToken }),
  });
  const result = await res.json().catch(() => null);
  if (!result?.ok) {
    throw new Error(result?.error || "No se pudo confirmar la publicación.");
  }
  return {
    slug: result.slug,
    previewUrl: result.previewUrl,
    sheetUrl: result.sheetUrl,
    editToken: result.editToken,
    payerName: result.payerName,
    payerEmail: result.payerEmail,
  };
};

// Actualiza una invitación YA PUBLICADA (sin volver a cobrar) — usa el mismo
// slug+token que ya demuestran que es la pareja dueña.
export const updateWeddingApi = async (weddingData, { slug, token }) => {
  if (!WEDDINGS_API) throw new Error("El servicio de actualización no está configurado.");

  const res = await fetch(`${WEDDINGS_API}/api/invitations/update`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug, token, data: weddingData }),
  });
  const result = await res.json().catch(() => null);
  if (!result?.ok) {
    throw new Error(result?.error || "No se pudo actualizar la invitación.");
  }
  return { slug: result.slug, previewUrl: result.previewUrl, sheetUrl: result.sheetUrl };
};

// ─── (eliminado) Aviso interno a Wedya ───────────────────────────────────────
// El viejo sendEditorData (template "contacto" de EmailJS, con el dump de
// datos) se retiró: el engine ya guarda todo al publicar, PayPal avisa cada
// venta, y el CC a Wedya en el template post-compra cubre el aviso con links.

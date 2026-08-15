import emailjs from "@emailjs/browser";
import {
  EMAILJS_SERVICE_ID,
  EMAILJS_TEMPLATE_ID,
  EMAILJS_PUBLIC_KEY,
  WEDDINGS_API,
} from "../constants/editorConstants";

// Confirma el pago (orderId de PayPal ya aprobado por el pagador) y publica
// la invitación: el engine verifica el pago contra PayPal server-to-server,
// y si es válido guarda + activa la boda + arma la hoja de RSVP. A diferencia
// del guardado viejo (borrador sin pagar), acá SÍ propagamos el error — si el
// pago no se puede verificar, el editor debe saberlo y avisarle a la pareja.
export const publishToWeddingsApi = async (weddingData, templateSlug, orderId) => {
  if (!WEDDINGS_API) throw new Error("El servicio de publicación no está configurado.");

  const res = await fetch(`${WEDDINGS_API}/api/invitations/publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ templateSlug, data: weddingData, orderId }),
  });
  const result = await res.json().catch(() => null);
  if (!result?.ok) {
    throw new Error(result?.error || "No se pudo confirmar la publicación.");
  }
  return { slug: result.slug, previewUrl: result.previewUrl, sheetUrl: result.sheetUrl };
};

// Identificador único del cliente: "Sofía" + "Alejandro" → "sofiayalejandro".
// Lo usan el RSVP universal (nombre de la hoja de respuestas) y, a futuro,
// la URL de la invitación publicada.
export const buildWeddingSlug = (brideName = "", groomName = "") =>
  `${brideName}y${groomName}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita tildes
    .replace(/[^a-z0-9]/g, "");

// Converts the editor data into a weddingConstants.js file string
const buildConstantsFile = (d, templateSlug = "") => {
  const j = (v) => JSON.stringify(v, null, 2);
  const s = (v) => JSON.stringify(v);
  const isElegant = templateSlug === "elegant";

  const imagesBlock = isElegant
    ? `export const IMAGE_HERO = ${s(d.imageHero)};
export const IMAGE_CEREMONY = ${s(d.imageCeremony)};
export const IMAGE_DRESSCODE_WOMEN = ${s(d.imageDressCodeWomen)};
export const IMAGE_DRESSCODE_MEN = ${s(d.imageDressCodeMen)};`
    : `export const IMAGE_HERO = ${s(d.imageHero)};
export const IMAGE_STORY = ${s(d.imageStory)};
export const IMAGE_DRESS_CODE = ${s(d.imageDressCode)};
export const IMAGE_RINGS = ${s(d.imageRings)};`;

  return `// ─── Pareja ───────────────────────────────────────────────────────────────────
export const BRIDE_NAME = ${s(d.brideName)};
export const GROOM_NAME = ${s(d.groomName)};
export const COUPLE_NAMES = \`\${BRIDE_NAME} & \${GROOM_NAME}\`;

// Identificador único del cliente — lo usa el RSVP universal para crear su
// hoja de respuestas (y a futuro, la URL de la invitación publicada).
export const WEDDING_SLUG = ${s(buildWeddingSlug(d.brideName, d.groomName))};

// ─── Fecha ────────────────────────────────────────────────────────────────────
export const WEDDING_DATE_ISO = ${s(d.weddingDateIso)};
export const WEDDING_DATE_DISPLAY = ${s(d.weddingDateDisplay)};
export const WEDDING_YEAR = ${s(d.weddingDateIso?.split("-")[0] ?? "")};

// ─── Eventos ──────────────────────────────────────────────────────────────────
// 'separate' (lugares distintos) | 'same' (mismo lugar) | 'reception-only' (solo recepción)
export const EVENTS_MODE = ${s(d.eventsMode ?? "separate")};

// ─── Ceremonia ────────────────────────────────────────────────────────────────
export const CEREMONY_TIME = ${s(d.ceremonyTime)};
export const CEREMONY_VENUE_NAME = ${s(d.ceremonyVenueName)};
export const CEREMONY_VENUE_ADDRESS = ${s(d.ceremonyVenueAddress)};
export const CEREMONY_MAPS_LINK = ${s(d.ceremonyMapsLink)};
export const CEREMONY_MAPS_EMBED_SRC = ${s(d.ceremonyMapsEmbedSrc)};

// ─── Recepción ────────────────────────────────────────────────────────────────
export const RECEPTION_TIME = ${s(d.receptionTime)};
export const RECEPTION_VENUE_NAME = ${s(d.receptionVenueName)};
export const RECEPTION_VENUE_ADDRESS = ${s(d.receptionVenueAddress)};
export const RECEPTION_MAPS_LINK = ${s(d.receptionMapsLink)};
export const RECEPTION_MAPS_EMBED_SRC = ${s(d.receptionMapsEmbedSrc)};

// ─── Historia ─────────────────────────────────────────────────────────────────
export const STORY_INTRO = ${s(d.storyIntro)};

export const STORY_ITEMS = ${j(d.storyItems)};

// ─── Cronograma ───────────────────────────────────────────────────────────────
export const SCHEDULE_INTRO = ${s(d.scheduleIntro ?? "")};

export const SCHEDULE_ITEMS = ${j(d.scheduleItems)};

// ─── Dress Code ───────────────────────────────────────────────────────────────
export const DRESS_CODE_STYLE = ${s(d.dressCodeStyle)};
export const DRESS_CODE_DESCRIPTION = ${s(d.dressCodeDescription)};
export const DRESS_CODE_WOMEN = ${s(d.dressCodeWomen)};
export const DRESS_CODE_MEN = ${s(d.dressCodeMen)};

export const DRESS_CODE_PALETTE = ${j(d.dressCodePalette)};

// ─── Cuentas para Regalo ──────────────────────────────────────────────────────
export const GIFT_REGISTRY_INTRO = ${s(d.giftRegistryIntro)};

export const BANK_ACCOUNTS = ${j(d.bankAccounts)};

// ─── RSVP ─────────────────────────────────────────────────────────────────────
export const RSVP_DEADLINE = ${s(d.rsvpDeadline)};

// 'whatsapp' (mensaje al número) | 'sheets' (formulario → Google Sheets)
export const RSVP_TYPE = ${s(d.rsvpType ?? "sheets")};
export const RSVP_WHATSAPP = ${s(d.rsvpWhatsapp ?? "")};

// 'free' (acompañantes libres, un solo link) | 'limited' (un link por cupo: ?cupos=N)
export const RSVP_COMPANIONS_MODE = ${s(d.rsvpCompanionsMode ?? "free")};
export const RSVP_CUPOS = ${JSON.stringify(d.rsvpCupos ?? [])};

export const RSVP_QUESTIONS = ${j(d.rsvpQuestions ?? [])};

export const RSVP_GUESTS = [];

// ─── Footer ───────────────────────────────────────────────────────────────────
export const FOOTER_MESSAGE = ${s(d.footerMessage)};

// ─── Paleta de colores ────────────────────────────────────────────────────────
// null → paleta original de la plantilla; si no: { id, bg, accent, text }
// (el resto de tonos se derivan solos — ver src/utils/palettes.js)
export const COLOR_PALETTE = ${j(d.colorPalette ?? null)};

// ─── Imágenes ─────────────────────────────────────────────────────────────────
${imagesBlock}
`;
};

// Envía el email de notificación a Wedya. `published` es el resultado de
// publishToWeddingsApi (slug/previewUrl/sheetUrl) cuando el pago ya se
// verificó — si es null, el email se manda igual pero sin esa info.
export const sendEditorData = async (
  weddingData,
  { templateSlug = "", published = null } = {},
) => {
  const { brideName, groomName } = weddingData;

  const templateParams = {
    to_email: "developer@iliestefa.com",
    subject: `Nueva boda pagada — ${brideName} & ${groomName}`,
    bride_name: brideName,
    groom_name: groomName,
    wedding_date: weddingData.weddingDateDisplay,
    // El template de EmailJS espera esta key; se deja fija ya que el editor
    // ahora tiene un único flujo (sin ?order= ni distinción de pedido).
    order: "editor",
    extra_notes: [
      weddingData.extraNotes || "(sin notas adicionales)",
      published
        ? `\n— Publicado: slug "${published.slug}" · sitio: ${published.previewUrl}` +
          (published.sheetUrl ? ` · RSVP: ${published.sheetUrl}` : "")
        : "",
    ].join(""),
    constants_file: buildConstantsFile(weddingData, templateSlug),
    data_json: JSON.stringify(weddingData, null, 2),
  };

  const emailConfigured =
    EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY;

  if (emailConfigured) {
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY,
    );
  } else if (import.meta.env.DEV) {
    // Las claves de EmailJS viven en GitHub Actions; en local se omite el envío
    console.warn('[editor] EmailJS sin configurar — envío omitido en desarrollo', templateParams);
  } else {
    throw new Error('El servicio de envío no está configurado.');
  }

  // La pareja ve su link de preview (y de RSVP) en el dialog de confirmación
  return published;
};

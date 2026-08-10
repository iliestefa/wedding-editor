import emailjs from "@emailjs/browser";
import {
  EMAILJS_SERVICE_ID,
  EMAILJS_TEMPLATE_ID,
  EMAILJS_PUBLIC_KEY,
  SHOPIFY_DOMAIN,
  SHOPIFY_VARIANTS,
} from "../constants/editorConstants";

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

// ─── Imágenes ─────────────────────────────────────────────────────────────────
${imagesBlock}
`;
};

export const buildShopifyCartUrl = (templateSlug, client = "") => {
  const variantId = SHOPIFY_VARIANTS[templateSlug];
  if (!variantId) return null;
  const base = `${SHOPIFY_DOMAIN}/cart/${variantId}:1`;
  if (!client) return base;
  return `${base}?note=${encodeURIComponent(client)}`;
};

export const sendEditorData = async (
  weddingData,
  { order = "", client = "", templateSlug = "" } = {},
) => {
  const { brideName, groomName } = weddingData;
  const identifier = order || (client ? `cliente-${client}` : "editor-libre");

  const templateParams = {
    to_email: "developer@iliestefa.com",
    subject: `Datos de boda — ${brideName} & ${groomName} [order: ${identifier}]`,
    bride_name: brideName,
    groom_name: groomName,
    wedding_date: weddingData.weddingDateDisplay,
    order: identifier,
    extra_notes: weddingData.extraNotes || "(sin notas adicionales)",
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

  if (client) {
    const cartUrl = buildShopifyCartUrl(templateSlug, client);
    if (cartUrl) window.location.href = cartUrl;
  }
};

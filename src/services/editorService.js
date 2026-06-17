import emailjs from "@emailjs/browser";
import {
  EMAILJS_SERVICE_ID,
  EMAILJS_TEMPLATE_ID,
  EMAILJS_PUBLIC_KEY,
  SHOPIFY_DOMAIN,
  SHOPIFY_VARIANTS,
} from "../constants/editorConstants";

// ── Animated template constants file ─────────────────────────────────────────
const buildAnimatedConstantsFile = (d) => {
  const s = (v) => JSON.stringify(v);
  const j = (v) => JSON.stringify(v, null, 2);

  return `// ─── config.js ────────────────────────────────────────────────────────────────
export const GROOM = ${s(d.groomName)};
export const BRIDE = ${s(d.brideName)};
export const COUPLE = \`\${GROOM} & \${BRIDE}\`;
export const COUPLE_ES = \`\${GROOM} y \${BRIDE}\`;
export const INITIALS = \`\${GROOM[0].toUpperCase()}&\${BRIDE[0].toUpperCase()}\`;
export const INITIALS_DISPLAY = \`\${GROOM[0].toUpperCase()} & \${BRIDE[0].toUpperCase()}\`;

// ─── Datos de boda (reemplaza los campos en i18n.js > translations.es) ────────
// phrase:           ${s(d.phrase)}
// ourSong:          ${s(d.songName)}
// story:            ${s(d.story)}
// storyBy:          ${s(d.storyBy)}
// venueName:        ${s(d.venueName)}
// venueAddr:        ${s(d.venueAddr)}
// mapsUrl:          ${s(d.mapsUrl)}
// ceremonyTime:     ${s(d.ceremonyTime)}
// receptionTime:    ${s(d.receptionTime)}
// verse:            ${s(d.verse)}
// giftsContent:     ${s(d.giftsContent)}
// photographyContent: ${s(d.photographyContent)}

// ─── Itinerario ───────────────────────────────────────────────────────────────
// itineraryItems: ${j(d.itineraryItems)}

// ─── Código de vestimenta ─────────────────────────────────────────────────────
// dressCodeItems: ${j(d.dressCodeItems)}

// ─── Secciones adicionales (goodToKnowItems) ──────────────────────────────────
// goodToKnowItems: ${j(d.goodToKnowItems)}

// ─── Imágenes ─────────────────────────────────────────────────────────────────
// imageHero:      ${s(d.imageHero)}
// imageEvent:     ${s(d.imageEvent)}
// imageItinerary: ${s(d.imageItinerary)}
// imageClosing:   ${s(d.imageClosing)}

// ─── Fecha ────────────────────────────────────────────────────────────────────
// weddingDateIso:     ${s(d.weddingDateIso)}
// weddingDateDisplay: ${s(d.weddingDateDisplay)}
// weddingTime:        ${s(d.weddingTime)}
`;
};

// ── Soho / Elegant constants file ─────────────────────────────────────────────
const buildConstantsFile = (d, templateSlug) => {
  if (templateSlug === 'animated') return buildAnimatedConstantsFile(d);

  const j = (v) => JSON.stringify(v, null, 2);
  const s = (v) => JSON.stringify(v);

  return `// ─── Pareja ───────────────────────────────────────────────────────────────────
export const BRIDE_NAME = ${s(d.brideName)};
export const GROOM_NAME = ${s(d.groomName)};
export const COUPLE_NAMES = \`\${BRIDE_NAME} & \${GROOM_NAME}\`;

// ─── Fecha ────────────────────────────────────────────────────────────────────
export const WEDDING_DATE_ISO = ${s(d.weddingDateIso)};
export const WEDDING_DATE_DISPLAY = ${s(d.weddingDateDisplay)};
export const WEDDING_YEAR = ${s(d.weddingDateIso?.split("-")[0] ?? "")};

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

// ─── Footer ───────────────────────────────────────────────────────────────────
export const FOOTER_MESSAGE = ${s(d.footerMessage)};

// ─── Imágenes ─────────────────────────────────────────────────────────────────
export const IMAGE_HERO = ${s(d.imageHero)};
export const IMAGE_STORY = ${s(d.imageStory)};
export const IMAGE_DRESS_CODE = ${s(d.imageDressCode)};
export const IMAGE_RINGS = ${s(d.imageRings)};
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
  const identifier = order || (client ? `cliente-${client}` : "");

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

  await emailjs.send(
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID,
    templateParams,
    EMAILJS_PUBLIC_KEY,
  );

  if (client) {
    const cartUrl = buildShopifyCartUrl(templateSlug, client);
    if (cartUrl) window.location.href = cartUrl;
  }
};

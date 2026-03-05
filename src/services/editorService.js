import emailjs from '@emailjs/browser';
import { EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY } from '../constants/editorConstants';

// Converts the editor data into a weddingConstants.js file string
const buildConstantsFile = (d) => {
  const j = (v) => JSON.stringify(v, null, 2);
  const s = (v) => JSON.stringify(v);

  return `// ─── Pareja ───────────────────────────────────────────────────────────────────
export const BRIDE_NAME = ${s(d.brideName)};
export const GROOM_NAME = ${s(d.groomName)};
export const COUPLE_NAMES = \`\${BRIDE_NAME} & \${GROOM_NAME}\`;

// ─── Fecha ────────────────────────────────────────────────────────────────────
export const WEDDING_DATE_ISO = ${s(d.weddingDateIso)};
export const WEDDING_DATE_DISPLAY = ${s(d.weddingDateDisplay)};
export const WEDDING_YEAR = ${s(d.weddingDateIso?.split('-')[0] ?? '')};

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

export const sendEditorData = async (weddingData) => {
  const { brideName, groomName } = weddingData;

  const templateParams = {
    to_email:       'developer@iliestefa.com',
    subject:        `Datos de boda — ${brideName} & ${groomName}`,
    bride_name:     brideName,
    groom_name:     groomName,
    wedding_date:   weddingData.weddingDateDisplay,
    extra_notes:    weddingData.extraNotes || '(sin notas adicionales)',
    constants_file: buildConstantsFile(weddingData),
    data_json:      JSON.stringify(weddingData, null, 2),
  };

  await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY);
};

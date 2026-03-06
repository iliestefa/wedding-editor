// ─── Default values for Elegant template (Champagne & Charcoal) ──────────────

export const BRIDE_NAME    = 'Sofía';
export const GROOM_NAME    = 'Alejandro';
export const COUPLE_NAMES  = `${BRIDE_NAME} & ${GROOM_NAME}`;

export const WEDDING_DATE_ISO     = '2026-09-05';
export const WEDDING_DATE_DISPLAY = '05 · 09 · 2026';
export const WEDDING_YEAR         = '2026';

export const CEREMONY_TIME           = '17:00 hrs';
export const CEREMONY_VENUE_NAME     = 'Iglesia del Pilar';
export const CEREMONY_VENUE_ADDRESS  = 'Junín 1904, Recoleta, Buenos Aires';
export const CEREMONY_MAPS_LINK      = 'https://maps.google.com/?q=Iglesia+Nuestra+Señora+del+Pilar+Buenos+Aires';
export const CEREMONY_MAPS_EMBED_SRC = 'https://maps.google.com/maps?q=Iglesia+Nuestra+Se%C3%B1ora+del+Pilar+Buenos+Aires&output=embed&hl=es';

export const RECEPTION_TIME           = '20:00 hrs';
export const RECEPTION_VENUE_NAME     = 'Palacio Duhau';
export const RECEPTION_VENUE_ADDRESS  = 'Av. Alvear 1661, Recoleta, Buenos Aires';
export const RECEPTION_MAPS_LINK      = 'https://maps.google.com/?q=Palacio+Duhau+Park+Hyatt+Buenos+Aires';
export const RECEPTION_MAPS_EMBED_SRC = 'https://maps.google.com/maps?q=Palacio+Duhau+Park+Hyatt+Buenos+Aires&output=embed&hl=es';

export const SCHEDULE_ITEMS = [
  { id: 'llegada',   time: '16:30', label: 'Llegada',             detail: 'Les esperamos en la puerta de la iglesia.' },
  { id: 'ceremonia', time: '17:00', label: 'Ceremonia',           detail: 'Iglesia del Pilar, Recoleta.' },
  { id: 'fotos',     time: '18:30', label: 'Sesión de fotos',     detail: 'Jardines del Pilar.' },
  { id: 'recepcion', time: '20:00', label: 'Recepción & Cóctel',  detail: 'Palacio Duhau.' },
  { id: 'cena',      time: '21:30', label: 'Cena de gala',        detail: 'Salón principal.' },
  { id: 'baile',     time: '23:30', label: 'Celebración & Baile', detail: '¡A disfrutar!' },
];

export const DRESS_CODE_STYLE       = 'Black Tie Optional';
export const DRESS_CODE_DESCRIPTION = 'Les pedimos acompañar la noche con elegancia. Tonos oscuros y neutros profundos. Por favor evitar el blanco.';
export const DRESS_CODE_WOMEN       = 'Vestido largo o de cóctel en negro, champagne, burdeos o azul noche.';
export const DRESS_CODE_MEN         = 'Traje oscuro o smoking. Negro, grafito, azul marino o burdeos.';

export const DRESS_CODE_PALETTE = [
  { id: 'black',     label: 'Negro',     hex: '#1c1917' },
  { id: 'champagne', label: 'Champagne', hex: '#e8d5b0' },
  { id: 'burgundy',  label: 'Burdeos',   hex: '#6b2737' },
  { id: 'navy',      label: 'Navy',      hex: '#1a2744' },
  { id: 'graphite',  label: 'Grafito',   hex: '#3d3d3d' },
  { id: 'gold',      label: 'Dorado',    hex: '#c9a96e' },
];

export const GIFT_REGISTRY_INTRO = 'Su presencia es nuestro mayor regalo. Si desean obsequiarnos algo, aquí encontrarán nuestras cuentas.';

export const BANK_ACCOUNTS = [
  { id: 'sofia',     ownerName: 'Sofía Morales',   bankName: 'Banco Pichincha', accountType: 'Cuenta de Ahorros', accountAlias: 'sofia.morales',   cbu: '2200123456789012', accountNumberLabel: 'N° de Cuenta' },
  { id: 'alejandro', ownerName: 'Alejandro Gómez', bankName: 'Banco Guayaquil', accountType: 'Cuenta Corriente',  accountAlias: 'alejandro.gomez', cbu: '0200987654321098', accountNumberLabel: 'N° de Cuenta' },
];

export const RSVP_DEADLINE  = '01 de Julio 2026';
export const FOOTER_MESSAGE = 'Con amor, los esperamos.';

export const IMAGE_HERO            = 'https://img.freepik.com/foto-gratis/novio-que-pone-anillo-dedo-novia_1157-338.jpg?t=st=1772822982~exp=1772826582~hmac=69276d26dd1f8a21be1b300de13a60172ee022edbae4cda18a40b75e5a36cf4a&w=1480';
export const IMAGE_CEREMONY        = 'https://images.unsplash.com/photo-1606216840721-aeb5c80ad67e?w=900&q=80&auto=format&fit=crop';
export const IMAGE_DRESSCODE_WOMEN = 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=1200&q=90&auto=format&fit=crop';
export const IMAGE_DRESSCODE_MEN   = 'https://img.freepik.com/foto-gratis/traje-novio-primer-plano_1303-10568.jpg?t=st=1772823100~exp=1772826700~hmac=3a581b62d68541e41ddb3da75b1db7cb117c84588115cfd2202f2779f9a48e24&w=1060';

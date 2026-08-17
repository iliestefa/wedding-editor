// ─── Token validation ────────────────────────────────────────────────────────
// Tokens are injected at build time via GitHub Actions secret: VITE_VALID_TOKENS
// Format in secret: "token1,token2,token3" (comma-separated, no spaces)
const rawTokens = import.meta.env.VITE_VALID_TOKENS ?? 'dev-token';
export const VALID_TOKENS = rawTokens.split(',').map((t) => t.trim()).filter(Boolean);

// ─── Contacto Wedya (canales para leads del editor libre) ────────────────────
export const WEDYA_WHATSAPP = '593998771032';
export const WEDYA_INSTAGRAM = 'wedya.digital';
export const WEDYA_TIKTOK = 'wedya.digital';

// ─── EmailJS ─────────────────────────────────────────────────────────────────
// Set these in GitHub Actions secrets or .env.local for development
export const EMAILJS_SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID  ?? '';
export const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID ?? '';
export const EMAILJS_PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY  ?? '';
// Template del email "continúa editando tu invitación" (va a la pareja, no a
// Wedya). Campos que espera: {{to_email}}, {{couple_names}}, {{draft_link}}.
// Vacío → el link solo se muestra en pantalla, sin email.
export const EMAILJS_DRAFT_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_DRAFT_TEMPLATE_ID ?? '';

// Worker de invitaciones (Fase 2) — guarda los datos y devuelve la URL de
// preview de la pareja. Vacío → se omite (el email sigue siendo el respaldo).
export const WEDDINGS_API = import.meta.env.VITE_WEDDINGS_API ?? '';

export const UPLOAD_ENDPOINT = import.meta.env.VITE_UPLOAD_ENDPOINT ?? '';
export const UPLOAD_KEY      = import.meta.env.VITE_UPLOAD_KEY      ?? '';

// ─── Pago (PayPal) ───────────────────────────────────────────────────────────
// Client ID público de la app "Live" en developer.paypal.com — no es secreto,
// viaja en el bundle del navegador (el SDK de PayPal lo requiere así).
export const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID ?? '';
export const PUBLISH_PRICE_USD = '65.00';
export const PUBLISH_PRICE_REGULAR_USD = '75.00';

// ─── Analytics ───────────────────────────────────────────────────────────────
// Set these in GitHub Actions secrets or .env.local for development.
// Ambos quedan inactivos si su ID no está definido.
export const GA4_ID        = import.meta.env.VITE_GA4_ID        ?? '';
export const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID ?? '';

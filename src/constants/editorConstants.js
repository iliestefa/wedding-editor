// ─── Token validation ────────────────────────────────────────────────────────
// Tokens are injected at build time via GitHub Actions secret: VITE_VALID_TOKENS
// Format in secret: "token1,token2,token3" (comma-separated, no spaces)
const rawTokens = import.meta.env.VITE_VALID_TOKENS ?? 'dev-token';
export const VALID_TOKENS = rawTokens.split(',').map((t) => t.trim()).filter(Boolean);

// ─── EmailJS ─────────────────────────────────────────────────────────────────
// Set these in GitHub Actions secrets or .env.local for development
export const EMAILJS_SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID  ?? '';
export const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID ?? '';
export const EMAILJS_PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY  ?? '';

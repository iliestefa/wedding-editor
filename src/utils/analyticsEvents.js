// ─── Eventos de analytics (GA4 + Meta Pixel) ────────────────────────────────
// Todos degradan en silencio si gtag/fbq no están cargados (IDs sin definir).

// CONVERSIÓN REAL: pago confirmado por PayPal y invitación publicada.
// Este es el evento que Meta Ads debe usar como objetivo de optimización
// ("Purchase"). Lleva el valor y la moneda reales del cobro, y el orderId
// de PayPal como eventID — así, si un día se agrega la Conversions API del
// lado del servidor, Meta deduplica ambos envíos del mismo pago.
export const trackPurchase = ({
  value = 0,
  currency = 'USD',
  templateSlug = '',
  orderId = '',
} = {}) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'purchase', {
      transaction_id: orderId || undefined,
      value,
      currency,
      items: [
        {
          item_name: `invitacion_${templateSlug || 'sin_etiquetar'}`,
          price: value,
          quantity: 1,
        },
      ],
    });
  }
  if (typeof window.fbq === 'function') {
    window.fbq(
      'track',
      'Purchase',
      { value, currency, content_name: templateSlug || 'sin_etiquetar' },
      orderId ? { eventID: orderId } : undefined,
    );
  }
};

// LEAD: la pareja dejó su correo al guardar el borrador — primer dato de
// contacto real del embudo (la conversión final es trackPurchase). Se
// dispara solo en la captura inicial del correo, no en cada re-guardado.
export const trackLead = ({ templateSlug = '' } = {}) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'generate_lead', {
      template: templateSlug || 'sin_etiquetar',
    });
  }
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'Lead');
  }
};

// CHECKOUT INICIADO: la pareja llegó al step Publicar con el precio a la
// vista (boda aún sin pagar). Mide el drop-off entre "vio el precio" y
// "pagó", y arma la audiencia de retargeting más caliente. Una vez por
// sesión — el guard vive en quien lo llama.
export const trackInitiateCheckout = ({
  value = 0,
  currency = 'USD',
  templateSlug = '',
} = {}) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'begin_checkout', {
      value,
      currency,
      items: [
        {
          item_name: `invitacion_${templateSlug || 'sin_etiquetar'}`,
          price: value,
          quantity: 1,
        },
      ],
    });
  }
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'InitiateCheckout', {
      value,
      currency,
      content_name: templateSlug || 'sin_etiquetar',
    });
  }
};

// Evento de personalización: la novia eligió una paleta de colores (un preset
// o la opción personalizada). Sirve para medir qué paletas gustan más y si la
// feature se usa — no es conversión, solo interés/engagement.
export const trackPaletteSelect = ({ paletteId = '', templateSlug = '' } = {}) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'paleta_seleccionada', {
      palette: paletteId || 'sin_etiquetar',
      template: templateSlug || 'sin_etiquetar',
    });
  }
};

// Evento de contacto: clic en WhatsApp/Instagram/TikTok para pedir ajustes o
// resolver dudas. Ya no es la conversión (eso es trackPurchase) — es señal
// de intención/soporte.
export const trackContactClick = ({ channel = '', templateSlug = '' } = {}) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'contacto_iniciado', {
      channel,
      template: templateSlug || 'sin_etiquetar',
    });
  }
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'Contact', { channel });
  }
};

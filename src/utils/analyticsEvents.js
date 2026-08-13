// Evento de interés: el usuario terminó de llenar sus datos y le dio a
// enviar. Es el punto donde, en el embudo marketing → editor, alguien pasa
// de "visitante" a "pedido enviado" — úsalo desde donde se dispara el envío.
// OJO: esto NO es la conversión real (no hay pago aquí, solo interés) —
// para optimizar campañas de Meta Ads usa trackContactClick, no este.
export const trackOrderSubmitted = ({ templateSlug = '' } = {}) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'pedido_enviado', {
      template: templateSlug || 'sin_etiquetar',
    });
  }
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'Lead');
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

// Evento de conversión real: el usuario, ya con su diseño enviado, hace clic
// para contactar por WhatsApp/Instagram/TikTok y coordinar la entrega. Como
// el cierre de venta es manual (no hay checkout online), este es el paso
// más cercano a "compra" que existe hoy — es el que debe usarse como
// objetivo de optimización en Meta Ads Manager, no "Lead" ni "Interacción".
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

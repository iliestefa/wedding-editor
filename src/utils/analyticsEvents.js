// Evento de conversión: el usuario terminó de llenar sus datos y le dio a
// enviar. Es el punto donde, en el embudo marketing → editor, alguien pasa
// de "visitante" a "pedido enviado" — úsalo desde donde se dispara el envío.
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

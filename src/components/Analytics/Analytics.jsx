import { useEffect } from 'react';
import { GA4_ID, META_PIXEL_ID } from '../../constants/editorConstants';

// GA4 + Meta Pixel del editor, activados solo si sus IDs están definidos
// (VITE_GA4_ID / VITE_META_PIXEL_ID en GitHub Actions secrets o .env.local).
// Mide el uso del editor en sí (quién empieza a llenar sus datos, en qué
// paso abandona, etc.) — no mide a los invitados de la boda, eso vive en
// las plantillas Soho/Elegant, no en este repo.
const Analytics = () => {
  useEffect(() => {
    if (GA4_ID) {
      const gaScript = document.createElement('script');
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
      gaScript.async = true;
      document.head.appendChild(gaScript);

      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag(...args) {
        window.dataLayer.push(args);
      };
      window.gtag('js', new Date());
      window.gtag('config', GA4_ID);
    }

    if (META_PIXEL_ID) {
      !(function (f, b, e, v, n, t, s) {
        if (f.fbq) return;
        n = f.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(
        window,
        document,
        'script',
        'https://connect.facebook.net/en_US/fbevents.js',
      );
      window.fbq('init', META_PIXEL_ID);
      window.fbq('track', 'PageView');
    }
  }, []);

  return null;
};

export default Analytics;

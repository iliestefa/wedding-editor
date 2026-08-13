import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { TEMPLATES, DEFAULT_TEMPLATE } from '../../../constants/templateRegistry';

// ── Preview "crudo" para el modo Celular ────────────────────────────────────
// Se monta dentro de un <iframe> (ver EditorLayout) para que las media
// queries @media de la plantilla respondan al ancho REAL del iframe (390px)
// y no al del navegador de escritorio — así el modo Celular muestra el
// diseño móvil de verdad, no una versión de escritorio escalada.
//
// No usa EditorProvider (no autoguarda ni comparte reducer): recibe los
// datos del editor padre por postMessage, porque un iframe corre en un
// documento aparte y no puede compartir React state por props.
const RawPreview = ({ templateSlug }) => {
  const [templateModule, setTemplateModule] = useState(null);
  const [data, setData] = useState(null);
  const [targetSection, setTargetSection] = useState(null);

  const slug = TEMPLATES[templateSlug] ? templateSlug : DEFAULT_TEMPLATE;

  useEffect(() => {
    TEMPLATES[slug].load().then(setTemplateModule);
  }, [slug]);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.source !== window.parent) return;
      const msg = event.data;
      if (!msg) return;
      if (msg.type === 'wedya:data') setData(msg.data);
      // Siempre un objeto nuevo: así el efecto de scroll corre aunque se
      // pida dos veces seguidas la misma sección.
      if (msg.type === 'wedya:section') setTargetSection({ id: msg.sectionId });
    };
    window.addEventListener('message', handleMessage);
    // Avisa al padre que ya puede empezar a enviar datos (por si el iframe
    // terminó de cargar después de que el padre ya intentó postear).
    window.parent.postMessage({ type: 'wedya:ready' }, window.location.origin);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // El scroll va como estado + efecto (no directo en el handler del mensaje)
  // para que también funcione si el pedido llega antes de que la plantilla
  // termine de cargar: se ejecuta recién cuando las secciones ya existen.
  // Va al INICIO de la sección (no block:'center'): en el ancho de celular
  // las secciones son más altas que la pantalla y centrarlas aterriza a
  // mitad de sección, saltándose el título. Se descuenta el nav fijo.
  useEffect(() => {
    if (!targetSection || !templateModule || !data) return;
    const el = document.querySelector(`[data-section="${targetSection.id}"]`);
    if (!el) return;
    const navHeight = document.querySelector('.nav, nav')?.offsetHeight ?? 0;
    const top = Math.max(0, el.getBoundingClientRect().top + window.scrollY - navHeight);
    window.scrollTo({ top, behavior: 'smooth' });
  }, [targetSection, templateModule, data]);

  if (!templateModule || !data) {
    return <div className="raw-preview__loading">Cargando…</div>;
  }

  const {
    Navigation, Hero, Story, Countdown,
    Events, Schedule, DressCode, GiftRegistry, RsvpForm, Footer,
    TemplateProvider,
  } = templateModule;

  // Mismos ids de sección que usa el panel del editor (ver EditorPanel), para
  // que el salto de sección funcione igual que en el preview de escritorio.
  // template-shell: ancla de overlays globales de la plantilla (textura floral).
  return (
    <TemplateProvider data={data}>
      <div className="template-shell">
        <Navigation />
        <div data-section="hero"><Hero /></div>
        {Story && <div data-section="historia"><Story /></div>}
        <div data-section="countdown"><Countdown /></div>
        <div data-section="eventos"><Events /></div>
        <div data-section="cronograma"><Schedule /></div>
        <div data-section="vestimenta"><DressCode /></div>
        <div data-section="regalos"><GiftRegistry /></div>
        <div data-section="rsvp"><RsvpForm /></div>
        <div data-section="footer"><Footer /></div>
      </div>
    </TemplateProvider>
  );
};

RawPreview.propTypes = {
  templateSlug: PropTypes.string,
};
RawPreview.defaultProps = { templateSlug: DEFAULT_TEMPLATE };

export default RawPreview;

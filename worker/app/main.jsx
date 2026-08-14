import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { TEMPLATES, DEFAULT_TEMPLATE } from '../../src/constants/templateRegistry';

// ─── Viewer — invitación renderizada desde datos en runtime ─────────────────
// El Worker inyecta window.__WEDDING__ = { templateSlug, data, preview } al
// servir /:slug o /p/:slug/:token. Aquí solo cargamos el módulo de la
// plantilla correspondiente y montamos sus secciones con esos datos —
// el mismo mecanismo del preview del editor, pero como página final.

const wedding = window.__WEDDING__ ?? null;

const Invitation = () => {
  const [templateModule, setTemplateModule] = useState(null);

  const slug = TEMPLATES[wedding?.templateSlug] ? wedding.templateSlug : DEFAULT_TEMPLATE;

  useEffect(() => {
    TEMPLATES[slug].load().then(setTemplateModule);
  }, [slug]);

  if (!wedding) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', height: '100vh', fontFamily: 'Georgia, serif' }}>
        <p>Invitación no encontrada 💌</p>
      </div>
    );
  }
  if (!templateModule) return null;

  const {
    Navigation, Hero, Story, Countdown,
    Events, Schedule, DressCode, GiftRegistry, RsvpForm, Footer,
    TemplateProvider,
  } = templateModule;

  return (
    <TemplateProvider data={wedding.data}>
      <div className="template-shell">
        <Navigation />
        <Hero />
        {Story && <Story />}
        <Countdown />
        <Events />
        <Schedule />
        <DressCode />
        <GiftRegistry />
        <RsvpForm />
        <Footer />
      </div>
    </TemplateProvider>
  );
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Invitation />
  </StrictMode>,
);

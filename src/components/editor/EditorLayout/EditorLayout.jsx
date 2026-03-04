import { useState, useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useEditorContext } from '../../../context/EditorContext';
import { TEMPLATES, DEFAULT_TEMPLATE } from '../../../constants/templateRegistry';
import EditorPanel from '../EditorPanel/EditorPanel';
import './EditorLayout.scss';

const SectionWrapper = ({ id, activeSection, children }) => (
  <div
    data-section={id}
    className={activeSection === id ? 'is-active-section' : ''}
  >
    {children}
  </div>
);

SectionWrapper.propTypes = {
  id:            PropTypes.string.isRequired,
  activeSection: PropTypes.string,
  children:      PropTypes.node.isRequired,
};
SectionWrapper.defaultProps = { activeSection: null };

const SuccessOverlay = () => (
  <div className="editor-layout__success-overlay">
    <div className="editor-layout__success-card">
      <span className="editor-layout__success-icon" aria-hidden="true">✓</span>
      <h2 className="editor-layout__success-title">¡Tu web está en construcción!</h2>
      <p className="editor-layout__success-body">
        Recibimos todos tus datos. Estamos preparando tu invitación personalizada.
      </p>
      <p className="editor-layout__success-note">
        Te enviaremos un mail cuando esté lista — puede tomar de <strong>24 a 48 horas</strong>.
      </p>
    </div>
  </div>
);

const EditorLayout = ({ templateSlug }) => {
  const [showPreview, setShowPreview]     = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [submitted, setSubmitted]         = useState(false);
  const [navScrolled, setNavScrolled]     = useState(false);
  const previewRef = useRef(null);
  const canvasRef  = useRef(null);

  const { liveData } = useEditorContext();

  const slug = TEMPLATES[templateSlug] ? templateSlug : DEFAULT_TEMPLATE;
  const { TemplateProvider, components } = TEMPLATES[slug];
  const {
    Navigation, Hero, Story, Countdown,
    Events, Schedule, DressCode, GiftRegistry, RsvpForm, Footer,
  } = components;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const update = () => setNavScrolled(canvas.scrollTop > 60);
    update();
    canvas.addEventListener('scroll', update, { passive: true });
    return () => canvas.removeEventListener('scroll', update);
  }, []);

  const scrollToSection = useCallback((sectionId) => {
    const el = previewRef.current?.querySelector(`[data-section="${sectionId}"]`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  const handleSectionChange = useCallback((sectionId) => {
    setActiveSection(sectionId);
    scrollToSection(sectionId);
  }, [scrollToSection]);

  return (
    <div className="editor-layout">

      {/* ── Mobile top bar ── */}
      <div className="editor-layout__mobile-bar">
        <button
          className="editor-layout__mobile-toggle"
          onClick={() => setShowPreview((v) => !v)}
        >
          {showPreview ? '← Editar' : 'Vista previa →'}
        </button>
      </div>

      {/* ── Preview (left on desktop) ── */}
      <main className={`editor-layout__preview ${showPreview ? 'editor-layout__preview--visible' : ''}`}>
        <div
          ref={canvasRef}
          className={`editor-layout__preview-canvas${navScrolled ? ' editor-layout__preview-canvas--scrolled' : ''}`}
        >
          {submitted && <SuccessOverlay />}
          <TemplateProvider data={liveData}>
            <div ref={previewRef} className="editor-layout__preview-inner">
              <Navigation />
              <SectionWrapper id="hero" activeSection={activeSection}>
                <Hero />
              </SectionWrapper>
              {Story && (
                <SectionWrapper id="historia" activeSection={activeSection}>
                  <Story />
                </SectionWrapper>
              )}
              <SectionWrapper id="countdown" activeSection={activeSection}>
                <Countdown />
              </SectionWrapper>
              <SectionWrapper id="eventos" activeSection={activeSection}>
                <Events />
              </SectionWrapper>
              <SectionWrapper id="cronograma" activeSection={activeSection}>
                <Schedule />
              </SectionWrapper>
              <SectionWrapper id="vestimenta" activeSection={activeSection}>
                <DressCode />
              </SectionWrapper>
              <SectionWrapper id="regalos" activeSection={activeSection}>
                <GiftRegistry />
              </SectionWrapper>
              <SectionWrapper id="rsvp" activeSection={activeSection}>
                <RsvpForm />
              </SectionWrapper>
              <SectionWrapper id="footer" activeSection={activeSection}>
                <Footer />
              </SectionWrapper>
            </div>
          </TemplateProvider>
        </div>
      </main>

      {/* ── Editor panel (right on desktop) ── */}
      <aside className={`editor-layout__panel ${!showPreview ? 'editor-layout__panel--visible' : ''}`}>
        <EditorPanel
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          onSubmitSuccess={() => setSubmitted(true)}
        />
      </aside>
    </div>
  );
};

EditorLayout.propTypes = {
  templateSlug: PropTypes.string,
};
EditorLayout.defaultProps = {
  templateSlug: DEFAULT_TEMPLATE,
};

export default EditorLayout;

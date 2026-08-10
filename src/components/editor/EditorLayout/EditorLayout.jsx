import { useState, useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useEditor } from '../../../context/EditorContext';
import { TEMPLATES, DEFAULT_TEMPLATE } from '../../../constants/templateRegistry';
import {
  WEDYA_WHATSAPP,
  WEDYA_INSTAGRAM,
  WEDYA_TIKTOK,
} from '../../../constants/editorConstants';
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

// Dialog de confirmación — única confirmación visual tras enviar los datos.
// Un solo flujo para todos: se muestra siempre, con los botones de contacto
// para coordinar la entrega por WhatsApp, Instagram o TikTok.
const ContactDialog = ({ brideName, groomName, onClose }) => {
  const [copied, setCopied] = useState(false);

  const prefilledMessage =
    `¡Holaa! Somos ${brideName} & ${groomName} 💍 y queremos nuestra invitación digital. ` +
    'Ya llenamos nuestros datos en el editor ✨';

  const handleChannel = async (channelKey) => {
    let url;
    if (channelKey === 'whatsapp') {
      url = `https://wa.me/${WEDYA_WHATSAPP}?text=${encodeURIComponent(prefilledMessage)}`;
    } else {
      // Instagram y TikTok no permiten precargar el mensaje: lo copiamos
      try {
        await navigator.clipboard.writeText(prefilledMessage);
        setCopied(true);
      } catch {
        // clipboard puede fallar sin https; el usuario aún puede escribir a mano
      }
      url =
        channelKey === 'instagram'
          ? `https://ig.me/m/${WEDYA_INSTAGRAM}`
          : `https://www.tiktok.com/@${WEDYA_TIKTOK}`;
    }
    window.open(url, '_blank', 'noopener');
  };

  return (
    <div
      className="editor-layout__contact-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="editor-layout__contact-dialog" role="dialog" aria-modal="true">
        <button
          type="button"
          className="editor-layout__contact-close"
          aria-label="Cerrar"
          onClick={onClose}
        >
          ×
        </button>

        <p className="editor-layout__contact-title">¡Recibimos su diseño! 🤍</p>
        <p className="editor-layout__contact-text">
          Déjennos un mensaje con sus nombres para coordinar la entrega de su
          invitación. Les escribiremos en cuanto esté lista.
        </p>

        <div className="editor-layout__contact-channels">
          <button
            type="button"
            className="editor-layout__contact-channel-btn"
            onClick={() => handleChannel('whatsapp')}
          >
            WhatsApp
          </button>
          <button
            type="button"
            className="editor-layout__contact-channel-btn"
            onClick={() => handleChannel('instagram')}
          >
            Instagram
          </button>
          <button
            type="button"
            className="editor-layout__contact-channel-btn"
            onClick={() => handleChannel('tiktok')}
          >
            TikTok
          </button>
        </div>

        {copied && (
          <p className="editor-layout__contact-copied-note">
            Mensaje copiado — solo pégalo en el chat 😉
          </p>
        )}
      </div>
    </div>
  );
};

ContactDialog.propTypes = {
  brideName: PropTypes.string,
  groomName: PropTypes.string,
  onClose:   PropTypes.func.isRequired,
};
ContactDialog.defaultProps = {
  brideName: '',
  groomName: '',
};

// Renders the preview once the template module is loaded
const TemplatePreview = ({ templateModule, activeSection, previewRef, navScrolled }) => {
  const {
    Navigation, Hero, Story, Countdown,
    Events, Schedule, DressCode, GiftRegistry, RsvpForm, Footer,
    TemplateProvider,
  } = templateModule;

  const { data } = useEditor();

  return (
    <TemplateProvider data={data}>
      <div ref={previewRef} className="editor-layout__preview-inner">
        <Navigation forceScrolled={navScrolled} />
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
  );
};

TemplatePreview.propTypes = {
  templateModule: PropTypes.object.isRequired,
  activeSection:  PropTypes.string,
  previewRef:     PropTypes.object.isRequired,
  navScrolled:    PropTypes.bool,
};
TemplatePreview.defaultProps = { activeSection: null, navScrolled: false };

const EditorLayout = ({ templateSlug }) => {
  const [showPreview, setShowPreview]       = useState(false);
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [activeSection, setActiveSection]   = useState('hero');
  const [submitted, setSubmitted]           = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [navScrolled, setNavScrolled]       = useState(false);
  const [templateModule, setTemplateModule] = useState(null);
  const previewRef = useRef(null);
  const canvasRef  = useRef(null);
  const { data, hasChanges } = useEditor();

  const slug = TEMPLATES[templateSlug] ? templateSlug : DEFAULT_TEMPLATE;

  useEffect(() => {
    TEMPLATES[slug].load().then(setTemplateModule);
  }, [slug]);

  // Avisa antes de cerrar/recargar si hay cambios sin enviar — el texto
  // del diálogo lo controla el navegador, no se puede personalizar.
  useEffect(() => {
    if (!hasChanges || submitted) return undefined;
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges, submitted]);

  // Avisa antes de salir con el botón "atrás" del navegador/celular.
  // Al montar, apilamos una entrada extra; si el usuario retrocede,
  // interceptamos con un confirm y, si cancela, restauramos esa entrada.
  useEffect(() => {
    if (!hasChanges || submitted) return undefined;

    window.history.pushState(null, '', window.location.href);
    const handlePopState = () => {
      const stay = window.confirm(
        '¿Seguro que quieres salir? Vas a perder el progreso de tu invitación.',
      );
      if (stay) {
        window.history.pushState(null, '', window.location.href);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [hasChanges, submitted]);

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

      {/* Mobile top bar */}
      <div className="editor-layout__mobile-bar">
        <span className="editor-layout__mobile-logo">Editor</span>
        <button
          className="editor-layout__mobile-toggle"
          onClick={() => setShowPreview((v) => !v)}
        >
          {showPreview ? '← Editar' : 'Vista previa →'}
        </button>
      </div>

      {/* Desktop panel toggle (tab anchored to panel left edge) */}
      <button
        className={`editor-toggle${panelCollapsed ? ' editor-toggle--collapsed' : ''}`}
        onClick={() => setPanelCollapsed((v) => !v)}
        aria-label={panelCollapsed ? 'Abrir editor' : 'Cerrar editor'}
      >
        {panelCollapsed ? 'EDITOR' : 'CERRAR'}
      </button>

      {/* Full-viewport preview */}
      <main className={`editor-layout__preview ${showPreview ? 'editor-layout__preview--visible' : ''}`}>
        <div
          ref={canvasRef}
          className={`editor-layout__preview-canvas editor-layout__preview-canvas--${slug}${navScrolled ? ' editor-layout__preview-canvas--scrolled' : ''}`}
        >
          {templateModule ? (
            <TemplatePreview
              templateModule={templateModule}
              activeSection={activeSection}
              previewRef={previewRef}
              navScrolled={navScrolled}
            />
          ) : (
            <div className="editor-layout__loading">Cargando template…</div>
          )}
        </div>
      </main>

      {showContactDialog && (
        <ContactDialog
          brideName={data.brideName}
          groomName={data.groomName}
          onClose={() => setShowContactDialog(false)}
        />
      )}

      {/* Editor panel — fixed overlay on right */}
      <aside className={`editor-layout__panel${panelCollapsed ? ' editor-layout__panel--collapsed' : ''}${!showPreview ? ' editor-layout__panel--visible' : ''}`}>
        <EditorPanel
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          onSubmitSuccess={() => {
            setSubmitted(true);
            setShowContactDialog(true);
          }}
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

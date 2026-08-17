import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useEditor } from '../../../context/EditorContext';
import { TEMPLATES, DEFAULT_TEMPLATE } from '../../../constants/templateRegistry';
import EditorPanel from '../EditorPanel/EditorPanel';
import PublishedInfo from '../PublishedInfo';
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

// Dialog de confirmación — se muestra tras el pago aprobado, con la misma
// info (PublishedInfo) que reaparece en el step "Publicar" si se reabre una
// boda ya activa.
const ContactDialog = ({ previewUrl, sheetUrl, editLink, onClose }) => (
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

      <span className="editor-layout__contact-icon" aria-hidden="true">🤍</span>
      <PublishedInfo
        title="¡Su invitación ya está publicada!"
        previewUrl={previewUrl}
        sheetUrl={sheetUrl}
        editLink={editLink}
      />
    </div>
  </div>
);

ContactDialog.propTypes = {
  previewUrl: PropTypes.string,
  sheetUrl:   PropTypes.string,
  editLink:   PropTypes.string,
  onClose:    PropTypes.func.isRequired,
};
ContactDialog.defaultProps = {
  sheetUrl:   '',
  previewUrl: '',
  editLink:   '',
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
      {/* template-shell: ancla de overlays globales de la plantilla (ej. textura floral) */}
      <div ref={previewRef} className="editor-layout__preview-inner template-shell">
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

// ── Preview en modo Celular ─────────────────────────────────────────────────
// Carga el preview dentro de un <iframe> con ancho real de celular (390px),
// para que las @media queries de la plantilla activen su diseño móvil de
// verdad — no una versión de escritorio achicada. El iframe corre en un
// documento aparte (ver RawPreview), así que los datos del editor viajan
// por postMessage en cada cambio.
const MobilePreviewFrame = ({ templateSlug, data, sectionRequest }) => {
  const iframeRef = useRef(null);
  const [iframeReady, setIframeReady] = useState(false);

  const iframeSrc = useMemo(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('template', templateSlug);
    url.searchParams.set('raw', '1');
    return url.toString();
  }, [templateSlug]);

  // El iframe avisa "wedya:ready" (ver RawPreview) cuando ya puede recibir
  // datos — evita mandar el primer postMessage antes de que exista el
  // listener del lado del iframe.
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.source !== iframeRef.current?.contentWindow) return;
      if (event.data?.type === 'wedya:ready') setIframeReady(true);
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (!iframeReady) return;
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'wedya:data', data },
      window.location.origin,
    );
  }, [iframeReady, data]);

  // Cambio de tab en el panel → el iframe hace scroll a esa sección.
  // sectionRequest es un objeto nuevo en cada click (ver handleSectionChange),
  // así el efecto también corre al repetir la misma sección.
  useEffect(() => {
    if (!iframeReady || !sectionRequest) return;
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'wedya:section', sectionId: sectionRequest.id },
      window.location.origin,
    );
  }, [iframeReady, sectionRequest]);

  return (
    <div className="editor-layout__mobile-frame">
      <div className="editor-layout__mobile-frame-notch" />
      <iframe
        ref={iframeRef}
        key={iframeSrc}
        src={iframeSrc}
        title="Vista previa en celular"
        className="editor-layout__mobile-frame-iframe"
      />
    </div>
  );
};

MobilePreviewFrame.propTypes = {
  templateSlug:   PropTypes.string.isRequired,
  data:           PropTypes.object.isRequired,
  sectionRequest: PropTypes.shape({ id: PropTypes.string }),
};
MobilePreviewFrame.defaultProps = { sectionRequest: null };

const EditorLayout = ({ templateSlug, published }) => {
  const [showPreview, setShowPreview]       = useState(false);
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  // Arranca en "Publicar" si la boda ya está publicada (ahí vive
  // PublishedInfo) o si el link lo pide explícitamente (&section=publicar —
  // lo usa el aviso de pago de la invitación bloqueada).
  const [activeSection, setActiveSection]   = useState(() => {
    if (published) return 'publicar';
    const wanted = new URLSearchParams(window.location.search).get('section');
    return wanted === 'publicar' ? 'publicar' : 'hero';
  });
  const [submitted, setSubmitted]           = useState(Boolean(published));
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [previewUrl, setPreviewUrl]         = useState(published?.previewUrl ?? '');
  const [sheetUrl, setSheetUrl]             = useState(published?.sheetUrl ?? '');
  const [editLink, setEditLink]             = useState(published?.editLink ?? '');
  const [navScrolled, setNavScrolled]       = useState(false);
  const [templateModule, setTemplateModule] = useState(null);
  // En escritorio arranca en modo Celular (el mockup con iframe simula el
  // ancho de teléfono — es la vista más fiel a cómo verán la invitación).
  // En un celular REAL no: ahí la vista directa ya es la móvil nativa, y
  // meter el mockup sería un teléfono dentro del teléfono.
  const [previewMode, setPreviewMode]       = useState(() =>
    window.matchMedia('(max-width: 900px)').matches ? 'desktop' : 'mobile',
  ); // 'desktop' | 'mobile'
  // Último salto de sección pedido desde el panel — objeto nuevo por click,
  // consumido por el iframe del modo Celular (ver MobilePreviewFrame).
  const [sectionRequest, setSectionRequest] = useState(null);
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

  // Scrollea al INICIO de la sección (no al centro): las secciones altas
  // centradas aterrizan a mitad de contenido y se saltan el título.
  // Se descuenta el nav sticky para que el título quede visible.
  const scrollToSection = useCallback((sectionId) => {
    const el = previewRef.current?.querySelector(`[data-section="${sectionId}"]`);
    const canvas = canvasRef.current;
    if (!el || !canvas) return;
    const navHeight = previewRef.current?.querySelector('.nav, nav')?.offsetHeight ?? 0;
    const top = Math.max(
      0,
      canvas.scrollTop + el.getBoundingClientRect().top - canvas.getBoundingClientRect().top - navHeight,
    );
    canvas.scrollTo({ top, behavior: 'smooth' });
  }, []);

  const handleSectionChange = useCallback((sectionId) => {
    setActiveSection(sectionId);
    // Preview de escritorio (mismo documento): scroll directo.
    scrollToSection(sectionId);
    // Preview modo Celular (iframe): se pide por postMessage.
    setSectionRequest({ id: sectionId });
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

      {/* Desktop-only: simula el ancho de celular dentro del preview */}
      <div className="editor-layout__device-toggle" role="group" aria-label="Vista del preview">
        <button
          type="button"
          className={`editor-layout__device-btn${previewMode === 'desktop' ? ' editor-layout__device-btn--active' : ''}`}
          onClick={() => setPreviewMode('desktop')}
          aria-pressed={previewMode === 'desktop'}
        >
          Escritorio
        </button>
        <button
          type="button"
          className={`editor-layout__device-btn${previewMode === 'mobile' ? ' editor-layout__device-btn--active' : ''}`}
          onClick={() => setPreviewMode('mobile')}
          aria-pressed={previewMode === 'mobile'}
        >
          Celular
        </button>
      </div>

      {/* Full-viewport preview */}
      <main className={`editor-layout__preview ${showPreview ? 'editor-layout__preview--visible' : ''}`}>
        {previewMode === 'mobile' ? (
          <div
            className={`editor-layout__mobile-frame-wrap${
              !panelCollapsed ? ' editor-layout__mobile-frame-wrap--panel-open' : ''
            }`}
          >
            <MobilePreviewFrame templateSlug={slug} data={data} sectionRequest={sectionRequest} />
          </div>
        ) : (
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
        )}
      </main>

      {showContactDialog && (
        <ContactDialog
          previewUrl={previewUrl}
          sheetUrl={sheetUrl}
          editLink={editLink}
          onClose={() => {
            setShowContactDialog(false);
            // Al cerrar (de cualquier forma), la sesión pasa a la URL del
            // draft del editor — así refrescar/volver mantiene el contexto
            // de la boda. Si ya está en esa URL, solo se cierra.
            if (editLink) {
              const target = new URL(editLink).searchParams.get('draft');
              const current = new URLSearchParams(window.location.search).get('draft');
              if (target && target !== current) window.location.href = editLink;
            }
          }}
        />
      )}

      {/* Editor panel — fixed overlay on right */}
      <aside className={`editor-layout__panel${panelCollapsed ? ' editor-layout__panel--collapsed' : ''}${!showPreview ? ' editor-layout__panel--visible' : ''}`}>
        <EditorPanel
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          palettePresets={templateModule?.PRESET_PALETTES ?? []}
          // Boda ya publicada (submitted=true): el step "Publicar" siempre
          // muestra PublishedInfo (links + copiar) con un botón "Guardar
          // cambios" debajo — nunca vuelve a pedir pago, sin importar si
          // editó algo o no.
          publishedInfo={submitted ? { previewUrl, sheetUrl, editLink } : null}
          onSubmitSuccess={(result) => {
            // Si ya estaba "submitted" (venía de una boda activa que se
            // editó), no reabrimos el dialog de bienvenida post-pago — solo
            // se refresca la info del step Publicar en silencio.
            const wasAlreadyPublished = submitted;
            setSubmitted(true);
            setPreviewUrl(result?.previewUrl ?? '');
            setSheetUrl(result?.sheetUrl ?? '');
            if (result?.editLink) setEditLink(result.editLink);
            if (!wasAlreadyPublished) setShowContactDialog(true);
          }}
        />
      </aside>
    </div>
  );
};

EditorLayout.propTypes = {
  templateSlug: PropTypes.string,
  published: PropTypes.shape({
    previewUrl: PropTypes.string,
    sheetUrl:   PropTypes.string,
    editLink:   PropTypes.string,
  }),
};
EditorLayout.defaultProps = {
  templateSlug: DEFAULT_TEMPLATE,
  published: null,
};

export default EditorLayout;

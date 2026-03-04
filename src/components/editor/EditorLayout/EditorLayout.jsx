import { useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import EditorPanel from '../EditorPanel/EditorPanel';
import Navigation from '@iliestefa/wedding-soho/components/Navigation/Navigation';
import Hero from '@iliestefa/wedding-soho/components/Hero/Hero';
import Story from '@iliestefa/wedding-soho/components/Story/Story';
import Countdown from '@iliestefa/wedding-soho/components/Countdown/Countdown';
import Events from '@iliestefa/wedding-soho/components/Events/Events';
import Schedule from '@iliestefa/wedding-soho/components/Schedule/Schedule';
import DressCode from '@iliestefa/wedding-soho/components/DressCode/DressCode';
import GiftRegistry from '@iliestefa/wedding-soho/components/GiftRegistry/GiftRegistry';
import RsvpForm from '@iliestefa/wedding-soho/components/RsvpForm/RsvpForm';
import Footer from '@iliestefa/wedding-soho/components/Footer/Footer';
import './EditorLayout.scss';

const VIEWPORTS = [
  { id: 'desktop', label: 'Escritorio', icon: '🖥', width: null },
  { id: 'tablet',  label: 'Tablet',     icon: '⬜', width: 768 },
  { id: 'mobile',  label: 'Móvil',      icon: '📱', width: 390 },
];

const SECTION_IDS = ['hero', 'historia', 'eventos', 'cronograma', 'vestimenta', 'regalos', 'rsvp', 'footer'];

const ViewportSwitcher = ({ viewport, onChange }) => (
  <div className="editor-layout__viewport-switcher">
    {VIEWPORTS.map((v) => (
      <button
        key={v.id}
        className={`editor-layout__viewport-btn ${viewport === v.id ? 'editor-layout__viewport-btn--active' : ''}`}
        title={v.label}
        onClick={() => onChange(v.id)}
      >
        {v.icon}
      </button>
    ))}
  </div>
);

ViewportSwitcher.propTypes = {
  viewport: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

const EditorLayout = () => {
  const [viewport, setViewport] = useState('desktop');
  const [showPreview, setShowPreview] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const previewRef = useRef(null);

  const scrollToSection = useCallback((sectionId) => {
    const el = previewRef.current?.querySelector(`[data-section="${sectionId}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const handleSectionChange = useCallback((sectionId) => {
    setActiveSection(sectionId);
    scrollToSection(sectionId);
    // On mobile, switch to preview to see the section
    setShowPreview(true);
  }, [scrollToSection]);

  const viewportWidth = VIEWPORTS.find((v) => v.id === viewport)?.width;

  return (
    <div className={`editor-layout ${showPreview ? 'editor-layout--preview-mode' : ''}`}>

      {/* ── Mobile top bar ── */}
      <div className="editor-layout__mobile-bar">
        <button
          className="editor-layout__mobile-toggle"
          onClick={() => setShowPreview((v) => !v)}
        >
          {showPreview ? '← Editar' : 'Vista previa →'}
        </button>
      </div>

      {/* ── Preview (left on desktop, full on mobile when toggled) ── */}
      <main className={`editor-layout__preview ${showPreview ? 'editor-layout__preview--visible' : ''}`}>
        {/* Desktop viewport switcher */}
        <div className="editor-layout__preview-toolbar">
          <ViewportSwitcher viewport={viewport} onChange={setViewport} />
        </div>

        <div className="editor-layout__preview-canvas">
          <div
            ref={previewRef}
            className="editor-layout__preview-inner"
            style={viewportWidth ? { width: viewportWidth, margin: '0 auto' } : undefined}
          >
            <div data-section="hero">
              <Navigation />
              <Hero />
            </div>
            <Countdown />
            <div data-section="historia" className={activeSection === 'historia' ? 'is-active-section' : ''}>
              <Story />
            </div>
            <div data-section="eventos" className={activeSection === 'eventos' ? 'is-active-section' : ''}>
              <Events />
            </div>
            <div data-section="cronograma" className={activeSection === 'cronograma' ? 'is-active-section' : ''}>
              <Schedule />
            </div>
            <div data-section="vestimenta" className={activeSection === 'vestimenta' ? 'is-active-section' : ''}>
              <DressCode />
            </div>
            <div data-section="regalos" className={activeSection === 'regalos' ? 'is-active-section' : ''}>
              <GiftRegistry />
            </div>
            <div data-section="rsvp" className={activeSection === 'rsvp' ? 'is-active-section' : ''}>
              <RsvpForm />
            </div>
            <div data-section="footer" className={activeSection === 'footer' ? 'is-active-section' : ''}>
              <Footer />
            </div>
          </div>
        </div>
      </main>

      {/* ── Editor panel (right on desktop) ── */}
      <aside className={`editor-layout__panel ${!showPreview ? 'editor-layout__panel--visible' : ''}`}>
        <EditorPanel
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
        />
      </aside>
    </div>
  );
};

export default EditorLayout;

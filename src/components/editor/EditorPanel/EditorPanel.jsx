import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import { useEditor } from '../../../context/EditorContext';
import { trackPaletteSelect } from '../../../utils/analyticsEvents';
import EditorField from '../EditorField/EditorField';
import EditorImageField from '../EditorImageField/EditorImageField';
import EditorSubmit from '../EditorSubmit/EditorSubmit';
import { mapsLinkToEmbedSrc } from '../../../utils/mapsUtils';
import './EditorPanel.scss';

const SECTIONS_SOHO = [
  { id: 'hero',       label: 'Portada' },
  { id: 'colores',    label: 'Colores' },
  { id: 'historia',   label: 'Historia' },
  { id: 'eventos',    label: 'Eventos' },
  { id: 'cronograma', label: 'Cronograma' },
  { id: 'vestimenta', label: 'Vestimenta' },
  { id: 'regalos',    label: 'Regalos' },
  { id: 'rsvp',       label: 'RSVP' },
  { id: 'footer',     label: 'Footer' },
  { id: 'extras',     label: 'Extras' },
  { id: 'publicar',   label: 'Publicar' },
];

const SECTIONS_ELEGANT = [
  { id: 'hero',       label: 'Portada' },
  { id: 'colores',    label: 'Colores' },
  { id: 'eventos',    label: 'Eventos' },
  { id: 'cronograma', label: 'Cronograma' },
  { id: 'vestimenta', label: 'Vestimenta' },
  { id: 'regalos',    label: 'Regalos' },
  { id: 'rsvp',       label: 'RSVP' },
  { id: 'footer',     label: 'Footer' },
  { id: 'extras',     label: 'Extras' },
  { id: 'publicar',   label: 'Publicar' },
];

const MONTHS = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
];

const EVENTS_MODE_OPTIONS = [
  { value: 'separate',       label: 'Ceremonia y recepción en lugares distintos' },
  { value: 'same',           label: 'Ceremonia y recepción en el mismo lugar' },
  { value: 'reception-only', label: 'Solo recepción' },
];

const RSVP_TYPE_OPTIONS = [
  {
    value: 'whatsapp',
    label: 'Confirmación por WhatsApp',
    desc:  'Cada confirmación te llega como mensaje de WhatsApp.',
  },
  {
    value: 'sheets',
    label: 'Formulario con Google Sheets',
    desc:  'Las respuestas se guardan automáticamente en una hoja de cálculo.',
  },
];

const COMPANIONS_MODE_OPTIONS = [
  { value: 'free',    label: 'Libre (el invitado escribe cuántos van)' },
  { value: 'limited', label: 'Limitado por cupos' },
];

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES_OPTS = ['00', '15', '30', '45'];

const DatePicker = ({ isoValue, timeValue, onIsoChange, onDisplayChange, onTimeChange }) => {
  const [y, m, d] = (isoValue || '').split('-');
  const year  = y ? parseInt(y,  10) : '';
  const month = m ? parseInt(m,  10) : '';
  const day   = d ? parseInt(d,  10) : '';

  const [th, tm] = (timeValue || '17:00').split(':');
  const timeH = th || '17';
  const timeM = tm || '00';

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear + i);
  const daysInMonth = (month && year) ? new Date(year, month, 0).getDate() : 31;
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const buildValues = (newY, newM, newD) => {
    if (!newY || !newM || !newD) return;
    const iso = `${newY}-${String(newM).padStart(2,'0')}-${String(newD).padStart(2,'0')}`;
    const display = `${String(newD).padStart(2,'0')} · ${String(newM).padStart(2,'0')} · ${newY}`;
    onIsoChange(iso);
    onDisplayChange(display);
  };

  return (
    <div className="editor-panel__date-picker">
      <div className="editor-panel__date-col">
        <label className="editor-panel__inline-label">Día</label>
        <select
          className="editor-panel__inline-select"
          value={day}
          onChange={(e) => buildValues(year, month, e.target.value)}
        >
          <option value="">—</option>
          {days.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
      <div className="editor-panel__date-col editor-panel__date-col--lg">
        <label className="editor-panel__inline-label">Mes</label>
        <select
          className="editor-panel__inline-select"
          value={month}
          onChange={(e) => buildValues(year, e.target.value, day)}
        >
          <option value="">—</option>
          {MONTHS.map((name, i) => (
            <option key={i + 1} value={i + 1}>{name}</option>
          ))}
        </select>
      </div>
      <div className="editor-panel__date-col">
        <label className="editor-panel__inline-label">Año</label>
        <select
          className="editor-panel__inline-select"
          value={year}
          onChange={(e) => buildValues(e.target.value, month, day)}
        >
          <option value="">—</option>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      <div className="editor-panel__date-col">
        <label className="editor-panel__inline-label">Hora</label>
        <select
          className="editor-panel__inline-select"
          value={timeH}
          onChange={(e) => onTimeChange(`${e.target.value}:${timeM}`)}
        >
          {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
        </select>
      </div>
      <div className="editor-panel__date-col">
        <label className="editor-panel__inline-label">Min</label>
        <select
          className="editor-panel__inline-select"
          value={timeM}
          onChange={(e) => onTimeChange(`${timeH}:${e.target.value}`)}
        >
          {MINUTES_OPTS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
    </div>
  );
};

DatePicker.propTypes = {
  isoValue:        PropTypes.string.isRequired,
  timeValue:       PropTypes.string,
  onIsoChange:     PropTypes.func.isRequired,
  onDisplayChange: PropTypes.func.isRequired,
  onTimeChange:    PropTypes.func.isRequired,
};
DatePicker.defaultProps = { timeValue: '17:00' };

// Campos editables de la paleta personalizada, en orden de aparición
const CUSTOM_PALETTE_FIELDS = [
  { key: 'bg',     label: 'Fondo' },
  { key: 'accent', label: 'Color principal' },
  { key: 'text',   label: 'Texto' },
];

// ── Main panel ──────────────────────────────────────────────────────────────
const EditorPanel = ({ activeSection, onSectionChange, onSubmitSuccess, palettePresets }) => {
  const {
    data,
    templateSlug,
    setField,
    setStoryItem, addStoryItem, removeStoryItem,
    setScheduleItem, addScheduleItem, removeScheduleItem,
    setBankAccount, addBankAccount, removeBankAccount,
    setRsvpQuestion, addRsvpQuestion, removeRsvpQuestion,
    toggleRsvpCupo,
    setDressCodeColor, setDressCodeColorLabel, addDressCodeColor, removeDressCodeColor,
    setActiveField,
  } = useEditor();

  const isElegant = templateSlug === 'elegant';
  const sections = isElegant ? SECTIONS_ELEGANT : SECTIONS_SOHO;
  const bodyRef = useRef(null);
  const tabsRef = useRef(null);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeSection]);

  useEffect(() => {
    const activeTab = tabsRef.current?.querySelector('.editor-panel__tab--active');
    activeTab?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [activeSection]);

  // ── Paleta de colores de la invitación ────────────────────────────────────
  // null → paleta original (el primer preset). El primer preset se guarda como
  // null para que el sitio final use los colores compilados de la plantilla.
  const customPaletteActive = data.colorPalette?.id === 'custom';
  const selectedPaletteId = data.colorPalette?.id ?? palettePresets[0]?.id;

  const handleSelectPreset = (preset, index) => {
    const value = index === 0
      ? null
      : { id: preset.id, bg: preset.bg, accent: preset.accent, text: preset.text };
    setField('colorPalette', value);
    trackPaletteSelect({ paletteId: preset.id, templateSlug });
  };

  const handleActivateCustomPalette = () => {
    if (customPaletteActive) return;
    const base = data.colorPalette ?? palettePresets[0];
    setField('colorPalette', { id: 'custom', bg: base.bg, accent: base.accent, text: base.text });
    trackPaletteSelect({ paletteId: 'custom', templateSlug });
  };

  const setCustomPaletteColor = (key, value) => {
    setField('colorPalette', { ...data.colorPalette, [key]: value });
  };

  const currentIndex = sections.findIndex((sec) => sec.id === activeSection);
  const prevSection = currentIndex > 0 ? sections[currentIndex - 1] : null;
  const nextSection =
    currentIndex >= 0 && currentIndex < sections.length - 1 ? sections[currentIndex + 1] : null;

  const navButtons = (prevSection || nextSection) && (
    <div className="editor-panel__nav-buttons">
      <button
        type="button"
        className="editor-panel__nav-btn editor-panel__nav-btn--prev"
        onClick={() => prevSection && onSectionChange(prevSection.id)}
        disabled={!prevSection}
      >
        ← {prevSection ? prevSection.label : ''}
      </button>
      <button
        type="button"
        className="editor-panel__nav-btn editor-panel__nav-btn--next"
        onClick={() => nextSection && onSectionChange(nextSection.id)}
        disabled={!nextSection}
      >
        {nextSection ? nextSection.label : ''} →
      </button>
    </div>
  );

  return (
    <aside className="editor-panel">
      <header className="editor-panel__header">
        <div className="editor-panel__logo">Editor</div>
        <p className="editor-panel__subtitle">Personaliza tu invitación en tiempo real</p>
      </header>

      <nav className="editor-panel__tabs" aria-label="Secciones" ref={tabsRef}>
        {sections.map((sec, i) => (
          <button
            key={sec.id}
            className={`editor-panel__tab ${activeSection === sec.id ? 'editor-panel__tab--active' : ''}`}
            onClick={() => onSectionChange(sec.id)}
          >
            <span className="editor-panel__tab-step" aria-hidden="true">{i + 1}</span>
            <span className="editor-panel__tab-label">{sec.label}</span>
          </button>
        ))}
      </nav>

      <div className="editor-panel__body" ref={bodyRef}>

        {/* ── Portada / Hero ── */}
        {activeSection === 'hero' && (
          <div className="editor-panel__section">
            <p className="editor-panel__group-label">Nombres</p>
            <EditorField label="Nombre de la novia" fieldKey="brideName" placeholder="Ej: Sofia" />
            <EditorField label="Nombre del novio"   fieldKey="groomName" placeholder="Ej: Alejandro" />

            <p className="editor-panel__group-label">Fecha y hora de la boda</p>
            <DatePicker
              isoValue={data.weddingDateIso}
              timeValue={data.weddingTime}
              onIsoChange={(v) => setField('weddingDateIso', v)}
              onDisplayChange={(v) => setField('weddingDateDisplay', v)}
              onTimeChange={(v) => setField('weddingTime', v)}
            />

            <p className="editor-panel__group-label">Foto de portada</p>
            <EditorImageField fieldKey="imageHero" />
          </div>
        )}

        {/* ── Colores de la invitación ── */}
        {activeSection === 'colores' && (
          <div className="editor-panel__section">
            <p className="editor-panel__group-label">Paleta de colores</p>
            <p className="editor-panel__hint">
              Elige una paleta y toda la invitación se adapta al instante: los
              tonos intermedios se calculan solos para que siempre combinen.
            </p>

            {palettePresets.length === 0 ? (
              <p className="editor-panel__hint">Cargando paletas…</p>
            ) : (
              <>
                <div className="editor-panel__palette-list">
                  {palettePresets.map((preset, i) => (
                    <button
                      key={preset.id}
                      type="button"
                      className={`editor-panel__palette-option${
                        !customPaletteActive && selectedPaletteId === preset.id
                          ? ' editor-panel__palette-option--active'
                          : ''
                      }`}
                      onClick={() => handleSelectPreset(preset, i)}
                    >
                      <span className="editor-panel__palette-dots" aria-hidden="true">
                        <span style={{ background: preset.bg }} />
                        <span style={{ background: preset.accent }} />
                        <span style={{ background: preset.text }} />
                      </span>
                      <span className="editor-panel__palette-name">
                        {preset.label}
                        {i === 0 && <span className="editor-panel__palette-tag">Original</span>}
                      </span>
                    </button>
                  ))}

                  <button
                    type="button"
                    className={`editor-panel__palette-option${
                      customPaletteActive ? ' editor-panel__palette-option--active' : ''
                    }`}
                    onClick={handleActivateCustomPalette}
                  >
                    <span className="editor-panel__palette-dots" aria-hidden="true">
                      {customPaletteActive ? (
                        <>
                          <span style={{ background: data.colorPalette.bg }} />
                          <span style={{ background: data.colorPalette.accent }} />
                          <span style={{ background: data.colorPalette.text }} />
                        </>
                      ) : (
                        <span className="editor-panel__palette-dot-custom" />
                      )}
                    </span>
                    <span className="editor-panel__palette-name">Personalizada</span>
                  </button>
                </div>

                {customPaletteActive && (
                  <div className="editor-panel__palette-custom">
                    {CUSTOM_PALETTE_FIELDS.map(({ key, label }) => (
                      <div key={key} className="editor-panel__palette-custom-row">
                        <label
                          className="editor-panel__color-swatch"
                          style={{ background: data.colorPalette[key] }}
                          title={label}
                        >
                          <input
                            type="color"
                            className="editor-panel__color-input"
                            value={data.colorPalette[key]}
                            onChange={(e) => setCustomPaletteColor(key, e.target.value)}
                          />
                        </label>
                        <span className="editor-panel__palette-custom-label">{label}</span>
                        <span className="editor-panel__palette-custom-hex">
                          {data.colorPalette[key]}
                        </span>
                      </div>
                    ))}
                    <p className="editor-panel__hint">
                      Si el texto no contrasta bien con el fondo, lo ajustamos
                      automáticamente para que la invitación siempre sea legible.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Nuestra Historia — solo Soho ── */}
        {activeSection === 'historia' && !isElegant && (
          <div className="editor-panel__section">
            <EditorField label="Texto introductorio" fieldKey="storyIntro" multiline placeholder="Frase de bienvenida..." />

            <p className="editor-panel__group-label">Momentos</p>
            {data.storyItems.map((item, i) => (
              <div key={item.id} className="editor-panel__card">
                <div className="editor-panel__card-header">
                  <span className="editor-panel__card-title">Momento {i + 1}</span>
                  {data.storyItems.length > 1 && (
                    <button
                      className="editor-panel__remove-btn"
                      onClick={() => removeStoryItem(i)}
                      aria-label="Eliminar momento"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <div className="editor-panel__row">
                  <div className="editor-panel__col-sm">
                    <label className="editor-panel__inline-label">Año</label>
                    <input
                      className="editor-panel__inline-input"
                      value={item.year}
                      placeholder="2019"
                      onFocus={() => setActiveField(`storyItem-${i}`)}
                      onBlur={() => setActiveField(null)}
                      onChange={(e) => setStoryItem(i, 'year', e.target.value)}
                    />
                  </div>
                  <div className="editor-panel__col-lg">
                    <label className="editor-panel__inline-label">Título</label>
                    <input
                      className="editor-panel__inline-input"
                      value={item.label}
                      placeholder="Primer Encuentro"
                      onFocus={() => setActiveField(`storyItem-${i}`)}
                      onBlur={() => setActiveField(null)}
                      onChange={(e) => setStoryItem(i, 'label', e.target.value)}
                    />
                  </div>
                </div>
                <label className="editor-panel__inline-label">Descripción</label>
                <textarea
                  className="editor-panel__inline-textarea"
                  value={item.text}
                  rows={3}
                  onFocus={() => setActiveField(`storyItem-${i}`)}
                  onBlur={() => setActiveField(null)}
                  onChange={(e) => setStoryItem(i, 'text', e.target.value)}
                />
              </div>
            ))}
            <button className="editor-panel__add-btn" onClick={addStoryItem}>
              + Agregar momento
            </button>
          </div>
        )}

        {/* ── Eventos (Ceremonia & Recepción) ── */}
        {activeSection === 'eventos' && (
          <div className="editor-panel__section">
            <p className="editor-panel__group-label">¿Cómo será el evento?</p>
            <div className="editor-panel__mode-group">
              {EVENTS_MODE_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`editor-panel__mode-option ${
                    (data.eventsMode ?? 'separate') === opt.value ? 'editor-panel__mode-option--active' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="eventsMode"
                    className="editor-panel__mode-radio"
                    value={opt.value}
                    checked={(data.eventsMode ?? 'separate') === opt.value}
                    onChange={() => setField('eventsMode', opt.value)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>

            {(data.eventsMode ?? 'separate') === 'separate' && (
              <>
                <p className="editor-panel__group-label">Ceremonia</p>
                <EditorField label="Hora"      fieldKey="ceremonyTime"         placeholder="17:00 hrs" />
                <EditorField label="Lugar"     fieldKey="ceremonyVenueName"    placeholder="Nombre de la iglesia" />
                <EditorField label="Dirección" fieldKey="ceremonyVenueAddress" placeholder="Calle, ciudad" />
                <EditorField
                  label="Link Google Maps"
                  fieldKey="ceremonyMapsLink"
                  placeholder="https://maps.google.com/?q=..."
                  onChange={(v) => {
                    setField('ceremonyMapsLink', v);
                    const embed = mapsLinkToEmbedSrc(v);
                    if (embed) setField('ceremonyMapsEmbedSrc', embed);
                  }}
                />

                <p className="editor-panel__group-label">Recepción</p>
                <EditorField label="Hora"      fieldKey="receptionTime"         placeholder="20:00 hrs" />
                <EditorField label="Lugar"     fieldKey="receptionVenueName"    placeholder="Nombre del salón" />
                <EditorField label="Dirección" fieldKey="receptionVenueAddress" placeholder="Calle, ciudad" />
                <EditorField
                  label="Link Google Maps"
                  fieldKey="receptionMapsLink"
                  placeholder="https://maps.google.com/?q=..."
                  onChange={(v) => {
                    setField('receptionMapsLink', v);
                    const embed = mapsLinkToEmbedSrc(v);
                    if (embed) setField('receptionMapsEmbedSrc', embed);
                  }}
                />
              </>
            )}

            {data.eventsMode === 'same' && (
              <>
                <p className="editor-panel__group-label">Horarios</p>
                <EditorField label="Hora ceremonia" fieldKey="ceremonyTime"  placeholder="17:00 hrs" />
                <EditorField label="Hora recepción" fieldKey="receptionTime" placeholder="20:00 hrs" />

                <p className="editor-panel__group-label">Lugar del evento</p>
                <EditorField label="Lugar"     fieldKey="receptionVenueName"    placeholder="Nombre del salón" />
                <EditorField label="Dirección" fieldKey="receptionVenueAddress" placeholder="Calle, ciudad" />
                <EditorField
                  label="Link Google Maps"
                  fieldKey="receptionMapsLink"
                  placeholder="https://maps.google.com/?q=..."
                  onChange={(v) => {
                    setField('receptionMapsLink', v);
                    const embed = mapsLinkToEmbedSrc(v);
                    if (embed) setField('receptionMapsEmbedSrc', embed);
                  }}
                />
              </>
            )}

            {data.eventsMode === 'reception-only' && (
              <>
                <p className="editor-panel__group-label">Recepción</p>
                <EditorField label="Hora"      fieldKey="receptionTime"         placeholder="20:00 hrs" />
                <EditorField label="Lugar"     fieldKey="receptionVenueName"    placeholder="Nombre del salón" />
                <EditorField label="Dirección" fieldKey="receptionVenueAddress" placeholder="Calle, ciudad" />
                <EditorField
                  label="Link Google Maps"
                  fieldKey="receptionMapsLink"
                  placeholder="https://maps.google.com/?q=..."
                  onChange={(v) => {
                    setField('receptionMapsLink', v);
                    const embed = mapsLinkToEmbedSrc(v);
                    if (embed) setField('receptionMapsEmbedSrc', embed);
                  }}
                />
              </>
            )}
          </div>
        )}

        {/* ── Cronograma ── */}
        {activeSection === 'cronograma' && (
          <div className="editor-panel__section">
            {!isElegant && (
              <EditorField
                label="Frase del cronograma"
                fieldKey="scheduleIntro"
                multiline
                placeholder="Cada momento del día fue pensado con amor…"
              />
            )}
            {data.scheduleItems.map((item, i) => (
              <div key={item.id} className="editor-panel__card">
                <div className="editor-panel__card-header">
                  <span className="editor-panel__card-title">Actividad {i + 1}</span>
                  {data.scheduleItems.length > 1 && (
                    <button
                      className="editor-panel__remove-btn"
                      onClick={() => removeScheduleItem(i)}
                      aria-label="Eliminar actividad"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <div className="editor-panel__row">
                  <div className="editor-panel__col-sm">
                    <label className="editor-panel__inline-label">Hora</label>
                    <input
                      className="editor-panel__inline-input"
                      value={item.time}
                      placeholder="17:00"
                      onFocus={() => setActiveField(`scheduleItem-${i}`)}
                      onBlur={() => setActiveField(null)}
                      onChange={(e) => setScheduleItem(i, 'time', e.target.value)}
                    />
                  </div>
                  {!isElegant && (
                    <div className="editor-panel__col-sm">
                      <label className="editor-panel__inline-label">Ícono</label>
                      <input
                        className="editor-panel__inline-input"
                        value={item.icon ?? ''}
                        placeholder="💍"
                        onFocus={() => setActiveField(`scheduleItem-${i}`)}
                        onBlur={() => setActiveField(null)}
                        onChange={(e) => setScheduleItem(i, 'icon', e.target.value)}
                      />
                    </div>
                  )}
                  <div className="editor-panel__col-lg">
                    <label className="editor-panel__inline-label">Actividad</label>
                    <input
                      className="editor-panel__inline-input"
                      value={item.label}
                      placeholder="Ceremonia"
                      onFocus={() => setActiveField(`scheduleItem-${i}`)}
                      onBlur={() => setActiveField(null)}
                      onChange={(e) => setScheduleItem(i, 'label', e.target.value)}
                    />
                  </div>
                  {isElegant && (
                    <div className="editor-panel__col-lg">
                      <label className="editor-panel__inline-label">Detalle</label>
                      <input
                        className="editor-panel__inline-input"
                        value={item.detail ?? ''}
                        placeholder="Descripción breve"
                        onFocus={() => setActiveField(`scheduleItem-${i}`)}
                        onBlur={() => setActiveField(null)}
                        onChange={(e) => setScheduleItem(i, 'detail', e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
            <button className="editor-panel__add-btn" onClick={addScheduleItem}>
              + Agregar actividad
            </button>
          </div>
        )}

        {/* ── Vestimenta / Dress Code ── */}
        {activeSection === 'vestimenta' && (
          <div className="editor-panel__section">
            <EditorField label="Estilo"              fieldKey="dressCodeStyle"       placeholder="Cocktail Elegante" />
            <EditorField label="Descripción"         fieldKey="dressCodeDescription" multiline placeholder="Descripción general..." />
            <EditorField label="Indicaciones Damas"  fieldKey="dressCodeWomen"       multiline placeholder="Vestido de cóctel..." />
            <EditorField label="Indicaciones Caballeros" fieldKey="dressCodeMen"     multiline placeholder="Traje con corbata..." />

            <p className="editor-panel__group-label">
              Paleta de colores
              {data.dressCodePalette.length < 4 && (
                <button className="editor-panel__group-add-btn" onClick={addDressCodeColor}>
                  + Agregar
                </button>
              )}
            </p>
            <div className="editor-panel__color-grid">
              {data.dressCodePalette.map((color, i) => (
                <div key={color.id} className="editor-panel__color-item">
                  <div className="editor-panel__color-swatch-wrap">
                    <label
                      className="editor-panel__color-swatch"
                      style={{ background: color.hex }}
                      title={color.label}
                    >
                      <input
                        type="color"
                        className="editor-panel__color-input"
                        value={color.hex}
                        onChange={(e) => setDressCodeColor(i, e.target.value)}
                      />
                    </label>
                    {data.dressCodePalette.length > 1 && (
                      <button
                        className="editor-panel__color-remove-btn"
                        onClick={() => removeDressCodeColor(i)}
                        aria-label="Eliminar color"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <input
                    className="editor-panel__color-name-input"
                    value={color.label}
                    maxLength={12}
                    onChange={(e) => setDressCodeColorLabel(i, e.target.value)}
                  />
                </div>
              ))}
            </div>

            {isElegant ? (
              <>
                <p className="editor-panel__group-label">Foto — Damas</p>
                <EditorImageField fieldKey="imageDressCodeWomen" />
                <p className="editor-panel__group-label">Foto — Caballeros</p>
                <EditorImageField fieldKey="imageDressCodeMen" />
              </>
            ) : (
              <>
                <p className="editor-panel__group-label">Foto de vestimenta</p>
                <EditorImageField fieldKey="imageDressCode" />
              </>
            )}
          </div>
        )}

        {/* ── Regalos / Gift Registry ── */}
        {activeSection === 'regalos' && (
          <div className="editor-panel__section">
            <EditorField label="Texto introductorio" fieldKey="giftRegistryIntro" multiline />

            {data.bankAccounts.map((acc, i) => (
              <div key={acc.id} className="editor-panel__card">
                <div className="editor-panel__card-header">
                  <span className="editor-panel__card-title">Cuenta {i + 1}</span>
                  <button
                    className="editor-panel__remove-btn"
                    onClick={() => removeBankAccount(i)}
                    aria-label="Eliminar cuenta"
                  >
                    ✕
                  </button>
                </div>
                <table className="editor-panel__bank-table">
                  <tbody>
                    {[
                      ['Banco',          'bankName'],
                      ['Titular',        'ownerName'],
                      ['Tipo',           'accountType'],
                      ['Identificación', 'accountAlias'],
                      ['Número',         'cbu'],
                    ].map(([lbl, key]) => (
                      <tr key={key}>
                        <td className="editor-panel__bank-cell-label">{lbl}</td>
                        <td className="editor-panel__bank-cell-input">
                          <input
                            className="editor-panel__inline-input"
                            value={acc[key]}
                            onFocus={() => setActiveField('bankAccounts')}
                            onBlur={() => setActiveField(null)}
                            onChange={(e) => setBankAccount(i, key, e.target.value)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
            <button className="editor-panel__add-btn" onClick={addBankAccount}>
              + Agregar cuenta
            </button>
          </div>
        )}

        {/* ── RSVP ── */}
        {activeSection === 'rsvp' && (
          <div className="editor-panel__section">
            <EditorField label="Fecha límite RSVP" fieldKey="rsvpDeadline" placeholder="01 de Julio 2026" />

            <p className="editor-panel__group-label">¿Cómo quieres recibir las confirmaciones?</p>
            <div className="editor-panel__mode-group">
              {RSVP_TYPE_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`editor-panel__mode-option ${
                    data.rsvpType === opt.value ? 'editor-panel__mode-option--active' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="rsvpType"
                    className="editor-panel__mode-radio"
                    value={opt.value}
                    checked={data.rsvpType === opt.value}
                    onChange={() => setField('rsvpType', opt.value)}
                  />
                  <span className="editor-panel__mode-text">
                    <span>{opt.label}</span>
                    <span className="editor-panel__mode-desc">{opt.desc}</span>
                  </span>
                </label>
              ))}
            </div>

            {data.rsvpType === 'whatsapp' && (
              <>
                <EditorField
                  label="Número de WhatsApp"
                  fieldKey="rsvpWhatsapp"
                  placeholder="+593 99 123 4567"
                />
                <p className="editor-panel__hint">
                  Incluye el código de país. Las confirmaciones de tus invitados te llegarán
                  como mensaje de WhatsApp a este número.
                </p>
              </>
            )}

            {data.rsvpType === 'sheets' && (
              <>
                <p className="editor-panel__group-label">Campo de acompañantes</p>
                <div className="editor-panel__mode-group">
                  {COMPANIONS_MODE_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={`editor-panel__mode-option ${
                        data.rsvpCompanionsMode === opt.value ? 'editor-panel__mode-option--active' : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name="rsvpCompanionsMode"
                        className="editor-panel__mode-radio"
                        value={opt.value}
                        checked={data.rsvpCompanionsMode === opt.value}
                        onChange={() => setField('rsvpCompanionsMode', opt.value)}
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>

                {data.rsvpCompanionsMode === 'free' && (
                  <p className="editor-panel__hint">
                    Con acompañantes libres, todos los invitados usan el mismo link y cada uno
                    escribe cuántas personas van.
                  </p>
                )}

                {data.rsvpCompanionsMode === 'limited' && (
                  <>
                    <label className="editor-panel__inline-label">¿Qué tipos de invitados tienes?</label>
                    <div className="editor-panel__checks">
                      {[0, 1, 2, 3, 4, 5, 6].map((n) => (
                        <label
                          key={n}
                          className={`editor-panel__check ${
                            data.rsvpCupos.includes(n) ? 'editor-panel__check--active' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="editor-panel__check-input"
                            checked={data.rsvpCupos.includes(n)}
                            onChange={() => toggleRsvpCupo(n)}
                          />
                          <span>
                            {n === 0
                              ? 'Individuales (sin acompañantes)'
                              : n === 1
                                ? 'Con 1 acompañante'
                                : `Con ${n} acompañantes`}
                          </span>
                        </label>
                      ))}
                    </div>
                    <p className="editor-panel__hint">
                      Marca los tipos de invitados que tienes: se creará un link distinto por cada
                      cupo (a diferencia del modo libre, que usa un solo link para todos). A cada
                      invitado le envías el link que le corresponde, y el formulario solo le
                      permitirá confirmar hasta ese número de acompañantes.
                    </p>
                  </>
                )}
              </>
            )}

            <p className="editor-panel__group-label">
              Preguntas del formulario
              {data.rsvpQuestions.length < 6 && (
                <button className="editor-panel__group-add-btn" onClick={addRsvpQuestion}>
                  + Agregar
                </button>
              )}
            </p>
            <p className="editor-panel__hint">
              Además de nombre, asistencia y acompañantes, estas preguntas aparecen en la
              confirmación. Puedes cambiarlas, agregar más o eliminarlas.
            </p>
            {data.rsvpQuestions.map((q, i) => (
              <div key={q.id} className="editor-panel__card">
                <div className="editor-panel__card-header">
                  <span className="editor-panel__card-title">Pregunta {i + 1}</span>
                  <button
                    className="editor-panel__remove-btn"
                    onClick={() => removeRsvpQuestion(i)}
                    aria-label="Eliminar pregunta"
                  >
                    ✕
                  </button>
                </div>
                <label className="editor-panel__inline-label">Texto de la pregunta</label>
                <input
                  className="editor-panel__inline-input"
                  value={q.label}
                  placeholder="Ej: ¿Alguna restricción alimentaria?"
                  onChange={(e) => setRsvpQuestion(i, 'label', e.target.value)}
                />
                <label className="editor-panel__inline-label">Tipo de respuesta</label>
                <select
                  className="editor-panel__inline-select"
                  value={q.type}
                  onChange={(e) => setRsvpQuestion(i, 'type', e.target.value)}
                >
                  <option value="text">Texto corto</option>
                  <option value="textarea">Texto largo</option>
                </select>
              </div>
            ))}
          </div>
        )}

        {/* ── Footer ── */}
        {activeSection === 'footer' && (
          <div className="editor-panel__section">
            <EditorField label="Mensaje del footer" fieldKey="footerMessage" multiline placeholder="Frase final..." />
          </div>
        )}

        {/* ── Extras ── */}
        {activeSection === 'extras' && (
          <div className="editor-panel__section">
            <p className="editor-panel__extras-hint">
              ¿Hay algo que no puedas configurar desde el editor? Escribilo acá y lo haremos manualmente.
            </p>
            <label className="editor-panel__inline-label">Notas adicionales</label>
            <textarea
              className="editor-panel__extras-textarea"
              rows={8}
              placeholder="Ej: quiero cambiar la fuente del título, agregar una sección de fotos, modificar los colores del footer..."
              value={data.extraNotes ?? ''}
              onChange={(e) => setField('extraNotes', e.target.value)}
            />
          </div>
        )}

        {/* ── Publicar ── */}
        {activeSection === 'publicar' && (
          <div className="editor-panel__section">
            <p className="editor-panel__publish-hint">
              Realiza el pago para generar tu página. En cuanto se confirme,
              tu invitación queda publicada al instante.
            </p>
            <EditorSubmit onSuccess={onSubmitSuccess} />
          </div>
        )}

        {!activeSection && (
          <div className="editor-panel__empty">
            <p>Selecciona una sección para empezar a editar</p>
          </div>
        )}

        {activeSection && navButtons}
      </div>
    </aside>
  );
};

EditorPanel.propTypes = {
  activeSection:   PropTypes.string,
  onSectionChange: PropTypes.func.isRequired,
  onSubmitSuccess: PropTypes.func,
  palettePresets:  PropTypes.arrayOf(PropTypes.shape({
    id:     PropTypes.string.isRequired,
    label:  PropTypes.string.isRequired,
    bg:     PropTypes.string.isRequired,
    accent: PropTypes.string.isRequired,
    text:   PropTypes.string.isRequired,
  })),
};

EditorPanel.defaultProps = {
  activeSection:   null,
  onSubmitSuccess: null,
  palettePresets:  [],
};

export default EditorPanel;

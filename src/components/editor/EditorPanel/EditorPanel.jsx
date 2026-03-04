import PropTypes from 'prop-types';
import { useEditor } from '../../../context/EditorContext';
import EditorField from '../EditorField/EditorField';
import EditorSubmit from '../EditorSubmit/EditorSubmit';
import './EditorPanel.scss';

const SECTIONS = [
  { id: 'hero',       label: 'Portada' },
  { id: 'historia',   label: 'Historia' },
  { id: 'eventos',    label: 'Eventos' },
  { id: 'cronograma', label: 'Cronograma' },
  { id: 'vestimenta', label: 'Vestimenta' },
  { id: 'regalos',    label: 'Regalos' },
  { id: 'rsvp',       label: 'RSVP' },
  { id: 'footer',     label: 'Footer' },
];

// Date picker: renders three selects for day/month/year and syncs to ISO + display strings
const MONTHS = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
];

const DatePicker = ({ isoValue, onIsoChange, onDisplayChange }) => {
  const [y, m, d] = (isoValue || '').split('-');
  const year  = y ? parseInt(y,  10) : '';
  const month = m ? parseInt(m,  10) : '';
  const day   = d ? parseInt(d,  10) : '';

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
    </div>
  );
};

DatePicker.propTypes = {
  isoValue:        PropTypes.string.isRequired,
  onIsoChange:     PropTypes.func.isRequired,
  onDisplayChange: PropTypes.func.isRequired,
};

// ── Main panel ──────────────────────────────────────────────────────────────
const EditorPanel = ({ activeSection, onSectionChange }) => {
  const {
    data,
    setField,
    setStoryItem, addStoryItem, removeStoryItem,
    setScheduleItem, addScheduleItem, removeScheduleItem,
    setBankAccount,
    setDressCodeColor,
    setActiveField,
  } = useEditor();

  return (
    <aside className="editor-panel">
      <header className="editor-panel__header">
        <div className="editor-panel__logo">Editor</div>
        <p className="editor-panel__subtitle">Personaliza tu invitación en tiempo real</p>
      </header>

      <nav className="editor-panel__tabs" aria-label="Secciones">
        {SECTIONS.map((sec) => (
          <button
            key={sec.id}
            className={`editor-panel__tab ${activeSection === sec.id ? 'editor-panel__tab--active' : ''}`}
            onClick={() => onSectionChange(sec.id)}
          >
            {sec.label}
          </button>
        ))}
      </nav>

      <div className="editor-panel__body">

        {/* ── Portada / Hero ── */}
        {activeSection === 'hero' && (
          <div className="editor-panel__section">
            <p className="editor-panel__group-label">Nombres</p>
            <EditorField label="Nombre de la novia" fieldKey="brideName" placeholder="Ej: Sofia" />
            <EditorField label="Nombre del novio"   fieldKey="groomName" placeholder="Ej: Alejandro" />

            <p className="editor-panel__group-label">Fecha de la boda</p>
            <DatePicker
              isoValue={data.weddingDateIso}
              onIsoChange={(v) => setField('weddingDateIso', v)}
              onDisplayChange={(v) => setField('weddingDateDisplay', v)}
            />

            <p className="editor-panel__group-label">Foto de portada</p>
            <EditorField label="URL de la imagen" fieldKey="imageHero" placeholder="https://..." />
            {data.imageHero && (
              <img
                className="editor-panel__img-preview"
                src={data.imageHero}
                alt="Preview portada"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
          </div>
        )}

        {/* ── Nuestra Historia ── */}
        {activeSection === 'historia' && (
          <div className="editor-panel__section">
            <EditorField label="Texto introductorio" fieldKey="storyIntro" multiline placeholder="Frase de bienvenida..." />

            <p className="editor-panel__group-label">Foto de historia</p>
            <EditorField label="URL de la imagen" fieldKey="imageStory" placeholder="https://..." />
            {data.imageStory && (
              <img
                className="editor-panel__img-preview"
                src={data.imageStory}
                alt="Preview historia"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}

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
            <p className="editor-panel__group-label">Ceremonia</p>
            <EditorField label="Hora"             fieldKey="ceremonyTime"          placeholder="17:00 hrs" />
            <EditorField label="Lugar"            fieldKey="ceremonyVenueName"     placeholder="Nombre de la iglesia" />
            <EditorField label="Dirección"        fieldKey="ceremonyVenueAddress"  placeholder="Calle, ciudad" />
            <EditorField label="Link Google Maps" fieldKey="ceremonyMapsLink"      placeholder="https://maps.google.com/..." />

            <p className="editor-panel__group-label">Recepción</p>
            <EditorField label="Hora"             fieldKey="receptionTime"         placeholder="20:00 hrs" />
            <EditorField label="Lugar"            fieldKey="receptionVenueName"    placeholder="Nombre del salón" />
            <EditorField label="Dirección"        fieldKey="receptionVenueAddress" placeholder="Calle, ciudad" />
            <EditorField label="Link Google Maps" fieldKey="receptionMapsLink"     placeholder="https://maps.google.com/..." />
          </div>
        )}

        {/* ── Cronograma ── */}
        {activeSection === 'cronograma' && (
          <div className="editor-panel__section">
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
                  <div className="editor-panel__col-sm">
                    <label className="editor-panel__inline-label">Ícono</label>
                    <input
                      className="editor-panel__inline-input"
                      value={item.icon}
                      placeholder="💍"
                      onFocus={() => setActiveField(`scheduleItem-${i}`)}
                      onBlur={() => setActiveField(null)}
                      onChange={(e) => setScheduleItem(i, 'icon', e.target.value)}
                    />
                  </div>
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

            <p className="editor-panel__group-label">Paleta de colores</p>
            <div className="editor-panel__color-grid">
              {data.dressCodePalette.map((color, i) => (
                <div key={color.id} className="editor-panel__color-item">
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
                  <span className="editor-panel__color-label">{color.label}</span>
                </div>
              ))}
            </div>

            <p className="editor-panel__group-label">Foto de vestimenta</p>
            <EditorField label="URL de la imagen" fieldKey="imageDressCode" placeholder="https://..." />
            {data.imageDressCode && (
              <img
                className="editor-panel__img-preview"
                src={data.imageDressCode}
                alt="Preview vestimenta"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
          </div>
        )}

        {/* ── Regalos / Gift Registry ── */}
        {activeSection === 'regalos' && (
          <div className="editor-panel__section">
            <EditorField label="Texto introductorio" fieldKey="giftRegistryIntro" multiline />

            {data.bankAccounts.map((acc, i) => (
              <div key={acc.id} className="editor-panel__card">
                <p className="editor-panel__card-title">Cuenta {i + 1}</p>
                <table className="editor-panel__bank-table">
                  <tbody>
                    {[
                      ['Banco',    'bankName'],
                      ['Titular',  'ownerName'],
                      ['Tipo',     'accountType'],
                      ['Alias',    'accountAlias'],
                      ['Número',   'cbu'],
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
          </div>
        )}

        {/* ── RSVP ── */}
        {activeSection === 'rsvp' && (
          <div className="editor-panel__section">
            <EditorField label="Fecha límite RSVP" fieldKey="rsvpDeadline" placeholder="01 de Julio 2026" />
          </div>
        )}

        {/* ── Footer ── */}
        {activeSection === 'footer' && (
          <div className="editor-panel__section">
            <EditorField label="Mensaje del footer" fieldKey="footerMessage" multiline placeholder="Frase final..." />
          </div>
        )}

        {/* ── Empty state ── */}
        {!activeSection && (
          <div className="editor-panel__empty">
            <p>Selecciona una sección para empezar a editar</p>
          </div>
        )}
      </div>

      <EditorSubmit />
    </aside>
  );
};

EditorPanel.propTypes = {
  activeSection:   PropTypes.string,
  onSectionChange: PropTypes.func.isRequired,
};

EditorPanel.defaultProps = {
  activeSection: null,
};

export default EditorPanel;

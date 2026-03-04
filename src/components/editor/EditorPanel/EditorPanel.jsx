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

const EditorPanel = ({ activeSection, onSectionChange }) => {
  const { data, setStoryItem, setScheduleItem, setBankAccount, setActiveField } = useEditor();

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

            <p className="editor-panel__group-label">Fecha</p>
            <EditorField label="Fecha (ISO)"     fieldKey="weddingDateIso"     placeholder="2026-09-05" />
            <EditorField label="Fecha (display)" fieldKey="weddingDateDisplay" placeholder="05 · 09 · 2026" />

            <p className="editor-panel__group-label">Foto de portada</p>
            <EditorField label="URL de la foto"  fieldKey="imageHero"  placeholder="https://..." />
          </div>
        )}

        {/* ── Nuestra Historia ── */}
        {activeSection === 'historia' && (
          <div className="editor-panel__section">
            <EditorField label="Texto introductorio" fieldKey="storyIntro" multiline placeholder="Frase de bienvenida..." />

            <p className="editor-panel__group-label">Foto de historia</p>
            <EditorField label="URL de la foto" fieldKey="imageStory" placeholder="https://..." />

            <p className="editor-panel__group-label">Momentos</p>
            {data.storyItems.map((item, i) => (
              <div key={item.id} className="editor-panel__card">
                <p className="editor-panel__card-title">Momento {i + 1}</p>
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
          </div>
        )}

        {/* ── Vestimenta / Dress Code ── */}
        {activeSection === 'vestimenta' && (
          <div className="editor-panel__section">
            <EditorField label="Estilo"              fieldKey="dressCodeStyle"       placeholder="Cocktail Elegante" />
            <EditorField label="Descripción"         fieldKey="dressCodeDescription" multiline placeholder="Descripción general..." />
            <EditorField label="Indicaciones Damas"  fieldKey="dressCodeWomen"       multiline placeholder="Vestido de cóctel..." />
            <EditorField label="Indicaciones Caballeros" fieldKey="dressCodeMen"     multiline placeholder="Traje con corbata..." />

            <p className="editor-panel__group-label">Foto de vestimenta</p>
            <EditorField label="URL de la foto" fieldKey="imageDressCode" placeholder="https://..." />
          </div>
        )}

        {/* ── Regalos / Gift Registry ── */}
        {activeSection === 'regalos' && (
          <div className="editor-panel__section">
            <EditorField label="Texto introductorio" fieldKey="giftRegistryIntro" multiline />

            {data.bankAccounts.map((acc, i) => (
              <div key={acc.id} className="editor-panel__card">
                <p className="editor-panel__card-title">Cuenta {i + 1}</p>
                {[
                  ['Banco',    'bankName'],
                  ['Titular',  'ownerName'],
                  ['Tipo',     'accountType'],
                  ['Alias',    'accountAlias'],
                  ['Número',   'cbu'],
                ].map(([lbl, key]) => (
                  <div key={key} className="editor-panel__bank-row">
                    <label className="editor-panel__inline-label">{lbl}</label>
                    <input
                      className="editor-panel__inline-input"
                      value={acc[key]}
                      onFocus={() => setActiveField('bankAccounts')}
                      onBlur={() => setActiveField(null)}
                      onChange={(e) => setBankAccount(i, key, e.target.value)}
                    />
                  </div>
                ))}
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
  activeSection: PropTypes.string,
  onSectionChange: PropTypes.func.isRequired,
};

EditorPanel.defaultProps = {
  activeSection: null,
};

export default EditorPanel;

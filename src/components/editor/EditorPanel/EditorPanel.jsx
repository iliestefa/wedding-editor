import { useState } from 'react';
import { useEditor } from '../../../context/EditorContext';
import EditorField from '../EditorField/EditorField';
import EditorSubmit from '../EditorSubmit/EditorSubmit';
import './EditorPanel.scss';

const TABS = [
  { id: 'pareja',    label: 'Pareja' },
  { id: 'fecha',     label: 'Fecha & Lugar' },
  { id: 'historia',  label: 'Historia' },
  { id: 'programa',  label: 'Programa' },
  { id: 'vestimenta',label: 'Vestimenta' },
  { id: 'extras',    label: 'Extras' },
];

const EditorPanel = () => {
  const [activeTab, setActiveTab] = useState('pareja');
  const { data, setStoryItem, setScheduleItem, setBankAccount, setActiveField } = useEditor();

  return (
    <aside className="editor-panel">
      <header className="editor-panel__header">
        <div className="editor-panel__monogram" aria-hidden="true">Editor</div>
        <p className="editor-panel__subtitle">Personaliza tu invitación en tiempo real</p>
      </header>

      <nav className="editor-panel__tabs" aria-label="Secciones del editor">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`editor-panel__tab ${activeTab === tab.id ? 'editor-panel__tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="editor-panel__body">

        {/* ── Pareja ── */}
        {activeTab === 'pareja' && (
          <div className="editor-panel__section">
            <EditorField label="Nombre de la novia"  fieldKey="brideName"  placeholder="Ej: Sofia" />
            <EditorField label="Nombre del novio"    fieldKey="groomName"  placeholder="Ej: Alejandro" />
            <EditorField label="Mensaje de la historia" fieldKey="storyIntro" multiline placeholder="Frase de bienvenida..." />
            <EditorField label="Mensaje del footer"  fieldKey="footerMessage" multiline placeholder="Frase final..." />
          </div>
        )}

        {/* ── Fecha & Lugar ── */}
        {activeTab === 'fecha' && (
          <div className="editor-panel__section">
            <p className="editor-panel__section-label">Fecha</p>
            <EditorField label="Fecha (ISO)"     fieldKey="weddingDateIso"     placeholder="2026-09-05" />
            <EditorField label="Fecha (display)" fieldKey="weddingDateDisplay" placeholder="05 · 09 · 2026" />

            <p className="editor-panel__section-label">Ceremonia</p>
            <EditorField label="Hora"      fieldKey="ceremonyTime"          placeholder="17:00 hrs" />
            <EditorField label="Lugar"     fieldKey="ceremonyVenueName"     placeholder="Nombre de la iglesia" />
            <EditorField label="Dirección" fieldKey="ceremonyVenueAddress"  placeholder="Calle, ciudad" />
            <EditorField label="Link Google Maps" fieldKey="ceremonyMapsLink" placeholder="https://maps.google.com/..." />

            <p className="editor-panel__section-label">Recepción</p>
            <EditorField label="Hora"      fieldKey="receptionTime"         placeholder="20:00 hrs" />
            <EditorField label="Lugar"     fieldKey="receptionVenueName"    placeholder="Nombre del salón" />
            <EditorField label="Dirección" fieldKey="receptionVenueAddress" placeholder="Calle, ciudad" />
            <EditorField label="Link Google Maps" fieldKey="receptionMapsLink" placeholder="https://maps.google.com/..." />
          </div>
        )}

        {/* ── Historia ── */}
        {activeTab === 'historia' && (
          <div className="editor-panel__section">
            {data.storyItems.map((item, i) => (
              <div key={item.id} className="editor-panel__story-item">
                <p className="editor-panel__section-label">Momento {i + 1}</p>
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

        {/* ── Programa ── */}
        {activeTab === 'programa' && (
          <div className="editor-panel__section">
            {data.scheduleItems.map((item, i) => (
              <div key={item.id} className="editor-panel__schedule-item">
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

        {/* ── Vestimenta & Regalos ── */}
        {activeTab === 'vestimenta' && (
          <div className="editor-panel__section">
            <p className="editor-panel__section-label">Código de Vestimenta</p>
            <EditorField label="Estilo"               fieldKey="dressCodeStyle"       placeholder="Cocktail Elegante" />
            <EditorField label="Descripción"          fieldKey="dressCodeDescription" multiline placeholder="Descripción general..." />
            <EditorField label="Indicaciones Damas"   fieldKey="dressCodeWomen"       multiline placeholder="Vestido de cóctel..." />
            <EditorField label="Indicaciones Caballeros" fieldKey="dressCodeMen"      multiline placeholder="Traje con corbata..." />

            <p className="editor-panel__section-label">Cuentas para Regalo</p>
            <EditorField label="Texto introductorio" fieldKey="giftRegistryIntro" multiline />
            {data.bankAccounts.map((acc, i) => (
              <div key={acc.id} className="editor-panel__bank-item">
                <p className="editor-panel__section-label">Cuenta {i + 1}</p>
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

        {/* ── Extras ── */}
        {activeTab === 'extras' && (
          <div className="editor-panel__section">
            <EditorField label="Fecha límite RSVP" fieldKey="rsvpDeadline" placeholder="01 de Julio 2026" />
          </div>
        )}
      </div>

      <EditorSubmit />
    </aside>
  );
};

export default EditorPanel;

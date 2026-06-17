import PropTypes from "prop-types";
import { useEditor } from "../../../context/EditorContext";
import EditorField from "../EditorField/EditorField";
import EditorSubmit from "../EditorSubmit/EditorSubmit";
import { mapsLinkToEmbedSrc } from "../../../utils/mapsUtils";
import "./EditorPanel.scss";

const SECTIONS_SOHO = [
  { id: "hero", label: "Portada" },
  { id: "historia", label: "Historia" },
  { id: "eventos", label: "Eventos" },
  { id: "cronograma", label: "Cronograma" },
  { id: "vestimenta", label: "Vestimenta" },
  { id: "regalos", label: "Regalos" },
  { id: "rsvp", label: "RSVP" },
  { id: "footer", label: "Footer" },
  { id: "extras", label: "Extras" },
];

const SECTIONS_ELEGANT = [
  { id: "hero", label: "Portada" },
  { id: "eventos", label: "Eventos" },
  { id: "cronograma", label: "Cronograma" },
  { id: "vestimenta", label: "Vestimenta" },
  { id: "regalos", label: "Regalos" },
  { id: "rsvp", label: "RSVP" },
  { id: "footer", label: "Footer" },
  { id: "extras", label: "Extras" },
];

const SECTIONS_ANIMATED = [
  { id: "hero", label: "Portada" },
  { id: "historia", label: "Historia" },
  { id: "eventos", label: "Eventos" },
  { id: "itinerario", label: "Itinerario" },
  { id: "información", label: "Información" },
  { id: "cierre", label: "Cierre" },
  { id: "extras", label: "Extras" },
];

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES_OPTS = ["00", "15", "30", "45"];

const DatePicker = ({
  isoValue,
  timeValue,
  onIsoChange,
  onDisplayChange,
  onTimeChange,
}) => {
  const [y, m, d] = (isoValue || "").split("-");
  const year = y ? parseInt(y, 10) : "";
  const month = m ? parseInt(m, 10) : "";
  const day = d ? parseInt(d, 10) : "";

  const [th, tm] = (timeValue || "17:00").split(":");
  const timeH = th || "17";
  const timeM = tm || "00";

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear + i);
  const daysInMonth = month && year ? new Date(year, month, 0).getDate() : 31;
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const buildValues = (newY, newM, newD) => {
    if (!newY || !newM || !newD) return;
    const iso = `${newY}-${String(newM).padStart(2, "0")}-${String(newD).padStart(2, "0")}`;
    const display = `${String(newD).padStart(2, "0")} · ${String(newM).padStart(2, "0")} · ${newY}`;
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
          {days.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
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
            <option key={i + 1} value={i + 1}>
              {name}
            </option>
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
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
      <div className="editor-panel__date-col">
        <label className="editor-panel__inline-label">Hora</label>
        <select
          className="editor-panel__inline-select"
          value={timeH}
          onChange={(e) => onTimeChange(`${e.target.value}:${timeM}`)}
        >
          {HOURS.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
      </div>
      <div className="editor-panel__date-col">
        <label className="editor-panel__inline-label">Min</label>
        <select
          className="editor-panel__inline-select"
          value={timeM}
          onChange={(e) => onTimeChange(`${timeH}:${e.target.value}`)}
        >
          {MINUTES_OPTS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

DatePicker.propTypes = {
  isoValue: PropTypes.string.isRequired,
  timeValue: PropTypes.string,
  onIsoChange: PropTypes.func.isRequired,
  onDisplayChange: PropTypes.func.isRequired,
  onTimeChange: PropTypes.func.isRequired,
};
DatePicker.defaultProps = { timeValue: "17:00" };

// ── Initials preview ─────────────────────────────────────────────────────────
const InitialsPreview = ({ groomName, brideName }) => {
  const g = (groomName || "A")[0].toUpperCase();
  const b = (brideName || "M")[0].toUpperCase();
  return (
    <div className="editor-panel__initials-preview">
      <span>{g}</span>
      <span className="editor-panel__initials-sep">&amp;</span>
      <span>{b}</span>
    </div>
  );
};

InitialsPreview.propTypes = {
  groomName: PropTypes.string,
  brideName: PropTypes.string,
};
InitialsPreview.defaultProps = { groomName: "", brideName: "" };

// ── Image field with preview ──────────────────────────────────────────────────
const ImageField = ({ label, fieldKey, placeholder }) => {
  const { data } = useEditor();
  return (
    <>
      <EditorField
        label={label}
        fieldKey={fieldKey}
        placeholder={placeholder || "https://i.postimg.cc/..."}
      />
      {data[fieldKey] && (
        <img
          className="editor-panel__img-preview"
          src={data[fieldKey]}
          alt={label}
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      )}
    </>
  );
};

ImageField.propTypes = {
  label: PropTypes.string.isRequired,
  fieldKey: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
};
ImageField.defaultProps = { placeholder: "" };

// ── Main panel ───────────────────────────────────────────────────────────────
const EditorPanel = ({ activeSection, onSectionChange, onSubmitSuccess }) => {
  const {
    data,
    templateSlug,
    setField,
    setStoryItem,
    addStoryItem,
    removeStoryItem,
    setScheduleItem,
    addScheduleItem,
    removeScheduleItem,
    setBankAccount,
    setDressCodeColor,
    setDressCodeColorLabel,
    addDressCodeColor,
    removeDressCodeColor,
    setItineraryItem,
    addItineraryItem,
    removeItineraryItem,
    setDressCodeItem,
    addDressCodeItem,
    removeDressCodeItem,
    setGoodToKnowItem,
    addGoodToKnowItem,
    removeGoodToKnowItem,
    setActiveField,
  } = useEditor();

  const isElegant = templateSlug === "elegant";
  const isAnimated = templateSlug === "animated";
  const sections = isAnimated
    ? SECTIONS_ANIMATED
    : isElegant
      ? SECTIONS_ELEGANT
      : SECTIONS_SOHO;

  return (
    <aside className="editor-panel">
      <header className="editor-panel__header">
        <div className="editor-panel__logo">Editor</div>
        <p className="editor-panel__subtitle">
          Personaliza tu invitación en tiempo real
        </p>
      </header>

      <nav className="editor-panel__tabs" aria-label="Secciones">
        {sections.map((sec) => (
          <button
            key={sec.id}
            className={`editor-panel__tab ${activeSection === sec.id ? "editor-panel__tab--active" : ""}`}
            onClick={() => onSectionChange(sec.id)}
          >
            {sec.label}
          </button>
        ))}
      </nav>

      <div className="editor-panel__body">
        {/* ══════════════════════════════════════════════════════════════
            PORTADA / HERO  (todos los templates)
        ══════════════════════════════════════════════════════════════ */}
        {activeSection === "hero" && (
          <div className="editor-panel__section">
            <p className="editor-panel__group-label">Nombres</p>
            <EditorField
              label="Nombre de la novia"
              fieldKey="brideName"
              placeholder="Ej: María"
            />
            <EditorField
              label="Nombre del novio"
              fieldKey="groomName"
              placeholder="Ej: Alejandro"
            />

            {isAnimated && (
              <>
                <p className="editor-panel__group-label">
                  Iniciales (calculadas automáticamente)
                </p>
                <InitialsPreview
                  groomName={data.groomName}
                  brideName={data.brideName}
                />

                <p className="editor-panel__group-label">
                  Frase sobre la canción
                </p>
                <EditorField
                  label="Frase"
                  fieldKey="phrase"
                  multiline
                  placeholder="El destino nos unió..."
                />

                <p className="editor-panel__group-label">
                  Nombre de la canción
                </p>
                <EditorField
                  label="Canción"
                  fieldKey="songName"
                  placeholder="Nuestra canción — Perfect"
                />

                <p className="editor-panel__group-label">Música de fondo</p>
                <div className="editor-panel__music-row">
                  <EditorField
                    label="URL del archivo .mp3"
                    fieldKey="musicUrl"
                    placeholder="https://ejemplo.com/cancion.mp3"
                  />
                  {data.musicUrl && (
                    <button
                      type="button"
                      className="editor-panel__music-clear"
                      onClick={() => setField("musicUrl", "")}
                      title="Eliminar enlace y usar música predeterminada"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <p className="editor-panel__hint">
                  {data.musicUrl ? (
                    <>
                      Usando URL personalizada ·{" "}
                      <a
                        href={data.musicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        verificar
                      </a>
                    </>
                  ) : (
                    "Usando música predeterminada del template"
                  )}
                </p>
              </>
            )}

            <p className="editor-panel__group-label">Fecha y hora de la boda</p>
            <DatePicker
              isoValue={data.weddingDateIso}
              timeValue={data.weddingTime}
              onIsoChange={(v) => setField("weddingDateIso", v)}
              onDisplayChange={(v) => setField("weddingDateDisplay", v)}
              onTimeChange={(v) => setField("weddingTime", v)}
            />

            <p className="editor-panel__group-label">Foto de portada</p>
            <ImageField label="URL de la imagen" fieldKey="imageHero" />
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            HISTORIA — Soho (momentos con línea de tiempo)
        ══════════════════════════════════════════════════════════════ */}
        {activeSection === "historia" && !isElegant && !isAnimated && (
          <div className="editor-panel__section">
            <EditorField
              label="Texto introductorio"
              fieldKey="storyIntro"
              multiline
              placeholder="Frase de bienvenida..."
            />

            <p className="editor-panel__group-label">Momentos</p>
            {data.storyItems.map((item, i) => (
              <div key={item.id} className="editor-panel__card">
                <div className="editor-panel__card-header">
                  <span className="editor-panel__card-title">
                    Momento {i + 1}
                  </span>
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
                      onChange={(e) => setStoryItem(i, "year", e.target.value)}
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
                      onChange={(e) => setStoryItem(i, "label", e.target.value)}
                    />
                  </div>
                </div>
                <label className="editor-panel__inline-label">
                  Descripción
                </label>
                <textarea
                  className="editor-panel__inline-textarea"
                  value={item.text}
                  rows={3}
                  onFocus={() => setActiveField(`storyItem-${i}`)}
                  onBlur={() => setActiveField(null)}
                  onChange={(e) => setStoryItem(i, "text", e.target.value)}
                />
              </div>
            ))}
            <button className="editor-panel__add-btn" onClick={addStoryItem}>
              + Agregar momento
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            HISTORIA — Animated (párrafo + firma)
        ══════════════════════════════════════════════════════════════ */}
        {activeSection === "historia" && isAnimated && (
          <div className="editor-panel__section">
            <p className="editor-panel__group-label">Historia de la pareja</p>
            <EditorField
              label="Historia"
              fieldKey="story"
              multiline
              placeholder="Cuéntanos cómo se conocieron..."
            />

            <p className="editor-panel__group-label">Firma</p>
            <EditorField
              label="Firma"
              fieldKey="storyBy"
              placeholder="— María"
            />
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            EVENTOS — Soho / Elegant (ceremonia + recepción con venue)
        ══════════════════════════════════════════════════════════════ */}
        {activeSection === "eventos" && !isAnimated && (
          <div className="editor-panel__section">
            <p className="editor-panel__group-label">Ceremonia</p>
            <EditorField
              label="Hora"
              fieldKey="ceremonyTime"
              placeholder="17:00 hrs"
            />
            <EditorField
              label="Lugar"
              fieldKey="ceremonyVenueName"
              placeholder="Nombre de la iglesia"
            />
            <EditorField
              label="Dirección"
              fieldKey="ceremonyVenueAddress"
              placeholder="Calle, ciudad"
            />
            <EditorField
              label="Link Google Maps"
              fieldKey="ceremonyMapsLink"
              placeholder="https://maps.google.com/?q=..."
              onChange={(v) => {
                setField("ceremonyMapsLink", v);
                const e = mapsLinkToEmbedSrc(v);
                if (e) setField("ceremonyMapsEmbedSrc", e);
              }}
            />

            <p className="editor-panel__group-label">Recepción</p>
            <EditorField
              label="Hora"
              fieldKey="receptionTime"
              placeholder="20:00 hrs"
            />
            <EditorField
              label="Lugar"
              fieldKey="receptionVenueName"
              placeholder="Nombre del salón"
            />
            <EditorField
              label="Dirección"
              fieldKey="receptionVenueAddress"
              placeholder="Calle, ciudad"
            />
            <EditorField
              label="Link Google Maps"
              fieldKey="receptionMapsLink"
              placeholder="https://maps.google.com/?q=..."
              onChange={(v) => {
                setField("receptionMapsLink", v);
                const e = mapsLinkToEmbedSrc(v);
                if (e) setField("receptionMapsEmbedSrc", e);
              }}
            />
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            EVENTOS — Animated (venue único + horarios + foto)
        ══════════════════════════════════════════════════════════════ */}
        {activeSection === "eventos" && isAnimated && (
          <div className="editor-panel__section">
            <p className="editor-panel__group-label">Lugar</p>
            <EditorField
              label="Nombre del lugar"
              fieldKey="venueName"
              placeholder="Ex Convento de San Hipólito"
            />
            <EditorField
              label="Dirección"
              fieldKey="venueAddr"
              placeholder="Av. Hidalgo 107, Ciudad de México"
            />
            <EditorField
              label="Link Google Maps"
              fieldKey="mapsUrl"
              placeholder="https://www.google.com/maps/..."
            />

            <p className="editor-panel__group-label">Horarios</p>
            <EditorField
              label="Hora Ceremonia"
              fieldKey="ceremonyTime"
              placeholder="18:00"
            />
            <EditorField
              label="Hora Recepción"
              fieldKey="receptionTime"
              placeholder="19:00"
            />

            <p className="editor-panel__group-label">Foto del evento</p>
            <ImageField label="URL de la imagen" fieldKey="imageEvent" />
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            CRONOGRAMA — Soho / Elegant
        ══════════════════════════════════════════════════════════════ */}
        {activeSection === "cronograma" && !isAnimated && (
          <div className="editor-panel__section">
            {data.scheduleItems.map((item, i) => (
              <div key={item.id} className="editor-panel__card">
                <div className="editor-panel__card-header">
                  <span className="editor-panel__card-title">
                    Actividad {i + 1}
                  </span>
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
                      onChange={(e) =>
                        setScheduleItem(i, "time", e.target.value)
                      }
                    />
                  </div>
                  {!isElegant && (
                    <div className="editor-panel__col-sm">
                      <label className="editor-panel__inline-label">
                        Ícono
                      </label>
                      <input
                        className="editor-panel__inline-input"
                        value={item.icon ?? ""}
                        placeholder="💍"
                        onFocus={() => setActiveField(`scheduleItem-${i}`)}
                        onBlur={() => setActiveField(null)}
                        onChange={(e) =>
                          setScheduleItem(i, "icon", e.target.value)
                        }
                      />
                    </div>
                  )}
                  <div className="editor-panel__col-lg">
                    <label className="editor-panel__inline-label">
                      Actividad
                    </label>
                    <input
                      className="editor-panel__inline-input"
                      value={item.label}
                      placeholder="Ceremonia"
                      onFocus={() => setActiveField(`scheduleItem-${i}`)}
                      onBlur={() => setActiveField(null)}
                      onChange={(e) =>
                        setScheduleItem(i, "label", e.target.value)
                      }
                    />
                  </div>
                  {isElegant && (
                    <div className="editor-panel__col-lg">
                      <label className="editor-panel__inline-label">
                        Detalle
                      </label>
                      <input
                        className="editor-panel__inline-input"
                        value={item.detail ?? ""}
                        placeholder="Descripción breve"
                        onFocus={() => setActiveField(`scheduleItem-${i}`)}
                        onBlur={() => setActiveField(null)}
                        onChange={(e) =>
                          setScheduleItem(i, "detail", e.target.value)
                        }
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

        {/* ══════════════════════════════════════════════════════════════
            ITINERARIO — Animated
        ══════════════════════════════════════════════════════════════ */}
        {activeSection === "itinerario" && isAnimated && (
          <div className="editor-panel__section">
            <p className="editor-panel__group-label">Actividades del día</p>
            {(data.itineraryItems || []).map((item, i) => (
              <div key={item.id} className="editor-panel__card">
                <div className="editor-panel__card-header">
                  <span className="editor-panel__card-title">
                    Actividad {i + 1}
                  </span>
                  {data.itineraryItems.length > 1 && (
                    <button
                      className="editor-panel__remove-btn"
                      onClick={() => removeItineraryItem(i)}
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
                      placeholder="18:00"
                      onFocus={() => setActiveField(`itineraryItem-${i}`)}
                      onBlur={() => setActiveField(null)}
                      onChange={(e) =>
                        setItineraryItem(i, "time", e.target.value)
                      }
                    />
                  </div>
                  <div className="editor-panel__col-lg">
                    <label className="editor-panel__inline-label">
                      Actividad
                    </label>
                    <input
                      className="editor-panel__inline-input"
                      value={item.label}
                      placeholder="Ceremonia"
                      onFocus={() => setActiveField(`itineraryItem-${i}`)}
                      onBlur={() => setActiveField(null)}
                      onChange={(e) =>
                        setItineraryItem(i, "label", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              className="editor-panel__add-btn"
              onClick={addItineraryItem}
            >
              + Agregar actividad
            </button>

            <p
              className="editor-panel__group-label"
              style={{ marginTop: "20px" }}
            >
              Foto del itinerario
            </p>
            <ImageField label="URL de la imagen" fieldKey="imageItinerary" />
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            VESTIMENTA — Soho / Elegant
        ══════════════════════════════════════════════════════════════ */}
        {activeSection === "vestimenta" && !isAnimated && (
          <div className="editor-panel__section">
            <EditorField
              label="Estilo"
              fieldKey="dressCodeStyle"
              placeholder="Cocktail Elegante"
            />
            <EditorField
              label="Descripción"
              fieldKey="dressCodeDescription"
              multiline
              placeholder="Descripción general..."
            />
            <EditorField
              label="Indicaciones Damas"
              fieldKey="dressCodeWomen"
              multiline
              placeholder="Vestido de cóctel..."
            />
            <EditorField
              label="Indicaciones Caballeros"
              fieldKey="dressCodeMen"
              multiline
              placeholder="Traje con corbata..."
            />

            <p className="editor-panel__group-label">
              Paleta de colores
              {data.dressCodePalette.length < 8 && (
                <button
                  className="editor-panel__group-add-btn"
                  onClick={addDressCodeColor}
                >
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
                <ImageField
                  label="URL de la imagen"
                  fieldKey="imageDressCodeWomen"
                />
                <p className="editor-panel__group-label">Foto — Caballeros</p>
                <ImageField
                  label="URL de la imagen"
                  fieldKey="imageDressCodeMen"
                />
              </>
            ) : (
              <>
                <p className="editor-panel__group-label">Foto de vestimenta</p>
                <ImageField
                  label="URL de la imagen"
                  fieldKey="imageDressCode"
                />
              </>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            INFORMACIÓN — Animated (dress code + regalos + extra acordeones)
        ══════════════════════════════════════════════════════════════ */}
        {activeSection === "información" && isAnimated && (
          <div className="editor-panel__section">
            <p className="editor-panel__group-label">Código de vestimenta</p>
            {(data.dressCodeItems || []).map((item, i) => (
              <div key={item.id} className="editor-panel__card">
                <div className="editor-panel__card-header">
                  <span className="editor-panel__card-title">
                    Bloque de información {i + 1}
                  </span>
                  {data.dressCodeItems.length > 1 && (
                    <button
                      className="editor-panel__remove-btn"
                      onClick={() => removeDressCodeItem(i)}
                      aria-label="Eliminar bloque de información"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <label className="editor-panel__inline-label">Etiqueta</label>
                <input
                  className="editor-panel__inline-input"
                  value={item.label}
                  placeholder="Mujeres:"
                  onFocus={() => setActiveField(`dressCodeItem-${i}`)}
                  onBlur={() => setActiveField(null)}
                  onChange={(e) => setDressCodeItem(i, "label", e.target.value)}
                />
                <label
                  className="editor-panel__inline-label"
                  style={{ marginTop: "8px" }}
                >
                  Descripción
                </label>
                <textarea
                  className="editor-panel__inline-textarea"
                  value={item.text}
                  rows={3}
                  onFocus={() => setActiveField(`dressCodeItem-${i}`)}
                  onBlur={() => setActiveField(null)}
                  onChange={(e) => setDressCodeItem(i, "text", e.target.value)}
                />
              </div>
            ))}
            <button
              className="editor-panel__add-btn"
              onClick={addDressCodeItem}
            >
              + Agregar bloque
            </button>

            <p
              className="editor-panel__group-label"
              style={{ marginTop: "20px" }}
            >
              Regalos
            </p>
            <EditorField
              label="Texto de regalos"
              fieldKey="giftsContent"
              multiline
              placeholder="Su presencia es nuestro mejor regalo..."
            />

            <p className="editor-panel__group-label">Fotografía</p>
            <EditorField
              label="Texto de fotografía"
              fieldKey="photographyContent"
              multiline
              placeholder="Las fotografías las tomarán profesionales..."
            />

            {(data.goodToKnowItems || []).length > 0 && (
              <p
                className="editor-panel__group-label"
                style={{ marginTop: "20px" }}
              >
                Secciones adicionales
              </p>
            )}
            {(data.goodToKnowItems || []).map((item, i) => (
              <div key={item.id} className="editor-panel__card">
                <div className="editor-panel__card-header">
                  <span className="editor-panel__card-title">
                    Sección extra {i + 1}
                  </span>
                  <button
                    className="editor-panel__remove-btn"
                    onClick={() => removeGoodToKnowItem(i)}
                    aria-label="Eliminar sección"
                  >
                    ✕
                  </button>
                </div>
                <label className="editor-panel__inline-label">Título</label>
                <input
                  className="editor-panel__inline-input"
                  value={item.title}
                  placeholder="Ej: Transporte"
                  onFocus={() => setActiveField(`goodToKnow-${i}`)}
                  onBlur={() => setActiveField(null)}
                  onChange={(e) =>
                    setGoodToKnowItem(i, "title", e.target.value)
                  }
                />
                <label
                  className="editor-panel__inline-label"
                  style={{ marginTop: "8px" }}
                >
                  Contenido
                </label>
                <textarea
                  className="editor-panel__inline-textarea"
                  value={item.content}
                  rows={3}
                  onFocus={() => setActiveField(`goodToKnow-${i}`)}
                  onBlur={() => setActiveField(null)}
                  onChange={(e) =>
                    setGoodToKnowItem(i, "content", e.target.value)
                  }
                />
              </div>
            ))}
            <button
              className="editor-panel__add-btn"
              onClick={addGoodToKnowItem}
            >
              + Agregar sección
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            REGALOS — Soho / Elegant
        ══════════════════════════════════════════════════════════════ */}
        {activeSection === "regalos" && !isAnimated && (
          <div className="editor-panel__section">
            <EditorField
              label="Texto introductorio"
              fieldKey="giftRegistryIntro"
              multiline
            />
            {data.bankAccounts.map((acc, i) => (
              <div key={acc.id} className="editor-panel__card">
                <p className="editor-panel__card-title">Cuenta {i + 1}</p>
                <table className="editor-panel__bank-table">
                  <tbody>
                    {[
                      ["Banco", "bankName"],
                      ["Titular", "ownerName"],
                      ["Tipo", "accountType"],
                      ["Alias", "accountAlias"],
                      ["Número", "cbu"],
                    ].map(([lbl, key]) => (
                      <tr key={key}>
                        <td className="editor-panel__bank-cell-label">{lbl}</td>
                        <td className="editor-panel__bank-cell-input">
                          <input
                            className="editor-panel__inline-input"
                            value={acc[key]}
                            onFocus={() => setActiveField("bankAccounts")}
                            onBlur={() => setActiveField(null)}
                            onChange={(e) =>
                              setBankAccount(i, key, e.target.value)
                            }
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

        {/* ══════════════════════════════════════════════════════════════
            CIERRE — Animated
        ══════════════════════════════════════════════════════════════ */}
        {activeSection === "cierre" && isAnimated && (
          <div className="editor-panel__section">
            <p className="editor-panel__group-label">Verso de cierre</p>
            <EditorField
              label="Verso"
              fieldKey="verse"
              multiline
              placeholder="Me gusta que nos amemos sin necesitarnos..."
            />

            <p className="editor-panel__group-label">Foto de cierre</p>
            <ImageField label="URL de la imagen" fieldKey="imageClosing" />

            <p className="editor-panel__group-label">RSVP — WhatsApp</p>
            <EditorField
              label="Número de WhatsApp"
              fieldKey="whatsappNumber"
              placeholder="521234567890 (con código de país, sin + ni espacios)"
            />
            {data.whatsappNumber && (
              <p
                className="editor-panel__extras-hint"
                style={{ marginTop: "6px" }}
              >
                Enlace: wa.me/{data.whatsappNumber}
              </p>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            RSVP — Soho / Elegant
        ══════════════════════════════════════════════════════════════ */}
        {activeSection === "rsvp" && !isAnimated && (
          <div className="editor-panel__section">
            <EditorField
              label="Fecha límite RSVP"
              fieldKey="rsvpDeadline"
              placeholder="01 de Julio 2026"
            />
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            FOOTER — Soho / Elegant
        ══════════════════════════════════════════════════════════════ */}
        {activeSection === "footer" && !isAnimated && (
          <div className="editor-panel__section">
            <EditorField
              label="Mensaje del footer"
              fieldKey="footerMessage"
              multiline
              placeholder="Frase final..."
            />
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            EXTRAS — todos los templates
        ══════════════════════════════════════════════════════════════ */}
        {activeSection === "extras" && (
          <div className="editor-panel__section">
            <p className="editor-panel__extras-hint">
              ¿Hay algo que no puedas configurar desde el editor? Escribilo acá
              y lo haremos manualmente.
            </p>
            <label className="editor-panel__inline-label">
              Notas adicionales
            </label>
            <textarea
              className="editor-panel__extras-textarea"
              rows={8}
              placeholder="Ej: quiero cambiar la fuente del título, agregar una sección de fotos, modificar los colores del footer..."
              value={data.extraNotes ?? ""}
              onChange={(e) => setField("extraNotes", e.target.value)}
            />
          </div>
        )}

        {!activeSection && (
          <div className="editor-panel__empty">
            <p>Selecciona una sección para empezar a editar</p>
          </div>
        )}
      </div>

      <EditorSubmit onSuccess={onSubmitSuccess} />
    </aside>
  );
};

EditorPanel.propTypes = {
  activeSection: PropTypes.string,
  onSectionChange: PropTypes.func.isRequired,
  onSubmitSuccess: PropTypes.func,
};
EditorPanel.defaultProps = {
  activeSection: null,
  onSubmitSuccess: null,
};

export default EditorPanel;

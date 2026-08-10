import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useEditor } from '../../../context/EditorContext';
import { uploadImage } from '../../../services/imageUploadService';
import './EditorImageField.scss';

const MAX_FILE_BYTES = 25 * 1024 * 1024;

const EditorImageField = ({ label, fieldKey }) => {
  const { data, setField, setActiveField } = useEditor();
  const value = data[fieldKey] ?? '';

  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleFile = async (file) => {
    if (!file || uploading) return;

    if (!file.type.startsWith('image/')) {
      setError('El archivo debe ser una imagen (JPG, PNG…).');
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError('La imagen es demasiado pesada (máximo 25 MB).');
      return;
    }

    setError('');
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setField(fieldKey, url);
    } catch (err) {
      console.error('Error subiendo imagen:', err);
      const detail = err?.message ? ` (${err.message})` : '';
      setError(`No se pudo subir la foto. Revisa tu conexión e intenta de nuevo.${detail}`);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    if (!uploading) inputRef.current?.click();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  return (
    <div
      className="editor-image-field"
      onFocus={() => setActiveField(fieldKey)}
      onBlur={() => setActiveField(null)}
    >
      {label && <span className="editor-image-field__label">{label}</span>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="editor-image-field__file-input"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {value && !uploading ? (
        <div className="editor-image-field__preview-wrap">
          <img
            className="editor-image-field__preview"
            src={value}
            alt="Vista previa"
            onError={(e) => { e.target.style.visibility = 'hidden'; }}
          />
          <div className="editor-image-field__actions">
            <button
              type="button"
              className="editor-image-field__btn"
              onClick={openFileDialog}
            >
              Cambiar foto
            </button>
            <button
              type="button"
              className="editor-image-field__btn editor-image-field__btn--ghost"
              onClick={() => setField(fieldKey, '')}
            >
              Quitar
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className={`editor-image-field__dropzone ${dragOver ? 'editor-image-field__dropzone--over' : ''}`}
          onClick={openFileDialog}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <span className="editor-image-field__spinner" aria-hidden="true" />
              <span>Subiendo foto…</span>
            </>
          ) : (
            <>
              <span className="editor-image-field__icon" aria-hidden="true">📷</span>
              <span>Subir foto</span>
              <span className="editor-image-field__hint">JPG o PNG · se sube automáticamente</span>
            </>
          )}
        </button>
      )}

      {error && <p className="editor-image-field__error">{error}</p>}

      <button
        type="button"
        className="editor-image-field__url-toggle"
        onClick={() => setShowUrlInput((v) => !v)}
      >
        {showUrlInput ? 'Ocultar campo de URL' : '¿Prefieres pegar una URL?'}
      </button>

      {showUrlInput && (
        <input
          type="text"
          className="editor-image-field__url-input"
          value={value}
          placeholder="https://..."
          onChange={(e) => setField(fieldKey, e.target.value)}
        />
      )}
    </div>
  );
};

EditorImageField.propTypes = {
  label:    PropTypes.string,
  fieldKey: PropTypes.string.isRequired,
};
EditorImageField.defaultProps = { label: '' };

export default EditorImageField;

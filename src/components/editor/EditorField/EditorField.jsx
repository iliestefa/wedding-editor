import PropTypes from 'prop-types';
import { useEditor } from '../../../context/EditorContext';
import './EditorField.scss';

const EditorField = ({ label, fieldKey, multiline = false, placeholder = '', onChange }) => {
  const { data, setField, setActiveField } = useEditor();
  const value = data[fieldKey] ?? '';

  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.value);
    } else {
      setField(fieldKey, e.target.value);
    }
  };

  return (
    <div
      className="editor-field"
      onFocus={() => setActiveField(fieldKey)}
      onBlur={() => setActiveField(null)}
    >
      <label className="editor-field__label" htmlFor={fieldKey}>
        {label}
      </label>
      {multiline ? (
        <textarea
          id={fieldKey}
          className="editor-field__textarea"
          value={value}
          placeholder={placeholder}
          onChange={handleChange}
          rows={3}
        />
      ) : (
        <input
          id={fieldKey}
          type="text"
          className="editor-field__input"
          value={value}
          placeholder={placeholder}
          onChange={handleChange}
        />
      )}
    </div>
  );
};

EditorField.propTypes = {
  label:       PropTypes.string.isRequired,
  fieldKey:    PropTypes.string.isRequired,
  multiline:   PropTypes.bool,
  placeholder: PropTypes.string,
  onChange:    PropTypes.func,
};
EditorField.defaultProps = { onChange: null };

export default EditorField;

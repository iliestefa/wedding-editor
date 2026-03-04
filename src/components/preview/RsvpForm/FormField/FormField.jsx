import PropTypes from 'prop-types';

import './FormField.scss';

const FormField = ({ label, htmlFor, error, children }) => (
  <div className={`form-field ${error ? 'form-field--error' : ''}`}>
    <label className="form-field__label" htmlFor={htmlFor}>
      {label}
    </label>
    <div className="form-field__control">
      {children}
    </div>
    {error && (
      <span className="form-field__error" role="alert">
        {error}
      </span>
    )}
  </div>
);

FormField.propTypes = {
  label:    PropTypes.string.isRequired,
  htmlFor:  PropTypes.string.isRequired,
  error:    PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default FormField;

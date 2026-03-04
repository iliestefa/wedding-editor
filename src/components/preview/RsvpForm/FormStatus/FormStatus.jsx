import PropTypes from 'prop-types';

import { FORM_STATUS, FORM_MESSAGES } from '../../../../constants/formConstants';

import './FormStatus.scss';

const FormStatus = ({ status }) => {
  if (status === FORM_STATUS.IDLE || status === FORM_STATUS.LOADING) return null;

  const isSuccess = status === FORM_STATUS.SUCCESS;
  const message   = isSuccess ? FORM_MESSAGES.SUCCESS : FORM_MESSAGES.ERROR;

  return (
    <div className={`form-status form-status--${status}`} role="status" aria-live="polite">
      <span className="form-status__icon">{isSuccess ? '✓' : '!'}</span>
      <p className="form-status__message">{message}</p>
    </div>
  );
};

FormStatus.propTypes = {
  status: PropTypes.oneOf(Object.values(FORM_STATUS)).isRequired,
};

export default FormStatus;

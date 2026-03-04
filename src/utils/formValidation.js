import { FORM_FIELD_NAMES, FORM_MESSAGES } from '../constants';

const validateRsvpForm = (formState) => {
  const errors = {};

  if (!formState[FORM_FIELD_NAMES.GUEST_NAME].trim()) {
    errors[FORM_FIELD_NAMES.GUEST_NAME] = FORM_MESSAGES.VALIDATION_NAME;
  }

  if (!formState[FORM_FIELD_NAMES.ATTENDANCE]) {
    errors[FORM_FIELD_NAMES.ATTENDANCE] = FORM_MESSAGES.VALIDATION_ATTENDANCE;
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};

export default validateRsvpForm;

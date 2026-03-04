import { useReducer, useState } from 'react';

import { FORM_FIELD_NAMES, FORM_STATUS } from '../constants';
import validateRsvpForm from '../utils/formValidation';
import { submitRsvp } from '../services/rsvpService';

const initialFormState = {
  [FORM_FIELD_NAMES.GUEST_NAME]:   '',
  [FORM_FIELD_NAMES.ATTENDANCE]:   '',
  [FORM_FIELD_NAMES.GUEST_COUNT]:  '1',
  [FORM_FIELD_NAMES.DIETARY]:      '',
  [FORM_FIELD_NAMES.SONG_REQUEST]: '',
  [FORM_FIELD_NAMES.MESSAGE]:      '',
};

const formReducer = (state, action) => {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'RESET':
      return initialFormState;
    default:
      return state;
  }
};

const useRsvpForm = () => {
  const [formState, dispatch] = useReducer(formReducer, initialFormState);
  const [errors, setErrors]   = useState({});
  const [status, setStatus]   = useState(FORM_STATUS.IDLE);

  const handleFieldChange = (field, value) => {
    dispatch({ type: 'SET_FIELD', field, value });
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { isValid, errors: validationErrors } = validateRsvpForm(formState);

    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    setStatus(FORM_STATUS.LOADING);

    const success = await submitRsvp(formState);

    if (success) {
      setStatus(FORM_STATUS.SUCCESS);
      dispatch({ type: 'RESET' });
    } else {
      setStatus(FORM_STATUS.ERROR);
    }
  };

  return { formState, errors, status, handleFieldChange, handleSubmit };
};

export default useRsvpForm;

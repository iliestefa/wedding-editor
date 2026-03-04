import { APPS_SCRIPT_URL, FETCH_MODE } from '../constants';

export const submitRsvp = async (formData) => {
  try {
    await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      mode: FETCH_MODE,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    return true;
  } catch {
    return false;
  }
};

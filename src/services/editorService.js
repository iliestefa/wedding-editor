import emailjs from '@emailjs/browser';
import { EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY } from '../constants/editorConstants';

export const sendEditorData = async (weddingData) => {
  const { brideName, groomName } = weddingData;

  const templateParams = {
    subject:      `Nuevos datos de boda — ${brideName} & ${groomName}`,
    bride_name:   brideName,
    groom_name:   groomName,
    wedding_date: weddingData.weddingDateDisplay,
    data_json:    JSON.stringify(weddingData, null, 2),
  };

  await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY);
};

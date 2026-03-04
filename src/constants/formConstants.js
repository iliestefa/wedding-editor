export const ATTENDANCE_OPTIONS = [
  { id: 'yes-solo',     value: 'yes_solo',     label: 'Sí, asistiré solo/a' },
  { id: 'yes-plus-one', value: 'yes_plus_one', label: 'Sí, asistiré con acompañante' },
  { id: 'yes-family',   value: 'yes_family',   label: 'Sí, vamos en familia' },
  { id: 'no',           value: 'no',           label: 'No podré asistir' },
];

export const FORM_FIELD_NAMES = {
  GUEST_NAME:   'guestName',
  ATTENDANCE:   'attendance',
  GUEST_COUNT:  'guestCount',
  DIETARY:      'dietary',
  SONG_REQUEST: 'songRequest',
  MESSAGE:      'message',
};

export const FORM_LABELS = {
  GUEST_NAME:   'Nombre completo *',
  ATTENDANCE:   '¿Asistirás a la boda? *',
  GUEST_COUNT:  'Número de personas (incluido tú)',
  DIETARY:      'Restricciones alimentarias o alergias',
  SONG_REQUEST: 'Una canción que no puede faltar en la pista',
  MESSAGE:      'Un mensaje para los novios',
  SUBMIT:       'CONFIRMAR ASISTENCIA',
};

export const FORM_PLACEHOLDERS = {
  GUEST_NAME:   'Tu nombre y apellido',
  GUEST_COUNT:  '1',
  DIETARY:      'Vegetariano, celíaco, alérgico a…',
  SONG_REQUEST: 'Artista – Canción',
  MESSAGE:      'Escríbeles algo desde el corazón…',
};

export const FORM_STATUS = {
  IDLE:    'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR:   'error',
};

export const FORM_MESSAGES = {
  SUCCESS:              '¡Gracias! Hemos recibido tu confirmación. ¡No podemos esperar para celebrar juntos!',
  ERROR:                'Algo salió mal. Por favor inténtalo de nuevo o escríbenos directamente.',
  VALIDATION_NAME:      'Por favor ingresa tu nombre completo.',
  VALIDATION_ATTENDANCE:'Por favor indica si podrás asistir.',
};

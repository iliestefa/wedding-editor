import { createContext, useContext, useEffect, useReducer, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import * as SohoDefaults from '../constants/weddingDefaults';
import * as ElegantDefaults from '../constants/weddingDefaultsElegant';

const EditorContext = createContext(null);

// ── Autoguardado en localStorage ────────────────────────────────────────────
// Se sube en cada versión del esquema de `data` para invalidar guardados
// viejos si algún día cambian los campos (evita cargar un shape obsoleto).
const STORAGE_VERSION = 1;
const STORAGE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 días
const SAVE_DEBOUNCE_MS = 500;

const buildStorageKey = (templateSlug) => `wedya-editor-draft:${templateSlug}`;

const loadSavedData = (templateSlug) => {
  try {
    const raw = window.localStorage.getItem(buildStorageKey(templateSlug));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.version !== STORAGE_VERSION) return null;
    if (Date.now() - (parsed.savedAt ?? 0) > STORAGE_MAX_AGE_MS) return null;
    return parsed.data ?? null;
  } catch {
    return null;
  }
};

const persistData = (templateSlug, data) => {
  try {
    window.localStorage.setItem(
      buildStorageKey(templateSlug),
      JSON.stringify({ version: STORAGE_VERSION, savedAt: Date.now(), data }),
    );
  } catch {
    // Storage lleno o bloqueado (modo privado, etc.) — el editor sigue
    // funcionando igual, solo sin autoguardado.
  }
};

const clearSavedData = (templateSlug) => {
  try {
    window.localStorage.removeItem(buildStorageKey(templateSlug));
  } catch {
    // no-op
  }
};

const buildInitialState = (slug) => {
  const D = slug === 'elegant' ? ElegantDefaults : SohoDefaults;
  const base = {
    brideName:            D.BRIDE_NAME,
    groomName:            D.GROOM_NAME,
    coupleNames:          D.COUPLE_NAMES,
    weddingDateIso:       D.WEDDING_DATE_ISO,
    weddingDateDisplay:   D.WEDDING_DATE_DISPLAY,
    weddingYear:          D.WEDDING_YEAR,
    weddingTime:          '17:00',
    eventsMode:           'separate',
    ceremonyTime:         D.CEREMONY_TIME,
    ceremonyVenueName:    D.CEREMONY_VENUE_NAME,
    ceremonyVenueAddress: D.CEREMONY_VENUE_ADDRESS,
    ceremonyMapsLink:     D.CEREMONY_MAPS_LINK,
    ceremonyMapsEmbedSrc: D.CEREMONY_MAPS_EMBED_SRC,
    receptionTime:        D.RECEPTION_TIME,
    receptionVenueName:   D.RECEPTION_VENUE_NAME,
    receptionVenueAddress:D.RECEPTION_VENUE_ADDRESS,
    receptionMapsLink:    D.RECEPTION_MAPS_LINK,
    receptionMapsEmbedSrc:D.RECEPTION_MAPS_EMBED_SRC,
    scheduleItems:        D.SCHEDULE_ITEMS,
    dressCodeStyle:       D.DRESS_CODE_STYLE,
    dressCodeDescription: D.DRESS_CODE_DESCRIPTION,
    dressCodeWomen:       D.DRESS_CODE_WOMEN,
    dressCodeMen:         D.DRESS_CODE_MEN,
    dressCodePalette:     D.DRESS_CODE_PALETTE,
    giftRegistryIntro:    D.GIFT_REGISTRY_INTRO,
    bankAccounts:         D.BANK_ACCOUNTS,
    rsvpDeadline:         D.RSVP_DEADLINE,
    rsvpType:             'whatsapp',
    rsvpWhatsapp:         '',
    rsvpCompanionsMode:   'free',
    rsvpCupos:            [0, 1, 2],
    footerMessage:        D.FOOTER_MESSAGE,
    imageHero:            D.IMAGE_HERO,
    // null → paleta original; { id, bg, accent, text } → preset o personalizada
    colorPalette:         null,
  };

  // Soho-only fields
  if (slug !== 'elegant') {
    base.storyIntro    = SohoDefaults.STORY_INTRO;
    base.storyItems    = SohoDefaults.STORY_ITEMS;
    base.scheduleIntro = 'Cada momento del día fue pensado con amor para compartirlo con ustedes.';
    base.imageStory    = SohoDefaults.IMAGE_STORY;
    base.imageDressCode= SohoDefaults.IMAGE_DRESS_CODE;
    base.imageRings    = SohoDefaults.IMAGE_RINGS;
    base.rsvpQuestions = [
      { id: 'dietary', label: 'Restricciones alimentarias o alergias',        type: 'text' },
      { id: 'song',    label: 'Una canción que no puede faltar en la pista',  type: 'text' },
      { id: 'message', label: 'Un mensaje para los novios',                   type: 'textarea' },
    ];
  }

  // Elegant-only fields
  if (slug === 'elegant') {
    base.imageCeremony       = ElegantDefaults.IMAGE_CEREMONY;
    base.imageDressCodeWomen = ElegantDefaults.IMAGE_DRESSCODE_WOMEN;
    base.imageDressCodeMen   = ElegantDefaults.IMAGE_DRESSCODE_MEN;
    base.rsvpQuestions = [
      { id: 'meal',    label: 'Preferencia de menú (estándar, vegetariano…)', type: 'text' },
      { id: 'message', label: 'Mensaje (opcional)',                           type: 'textarea' },
    ];
  }

  return base;
};

const editorReducer = (state, action) => {
  switch (action.type) {
    case 'SET_FIELD':
      if (state[action.field] === action.value) return state;
      return { ...state, [action.field]: action.value };

    case 'SET_STORY_ITEM': {
      const updated = state.storyItems.map((item, i) =>
        i === action.index ? { ...item, [action.key]: action.value } : item
      );
      return { ...state, storyItems: updated };
    }
    case 'ADD_STORY_ITEM': {
      const newItem = { id: `momento-${Date.now()}`, year: '', label: '', text: '' };
      return { ...state, storyItems: [...state.storyItems, newItem] };
    }
    case 'REMOVE_STORY_ITEM': {
      return { ...state, storyItems: state.storyItems.filter((_, i) => i !== action.index) };
    }

    case 'SET_SCHEDULE_ITEM': {
      const updated = state.scheduleItems.map((item, i) =>
        i === action.index ? { ...item, [action.key]: action.value } : item
      );
      return { ...state, scheduleItems: updated };
    }
    case 'ADD_SCHEDULE_ITEM': {
      const newItem = { id: `actividad-${Date.now()}`, time: '', label: '', icon: '✨' };
      return { ...state, scheduleItems: [...state.scheduleItems, newItem] };
    }
    case 'REMOVE_SCHEDULE_ITEM': {
      return { ...state, scheduleItems: state.scheduleItems.filter((_, i) => i !== action.index) };
    }

    case 'SET_BANK_ACCOUNT': {
      const updated = state.bankAccounts.map((acc, i) =>
        i === action.index ? { ...acc, [action.key]: action.value } : acc
      );
      return { ...state, bankAccounts: updated };
    }
    case 'ADD_BANK_ACCOUNT': {
      const newAcc = {
        id: `cuenta-${Date.now()}`,
        ownerName: '', bankName: '', accountType: '',
        accountAlias: '', cbu: '', accountNumberLabel: 'N° de Cuenta',
      };
      return { ...state, bankAccounts: [...state.bankAccounts, newAcc] };
    }
    case 'REMOVE_BANK_ACCOUNT': {
      return { ...state, bankAccounts: state.bankAccounts.filter((_, i) => i !== action.index) };
    }

    case 'SET_RSVP_QUESTION': {
      const updated = state.rsvpQuestions.map((q, i) =>
        i === action.index ? { ...q, [action.key]: action.value } : q
      );
      return { ...state, rsvpQuestions: updated };
    }
    case 'ADD_RSVP_QUESTION': {
      if (state.rsvpQuestions.length >= 6) return state;
      const newQuestion = { id: `pregunta-${Date.now()}`, label: '', type: 'text' };
      return { ...state, rsvpQuestions: [...state.rsvpQuestions, newQuestion] };
    }
    case 'REMOVE_RSVP_QUESTION': {
      return { ...state, rsvpQuestions: state.rsvpQuestions.filter((_, i) => i !== action.index) };
    }

    case 'TOGGLE_RSVP_CUPO': {
      const has = state.rsvpCupos.includes(action.value);
      const updated = has
        ? state.rsvpCupos.filter((n) => n !== action.value)
        : [...state.rsvpCupos, action.value].sort((a, b) => a - b);
      if (!updated.length) return state; // siempre debe quedar al menos un cupo
      return { ...state, rsvpCupos: updated };
    }

    case 'SET_DRESS_CODE_COLOR': {
      const updated = state.dressCodePalette.map((c, i) =>
        i === action.index ? { ...c, hex: action.hex } : c
      );
      return { ...state, dressCodePalette: updated };
    }
    case 'ADD_DRESS_CODE_COLOR': {
      if (state.dressCodePalette.length >= 4) return state;
      const newColor = { id: `color-${Date.now()}`, label: 'Nuevo', hex: '#cccccc' };
      return { ...state, dressCodePalette: [...state.dressCodePalette, newColor] };
    }
    case 'REMOVE_DRESS_CODE_COLOR': {
      if (state.dressCodePalette.length <= 1) return state;
      return { ...state, dressCodePalette: state.dressCodePalette.filter((_, i) => i !== action.index) };
    }
    case 'SET_DRESS_CODE_COLOR_LABEL': {
      const updated = state.dressCodePalette.map((c, i) =>
        i === action.index ? { ...c, label: action.label } : c
      );
      return { ...state, dressCodePalette: updated };
    }

    default:
      return state;
  }
};

export const EditorProvider = ({ templateSlug, children }) => {
  const [data, dispatch] = useReducer(
    editorReducer,
    templateSlug,
    (slug) => {
      const defaults = buildInitialState(slug);
      const saved = loadSavedData(slug);
      return saved ? { ...defaults, ...saved } : defaults;
    },
  );
  const [activeField, setActiveField] = useState(null);

  // El reducer solo devuelve un objeto nuevo cuando algo cambia de verdad
  // (los "no-op" retornan el mismo state) — así detectamos progreso sin
  // necesidad de comparar campo por campo.
  const [initialData] = useState(data);
  const hasChanges = data !== initialData;

  // Autoguardado: cada cambio se persiste (con debounce) para poder
  // recuperar el progreso si se recarga la página o se cierra por error.
  const saveTimeoutRef = useRef(null);
  useEffect(() => {
    if (!hasChanges) return undefined;
    clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      persistData(templateSlug, data);
    }, SAVE_DEBOUNCE_MS);
    return () => clearTimeout(saveTimeoutRef.current);
  }, [data, hasChanges, templateSlug]);

  const setField             = (field, value)        => dispatch({ type: 'SET_FIELD', field, value });
  const setStoryItem         = (index, key, value)   => dispatch({ type: 'SET_STORY_ITEM', index, key, value });
  const addStoryItem         = ()                    => dispatch({ type: 'ADD_STORY_ITEM' });
  const removeStoryItem      = (index)               => dispatch({ type: 'REMOVE_STORY_ITEM', index });
  const setScheduleItem      = (index, key, value)   => dispatch({ type: 'SET_SCHEDULE_ITEM', index, key, value });
  const addScheduleItem      = ()                    => dispatch({ type: 'ADD_SCHEDULE_ITEM' });
  const removeScheduleItem   = (index)               => dispatch({ type: 'REMOVE_SCHEDULE_ITEM', index });
  const setBankAccount       = (index, key, value)   => dispatch({ type: 'SET_BANK_ACCOUNT', index, key, value });
  const addBankAccount       = ()                    => dispatch({ type: 'ADD_BANK_ACCOUNT' });
  const removeBankAccount    = (index)               => dispatch({ type: 'REMOVE_BANK_ACCOUNT', index });
  const setRsvpQuestion      = (index, key, value)   => dispatch({ type: 'SET_RSVP_QUESTION', index, key, value });
  const addRsvpQuestion      = ()                    => dispatch({ type: 'ADD_RSVP_QUESTION' });
  const removeRsvpQuestion   = (index)               => dispatch({ type: 'REMOVE_RSVP_QUESTION', index });
  const toggleRsvpCupo       = (value)               => dispatch({ type: 'TOGGLE_RSVP_CUPO', value });
  const setDressCodeColor    = (index, hex)          => dispatch({ type: 'SET_DRESS_CODE_COLOR', index, hex });
  const setDressCodeColorLabel = (index, label)      => dispatch({ type: 'SET_DRESS_CODE_COLOR_LABEL', index, label });
  const addDressCodeColor    = ()                    => dispatch({ type: 'ADD_DRESS_CODE_COLOR' });
  const removeDressCodeColor = (index)               => dispatch({ type: 'REMOVE_DRESS_CODE_COLOR', index });

  // Se llama tras un envío exitoso para no dejar el borrador viejo dando
  // vueltas si el editor se vuelve a abrir más adelante.
  const clearSavedProgress = () => {
    clearTimeout(saveTimeoutRef.current);
    clearSavedData(templateSlug);
  };

  const coupleNames = `${data.brideName} & ${data.groomName}`;
  const weddingYear = data.weddingDateIso ? data.weddingDateIso.slice(0, 4) : data.weddingYear;
  const liveData = { ...data, coupleNames, weddingYear };

  return (
    <EditorContext.Provider value={{
      data: liveData,
      hasChanges,
      clearSavedProgress,
      templateSlug,
      activeField,
      setActiveField,
      setField,
      setStoryItem,
      addStoryItem,
      removeStoryItem,
      setScheduleItem,
      addScheduleItem,
      removeScheduleItem,
      setBankAccount,
      addBankAccount,
      removeBankAccount,
      setRsvpQuestion,
      addRsvpQuestion,
      removeRsvpQuestion,
      toggleRsvpCupo,
      setDressCodeColor,
      setDressCodeColorLabel,
      addDressCodeColor,
      removeDressCodeColor,
    }}>
      {children}
    </EditorContext.Provider>
  );
};

EditorProvider.propTypes = {
  templateSlug: PropTypes.string,
  children:     PropTypes.node.isRequired,
};
EditorProvider.defaultProps = { templateSlug: 'soho' };

export const useEditor = () => {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error('useEditor must be used inside EditorProvider');
  return ctx;
};

export const useEditorContext = useEditor;
export const useWeddingData = () => useEditor().data;

import { createContext, useContext, useReducer, useState } from 'react';
import PropTypes from 'prop-types';

import * as SohoDefaults from '../constants/weddingDefaults';
import * as ElegantDefaults from '../constants/weddingDefaultsElegant';

const EditorContext = createContext(null);

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
    footerMessage:        D.FOOTER_MESSAGE,
    imageHero:            D.IMAGE_HERO,
  };

  // Soho-only fields
  if (slug !== 'elegant') {
    base.storyIntro    = SohoDefaults.STORY_INTRO;
    base.storyItems    = SohoDefaults.STORY_ITEMS;
    base.imageStory    = SohoDefaults.IMAGE_STORY;
    base.imageDressCode= SohoDefaults.IMAGE_DRESS_CODE;
    base.imageRings    = SohoDefaults.IMAGE_RINGS;
  }

  // Elegant-only fields
  if (slug === 'elegant') {
    base.imageCeremony       = ElegantDefaults.IMAGE_CEREMONY;
    base.imageDressCodeWomen = ElegantDefaults.IMAGE_DRESSCODE_WOMEN;
    base.imageDressCodeMen   = ElegantDefaults.IMAGE_DRESSCODE_MEN;
  }

  return base;
};

const editorReducer = (state, action) => {
  switch (action.type) {
    case 'SET_FIELD':
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

    case 'SET_DRESS_CODE_COLOR': {
      const updated = state.dressCodePalette.map((c, i) =>
        i === action.index ? { ...c, hex: action.hex } : c
      );
      return { ...state, dressCodePalette: updated };
    }
    case 'ADD_DRESS_CODE_COLOR': {
      if (state.dressCodePalette.length >= 8) return state;
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

export const EditorProvider = ({ templateSlug, order, children }) => {
  const [data, dispatch] = useReducer(
    editorReducer,
    templateSlug,
    buildInitialState,
  );
  const [activeField, setActiveField] = useState(null);

  const setField             = (field, value)        => dispatch({ type: 'SET_FIELD', field, value });
  const setStoryItem         = (index, key, value)   => dispatch({ type: 'SET_STORY_ITEM', index, key, value });
  const addStoryItem         = ()                    => dispatch({ type: 'ADD_STORY_ITEM' });
  const removeStoryItem      = (index)               => dispatch({ type: 'REMOVE_STORY_ITEM', index });
  const setScheduleItem      = (index, key, value)   => dispatch({ type: 'SET_SCHEDULE_ITEM', index, key, value });
  const addScheduleItem      = ()                    => dispatch({ type: 'ADD_SCHEDULE_ITEM' });
  const removeScheduleItem   = (index)               => dispatch({ type: 'REMOVE_SCHEDULE_ITEM', index });
  const setBankAccount       = (index, key, value)   => dispatch({ type: 'SET_BANK_ACCOUNT', index, key, value });
  const setDressCodeColor    = (index, hex)          => dispatch({ type: 'SET_DRESS_CODE_COLOR', index, hex });
  const setDressCodeColorLabel = (index, label)      => dispatch({ type: 'SET_DRESS_CODE_COLOR_LABEL', index, label });
  const addDressCodeColor    = ()                    => dispatch({ type: 'ADD_DRESS_CODE_COLOR' });
  const removeDressCodeColor = (index)               => dispatch({ type: 'REMOVE_DRESS_CODE_COLOR', index });

  const coupleNames = `${data.brideName} & ${data.groomName}`;
  const weddingYear = data.weddingDateIso ? data.weddingDateIso.slice(0, 4) : data.weddingYear;
  const liveData = { ...data, coupleNames, weddingYear };

  return (
    <EditorContext.Provider value={{
      data: liveData,
      templateSlug,
      order,
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
  order:        PropTypes.string,
  children:     PropTypes.node.isRequired,
};
EditorProvider.defaultProps = { templateSlug: 'soho', order: '' };

export const useEditor = () => {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error('useEditor must be used inside EditorProvider');
  return ctx;
};

export const useEditorContext = useEditor;
export const useWeddingData = () => useEditor().data;

import { createContext, useContext, useReducer, useState } from 'react';
import PropTypes from 'prop-types';

import {
  BRIDE_NAME, GROOM_NAME, COUPLE_NAMES,
  WEDDING_DATE_ISO, WEDDING_DATE_DISPLAY, WEDDING_YEAR,
  CEREMONY_TIME, CEREMONY_VENUE_NAME, CEREMONY_VENUE_ADDRESS, CEREMONY_MAPS_LINK, CEREMONY_MAPS_EMBED_SRC,
  RECEPTION_TIME, RECEPTION_VENUE_NAME, RECEPTION_VENUE_ADDRESS, RECEPTION_MAPS_LINK, RECEPTION_MAPS_EMBED_SRC,
  STORY_INTRO, STORY_ITEMS,
  SCHEDULE_ITEMS,
  DRESS_CODE_STYLE, DRESS_CODE_DESCRIPTION, DRESS_CODE_WOMEN, DRESS_CODE_MEN, DRESS_CODE_PALETTE,
  GIFT_REGISTRY_INTRO, BANK_ACCOUNTS,
  RSVP_DEADLINE, FOOTER_MESSAGE,
  IMAGE_HERO, IMAGE_STORY, IMAGE_DRESS_CODE, IMAGE_RINGS,
} from '../constants/weddingDefaults';

const EditorContext = createContext(null);

const buildInitialState = () => ({
  brideName:              BRIDE_NAME,
  groomName:              GROOM_NAME,
  coupleNames:            COUPLE_NAMES,
  weddingDateIso:         WEDDING_DATE_ISO,
  weddingDateDisplay:     WEDDING_DATE_DISPLAY,
  weddingYear:            WEDDING_YEAR,
  ceremonyTime:           CEREMONY_TIME,
  ceremonyVenueName:      CEREMONY_VENUE_NAME,
  ceremonyVenueAddress:   CEREMONY_VENUE_ADDRESS,
  ceremonyMapsLink:       CEREMONY_MAPS_LINK,
  ceremonyMapsEmbedSrc:   CEREMONY_MAPS_EMBED_SRC,
  receptionTime:          RECEPTION_TIME,
  receptionVenueName:     RECEPTION_VENUE_NAME,
  receptionVenueAddress:  RECEPTION_VENUE_ADDRESS,
  receptionMapsLink:      RECEPTION_MAPS_LINK,
  receptionMapsEmbedSrc:  RECEPTION_MAPS_EMBED_SRC,
  storyIntro:             STORY_INTRO,
  storyItems:             STORY_ITEMS,
  scheduleItems:          SCHEDULE_ITEMS,
  dressCodeStyle:         DRESS_CODE_STYLE,
  dressCodeDescription:   DRESS_CODE_DESCRIPTION,
  dressCodeWomen:         DRESS_CODE_WOMEN,
  dressCodeMen:           DRESS_CODE_MEN,
  dressCodePalette:       DRESS_CODE_PALETTE,
  giftRegistryIntro:      GIFT_REGISTRY_INTRO,
  bankAccounts:           BANK_ACCOUNTS,
  rsvpDeadline:           RSVP_DEADLINE,
  footerMessage:          FOOTER_MESSAGE,
  imageHero:              IMAGE_HERO,
  imageStory:             IMAGE_STORY,
  imageDressCode:         IMAGE_DRESS_CODE,
  imageRings:             IMAGE_RINGS,
});

const editorReducer = (state, action) => {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'SET_STORY_ITEM': {
      const updatedStory = state.storyItems.map((item, i) =>
        i === action.index ? { ...item, [action.key]: action.value } : item
      );
      return { ...state, storyItems: updatedStory };
    }
    case 'SET_SCHEDULE_ITEM': {
      const updatedSchedule = state.scheduleItems.map((item, i) =>
        i === action.index ? { ...item, [action.key]: action.value } : item
      );
      return { ...state, scheduleItems: updatedSchedule };
    }
    case 'SET_BANK_ACCOUNT': {
      const updatedAccounts = state.bankAccounts.map((acc, i) =>
        i === action.index ? { ...acc, [action.key]: action.value } : acc
      );
      return { ...state, bankAccounts: updatedAccounts };
    }
    default:
      return state;
  }
};

export const EditorProvider = ({ children }) => {
  const [data, dispatch] = useReducer(editorReducer, null, buildInitialState);
  const [activeField, setActiveField] = useState(null);

  const setField = (field, value) => dispatch({ type: 'SET_FIELD', field, value });
  const setStoryItem = (index, key, value) => dispatch({ type: 'SET_STORY_ITEM', index, key, value });
  const setScheduleItem = (index, key, value) => dispatch({ type: 'SET_SCHEDULE_ITEM', index, key, value });
  const setBankAccount = (index, key, value) => dispatch({ type: 'SET_BANK_ACCOUNT', index, key, value });

  // Derived: couple names auto-updates when either name changes
  const coupleNames = `${data.brideName} & ${data.groomName}`;

  return (
    <EditorContext.Provider value={{
      data: { ...data, coupleNames },
      activeField,
      setActiveField,
      setField,
      setStoryItem,
      setScheduleItem,
      setBankAccount,
    }}>
      {children}
    </EditorContext.Provider>
  );
};

EditorProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useEditor = () => {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error('useEditor must be used inside EditorProvider');
  return ctx;
};

// Hook for preview components — returns live data from context
export const useWeddingData = () => useEditor().data;

// ─── Template Registry ────────────────────────────────────────────────────────
// Each template slug maps to its components and TemplateProvider.
// Add new templates here when available.

import SohoNavigation from '@iliestefa/wedding-soho/components/Navigation/Navigation';
import SohoHero from '@iliestefa/wedding-soho/components/Hero/Hero';
import SohoStory from '@iliestefa/wedding-soho/components/Story/Story';
import SohoCountdown from '@iliestefa/wedding-soho/components/Countdown/Countdown';
import SohoEvents from '@iliestefa/wedding-soho/components/Events/Events';
import SohoSchedule from '@iliestefa/wedding-soho/components/Schedule/Schedule';
import SohoDressCode from '@iliestefa/wedding-soho/components/DressCode/DressCode';
import SohoGiftRegistry from '@iliestefa/wedding-soho/components/GiftRegistry/GiftRegistry';
import SohoRsvpForm from '@iliestefa/wedding-soho/components/RsvpForm/RsvpForm';
import SohoFooter from '@iliestefa/wedding-soho/components/Footer/Footer';
import { TemplateProvider as SohoTemplateProvider } from '@iliestefa/wedding-soho/context';

import ElegantNavigation from '@iliestefa/wedding-elegant/components/Navigation/Navigation';
import ElegantHero from '@iliestefa/wedding-elegant/components/Hero/Hero';
import ElegantCountdown from '@iliestefa/wedding-elegant/components/Countdown/Countdown';
import ElegantEvents from '@iliestefa/wedding-elegant/components/Events/Events';
import ElegantSchedule from '@iliestefa/wedding-elegant/components/Schedule/Schedule';
import ElegantDressCode from '@iliestefa/wedding-elegant/components/DressCode/DressCode';
import ElegantGiftRegistry from '@iliestefa/wedding-elegant/components/GiftRegistry/GiftRegistry';
import ElegantRsvpForm from '@iliestefa/wedding-elegant/components/RsvpForm/RsvpForm';
import ElegantFooter from '@iliestefa/wedding-elegant/components/Footer/Footer';
import { TemplateProvider as ElegantTemplateProvider } from '@iliestefa/wedding-elegant/context';

export const TEMPLATES = {
  soho: {
    label: 'Romántico Soho',
    TemplateProvider: SohoTemplateProvider,
    components: {
      Navigation: SohoNavigation,
      Hero: SohoHero,
      Story: SohoStory,
      Countdown: SohoCountdown,
      Events: SohoEvents,
      Schedule: SohoSchedule,
      DressCode: SohoDressCode,
      GiftRegistry: SohoGiftRegistry,
      RsvpForm: SohoRsvpForm,
      Footer: SohoFooter,
    },
  },
  elegant: {
    label: 'Champagne & Charcoal',
    TemplateProvider: ElegantTemplateProvider,
    components: {
      Navigation: ElegantNavigation,
      Hero: ElegantHero,
      Story: null,
      Countdown: ElegantCountdown,
      Events: ElegantEvents,
      Schedule: ElegantSchedule,
      DressCode: ElegantDressCode,
      GiftRegistry: ElegantGiftRegistry,
      RsvpForm: ElegantRsvpForm,
      Footer: ElegantFooter,
    },
  },
};

export const DEFAULT_TEMPLATE = 'soho';

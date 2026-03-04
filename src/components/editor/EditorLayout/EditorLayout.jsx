import EditorPanel from '../EditorPanel/EditorPanel';
import Navigation from '@iliestefa/wedding-soho/components/Navigation/Navigation';
import Hero from '@iliestefa/wedding-soho/components/Hero/Hero';
import Story from '@iliestefa/wedding-soho/components/Story/Story';
import Countdown from '@iliestefa/wedding-soho/components/Countdown/Countdown';
import Events from '@iliestefa/wedding-soho/components/Events/Events';
import Schedule from '@iliestefa/wedding-soho/components/Schedule/Schedule';
import DressCode from '@iliestefa/wedding-soho/components/DressCode/DressCode';
import GiftRegistry from '@iliestefa/wedding-soho/components/GiftRegistry/GiftRegistry';
import RsvpForm from '@iliestefa/wedding-soho/components/RsvpForm/RsvpForm';
import Footer from '@iliestefa/wedding-soho/components/Footer/Footer';
import './EditorLayout.scss';

const EditorLayout = () => (
  <div className="editor-layout">
    <EditorPanel />
    <main className="editor-layout__preview">
      <div className="editor-layout__preview-inner">
        <Navigation />
        <Hero />
        <Story />
        <Countdown />
        <Events />
        <Schedule />
        <DressCode />
        <GiftRegistry />
        <RsvpForm />
        <Footer />
      </div>
    </main>
  </div>
);

export default EditorLayout;

import EditorPanel from '../EditorPanel/EditorPanel';
import Navigation from '../../preview/Navigation/Navigation';
import Hero from '../../preview/Hero/Hero';
import Story from '../../preview/Story/Story';
import Countdown from '../../preview/Countdown/Countdown';
import Events from '../../preview/Events/Events';
import Schedule from '../../preview/Schedule/Schedule';
import DressCode from '../../preview/DressCode/DressCode';
import GiftRegistry from '../../preview/GiftRegistry/GiftRegistry';
import RsvpForm from '../../preview/RsvpForm/RsvpForm';
import Footer from '../../preview/Footer/Footer';
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

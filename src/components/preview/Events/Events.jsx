import { useWeddingData } from '../../../context/EditorContext';

import SectionHeader from '../shared/SectionHeader/SectionHeader';
import EventCard from './EventCard/EventCard';

import './Events.scss';

const Events = () => {
  const {
    ceremonyTime,
    ceremonyVenueName,
    ceremonyVenueAddress,
    ceremonyMapsLink,
    ceremonyMapsEmbedSrc,
    receptionTime,
    receptionVenueName,
    receptionVenueAddress,
    receptionMapsLink,
    receptionMapsEmbedSrc,
  } = useWeddingData();

  return (
    <section className="events" id="ceremony">
      <div className="events__inner">
        <SectionHeader eyebrow="Nos acompañas" title="Ceremonia &amp; Recepción" />

        <div className="events__grid">
          <div className="events__col">
            <EventCard
              eyebrow="Ceremonia Religiosa"
              venueName={ceremonyVenueName}
              time={ceremonyTime}
              address={ceremonyVenueAddress}
              mapsLink={ceremonyMapsLink}
              mapsEmbedSrc={ceremonyMapsEmbedSrc}
            />
          </div>

          <div className="events__divider" aria-hidden="true" />

          <div className="events__col">
            <EventCard
              eyebrow="Fiesta de Recepción"
              venueName={receptionVenueName}
              time={receptionTime}
              address={receptionVenueAddress}
              mapsLink={receptionMapsLink}
              mapsEmbedSrc={receptionMapsEmbedSrc}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Events;

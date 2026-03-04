import PropTypes from 'prop-types';

import './MapEmbed.scss';

const MapEmbed = ({ src, title, mapsLink }) => (
  <div className="map-embed">
    <iframe
      className="map-embed__frame"
      src={src}
      title={title}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
    />
    <a
      className="map-embed__cta"
      href={mapsLink}
      target="_blank"
      rel="noopener noreferrer"
    >
      Ver en Google Maps →
    </a>
  </div>
);

MapEmbed.propTypes = {
  src:      PropTypes.string.isRequired,
  title:    PropTypes.string.isRequired,
  mapsLink: PropTypes.string.isRequired,
};

export default MapEmbed;

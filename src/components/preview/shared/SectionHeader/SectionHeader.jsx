import PropTypes from 'prop-types';

import './SectionHeader.scss';

const SectionHeader = ({ eyebrow, title, centered = true, light = false }) => (
  <div className={`section-header ${centered ? 'section-header--centered' : ''} ${light ? 'section-header--light' : ''}`}>
    <span className="section-header__eyebrow">{eyebrow}</span>
    <h2 className="section-header__title">{title}</h2>
    <span className="section-header__rule" aria-hidden="true" />
  </div>
);

SectionHeader.propTypes = {
  eyebrow:  PropTypes.string.isRequired,
  title:    PropTypes.string.isRequired,
  centered: PropTypes.bool,
  light:    PropTypes.bool,
};

export default SectionHeader;

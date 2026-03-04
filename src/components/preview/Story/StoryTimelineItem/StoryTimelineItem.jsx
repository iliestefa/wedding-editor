import PropTypes from 'prop-types';

import useIntersectionObserver from '../../../../hooks/useIntersectionObserver';

import './StoryTimelineItem.scss';

const StoryTimelineItem = ({ year, label, text, align }) => {
  const revealRef = useIntersectionObserver();

  return (
    <div
      ref={revealRef}
      className={`story-item story-item--${align}`}
    >
      <div className="story-item__connector">
        <span className="story-item__dot" />
        <span className="story-item__line" />
      </div>
      <div className="story-item__card">
        <span className="story-item__year">{year}</span>
        <h3 className="story-item__label">{label}</h3>
        <p className="story-item__text">{text}</p>
      </div>
    </div>
  );
};

StoryTimelineItem.propTypes = {
  year:  PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  text:  PropTypes.string.isRequired,
  align: PropTypes.oneOf(['left', 'right']),
};

StoryTimelineItem.defaultProps = {
  align: 'left',
};

export default StoryTimelineItem;

import PropTypes from 'prop-types';

import './ScheduleRow.scss';

const ScheduleRow = ({ time, label, icon, isLast }) => (
  <div className={`schedule-item${isLast ? ' schedule-item--last' : ''}`}>
    <div className="schedule-item__spine" aria-hidden="true">
      <span className="schedule-item__dot" />
      {!isLast && <span className="schedule-item__line" />}
    </div>

    <div className="schedule-item__body">
      <span className="schedule-item__time">{time}</span>
      <span className="schedule-item__icon" aria-hidden="true">{icon}</span>
      <p className="schedule-item__label">{label}</p>
    </div>
  </div>
);

ScheduleRow.propTypes = {
  time:   PropTypes.string.isRequired,
  label:  PropTypes.string.isRequired,
  icon:   PropTypes.string.isRequired,
  isLast: PropTypes.bool,
};

ScheduleRow.defaultProps = {
  isLast: false,
};

export default ScheduleRow;

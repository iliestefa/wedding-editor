import PropTypes from 'prop-types';

import { padTimeUnit } from '../../../../utils/formatters';

import './CountdownUnit.scss';

const CountdownUnit = ({ value, label }) => {
  const displayValue = padTimeUnit(value);

  return (
    <div className="countdown-unit">
      <span className="countdown-unit__value">{displayValue}</span>
      <span className="countdown-unit__label">{label}</span>
    </div>
  );
};

CountdownUnit.propTypes = {
  value: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired,
};

export default CountdownUnit;

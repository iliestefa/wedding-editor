import PropTypes from 'prop-types';

import './BotanicalDivider.scss';

const BotanicalDivider = ({ variant = 'center' }) => (
  <div className={`botanical-divider botanical-divider--${variant}`} aria-hidden="true">
    <span className="botanical-divider__line" />
    <span className="botanical-divider__diamond" />
    <span className="botanical-divider__line" />
  </div>
);

BotanicalDivider.propTypes = {
  variant: PropTypes.oneOf(['center', 'left', 'right']),
};

export default BotanicalDivider;

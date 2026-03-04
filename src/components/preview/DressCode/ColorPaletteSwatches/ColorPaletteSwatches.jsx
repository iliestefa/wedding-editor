import PropTypes from 'prop-types';

import './ColorPaletteSwatches.scss';

const ColorPaletteSwatches = ({ palette }) => {
  const swatches = palette.map(({ id, label, hex }) => (
    <div key={id} className="palette-swatch">
      <span
        className="palette-swatch__color"
        style={{ backgroundColor: hex }}
        title={label}
      />
      <span className="palette-swatch__label">{label}</span>
    </div>
  ));

  return <div className="palette-swatches">{swatches}</div>;
};

ColorPaletteSwatches.propTypes = {
  palette: PropTypes.arrayOf(
    PropTypes.shape({
      id:    PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      hex:   PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default ColorPaletteSwatches;

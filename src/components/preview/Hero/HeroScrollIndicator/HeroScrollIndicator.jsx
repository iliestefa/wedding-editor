import './HeroScrollIndicator.scss';

const HeroScrollIndicator = () => (
  <a href="#story" className="scroll-indicator" aria-label="Ver más">
    <span className="scroll-indicator__line" />
    <span className="scroll-indicator__label">Scroll</span>
  </a>
);

export default HeroScrollIndicator;

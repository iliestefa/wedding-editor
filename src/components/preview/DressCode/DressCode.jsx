import { useWeddingData } from '../../../context/EditorContext';
import useIntersectionObserver from '../../../hooks/useIntersectionObserver';

import SectionHeader from '../shared/SectionHeader/SectionHeader';
import ColorPaletteSwatches from './ColorPaletteSwatches/ColorPaletteSwatches';

import './DressCode.scss';

const DressCode = () => {
  const {
    dressCodeStyle,
    dressCodeDescription,
    dressCodeWomen,
    dressCodeMen,
    dressCodePalette,
    imageDressCode,
  } = useWeddingData();
  const revealRef = useIntersectionObserver();

  return (
    <section className="dress-code" id="dresscode">
      <div className="dress-code__image-col" aria-hidden="true">
        <img
          src={imageDressCode}
          alt="Código de vestimenta"
          className="dress-code__image"
          loading="lazy"
        />
      </div>

      <div ref={revealRef} className="dress-code__content">
        <SectionHeader eyebrow="Código de Vestimenta" title={dressCodeStyle} centered={false} />

        <p className="dress-code__description">{dressCodeDescription}</p>

        <div className="dress-code__categories">
          <div className="dress-code__category">
            <span className="dress-code__category-label">Damas</span>
            <p className="dress-code__category-text">{dressCodeWomen}</p>
          </div>
          <div className="dress-code__category">
            <span className="dress-code__category-label">Caballeros</span>
            <p className="dress-code__category-text">{dressCodeMen}</p>
          </div>
        </div>

        <ColorPaletteSwatches palette={dressCodePalette} />
      </div>
    </section>
  );
};

export default DressCode;

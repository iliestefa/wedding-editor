import { useWeddingData } from '../../../context/EditorContext';

import './Footer.scss';

const Footer = () => {
  const { coupleNames, weddingDateDisplay, footerMessage } = useWeddingData();

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__monogram" aria-hidden="true">S &amp; A</div>

        <p className="footer__names">{coupleNames}</p>

        <span className="footer__rule" aria-hidden="true" />

        <p className="footer__date">{weddingDateDisplay}</p>

        <p className="footer__message">{footerMessage}</p>

        <p className="footer__credit">
          Hecho con amor · {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
};

export default Footer;

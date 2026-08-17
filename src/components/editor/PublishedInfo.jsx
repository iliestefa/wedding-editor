import { useState } from 'react';
import PropTypes from 'prop-types';
import { useEditor } from '../../context/EditorContext';
import { trackContactClick } from '../../utils/analyticsEvents';
import {
  WEDYA_WHATSAPP,
  WEDYA_INSTAGRAM,
  WEDYA_TIKTOK,
} from '../../constants/editorConstants';
import {
  WhatsAppIcon,
  InstagramIcon,
  TikTokIcon,
  CopyIcon,
  CheckIcon,
  ExternalIcon,
} from './SocialIcons';
import './PublishedInfo.scss';

// Una fila de link: label + link truncado, con sus acciones (abrir / copiar)
// dentro de la misma fila — sin botones grandes aparte.
const LinkRow = ({ label, url }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // sin clipboard (http, permisos) — el link sigue siendo clickeable igual
    }
  };

  return (
    <div className="published-info__row">
      <div className="published-info__row-text">
        <span className="published-info__row-label">{label}</span>
        <a href={url} target="_blank" rel="noreferrer noopener" className="published-info__row-link">
          {url}
        </a>
      </div>
      <a
        href={url}
        target="_blank"
        rel="noreferrer noopener"
        className="published-info__icon-btn"
        aria-label={`Abrir ${label}`}
        title={`Abrir ${label}`}
      >
        <ExternalIcon />
      </a>
      <button
        type="button"
        className="published-info__icon-btn"
        onClick={handleCopy}
        aria-label={`Copiar ${label}`}
        title={`Copiar ${label}`}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </button>
    </div>
  );
};

LinkRow.propTypes = {
  label: PropTypes.string.isRequired,
  url:   PropTypes.string.isRequired,
};

const cupoLabel = (n) => {
  if (n === 0) return 'Invitado sin acompañantes';
  if (n === 1) return 'Máx. 1 acompañante';
  return `Máx. ${n} acompañantes`;
};

// Vista de "ya está publicado" — reutilizada tanto en el dialog que sigue al
// pago como en el step "Publicar" cuando se reabre una boda ya activa. Cada
// link se abre/copia desde su propia fila; el único botón principal de la
// pantalla es "Guardar cambios" (vive fuera, en EditorSubmit).
const PublishedInfo = ({ title, previewUrl, sheetUrl, editLink, children }) => {
  const { data, templateSlug } = useEditor();

  // RSVP con cupos: cada tipo de invitado tiene su propio link (?cupos=N) —
  // se listan todos para que la pareja mande a cada quien el que corresponde.
  const limited = data?.rsvpType === 'sheets' && data?.rsvpCompanionsMode === 'limited';
  const cupoLinks = limited
    ? [...(data.rsvpCupos?.length ? data.rsvpCupos : [0, 1, 2])]
        .sort((a, b) => a - b)
        .map((n) => ({ label: cupoLabel(n), url: `${previewUrl}?cupos=${n}` }))
    : [];

  return (
  <div className="published-info">
    {title && <p className="published-info__title">{title}</p>}

    <div className="published-info__card">
      <LinkRow label="Su sitio" url={previewUrl} />
      {sheetUrl && <LinkRow label="Respuestas (RSVP)" url={sheetUrl} />}
      {editLink && <LinkRow label="Editar más adelante" url={editLink} />}
    </div>

    {cupoLinks.length > 0 && (
      <>
        <p className="published-info__group-title">
          Links por tipo de invitado — comparte a cada quien el suyo:
        </p>
        <div className="published-info__card">
          {cupoLinks.map(({ label, url }) => (
            <LinkRow key={url} label={label} url={url} />
          ))}
        </div>
      </>
    )}

    {/* Acciones (ej. botón "Guardar cambios") — arriba del texto de contacto */}
    {children}

    <p className="published-info__contact">
      ¿Necesitas algún cambio adicional que no se pueda hacer desde el editor?
      Escríbenos
      <a
        href={`https://wa.me/${WEDYA_WHATSAPP}`}
        target="_blank"
        rel="noreferrer noopener"
        className="published-info__contact-icon"
        aria-label="WhatsApp"
        onClick={() => trackContactClick({ channel: 'whatsapp', templateSlug })}
      >
        <WhatsAppIcon />
      </a>
      <a
        href={`https://ig.me/m/${WEDYA_INSTAGRAM}`}
        target="_blank"
        rel="noreferrer noopener"
        className="published-info__contact-icon"
        aria-label="Instagram"
        onClick={() => trackContactClick({ channel: 'instagram', templateSlug })}
      >
        <InstagramIcon />
      </a>
      <a
        href={`https://www.tiktok.com/@${WEDYA_TIKTOK}`}
        target="_blank"
        rel="noreferrer noopener"
        className="published-info__contact-icon"
        aria-label="TikTok"
        onClick={() => trackContactClick({ channel: 'tiktok', templateSlug })}
      >
        <TikTokIcon />
      </a>
    </p>
  </div>
  );
};

PublishedInfo.propTypes = {
  title:      PropTypes.string,
  previewUrl: PropTypes.string.isRequired,
  sheetUrl:   PropTypes.string,
  editLink:   PropTypes.string,
  children:   PropTypes.node,
};

PublishedInfo.defaultProps = {
  title:    '',
  sheetUrl: '',
  editLink: '',
  children: null,
};

export default PublishedInfo;

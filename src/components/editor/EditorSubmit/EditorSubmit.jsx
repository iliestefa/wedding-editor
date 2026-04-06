import PropTypes from "prop-types";
import { useState } from "react";
import { useEditor } from "../../../context/EditorContext";
import { sendEditorData } from "../../../services/editorService";
import "./EditorSubmit.scss";

const SEND_STATUS = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
};

const EditorSubmit = ({ onSuccess }) => {
  const { data, order, client, templateSlug } = useEditor();
  const [status, setStatus] = useState(SEND_STATUS.IDLE);
  const [errors, setErrors] = useState([]);
  const [sendError, setSendError] = useState("");

  const isClientMode = !!client && !order;

  const validate = () => {
    const missing = [];
    if (!data.brideName.trim()) missing.push("Nombre de la novia");
    if (!data.groomName.trim()) missing.push("Nombre del novio");
    if (!data.weddingDateIso.trim()) missing.push("Fecha de la boda");
    if (!data.ceremonyVenueName.trim()) missing.push("Lugar de la ceremonia");
    if (!data.receptionVenueName.trim()) missing.push("Lugar de la recepción");
    return missing;
  };

  const handleSend = async () => {
    const missing = validate();
    if (missing.length > 0) {
      setErrors(missing);
      return;
    }
    setErrors([]);
    setStatus(SEND_STATUS.LOADING);
    try {
      await sendEditorData(data, { order, client, templateSlug });
      if (!isClientMode) {
        setStatus(SEND_STATUS.SUCCESS);
        onSuccess?.();
      }
      // In client mode, sendEditorData handles the redirect to Shopify
    } catch (err) {
      const msg =
        err?.text || err?.message || JSON.stringify(err) || "Error desconocido";
      setSendError(msg);
      setStatus(SEND_STATUS.ERROR);
    }
  };

  if (status === SEND_STATUS.SUCCESS) {
    return (
      <div className="editor-submit editor-submit--success">
        <span className="editor-submit__icon" aria-hidden="true">
          ✓
        </span>
        <p className="editor-submit__title">¡Datos enviados!</p>
        <p className="editor-submit__message">
          Tu web está en construcción. Mira el preview para más detalles.
        </p>
      </div>
    );
  }

  if (!order && !client) return null;

  return (
    <div className="editor-submit">
      {errors.length > 0 && (
        <ul className="editor-submit__errors">
          <li className="editor-submit__errors-title">
            Completa estos campos obligatorios:
          </li>
          {errors.map((e) => (
            <li key={e}>— {e}</li>
          ))}
        </ul>
      )}

      <button
        className="editor-submit__btn"
        onClick={handleSend}
        disabled={status === SEND_STATUS.LOADING}
      >
        {status === SEND_STATUS.LOADING
          ? isClientMode
            ? "Procesando..."
            : "Enviando..."
          : isClientMode
            ? "Proceder con el pago"
            : "Enviar mis datos"}
      </button>

      {status === SEND_STATUS.ERROR && (
        <p className="editor-submit__error-msg">Error: {sendError}</p>
      )}
    </div>
  );
};

EditorSubmit.propTypes = {
  onSuccess: PropTypes.func,
};

EditorSubmit.defaultProps = {
  onSuccess: null,
};

export default EditorSubmit;

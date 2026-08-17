import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { EditorProvider } from './context/EditorContext';
import { TEMPLATES, DEFAULT_TEMPLATE } from './constants/templateRegistry';
import { fetchStatusFromWeddingsApi } from './services/editorService';
import { saveDraftIdentity } from './services/draftIdentity';
import App from './App';
import './index.css';

const params = new URLSearchParams(window.location.search);
const templateParam = params.get('template') ?? '';

// ?draft=<slug>.<token> → link "continuar editando" / "editar mi invitación":
// consulta el estado ANTES de montar nada y precarga sus datos en el editor,
// sin importar si sigue como borrador o ya está publicada — en ambos casos
// se puede seguir editando. La diferencia es qué hace "Publicar" al final:
// si ya estaba activa, actualiza sin volver a cobrar (ver EditorSubmit).
const draftParam = params.get('draft') ?? '';

const bootstrap = async () => {
  let remoteDraft = null;

  const dot = draftParam.indexOf('.');
  if (dot > 0) {
    const slug = draftParam.slice(0, dot);
    const token = draftParam.slice(dot + 1);
    const status = await fetchStatusFromWeddingsApi(slug, token);

    if (status) {
      remoteDraft = status;
      // Los próximos "Guardar"/"Publicar" desde este dispositivo apuntan a
      // este mismo registro (y el email queda prellenado si aplica).
      saveDraftIdentity(status.templateSlug, { slug: status.slug, token, email: status.email });
    }
  }

  // El template del borrador manda sobre el de la URL (si difieren)
  const templateSlug =
    remoteDraft?.templateSlug && TEMPLATES[remoteDraft.templateSlug]
      ? remoteDraft.templateSlug
      : TEMPLATES[templateParam]
        ? templateParam
        : DEFAULT_TEMPLATE;

  const published =
    remoteDraft?.status === 'active'
      ? {
          previewUrl: remoteDraft.publicUrl,
          sheetUrl: remoteDraft.sheetUrl,
          editLink: `${window.location.origin}${import.meta.env.BASE_URL}?template=${templateSlug}&draft=${draftParam}`,
        }
      : null;

  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <EditorProvider templateSlug={templateSlug} remoteDraft={remoteDraft}>
        <App published={published} />
      </EditorProvider>
    </StrictMode>,
  );
};

bootstrap();

// Identidad del borrador remoto ("Guardar y continuar luego"): guarda qué
// slug/token del engine corresponde a lo que la pareja está editando en este
// navegador, para que cada guardado actualice el MISMO registro (sin duplicar
// bodas) y para prellenar su email la próxima vez.

const buildKey = (templateSlug) => `wedya-editor-draft-id:${templateSlug}`;

export const loadDraftIdentity = (templateSlug) => {
  try {
    const raw = window.localStorage.getItem(buildKey(templateSlug));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.slug && parsed?.token ? parsed : null;
  } catch {
    return null;
  }
};

export const saveDraftIdentity = (templateSlug, { slug, token, email }) => {
  try {
    window.localStorage.setItem(buildKey(templateSlug), JSON.stringify({ slug, token, email }));
  } catch {
    // storage bloqueado — el guardado remoto sigue funcionando, solo que el
    // próximo "Guardar" creará un borrador nuevo en vez de actualizar este
  }
};

export const clearDraftIdentity = (templateSlug) => {
  try {
    window.localStorage.removeItem(buildKey(templateSlug));
  } catch {
    // no-op
  }
};

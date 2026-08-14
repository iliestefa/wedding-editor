/**
 * ─── Wedya Bodas — Worker ────────────────────────────────────────────────────
 *
 * Sirve las invitaciones por slug con render en runtime (sin repo por
 * cliente) y guarda los datos que envía el editor.
 *
 * Rutas públicas:
 *   POST /api/invitations        ← el editor guarda { templateSlug, data }
 *                                → { ok, slug, previewUrl } (estado: draft)
 *   GET  /p/:slug/:token         ← preview privado de la pareja (cualquier estado)
 *   GET  /:slug                  ← invitación publicada (para los invitados)
 *
 * Rutas admin (requieren ?key= o header x-admin-key == secret ADMIN_KEY):
 *   POST /api/admin/publish      { slug }   → estado published
 *   POST /api/admin/unpublish    { slug }   → estado draft
 *   GET  /api/admin/list                    → resumen de todas las bodas
 *   GET  /api/admin/get?slug=               → registro completo
 *
 * Registro en KV (key = "w:{slug}"):
 *   { slug, templateSlug, data, status: 'draft'|'published',
 *     previewToken, createdAt, updatedAt }
 */

const MAX_BODY_BYTES = 300 * 1024; // una invitación pesa ~10-30 KB
const RESERVED_SLUGS = ['api', 'p', 'assets', 'favicon.ico', 'robots.txt'];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // ── API ──────────────────────────────────────────────────────────
      if (path === '/api/invitations' && request.method === 'OPTIONS') {
        return corsPreflight();
      }
      if (path === '/api/invitations' && request.method === 'POST') {
        return await saveInvitation(request, env, url);
      }
      if (path.startsWith('/api/admin/')) {
        return await handleAdmin(request, env, url);
      }
      if (path === '/api/health') {
        return json({ ok: true, service: 'wedya-bodas' });
      }

      // ── Páginas ──────────────────────────────────────────────────────
      // Preview privado: /p/:slug/:token
      const preview = path.match(/^\/p\/([a-z0-9-]+)\/([A-Za-z0-9-]+)$/);
      if (preview && request.method === 'GET') {
        const record = await getRecord(env, preview[1]);
        if (!record || record.previewToken !== preview[2]) return notFound(env, request);
        return renderInvitation(env, request, record, { preview: true });
      }

      // Invitación publicada: /:slug
      const pub = path.match(/^\/([a-z0-9-]+)$/);
      if (pub && request.method === 'GET' && !RESERVED_SLUGS.includes(pub[1])) {
        const record = await getRecord(env, pub[1]);
        if (record && record.status === 'published') {
          return renderInvitation(env, request, record, { preview: false });
        }
        return notFound(env, request);
      }

      // Assets estáticos del viewer (JS/CSS/favicon) y raíz
      return env.ASSETS.fetch(request);
    } catch (err) {
      return json({ ok: false, error: String(err) }, 500);
    }
  },
};

// ─── Guardar invitación (desde el editor) ────────────────────────────────────

async function saveInvitation(request, env, url) {
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return json({ ok: false, error: 'payload demasiado grande' }, 413, cors());
  }

  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ ok: false, error: 'JSON inválido' }, 400, cors());
  }

  const templateSlug = body.templateSlug === 'elegant' ? 'elegant' : 'soho';
  const data = body.data;
  if (!data || typeof data !== 'object' || !data.brideName || !data.groomName) {
    return json({ ok: false, error: 'faltan datos de la pareja' }, 400, cors());
  }

  const slug = await uniqueSlug(env, slugify(`${data.brideName}y${data.groomName}`));
  const now = new Date().toISOString();
  const record = {
    slug,
    templateSlug,
    data,
    status: 'draft',
    previewToken: crypto.randomUUID().replaceAll('-', '').slice(0, 20),
    createdAt: now,
    updatedAt: now,
  };
  await env.WEDDINGS.put(kvKey(slug), JSON.stringify(record));

  const previewUrl = `${url.origin}/p/${slug}/${record.previewToken}`;
  return json({ ok: true, slug, previewUrl }, 200, cors());
}

// ─── Admin ───────────────────────────────────────────────────────────────────

async function handleAdmin(request, env, url) {
  const key = url.searchParams.get('key') ?? request.headers.get('x-admin-key');
  if (!env.ADMIN_KEY || key !== env.ADMIN_KEY) {
    return json({ ok: false, error: 'no autorizado' }, 401);
  }

  const path = url.pathname;

  if (path === '/api/admin/publish' && request.method === 'POST') {
    return await setStatus(env, request, url, 'published');
  }
  if (path === '/api/admin/unpublish' && request.method === 'POST') {
    return await setStatus(env, request, url, 'draft');
  }
  if (path === '/api/admin/get' && request.method === 'GET') {
    const record = await getRecord(env, url.searchParams.get('slug') ?? '');
    if (!record) return json({ ok: false, error: 'no existe' }, 404);
    return json({ ok: true, record });
  }
  if (path === '/api/admin/list' && request.method === 'GET') {
    const list = await env.WEDDINGS.list({ prefix: 'w:' });
    const items = [];
    for (const k of list.keys) {
      const record = JSON.parse(await env.WEDDINGS.get(k.name));
      items.push({
        slug: record.slug,
        coupleNames: `${record.data.brideName} & ${record.data.groomName}`,
        templateSlug: record.templateSlug,
        status: record.status,
        updatedAt: record.updatedAt,
        previewUrl: `${url.origin}/p/${record.slug}/${record.previewToken}`,
        publicUrl: `${url.origin}/${record.slug}`,
      });
    }
    return json({ ok: true, items });
  }
  return json({ ok: false, error: 'ruta admin desconocida' }, 404);
}

async function setStatus(env, request, url, status) {
  const body = await request.json().catch(() => ({}));
  const record = await getRecord(env, body.slug ?? '');
  if (!record) return json({ ok: false, error: 'no existe' }, 404);
  record.status = status;
  record.updatedAt = new Date().toISOString();
  await env.WEDDINGS.put(kvKey(record.slug), JSON.stringify(record));
  return json({ ok: true, slug: record.slug, status, url: `${url.origin}/${record.slug}` });
}

// ─── Render de la invitación ─────────────────────────────────────────────────

// Sirve el index.html del viewer con los datos de la boda inyectados —
// render inmediato sin segundo fetch, y con <title> propio de la pareja.
async function renderInvitation(env, request, record, { preview }) {
  const assetUrl = new URL('/', request.url);
  const res = await env.ASSETS.fetch(new Request(assetUrl, { method: 'GET' }));
  let html = await res.text();

  const payload = {
    templateSlug: record.templateSlug,
    data: record.data,
    preview,
  };
  // < evita que un "</script>" dentro de los datos rompa/inyecte HTML
  const serialized = JSON.stringify(payload).replaceAll('<', '\\u003c');
  const title = `${record.data.brideName} & ${record.data.groomName} — Invitación`;

  html = html
    .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace('</head>', `<script>window.__WEDDING__ = ${serialized};</script></head>`);

  return new Response(html, {
    status: 200,
    headers: {
      'content-type': 'text/html;charset=UTF-8',
      // los invitados siempre ven la última versión publicada
      'cache-control': 'no-store',
      'x-robots-tag': preview ? 'noindex' : 'all',
    },
  });
}

async function notFound(env, request) {
  return new Response(
    '<!doctype html><meta charset="utf-8"><title>Wedya</title>' +
    '<body style="font-family:Georgia,serif;display:grid;place-items:center;height:100vh;margin:0;background:#faf5ef;color:#4a3728">' +
    '<div style="text-align:center"><h1 style="font-weight:400">Invitación no encontrada</h1>' +
    '<p style="color:#a88b78">Revisa el link o contacta a los novios 💌</p></div>',
    { status: 404, headers: { 'content-type': 'text/html;charset=UTF-8' } },
  );
}

// ─── Utilidades ──────────────────────────────────────────────────────────────

const kvKey = (slug) => `w:${slug}`;

async function getRecord(env, slug) {
  if (!slug) return null;
  const raw = await env.WEDDINGS.get(kvKey(slug));
  return raw ? JSON.parse(raw) : null;
}

function slugify(text) {
  const slug = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '');
  return slug || 'boda';
}

// Si el slug ya existe (otra pareja con los mismos nombres), agrega sufijo
async function uniqueSlug(env, base) {
  let slug = base;
  for (let i = 2; i < 50; i += 1) {
    if (!(await env.WEDDINGS.get(kvKey(slug)))) return slug;
    slug = `${base}${i}`;
  }
  return `${base}-${crypto.randomUUID().slice(0, 6)}`;
}

function escapeHtml(s) {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

function cors() {
  return {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
  };
}

function corsPreflight() {
  return new Response(null, { status: 204, headers: cors() });
}

function json(obj, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json;charset=UTF-8', ...extraHeaders },
  });
}

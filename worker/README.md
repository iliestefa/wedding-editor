# Wedya Bodas — Worker (Fase 2)

Backend serverless en Cloudflare que elimina el clonado de repos por cliente:
el editor guarda los datos de la boda en KV y cada invitación se sirve por
URL con render en runtime.

- **Invitados**: `https://wedya-bodas.<cuenta>.workers.dev/{slug}` (solo si
  está publicada). Con dominio propio: `https://bodas.wedya.com/{slug}`.
- **Pareja (preview privado)**: `/p/{slug}/{token}` — se genera al instante
  cuando dan "Enviar" en el editor, sin esperar publicación.
- **Base de datos**: Cloudflare KV — un registro JSON por boda, sin servidor
  que mantener ni costo a esta escala.

## Despliegue (una sola vez)

Desde `wedding-editor/`:

```bash
# 1. Login con tu cuenta de Cloudflare (abre el navegador)
npx wrangler login

# 2. Crear la base de datos KV
cd worker && npx wrangler kv namespace create WEDDINGS
# → devuelve un id; pégalo en wrangler.toml donde dice PENDIENTE_PEGAR_ID

# 3. Clave de administrador (para publicar/listar — NUNCA en repos)
npx wrangler secret put ADMIN_KEY
# → escribe una clave larga generada (distinta a la del Apps Script)

# 4. Compilar el viewer y desplegar
cd .. && npm run worker:deploy
# → te da la URL: https://wedya-bodas.<cuenta>.workers.dev
```

Después conecta el editor: agrega el secret `VITE_WEDDINGS_API` con esa URL
en GitHub → wedding-editor → Settings → Secrets and variables → Actions, y
pásalo al build en `.github/workflows/deploy.yml` (junto a los otros VITE_).
Sin esa variable, el editor funciona como siempre (solo email).

## Uso diario

```bash
URL="https://wedya-bodas.<cuenta>.workers.dev"
KEY="<tu ADMIN_KEY>"

# Ver todas las bodas (slug, estado, links)
curl -s "$URL/api/admin/list?key=$KEY"

# Publicar cuando pagan (la URL pública queda viva al instante)
curl -s -X POST "$URL/api/admin/publish?key=$KEY" \
  -H 'Content-Type: application/json' -d '{"slug":"sofiayalejandro"}'

# Despublicar
curl -s -X POST "$URL/api/admin/unpublish?key=$KEY" \
  -H 'Content-Type: application/json' -d '{"slug":"sofiayalejandro"}'
```

En la Fase 3, `publish` lo disparará el webhook del pago en vez de este curl.

## Desarrollo local

```bash
# terminal 1 — worker con KV local (crea worker/.dev.vars con ADMIN_KEY=algo)
npm run worker:dev

# terminal 2 — editor apuntando al worker local
VITE_WEDDINGS_API=http://localhost:8787 npm run dev
```

## Actualizar el viewer o el worker

Cualquier cambio en plantillas (nueva versión publicada) o en el código del
worker se repliega con `npm run worker:deploy` — las invitaciones ya
guardadas toman el diseño nuevo automáticamente porque el render es en
runtime.

## Dominio propio (opcional, recomendado)

En el dashboard de Cloudflare → Workers → wedya-bodas → Settings → Domains &
Routes → agrega `bodas.wedya.com` (requiere que wedya.com esté en Cloudflare).
Los links quedan `https://bodas.wedya.com/sofiayalejandro`.

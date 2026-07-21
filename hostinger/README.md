# Subida de fotos vía Hostinger

El editor sube las fotos de los clientes a tu hosting de Hostinger usando el
script `upload.php` de esta carpeta. Configuración (una sola vez):

## 1. Subir el script a Hostinger

1. Entra a **hPanel → Archivos → Administrador de archivos**.
2. Dentro de `public_html/` crea una carpeta, por ejemplo `wedya-uploads/`.
3. Sube ahí el archivo `upload.php`.

## 2. Configurar la clave

1. Genera una clave larga y aleatoria (por ejemplo en https://www.uuidgenerator.net/).
2. Edita `upload.php` en el administrador de archivos y reemplaza el valor de
   `$UPLOAD_KEY` por esa clave.

## 3. Configurar el editor

Variables de entorno del editor (ver `.env.example`):

- `VITE_UPLOAD_ENDPOINT` → `https://TUDOMINIO.com/wedya-uploads/upload.php`
- `VITE_UPLOAD_KEY` → la misma clave del paso 2

Para desarrollo local ponlas en `.env.local`. Para producción agrégalas como
**secrets** del repositorio en GitHub (Settings → Secrets and variables →
Actions): `VITE_UPLOAD_ENDPOINT` y `VITE_UPLOAD_KEY`.

## Notas

- Las fotos quedan guardadas en `public_html/wedya-uploads/uploads/` con
  nombres tipo `20260721-153000-a1b2c3d4e5f6.jpg` (fecha + aleatorio).
- El script solo acepta imágenes (JPG, PNG, WEBP, GIF, HEIC), máximo 25 MB,
  y solo desde los dominios listados en `$ALLOWED_ORIGINS`.
- El editor comprime las fotos en el navegador antes de subirlas (máx. 1920px),
  así que el espacio usado en el hosting es bajo.
- Si el editor se publica en otro dominio, agrégalo a `$ALLOWED_ORIGINS`
  en `upload.php`.

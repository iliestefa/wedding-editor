# Wedya — RSVP Universal (Google Apps Script)

Un solo Web App que recibe las confirmaciones de **todos** los clientes.
Reemplaza el flujo anterior de crear un spreadsheet + deployment por cliente:
ahora la hoja se crea sola (en la carpeta de Drive `Wedya — RSVP`) la primera
vez que un cliente recibe una confirmación, con las columnas según **sus**
preguntas personalizadas.

## Despliegue (una sola vez)

1. Entra a [script.google.com](https://script.google.com) con la cuenta de
   Google donde quieres que vivan las hojas.
2. **Nuevo proyecto** → borra el contenido y pega el código de
   [`rsvp-universal.gs`](./rsvp-universal.gs). Nómbralo `Wedya RSVP Universal`.
3. **Implementar → Nueva implementación** → tipo **Aplicación web**:
   - *Ejecutar como*: **Yo** (tu cuenta)
   - *Quién tiene acceso*: **Cualquier usuario** (necesario para que las
     invitaciones publiquen sin login)
4. Autoriza los permisos (Drive + Sheets) cuando lo pida.
5. Copia la **URL del Web App** (`https://script.google.com/macros/s/…/exec`).

## Conectar las plantillas (una sola vez)

Pega esa URL en:

- `soho/src/constants/apiConstants.js` → `APPS_SCRIPT_URL`
- `elegante/src/constants/apiConstants.js` → `RSVP_ENDPOINT` (fallback del env)

Publica versión nueva de ambas plantillas. Desde ahí, **ningún cliente
necesita configuración de RSVP**: el slug viaja en sus constants y la hoja
se crea sola.

## Uso diario

- **Ver la hoja de un cliente**: abre en el navegador
  `<URL-del-webapp>?slug=sofiayalejandro` → responde con el link de su hoja.
  (O búscala en Drive, carpeta `Wedya — RSVP`.)
- **Pre-crear y compartir la hoja con la novia** (opcional, antes de la boda):
  ```bash
  curl -L -X POST '<URL-del-webapp>' \
    -H 'Content-Type: text/plain' \
    -d '{"action":"setup","slug":"sofiayalejandro","coupleNames":"Sofía & Alejandro","questionLabels":["Restricciones alimentarias o alergias"],"shareWith":"novia@gmail.com"}'
  ```

## Notas técnicas

- Las plantillas envían el body como `text/plain` a propósito: Apps Script no
  responde al preflight CORS que dispararía `application/json`.
- Columnas dinámicas: base fija (Fecha, Nombre, Asistencia, Confirmados) +
  una por pregunta del cliente. "Confirmados" = invitado + acompañantes
  (0 si no asiste); el panel del total la suma. Preguntas nuevas agregan
  columna al final sin dañar filas anteriores.
- El mapeo slug → spreadsheet vive en Script Properties del proyecto. Si
  borras una hoja a mano, se recrea sola en la próxima confirmación.
- Si cambias el código, usa **Implementar → Administrar implementaciones →
  editar (lápiz) → Nueva versión** para mantener la MISMA URL.

/**
 * ─── Wedya — RSVP Universal ──────────────────────────────────────────────────
 *
 * UN solo Web App para TODOS los clientes (reemplaza el deployment por-cliente).
 * Cada invitación envía su `slug`; el script crea automáticamente un
 * spreadsheet por cliente la primera vez que llega una confirmación, con:
 *   - Título con los nombres de la pareja
 *   - Panel "Invitados confirmados" con fórmula que suma sola
 *   - Tabla con encabezado verde y filas de colores alternados
 *   - Compartido como "cualquiera con el link puede ver" (para la pareja)
 *
 * Las columnas son DINÁMICAS: base fija + una columna por cada pregunta
 * personalizada del cliente (questionLabels). Si el cliente agrega una
 * pregunta nueva después de recibir confirmaciones, la columna se agrega
 * sola al final sin dañar las filas anteriores.
 *
 * Payload esperado (POST, body JSON — enviar como text/plain para evitar
 * el preflight CORS que Apps Script no soporta):
 * {
 *   "slug":           "sofiayalejandro",        // requerido
 *   "coupleNames":    "Sofía & Alejandro",      // título y nombre del archivo
 *   "questionLabels": ["Restricciones…", "…"],  // preguntas del cliente
 *   "guestName":      "María Pérez",
 *   "attendance":     "yes" | "no",
 *   "attendanceDetail": "Asistiré",
 *   "totalGuests":    3,                        // invitado + acompañantes (0 si no asiste)
 *   "answers":        { "Restricciones…": "vegetariana", … }
 * }
 * (Campos extra como "cupo" o "template" se ignoran sin romper nada.)
 *
 * Acciones extra:
 *  - POST {"action":"setup", "slug", "coupleNames", "questionLabels",
 *          "shareWith":"novia@gmail.com"}  → pre-crea la hoja (y la comparte
 *          también a ese email como viewer); responde {ok:true, url}.
 *  - GET ?slug=xxx → responde {ok:true, url} con el link de la hoja.
 *
 * Ver README.md para las instrucciones de despliegue (una sola vez).
 */

var FOLDER_NAME = 'Wedya — RSVP';

// Un solo template de hoja para todas las plantillas. "Confirmados" es el
// total de personas que representa cada respuesta (invitado + acompañantes;
// 0 si no asiste) — es la columna que suma el panel del total.
var BASE_HEADERS = ['Fecha', 'Nombre', 'Asistencia', 'Confirmados'];

// Anchos de columna (px) por encabezado; las preguntas usan QUESTION_WIDTH y
// las que parecen de texto largo (mensaje/canción/restricciones) MESSAGE_WIDTH.
var COLUMN_WIDTHS = {
  'Fecha': 170,
  'Nombre': 280,
  'Asistencia': 160,
  'Confirmados': 110,
  'Orden': 100,
};
var QUESTION_WIDTH = 220;
var MESSAGE_WIDTH = 340;

// Layout: 2 filas de aire, título (3), panel (4-5), 3 filas de aire, tabla (9)
var TITLE_ROW = 3;
var HEADER_ROW = 9;      // fila de encabezados de la tabla
var GUESTS_COL = 4;      // columna "Confirmados" (D) — la suma el panel de total
var BAND_ROWS = 1000;    // filas pre-formateadas con colores alternados

// Paleta de la hoja (verde elegante, como el ejemplo)
var COLOR_TITLE  = '#2e5339';
var COLOR_HEADER = '#2e5339';

// ─── Entradas ────────────────────────────────────────────────────────────────

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000); // evita carreras si llegan 2 confirmaciones a la vez
  try {
    var data = JSON.parse(e.postData.contents);
    if (!data.slug) return jsonResponse({ ok: false, error: 'slug requerido' });

    if (data.action === 'setup') {
      var setup = getOrCreateSheet(data);
      if (data.shareWith) shareSheet(setup.spreadsheet, data.shareWith);
      return jsonResponse({ ok: true, url: setup.spreadsheet.getUrl() });
    }

    var target = getOrCreateSheet(data);
    appendRsvpRow(target.sheet, data);
    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  var slug = e.parameter.slug;
  if (!slug) return jsonResponse({ ok: true, service: 'wedya-rsvp' });
  var id = PropertiesService.getScriptProperties().getProperty(propKey(slug));
  if (!id) return jsonResponse({ ok: false, error: 'sin hoja para ese slug' });
  return jsonResponse({ ok: true, url: SpreadsheetApp.openById(id).getUrl() });
}

// ─── Hoja por cliente ────────────────────────────────────────────────────────

function getOrCreateSheet(data) {
  var props = PropertiesService.getScriptProperties();
  var key = propKey(data.slug);
  var id = props.getProperty(key);
  var spreadsheet = null;

  if (id) {
    try {
      if (DriveApp.getFileById(id).isTrashed()) throw new Error('en papelera');
      spreadsheet = SpreadsheetApp.openById(id);
    } catch (err) {
      spreadsheet = null; // borrada a mano — se recrea
    }
  }

  if (!spreadsheet) {
    spreadsheet = createStyledSpreadsheet(data);
    props.setProperty(key, spreadsheet.getId());
  }

  var sheet = spreadsheet.getSheets()[0];
  ensureHeaders(sheet, data);
  return { spreadsheet: spreadsheet, sheet: sheet };
}

// Crea el spreadsheet con el layout: título, panel de total y tabla verde.
function createStyledSpreadsheet(data) {
  var couple = data.coupleNames || data.slug;
  var spreadsheet = SpreadsheetApp.create('RSVP — ' + couple + ' (' + data.slug + ')');
  moveToFolder(spreadsheet.getId());

  var sheet = spreadsheet.getSheets()[0];
  sheet.setName('Confirmaciones');

  // Título
  sheet.getRange(TITLE_ROW, 1, 1, 5).merge();
  sheet.getRange(TITLE_ROW, 1)
    .setValue('Boda de ' + couple)
    .setFontSize(16)
    .setFontWeight('bold')
    .setFontColor(COLOR_TITLE)
    .setFontFamily('Georgia');
  sheet.setRowHeight(TITLE_ROW, 36);

  // Panel: total de invitados confirmados (suma la columna Personas)
  var guestsColLetter = columnLetter(GUESTS_COL);
  sheet.getRange(TITLE_ROW + 1, 1).setValue('Invitados confirmados:').setFontWeight('bold');
  sheet.getRange(TITLE_ROW + 1, 2)
    .setFormula('=SUM(' + guestsColLetter + (HEADER_ROW + 1) + ':' + guestsColLetter + ')')
    .setFontWeight('bold')
    .setFontSize(12)
    .setFontColor(COLOR_TITLE);
  sheet.getRange(TITLE_ROW + 2, 1).setValue('Respuestas:');
  sheet.getRange(TITLE_ROW + 2, 2).setFormula(
    '=COUNTA(B' + (HEADER_ROW + 1) + ':B)'
  );

  sheet.setFrozenRows(HEADER_ROW);
  return spreadsheet;
}

// Encabezados dinámicos: base + preguntas del cliente. Si llega una pregunta
// que no está en los encabezados (cliente la agregó después), se añade al
// final — las filas viejas quedan intactas con esa celda vacía.
function ensureHeaders(sheet, data) {
  var wanted = BASE_HEADERS.concat(data.questionLabels || []);
  Object.keys(data.answers || {}).forEach(function (label) {
    if (wanted.indexOf(label) === -1) wanted.push(label);
  });

  var lastCol = sheet.getLastColumn();
  var current = [];
  if (lastCol > 0) {
    var row = sheet.getRange(HEADER_ROW, 1, 1, lastCol).getValues()[0];
    current = row.filter(function (v) { return v !== ''; });
  }

  if (current.length === 0) {
    writeHeaders(sheet, 1, wanted);
    applyTableStyle(sheet, wanted.length);
    return;
  }

  var missing = wanted.filter(function (h) { return current.indexOf(h) === -1; });
  if (missing.length > 0) {
    writeHeaders(sheet, current.length + 1, missing);
    applyTableStyle(sheet, current.length + missing.length);
  }
}

function writeHeaders(sheet, startCol, headers) {
  sheet.getRange(HEADER_ROW, startCol, 1, headers.length)
    .setValues([headers])
    .setFontWeight('bold')
    .setFontColor('#ffffff')
    .setBackground(COLOR_HEADER);
  headers.forEach(function (h, i) {
    sheet.setColumnWidth(startCol + i, widthFor(h));
  });
}

// Ancho según el tipo de columna: fijas conocidas, preguntas de texto largo
// (mensaje, canción, restricciones…) más anchas, resto de preguntas medianas.
function widthFor(header) {
  if (COLUMN_WIDTHS[header]) return COLUMN_WIDTHS[header];
  if (/mensaje|canci|restricc|alerg|coment/i.test(header)) return MESSAGE_WIDTH;
  return QUESTION_WIDTH;
}

// Look de tabla: encabezado verde + filas alternadas. Se re-aplica cuando
// se agregan columnas para que las nuevas también queden con bandas.
function applyTableStyle(sheet, totalCols) {
  sheet.getBandings().forEach(function (b) { b.remove(); });
  var range = sheet.getRange(HEADER_ROW, 1, BAND_ROWS, totalCols);
  var banding = range.applyRowBanding(SpreadsheetApp.BandingTheme.GREEN, true, false);
  banding.setHeaderRowColor(COLOR_HEADER);
  // el banding pinta su propio header — reforzamos el texto blanco
  sheet.getRange(HEADER_ROW, 1, 1, totalCols).setFontColor('#ffffff').setFontWeight('bold');
}

function appendRsvpRow(sheet, data) {
  var headers = sheet.getRange(HEADER_ROW, 1, 1, sheet.getLastColumn()).getValues()[0];
  var answers = data.answers || {};

  var byHeader = {
    'Fecha':       Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm'),
    'Nombre':      data.guestName || '',
    'Asistencia':  data.attendanceDetail || data.attendance || '',
    'Confirmados': data.totalGuests != null ? Number(data.totalGuests) : '',
  };

  var row = headers.map(function (h) {
    if (h in byHeader) return byHeader[h];
    return answers[h] != null ? answers[h] : '';
  });

  sheet.appendRow(row);
}

// ─── Utilidades ──────────────────────────────────────────────────────────────

function propKey(slug) {
  return 'sheet:' + String(slug).toLowerCase().trim();
}

function columnLetter(col) {
  var letter = '';
  while (col > 0) {
    var rem = (col - 1) % 26;
    letter = String.fromCharCode(65 + rem) + letter;
    col = Math.floor((col - 1) / 26);
  }
  return letter;
}

function moveToFolder(fileId) {
  var folders = DriveApp.getFoldersByName(FOLDER_NAME);
  var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(FOLDER_NAME);
  var file = DriveApp.getFileById(fileId);
  file.moveTo(folder);
  // La pareja recibe el link como viewer — sin pedir su correo
  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (err) {
    // dominios con restricción de compartir — la hoja queda privada
  }
}

function shareSheet(spreadsheet, email) {
  try {
    spreadsheet.addViewer(email);
  } catch (err) {
    // email inválido o cuota — no rompe el setup
  }
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

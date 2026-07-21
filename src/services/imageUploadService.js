import { UPLOAD_ENDPOINT, UPLOAD_KEY } from '../constants/editorConstants';

const MAX_DIMENSION = 1920;
const JPEG_QUALITY = 0.82;
const SKIP_COMPRESSION_BYTES = 400 * 1024;

const loadImageElement = (file) =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ img, objectUrl });
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('No se pudo leer la imagen'));
    };
    img.src = objectUrl;
  });

// Resizes to MAX_DIMENSION and re-encodes as JPEG to keep uploads fast.
// GIFs are skipped (would lose animation); files that fail to decode
// (e.g. HEIC on Chrome) are uploaded as-is — ImgBB supports them.
const compressImage = async (file) => {
  if (file.type === 'image/gif' || file.size < SKIP_COMPRESSION_BYTES) return file;

  const { img, objectUrl } = await loadImageElement(file);
  try {
    const scale = Math.min(1, MAX_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight));
    const width = Math.round(img.naturalWidth * scale);
    const height = Math.round(img.naturalHeight * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d').drawImage(img, 0, 0, width, height);

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY),
    );
    if (!blob) return file;
    return blob.size < file.size ? blob : file;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

// Uploads a File to the Hostinger endpoint (hostinger/upload.php)
// and returns the hosted image URL.
export const uploadImage = async (file) => {
  if (!UPLOAD_ENDPOINT) {
    throw new Error('Falta configurar VITE_UPLOAD_ENDPOINT');
  }

  let blob = file;
  try {
    blob = await compressImage(file);
  } catch {
    blob = file;
  }

  const form = new FormData();
  form.append('key', UPLOAD_KEY);
  form.append('image', blob, blob === file ? file.name : 'foto.jpg');

  const res = await fetch(UPLOAD_ENDPOINT, { method: 'POST', body: form });
  if (!res.ok) throw new Error(`Error al subir la imagen (HTTP ${res.status})`);

  const json = await res.json();
  if (!json?.success || !json?.url) throw new Error('Respuesta inválida del servidor de imágenes');
  return json.url;
};

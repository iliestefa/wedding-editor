import path from 'path';

// ─── Opciones SCSS compartidas (editor + viewer del Worker) ──────────────────
// Cada plantilla debe compilarse con SUS PROPIAS variables/mixins — si no,
// sus colores quedan fijos con los valores del editor y no responden a la
// paleta elegida (ver src/utils/palettes.js de cada plantilla).
export const buildScssOptions = (dirname) => {
  const elegantSrc = path.resolve(dirname, 'node_modules/@iliestefa/wedding-elegant/src');
  const sohoSrc = path.resolve(dirname, 'node_modules/@iliestefa/wedding-soho/src');
  return {
    loadPaths: [
      path.resolve(dirname, 'src'),
      sohoSrc,
      elegantSrc,
    ],
    silenceDeprecations: ['import'],
    additionalData: (content, filename) => {
      if (filename.includes('/styles/')) return content;
      if (
        filename.includes('wedding-elegant') ||
        filename.includes('wedding-invitation-template-elegant') ||
        filename.includes('/elegante/')
      ) {
        return `
          @import '${elegantSrc}/styles/variables';
          @import '${elegantSrc}/styles/mixins';
          @import '${elegantSrc}/styles/animations';
        ` + content;
      }
      if (filename.includes('wedding-soho') || filename.includes('/soho/')) {
        return `
          @import '${sohoSrc}/styles/variables';
          @import '${sohoSrc}/styles/mixins';
          @import '${sohoSrc}/styles/animations';
        ` + content;
      }
      return `
        @import 'styles/variables';
        @import 'styles/mixins';
        @import 'styles/animations';
      ` + content;
    },
  };
};

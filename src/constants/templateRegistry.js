// ─── Template Registry ────────────────────────────────────────────────────────
// Lazy loaders — each template is loaded on demand so their CSS never mixes.

export const TEMPLATES = {
  soho: {
    label: 'Romántico Soho',
    load: () => import('./templateLoaders/sohoLoader'),
  },
  elegant: {
    label: 'Champagne & Charcoal',
    load: () => import('./templateLoaders/elegantLoader'),
  },
  animated: {
    label: 'Sobre Animado',
    load: () => import('./templateLoaders/animatedLoader'),
  },
};

export const DEFAULT_TEMPLATE = 'soho';

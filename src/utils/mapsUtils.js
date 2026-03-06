/**
 * Converts any Google Maps share/search URL into a working embeddable URL.
 *
 * Supported input formats:
 *   https://maps.google.com/?q=Place+Name
 *   https://www.google.com/maps/place/Place+Name/...
 *   https://www.google.com/maps?q=...
 *   https://maps.app.goo.gl/shortlink  (passed through as-is — can't resolve without fetch)
 *
 * Output: https://maps.google.com/maps?q=ENCODED_QUERY&output=embed&hl=es
 */
export const mapsLinkToEmbedSrc = (url) => {
  if (!url || typeof url !== 'string') return '';

  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname;

    // Already an embed URL — return as-is
    if (parsed.searchParams.get('output') === 'embed') return url;

    // Extract the query from common Google Maps URL patterns
    let query = '';

    // Pattern: ?q=...
    if (parsed.searchParams.get('q')) {
      query = parsed.searchParams.get('q');
    }

    // Pattern: /maps/place/PLACE_NAME/@lat,lng,...
    if (!query && hostname.includes('google.com')) {
      const placeMatch = parsed.pathname.match(/\/maps\/place\/([^/@]+)/);
      if (placeMatch) {
        query = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
      }
    }

    // Pattern: /maps?q=... or /maps/search/QUERY
    if (!query) {
      const searchMatch = parsed.pathname.match(/\/maps\/search\/([^/]+)/);
      if (searchMatch) {
        query = decodeURIComponent(searchMatch[1].replace(/\+/g, ' '));
      }
    }

    if (!query) return '';

    return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed&hl=es`;
  } catch {
    return '';
  }
};

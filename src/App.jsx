import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { TEMPLATES, DEFAULT_TEMPLATE } from './constants/templateRegistry';
import EditorLayout from './components/editor/EditorLayout/EditorLayout';
import RawPreview from './components/editor/RawPreview/RawPreview';
import Analytics from './components/Analytics/Analytics';
import './App.scss';

// `published`: viene de main.jsx cuando el link ?draft=slug.token apunta a
// una boda que YA fue publicada — el editor igual se monta con sus datos
// cargados (se puede seguir editando), pero arranca en el step "Publicar"
// mostrando PublishedInfo hasta que la pareja cambie algo.
const App = ({ published }) => {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);

  const templateSlug = useMemo(() => {
    const slug = params.get('template') ?? '';
    return TEMPLATES[slug] ? slug : DEFAULT_TEMPLATE;
  }, [params]);

  // ?raw=1 → solo el preview de la plantilla, sin el editor alrededor.
  // Lo usa el iframe del modo "Celular" (ver EditorLayout/RawPreview).
  const isRaw = params.get('raw') === '1';

  if (isRaw) {
    return <RawPreview templateSlug={templateSlug} />;
  }

  return (
    <>
      <Analytics />
      <EditorLayout templateSlug={templateSlug} published={published} />
    </>
  );
};

App.propTypes = {
  published: PropTypes.shape({
    previewUrl: PropTypes.string,
    sheetUrl:   PropTypes.string,
    editLink:   PropTypes.string,
  }),
};
App.defaultProps = { published: null };

export default App;

import { useMemo } from 'react';
import { TEMPLATES, DEFAULT_TEMPLATE } from './constants/templateRegistry';
import EditorLayout from './components/editor/EditorLayout/EditorLayout';
import RawPreview from './components/editor/RawPreview/RawPreview';
import Analytics from './components/Analytics/Analytics';
import './App.scss';

const App = () => {
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
      <EditorLayout templateSlug={templateSlug} />
    </>
  );
};

export default App;

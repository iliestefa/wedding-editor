import { useMemo } from 'react';
import { TEMPLATES, DEFAULT_TEMPLATE } from './constants/templateRegistry';
import EditorLayout from './components/editor/EditorLayout/EditorLayout';
import Analytics from './components/Analytics/Analytics';
import './App.scss';

const App = () => {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);

  const templateSlug = useMemo(() => {
    const slug = params.get('template') ?? '';
    return TEMPLATES[slug] ? slug : DEFAULT_TEMPLATE;
  }, [params]);

  return (
    <>
      <Analytics />
      <EditorLayout templateSlug={templateSlug} />
    </>
  );
};

export default App;

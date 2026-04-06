import { useMemo } from 'react';
import { TEMPLATES, DEFAULT_TEMPLATE } from './constants/templateRegistry';
import EditorLayout from './components/editor/EditorLayout/EditorLayout';
import './App.scss';

const App = () => {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);

  const templateSlug = useMemo(() => {
    const slug = params.get('template') ?? '';
    return TEMPLATES[slug] ? slug : DEFAULT_TEMPLATE;
  }, [params]);

  const order  = useMemo(() => params.get('order')  ?? '', [params]);
  const client = useMemo(() => params.get('client') ?? '', [params]);

  return <EditorLayout templateSlug={templateSlug} order={order} client={client} />;
};

export default App;

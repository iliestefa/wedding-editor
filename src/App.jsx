import { useMemo } from 'react';
import { VALID_TOKENS } from './constants/editorConstants';
import { TEMPLATES, DEFAULT_TEMPLATE } from './constants/templateRegistry';
import TokenGuard from './components/editor/TokenGuard/TokenGuard';
import EditorLayout from './components/editor/EditorLayout/EditorLayout';
import './App.scss';

const App = () => {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);

  const isAuthorized = useMemo(() => {
    const token = params.get('token') ?? '';
    return VALID_TOKENS.includes(token);
  }, [params]);

  const templateSlug = useMemo(() => {
    const slug = params.get('template') ?? '';
    return TEMPLATES[slug] ? slug : DEFAULT_TEMPLATE;
  }, [params]);

  if (!isAuthorized) return <TokenGuard />;

  return <EditorLayout templateSlug={templateSlug} />;
};

export default App;

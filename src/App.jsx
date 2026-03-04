import { useMemo } from 'react';
import { VALID_TOKENS } from './constants/editorConstants';
import { TEMPLATES, DEFAULT_TEMPLATE } from './constants/templateRegistry';
import TokenGuard from './components/editor/TokenGuard/TokenGuard';
import EditorLayout from './components/editor/EditorLayout/EditorLayout';
import './App.scss';

const getParams = () => {
  const params = new URLSearchParams(window.location.search);

  // GitHub Pages SPA redirect: restore path from ?p= param
  const redirectedPath = params.get('p');
  if (redirectedPath) {
    const cleanSearch = Array.from(params.entries())
      .filter(([k]) => k !== 'p')
      .map(([k, v]) => `${k}=${v}`)
      .join('&');
    const newUrl =
      window.location.pathname +
      (redirectedPath ? `/${redirectedPath}` : '') +
      (cleanSearch ? `?${cleanSearch}` : '');
    window.history.replaceState(null, '', newUrl);
    return new URLSearchParams(cleanSearch);
  }
  return params;
};

const getTemplateFromUrl = () => {
  // pathname: /wedding-editor/soho?token=xxx  or  /wedding-editor/elegant?token=xxx
  const segments = window.location.pathname.replace(/\/$/, '').split('/');
  const slug = segments[segments.length - 1];
  return TEMPLATES[slug] ? slug : DEFAULT_TEMPLATE;
};

const App = () => {
  const params = useMemo(getParams, []);
  const templateSlug = useMemo(getTemplateFromUrl, []);

  const isAuthorized = useMemo(() => {
    const token = params.get('token') ?? '';
    return VALID_TOKENS.includes(token);
  }, [params]);

  if (!isAuthorized) return <TokenGuard />;

  return <EditorLayout templateSlug={templateSlug} />;
};

export default App;

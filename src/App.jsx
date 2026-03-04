import { useMemo } from 'react';
import { VALID_TOKENS } from './constants/editorConstants';
import TokenGuard from './components/editor/TokenGuard/TokenGuard';
import EditorLayout from './components/editor/EditorLayout/EditorLayout';
import './App.scss';

const getTokenFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('token') ?? '';
};

const App = () => {
  const isAuthorized = useMemo(() => {
    const token = getTokenFromUrl();
    return VALID_TOKENS.includes(token);
  }, []);

  if (!isAuthorized) return <TokenGuard />;

  return <EditorLayout />;
};

export default App;

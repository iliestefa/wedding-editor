import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { EditorProvider } from './context/EditorContext';
import { TEMPLATES, DEFAULT_TEMPLATE } from './constants/templateRegistry';
import App from './App';
import './index.css';

const params = new URLSearchParams(window.location.search);
const slug = params.get('template') ?? '';
const templateSlug = TEMPLATES[slug] ? slug : DEFAULT_TEMPLATE;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <EditorProvider templateSlug={templateSlug}>
      <App />
    </EditorProvider>
  </StrictMode>,
);

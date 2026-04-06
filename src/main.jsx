import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { EditorProvider } from './context/EditorContext';
import { TEMPLATES, DEFAULT_TEMPLATE } from './constants/templateRegistry';
import App from './App';
import './index.css';

const params = new URLSearchParams(window.location.search);
const slug = params.get('template') ?? '';
const templateSlug = TEMPLATES[slug] ? slug : DEFAULT_TEMPLATE;
const order  = params.get('order')  ?? '';
const client = params.get('client') ?? '';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <EditorProvider templateSlug={templateSlug} order={order} client={client}>
      <App />
    </EditorProvider>
  </StrictMode>,
);

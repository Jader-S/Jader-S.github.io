import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/tokens.css';
import './styles/atmosphere.css';

const root = document.getElementById('root');
if (!root) throw new Error('No #root');

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      {/* Deep-space atmosphere layer — sits at z:0, behind the 3D canvas
          (home) and visible through content panels / 2D fallback. */}
      <div className="atmosphere" aria-hidden="true">
        <div className="atmosphere__nebula" />
        <div className="atmosphere__horizon" />
        <div className="atmosphere__grain" />
        <div className="atmosphere__vignette" />
      </div>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
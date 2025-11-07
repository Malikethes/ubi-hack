import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Importing our global styles
import App from './App';

// This is the standard React 18+ way to initialize the app
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
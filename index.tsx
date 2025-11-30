import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Global Error Handlers
window.onerror = function (message, source, lineno, colno, error) {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `<div style="color:red; background:black; padding:20px; z-index:9999; position:fixed; top:0; left:0; width:100%; height:100%; overflow:auto;">
      <h1 style="font-size:24px; margin-bottom:10px;">Global Error</h1>
      <pre style="white-space:pre-wrap;">${message}\n${source}:${lineno}:${colno}\n${error?.stack || ''}</pre>
    </div>`;
  }
};

window.onunhandledrejection = function (event) {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `<div style="color:orange; background:black; padding:20px; z-index:9999; position:fixed; top:0; left:0; width:100%; height:100%; overflow:auto;">
      <h1 style="font-size:24px; margin-bottom:10px;">Unhandled Promise Rejection</h1>
      <pre style="white-space:pre-wrap;">${event.reason}</pre>
    </div>`;
  }
};

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
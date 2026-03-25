import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

try {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <App />
  );
} catch (err) {
  document.getElementById('root').innerHTML = '<pre style="padding:20px;color:red">' + err.message + '\n' + err.stack + '</pre>';
}

// Service Worker registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { store } from './store/index.js';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { background: '#1c2333', color: '#e6edf3', border: '1px solid rgba(240,180,41,0.2)', borderRadius: '10px', fontSize: '0.875rem' },
          success: { iconTheme: { primary: '#2d7a3a', secondary: 'white' } },
          error: { iconTheme: { primary: '#da3633', secondary: 'white' } },
        }}
      />
    </Provider>
  </React.StrictMode>
);

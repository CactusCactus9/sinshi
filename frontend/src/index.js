import React from 'react';
import ReactDOM from 'react-dom/client'; // Import the new `createRoot` API
import App from './App';
import "./index.css"
import { AuthProvider } from './context/AuthContext'; // Ensure AuthProvider is imported correctly

const rootElement = document.getElementById('root');

const root = ReactDOM.createRoot(rootElement);

root.render(
  // <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  // </React.StrictMode>
);

import React from 'react';
import ReactDOM from 'react-dom/client';
import '@cloudscape-design/global-styles/index.css';
import './styles/custom.css';
import App from './App';
import { Amplify } from 'aws-amplify';
import awsconfig from './aws-exports.ts';

Amplify.configure(awsconfig);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

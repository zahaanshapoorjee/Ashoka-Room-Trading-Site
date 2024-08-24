// src/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';

// Initialize the client ID directly in the component
const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
ReactDOM.render(
  <GoogleOAuthProvider clientId={googleClientId}>
    <App />
  </GoogleOAuthProvider>,
  document.getElementById('root')
);


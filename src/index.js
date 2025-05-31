import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {PublicClientApplication,EventType} from '@azure/msal-browser'
import {MsalProvider} from '@azure/msal-react'
import { msalConfig } from './auth-config';
import 'bootstrap/dist/css/bootstrap.min.css';

const msalInstance = new PublicClientApplication(msalConfig);

// Add account initialization logic
msalInstance.initialize()
  .then(() => {
    // Handle redirect response
    msalInstance.handleRedirectPromise()
      .then((response) => {
        if (response) {
          // Set active account after successful redirect
          msalInstance.setActiveAccount(response.account);
        }
      })
      .catch((error) => {
        console.error("Redirect promise error:", error);
      });

    // Event callback for account changes
    msalInstance.addEventCallback((event) => {
      if (event.eventType === EventType.LOGIN_SUCCESS && event.payload.account) {
        msalInstance.setActiveAccount(event.payload.account);
      }
    });
  });
  
// Create root and render
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <MsalProvider instance={msalInstance}>
    <App /> 
  </MsalProvider>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

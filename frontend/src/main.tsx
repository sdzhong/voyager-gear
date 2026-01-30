import React from 'react'
import ReactDOM from 'react-dom/client'
import './global.css'
import * as Sentry from "@sentry/react";

import VoyagerApp from './App'
import { AuthProvider } from './contexts/AuthProvider'
import { CartProvider } from './contexts/CartProvider'

// Initialize Sentry
console.log('Initializing Sentry with DSN:', 'https://4e4dc332cdb647f0fe6d6916f479974a@o713169.ingest.us.sentry.io/4510801019273216');
console.log('Environment:', import.meta.env.MODE);

Sentry.init({
  dsn: "https://4e4dc332cdb647f0fe6d6916f479974a@o713169.ingest.us.sentry.io/4510801019273216",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  environment: import.meta.env.MODE || 'development',
  debug: true, // Enable debug mode for verbose logging
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of the transactions
  // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: ["localhost", /^http:\/\/localhost:5001\/api/],
  // Session Replay
  replaysSessionSampleRate: 1.0, // Capture 100% of sessions in development
  replaysOnErrorSampleRate: 1.0, // Capture 100% of sessions with errors
  beforeSend(event) {
    console.log('Sentry event being sent:', event);
    return event;
  },
});

console.log('Sentry initialized successfully!');

const root = ReactDOM.createRoot(document.getElementById('root')!)

// MSW mock server disabled - using real backend API
// Uncomment below to use mock data instead of real backend
/*
import('../mocks/browser')
  .then(async ({ worker }) => {
    return worker.start()
  })
  .then(() => {
    root.render(
      <Sentry.ErrorBoundary fallback={<div>An error has occurred</div>} showDialog>
        <AuthProvider>
          <CartProvider>
            <VoyagerApp />
          </CartProvider>
        </AuthProvider>
      </Sentry.ErrorBoundary>,
    )
  })
*/// Render app directly without MSW
root.render(
  <Sentry.ErrorBoundary fallback={<div>An error has occurred</div>} showDialog>
    <AuthProvider>
      <CartProvider>
        <VoyagerApp />
      </CartProvider>
    </AuthProvider>
  </Sentry.ErrorBoundary>,
)
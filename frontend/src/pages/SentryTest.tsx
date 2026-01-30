import React from 'react';
import * as Sentry from '@sentry/react';

const SentryTest: React.FC = () => {
  const triggerError = () => {
    throw new Error('This is a test error for Sentry!');
  };

  const triggerCaptureException = () => {
    try {
      throw new Error('Manual Sentry test error');
    } catch (error) {
      Sentry.captureException(error);
      alert('Error captured and sent to Sentry!');
    }
  };

  const triggerCaptureMessage = () => {
    Sentry.captureMessage('This is a test message from Sentry', 'info');
    alert('Message sent to Sentry!');
  };

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Sentry Integration Test</h1>
      <p>Use these buttons to test if Sentry is properly capturing events:</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
        <button
          onClick={triggerCaptureMessage}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test 1: Send Message to Sentry
        </button>

        <button
          onClick={triggerCaptureException}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: '#e67e22',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test 2: Send Exception to Sentry (Caught)
        </button>

        <button
          onClick={triggerError}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test 3: Throw Uncaught Error (ErrorBoundary)
        </button>
      </div>

      <div style={{ marginTop: '40px', padding: '16px', backgroundColor: '#ecf0f1', borderRadius: '4px' }}>
        <h3>Instructions:</h3>
        <ol>
          <li><strong>Test 1:</strong> Sends an info-level message to Sentry</li>
          <li><strong>Test 2:</strong> Captures and sends an exception manually</li>
          <li><strong>Test 3:</strong> Throws an uncaught error that will be caught by Sentry's ErrorBoundary</li>
        </ol>
        <p style={{ marginTop: '16px' }}>
          After clicking any button, check your Sentry dashboard at:{' '}
          <a
            href="https://o713169.ingest.us.sentry.io/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#3498db' }}
          >
            Sentry Dashboard
          </a>
        </p>
      </div>

      <div style={{ marginTop: '24px', fontSize: '14px', color: '#666' }}>
        <p><strong>DSN:</strong> https://4e4dc332cdb647f0fe6d6916f479974a@o713169.ingest.us.sentry.io/4510801019273216</p>
        <p><strong>Environment:</strong> {import.meta.env.MODE}</p>
      </div>
    </div>
  );
};

export default SentryTest;

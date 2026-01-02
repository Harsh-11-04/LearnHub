
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import { initSentry } from './lib/sentry.ts'
import './index.css'

// Initialize error tracking
initSentry();

// Remove dark mode class addition
createRoot(document.getElementById("root")!).render(
    <ErrorBoundary>
        <App />
    </ErrorBoundary>
);

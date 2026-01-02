import * as Sentry from '@sentry/react';

/**
 * Initialize Sentry error tracking
 * Only enable in production or if explicitly configured
 */
export const initSentry = () => {
    const dsn = import.meta.env.VITE_SENTRY_DSN;
    const environment = import.meta.env.MODE;

    // Only initialize if DSN is provided
    if (!dsn) {
        console.log('Sentry DSN not configured - skipping error tracking initialization');
        return;
    }

    Sentry.init({
        dsn,
        environment,

        // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
        // We recommend adjusting this value in production
        tracesSampleRate: environment === 'production' ? 0.1 : 1.0,

        // Note: BrowserTracing and Replay require additional packages
        // Install with: npm install @sentry/tracing @sentry/replay
        // integrations: [
        //     new Sentry.BrowserTracing(),
        //     new Sentry.Replay({
        //         maskAllText: true,
        //         blockAllMedia: true,
        //     }),
        // ],

        // Filter out sensitive information
        beforeSend(event, hint) {
            // Don't send errors in development
            if (environment === 'development') {
                console.error('Sentry error (not sent):', hint.originalException || hint.syntheticException);
                return null;
            }

            // Filter private data
            if (event.user) {
                delete event.user.email;
                delete event.user.ip_address;
            }

            return event;
        },

        // Ignore common errors
        ignoreErrors: [
            // Browser extensions
            'top.GLOBALS',
            // Random plugins/extensions
            'originalCreateNotification',
            'canvas.contentDocument',
            'MyApp_RemoveAllHighlights',
            // Network errors
            'NetworkError',
            'Failed to fetch',
        ],
    });

    console.log(`Sentry initialized for ${environment} environment`);
};

/**
 * Manually capture an exception
 */
export const captureException = (error: Error, context?: Record<string, any>) => {
    if (context) {
        Sentry.setContext('additional', context);
    }
    Sentry.captureException(error);
};

/**
 * Manually capture a message
 */
export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info') => {
    Sentry.captureMessage(message, level);
};

/**
 * Set user context for error tracking
 */
export const setUserContext = (user: { id: string; username?: string }) => {
    Sentry.setUser({
        id: user.id,
        username: user.username,
    });
};

/**
 * Clear user context (on logout)
 */
export const clearUserContext = () => {
    Sentry.setUser(null);
};

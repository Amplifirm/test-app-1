// Sentry — error tracking.
// TODO_INSTALL: `npx expo install @sentry/react-native`
// Note: spec said `sentry-expo` but that package is deprecated. Use
// @sentry/react-native with the Expo config plugin (added in app.json).
//
// Native module — requires EAS dev client to fully test.

let _initialized = false;

export function initializeSentry(): void {
  if (_initialized) return;
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  if (!dsn) {
    if (__DEV__) console.log('[sentry] no DSN set — errors will not be reported');
    _initialized = true;
    return;
  }
  // LOCAL_MOCK: when SDK installed:
  //   const Sentry = require('@sentry/react-native');
  //   Sentry.init({ dsn, tracesSampleRate: 0.1, enableNative: true });
  _initialized = true;
}

export function captureException(err: unknown, context?: Record<string, unknown>): void {
  if (__DEV__) console.error('[sentry-mock] captureException', err, context);
  // LOCAL_MOCK: Sentry.captureException(err, { extra: context });
}

export function captureMessage(msg: string, level: 'info' | 'warning' | 'error' = 'info'): void {
  if (__DEV__) console.log(`[sentry-mock] ${level}: ${msg}`);
  // LOCAL_MOCK: Sentry.captureMessage(msg, level);
}

export function setUser(user: { id: string; email?: string } | null): void {
  // LOCAL_MOCK: Sentry.setUser(user);
}

export function addBreadcrumb(category: string, message: string, data?: Record<string, unknown>): void {
  if (__DEV__) console.log(`[sentry-mock] ${category}: ${message}`, data);
  // LOCAL_MOCK: Sentry.addBreadcrumb({ category, message, data });
}

import { createApp } from "vue";
import { createPinia } from "pinia";
import router from "./router";

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { setupFontAwesome } from "./utils/fontawesome";

import App from "./App.vue";
import "./assets/css/main.css";

setupFontAwesome();

const app = createApp(App);

app.component("font-awesome-icon", FontAwesomeIcon);
app.use(createPinia());
app.use(router);

app.mount("#app");

// logging utility for service worker
const logSW = {
  info: (message: string, ...args: unknown[]) => {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log(`[SW] ${message}`, ...args);
    }
  },
  warn: (message: string, ...args: unknown[]) => {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn(`[SW] ${message}`, ...args);
    }

  },
  error: (message: string, error?: unknown) => {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error(`[SW] ${message}`, error);
    }
  }
};

// error message generator
const getServiceWorkerErrorMessage = (error: unknown): string => {
  if (error instanceof TypeError) {
    if (error.message.includes('Failed to fetch')) {
      return 'Network error. Check if service-worker.js exists and is accessible.';
    } else if (error.message.includes('Script error')) {
      return 'Script parsing error. Check service-worker.js for syntax errors.';
    } else {
      return `TypeError: ${error.message}`;
    }
  } else if (error instanceof DOMException) {
    switch (error.name) {
      case 'SecurityError':
        return 'Security error. Ensure the app is served over HTTPS or localhost.';
      case 'NotSupportedError':
        return 'Feature not supported in this browser version.';
      case 'InvalidStateError':
        return 'Invalid state. Browser may be in private/incognito mode.';
      default:
        return `DOMException ${error.name}: ${error.message}`;
    }
  } else if (error instanceof Error) {
    if (error.message.includes('ImportError') || error.message.includes('SyntaxError')) {
      return 'Script loading or parsing error. Check service-worker.js file.';
    } else if (error.message.includes('quota')) {
      return 'Storage quota exceeded. Clear browser data and try again.';
    } else {
      return error.message;
    }
  } else {
    return `Unknown error: ${String(error)}`;
  }
};

// Register Service Worker in production
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/'
      });
      
      logSW.info('Service Worker registered successfully:', registration.scope);
      
      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              logSW.info('[PWA] New content available; please refresh.');
              // optionally dispatch custom event for UI notification
              document.dispatchEvent(new CustomEvent('pwa-update-available'));
            }
          });
        }
      });
    } catch (error) {
      const errorMessage = getServiceWorkerErrorMessage(error);
      logSW.error(`Service Worker registration failed: ${errorMessage}`, error);
      
      // dispatch custom event for error handling in UI
      document.dispatchEvent(new CustomEvent('sw-registration-failed', { 
        detail: { message: errorMessage, error } 
      }));
    }
  });
} else if (!('serviceWorker' in navigator)) {
  logSW.info('Service Worker not supported in this browser');
} else {
  logSW.info('Service Worker disabled in development mode');
}

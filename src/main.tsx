import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Guard: don't register service worker in iframes or preview hosts
const isInIframe = (() => {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
})();

const isPreviewHost =
  window.location.hostname.includes("id-preview--") ||
  window.location.hostname.includes("lovableproject.com");

// Always unregister stale service workers (one-time cleanup after backend migration)
// In preview/iframe: always clean up. In production: clean old caches once.
navigator.serviceWorker?.getRegistrations().then((registrations) => {
  if (isPreviewHost || isInIframe) {
    registrations.forEach((r) => r.unregister());
  } else if (!sessionStorage.getItem("sw-cleaned")) {
    registrations.forEach((r) => r.unregister());
    caches.keys().then((names) => names.forEach((n) => caches.delete(n)));
    sessionStorage.setItem("sw-cleaned", "1");
  }
});

createRoot(document.getElementById("root")!).render(<App />);

// Lightweight Google Analytics 4 integration for a client-side-routed SPA.
// GA's default automatic page_view only fires once on initial script load,
// which is wrong for a single-page app — every route change needs its own
// manual page_view event, or Analytics will only ever see one page hit no
// matter how many pages someone actually visits.

export const GA_MEASUREMENT_ID = 'G-C6BVBVNW1S';

let initialized = false;

export function initGA(measurementId = GA_MEASUREMENT_ID) {
  if (typeof window === 'undefined' || initialized) return;
  if (document.getElementById('ga4-script')) { initialized = true; return; }

  const script = document.createElement('script');
  script.id = 'ga4-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  gtag('js', new Date());
  // send_page_view: false — we send page_view events ourselves per route
  // change (see usePageTracking in App.jsx) instead of relying on GA's
  // single automatic pageview on script load.
  gtag('config', measurementId, { send_page_view: false });

  initialized = true;
}

export function trackPageView(path) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', 'page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
}

/* ==========================================
   FullStack Café - Service Worker (Push Only)
   ========================================== */

// 1. Push Event: Receives data from the server
self.addEventListener("push", (event) => {
  let data = {
    title: "FullStack Café",
    body: "You have a new update on your order!",
  };

  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    console.error("Push payload was not JSON, using fallback.", e);
  }

  const options = {
    body: data.body,
    icon: "/icons/favicon.png", // Ensure this exists in your public folder
    badge: "/icons/favicon.png",
    vibrate: [200, 100, 200],
    tag: "order-notification", // Replaces old notifications so they don't stack
    renotify: true,
    data: {
      // Link to open; defaults to Order History
      url: data.data && data.data.url ? data.data.url : "/orders",
    },
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// 2. Notification Click: Opens the app or focuses an existing tab
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  // Construct the full URL relative to the current origin
  const targetUrl = new URL(event.notification.data.url, self.location.origin)
    .href;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        // Check if a tab is already open with our app
        for (let client of windowClients) {
          if (client.url === targetUrl && "focus" in client) {
            return client.focus();
          }
        }
        // If no tab is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});

// 3. Lifecycle Management: Ensures the SW updates immediately
self.addEventListener("install", () => {
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Take control of all open tabs immediately
  event.waitUntil(clients.claim());
});

// public/sw.js — Service Worker for Web Push Notifications
// Receives push events from the backend and displays browser notifications.

self.addEventListener("push", (event) => {
  let data = { title: "E-Library Norton", body: "You have a new notification." };

  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch {
    // If the payload is plain text
    if (event.data) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body || "You have a new notification.",
    icon: "/logo.webp",
    badge: "/logo.webp",
    data: { url: data.url || "/" },
    vibrate: [200, 100, 200],
    tag: "elibrary-notification",
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(data.title || "E-Library Norton", options));
});

// When the user clicks the notification, open the URL
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";

  event.waitUntil(
    // eslint-disable-next-line no-undef
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Focus an existing tab if one is on the same origin
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Otherwise open a new window
      return clients.openWindow(url);
    })
  );
});

// Activate immediately — skip waiting
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

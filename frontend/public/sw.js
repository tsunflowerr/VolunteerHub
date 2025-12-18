self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/logo.png', // Ensure this path is correct
      badge: '/logo.png',
      data: {
        url: data.url || '/', // Allow backend to send a URL to open
      },
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'VolunteerHub', options)
    );
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  event.waitUntil(
    clients
      .matchAll({
        type: 'window',
      })
      .then(function (clientList) {
        const urlToOpen = event.notification.data.url;

        // Check if there is already a window open with this URL
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }

        // If not, open a new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

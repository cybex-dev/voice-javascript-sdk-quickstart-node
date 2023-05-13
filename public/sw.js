// create service worker

const tag = 'Service Worker';

const _log = (...message) => {
  console.log(`[ ${tag} ]`, ...message);
};
const _error = (...message) => {
  console.error(tag, ...message);
};

_log('Started');

addEventListener('activate', (event) => {
  _log('activate event', event);
});

addEventListener('fetch', (event) => {
  _log(`fetch event [${event.request.url}]`, event);
});

addEventListener('install', (event) => {
  _log('install event', event);
});

addEventListener('message', (event) => {
  _log('message event', event);
  handleMessage(event);
});

addEventListener('messageerror', (event) => {
  _log('messageerror event', event);
});

addEventListener('notificationclick', (event) => {
  _log(`notificationclick event [${event.action}]`, event);
});

addEventListener('notificationclose', (event) => {
  _log('notificationclose event', event);
});

addEventListener('push', (event) => {
  _log('push event', event);
});

function getNotifications() {
  return self.registration.getNotifications();
}

function getNotificationByTag(tag) {
  return getNotifications().find(n => n.tag === tag);
}

function handleMessage(event) {
  if(!event) {
    _error('No event');
    return;
  }

  if(!event.action) {
    _error('No action in event', event);
    return;
  }

  switch (event.action) {
    case 'hangup':
    case 'reject':
    case 'answer': {
      cancelNotification(event.tag);
      break;
    }
    case 'test': {
      _log('Test action');
      break;
    }
  }
}

function cancelNotification(tag) {
  _log("Canceling notification: ", tag)
  return getNotificationByTag(tag).then((notification) => {
    if (notification) {
      notification.close();
      _log("Notification cancelled: ", tag)
    }
  });
}

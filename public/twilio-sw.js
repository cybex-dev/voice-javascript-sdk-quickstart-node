importScripts('notifications.js')

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
    event.waitUntil(self.clients.claim()); // Become available to all pages
    _log('activated!');

    // Optional: Get a list of all the current open windows/tabs under
    // our service worker's control, and force them to reload.
    // This can "unbreak" any open windows/tabs as soon as the new
    // service worker activates, rather than users having to manually reload.
    // source: https://stackoverflow.com/a/38980776/4628115
    // self.clients.matchAll({type: 'window'}).then(windowClients => {
    //   windowClients.forEach(windowClient => {
    //     windowClient.navigate(windowClient.url);
    //   });
    // });
});

addEventListener('fetch', (event) => {
    _log(`fetch event [${event.request.url}]`, event);
});

addEventListener('install', (event) => {
    _log('install event, skip waiting', event);
    event.waitUntil(self.skipWaiting()); // Activate worker immediately

    // // Skip over the "waiting" lifecycle state, to ensure that our
    // // new service worker is activated immediately, even if there's
    // // another tab open controlled by our older service worker code.
    // // source: https://stackoverflow.com/a/38980776/4628115
    // self.skipWaiting();
});

addEventListener('message', (event) => {
    handleMessage(event);
});

addEventListener('messageerror', (event) => {
    _log('messageerror event', event);
});

addEventListener('notificationclick', (event) => {
    _log(`notificationclick event [${event.action}]`, event);
    event.notification.close();
    handleNotificationEvent(event.action, event.notification, event.notification.tag);
});

addEventListener('notificationclose', (event) => {
    _log('notificationclose event', event);
    event.notification.close();
    handleNotificationEvent(null, event.data, event.tag);
});

addEventListener('push', (event) => {
    _log('push event', event);
});

function handleNotificationEvent(action, payload, tag) {
    switch (action) {
        case 'answer': {
            focusClientWindow();
            sendToClient(action, tag);
            break;
        }
        case 'hangup':
        case 'reject': {
            sendToClient(action, tag);
            break;
        }
        default: {
            focusClientWindow();
            break;
        }
    }
}

function sendToClient(action, payload) {
    const message = {
        action: action,
        payload: payload
    };
    self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
            client.postMessage(message);
        });
    });
}

function focusClientWindow() {
    self.clients.matchAll({
        type: "window",
    }).then((clients) => {
        for (const client of clients) {
            if (client.url === "/" && "focus" in client) return client.focus();
        }
        if (clients.openWindow) return clients.openWindow("/");
    }).catch((error) => {
        _error('Could not focus client window', error);
    });
}

function handleMessage(event) {
    if (!event) {
        _error('No event');
        return;
    }

    if (!event.data) {
        _error('No event data');
        return;
    }

    const data = event.data;
    const action = data.action;
    const payload = data.payload;

    switch (action) {
        case 'incoming': {
            _showIncomingCallNotification(payload);
            break;
        }
    }
}

/**
 * Show an incoming call notification with actions (if available)
 * @param payload
 * @private
 */
function _showIncomingCallNotification(payload) {
    if (!payload) {
        _error('Cannot show an incoming call notification with no data', payload);
        return;
    }

    if (!payload.title) {
        _error('Cannot show an incoming call notification with no title', payload);
        return;
    }

    if (!payload.options) {
        _error('Cannot show an incoming call notification with no options', payload);
        return;
    }

    const title = payload.title;
    const options = payload.options;
    showNotification(title, options);
}

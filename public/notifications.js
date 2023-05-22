async function requestNotificationPermissions() {
    if (Notification) {
        try {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        } catch (e) {
            _error('Error requesting notification permissions', e);
        }
    }
    return false;
}

/// Has background Notification API permissions
function hasNotificationPermissions() {
    return Notification.permission === 'granted';
}

function showNotification(title, options) {
    if (!requestNotificationPermissions()) {
        _error('Cannot show an incoming call notification without permissions', title, options);
        return;
    }

    if (hasNotificationPermissions()) {
        self.registration.showNotification(title, options).catch((error) => {
            _error('Error showing notification', error);
        });
    }
}

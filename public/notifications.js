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
    if (!hasNotificationPermissions()) {
        _error('Cannot show notification without permissions');
        return;
    }
    self.registration.showNotification(title, options).catch((error) => {
        _error('Error showing notification', error);
    });
}

function getNotificationByTag(tag) {
    return self.registration.getNotifications().then((notifications) => {
        return notifications.find((notification) => {
            return notification.tag === tag;
        });
    });
}

function cancelNotification(tag) {
    if (!tag) {
        _error('Cannot cancel a notification with no tag', tag);
        return;
    }
    _log("Canceling notification: ", tag)
    return getNotificationByTag(tag).then((notification) => {
        if (notification) {
            notification.close();
            _log("Notification cancelled: ", tag)
        }
    });
}


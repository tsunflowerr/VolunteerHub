import { useState, useEffect } from 'react';
import { usersApi } from '../api/users';
import useAuth from './useAuth';
import toast from 'react-hot-toast';

// Helper to convert VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const usePushNotifications = () => {
  const { user, updateUser } = useAuth();
  const [isLocallySubscribed, setIsLocallySubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [permission, setPermission] = useState(Notification.permission);

  // You should set this in your frontend .env file: VITE_VAPID_PUBLIC_KEY=...
  const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((subscription) => {
          setIsLocallySubscribed(!!subscription);
        });
      });
    }
  }, []);

  const subscribeToPush = async () => {
    if (!user) {
      console.error('Cannot subscribe: User not logged in');
      return;
    }
    if (!VAPID_PUBLIC_KEY) {
      console.error('VAPID_PUBLIC_KEY is missing. Check VITE_VAPID_PUBLIC_KEY in .env');
      toast.error('Push notifications are not configured (Missing Key)');
      return;
    }

    console.log('Attempting to subscribe to push notifications...');
    setLoading(true);
    try {
      // Request permission first
      const permissionResult = await Notification.requestPermission();
      
      if (permissionResult !== 'granted') {
        toast.error('Notification permission denied');
        setPermission(permissionResult);
        setLoading(false);
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      
      // Subscribe (returns existing if available)
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // Send subscription to backend
      await usersApi.savePushSubscription(subscription);
      console.log('Subscription saved to backend successfully');

      // Update local state and auth context
      setIsLocallySubscribed(true);
      updateUser({ hasPushSubscription: true });
      
      setPermission('granted');
      toast.success('Push notifications enabled!');
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      toast.error('Failed to enable push notifications: ' + error.message);
      setPermission(Notification.permission);
    } finally {
      setLoading(false);
    }
  };

  const unsubscribeFromPush = async () => {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
      }

      await usersApi.removePushSubscription();

      // Update local state and auth context
      setIsLocallySubscribed(false);
      updateUser({ hasPushSubscription: false });

      toast.success('Push notifications disabled');
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications', error);
      toast.error('Failed to disable push notifications');
    } finally {
      setLoading(false);
    }
  };

  // Determine effective subscription status:
  // Must have local browser subscription AND backend record for this user
  const isSubscribed = isLocallySubscribed && !!user?.hasPushSubscription;

  return {
    isSubscribed,
    isLocallySubscribed,
    isRemoteSubscribed: !!user?.hasPushSubscription,
    loading,
    permission,
    subscribeToPush,
    unsubscribeFromPush,
  };
};
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
  const { user } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [permission, setPermission] = useState(Notification.permission);

  // You should set this in your frontend .env file: VITE_VAPID_PUBLIC_KEY=...
  const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((subscription) => {
          setIsSubscribed(!!subscription);
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
    console.log('VAPID_PUBLIC_KEY:', VAPID_PUBLIC_KEY?.substring(0, 20) + '...');

    setLoading(true);
    try {
      // Request permission first
      const permissionResult = await Notification.requestPermission();
      console.log('Notification permission result:', permissionResult);
      
      if (permissionResult !== 'granted') {
        toast.error('Notification permission denied');
        setPermission(permissionResult);
        setLoading(false);
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      console.log('ServiceWorker ready:', registration);

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      console.log('Push subscription created:', subscription);
      console.log('Endpoint:', subscription.endpoint);

      // Send subscription to backend
      await usersApi.savePushSubscription(subscription);
      console.log('Subscription saved to backend successfully');

      setIsSubscribed(true);
      setPermission('granted');
      toast.success('Push notifications enabled!');
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      console.error('Error details:', error.message, error.code);
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

      setIsSubscribed(false);
      toast.success('Push notifications disabled');
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications', error);
      toast.error('Failed to disable push notifications');
    } finally {
      setLoading(false);
    }
  };

  return {
    isSubscribed,
    isRemoteSubscribed: user?.hasPushSubscription,
    loading,
    permission,
    subscribeToPush,
    unsubscribeFromPush,
  };
};

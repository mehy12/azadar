import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const getAppMessaging = () => {
  if (typeof window !== 'undefined') {
    return getMessaging(app);
  }
  return null;
};

export const requestForToken = async (): Promise<{ token: string | null, error?: string }> => {
  try {
    if (!firebaseConfig.projectId) {
      console.warn("[AzaHub] Firebase configuration is missing.");
      return { token: null, error: 'missing_config' };
    }

    const supported = await isSupported();
    if (!supported) {
      console.warn("Firebase Messaging is not supported in this browser.");
      return { token: null, error: 'not_supported' };
    }

    // iOS requires explicit permission prompt triggered directly by user action
    if (!('Notification' in window)) {
      return { token: null, error: 'not_supported' };
    }

    if (Notification.permission === 'denied') {
      return { token: null, error: 'denied' };
    }

    // Explicitly ask for permission BEFORE Firebase does
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        return { token: null, error: 'denied' };
      }
    }

    const messaging = getMessaging(app);
    
    let registration = null;
    if ('serviceWorker' in navigator) {
      registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        await navigator.serviceWorker.register('/sw.js');
        registration = await navigator.serviceWorker.ready;
      }
    }

    const currentToken = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration || undefined,
    });

    if (currentToken) {
      localStorage.setItem('notificationRequested', 'true');
      return { token: currentToken };
    } else {
      return { token: null, error: 'no_token' };
    }
  } catch (err: any) {
    console.error("An error occurred while retrieving token. ", err);
    return { token: null, error: err.message };
  }
};

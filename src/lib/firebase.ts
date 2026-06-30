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

export const requestForToken = async () => {
  try {
    if (!firebaseConfig.projectId) {
      console.warn("[AzaHub] Firebase configuration is missing. Please add NEXT_PUBLIC_FIREBASE_* variables to .env.local.");
      return null;
    }

    const supported = await isSupported();
    if (!supported) {
      console.warn("Firebase Messaging is not supported in this browser.");
      return null;
    }

    // Only prompt if we haven't permanently denied it. 
    // And to prevent spamming, we track if we explicitly asked before.
    if (Notification.permission === 'denied') {
      console.warn("Notifications are denied by the user.");
      return null;
    }

    const messaging = getMessaging(app);
    
    let registration = null;
    if ('serviceWorker' in navigator) {
      registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        await navigator.serviceWorker.register('/sw.js');
        // We must wait for the service worker to become fully active before Firebase can subscribe
        registration = await navigator.serviceWorker.ready;
      }
    }

    const currentToken = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration || undefined,
    });

    if (currentToken) {
      localStorage.setItem('notificationRequested', 'true');
      return currentToken;
    } else {
      console.warn("No registration token available. Request permission to generate one.");
      return null;
    }
  } catch (err) {
    console.error("An error occurred while retrieving token. ", err);
    return null;
  }
};

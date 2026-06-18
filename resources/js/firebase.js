import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAIitrAiiWKF3z-DkRgJHMAfSnRco5ojlg",
  authDomain: "tetugas-90d30.firebaseapp.com",
  projectId: "tetugas-90d30",
  storageBucket: "tetugas-90d30.firebasestorage.app",
  messagingSenderId: "308749485078",
  appId: "1:308749485078:web:caa9cf20cf897840d9e137",
  measurementId: "G-HVC111FHX3"
};

const app = initializeApp(firebaseConfig);
const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

export const requestForToken = async () => {
  try {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('Permission not granted for Notification');
        return null;
      }
    }

    const currentToken = await getToken(messaging, { 
        vapidKey: "BAENz_P3Gjqpv9Pt7ADVwdJeeak6PpdkLuzN9UUepeK8grmXgXoQtoKI9VdjNI3eauzqcZboW4ZJqhppux3zKoM" 
    });
    if (currentToken) {
      return currentToken;
    } else {
      console.log('No registration token available. Request permission to generate one.');
      return null;
    }
  } catch (err) {
    console.error('An error occurred while retrieving token. ', err);
    return null;
  }
};

export const setupForegroundListener = (callback) => {
  if (!messaging) return;
  onMessage(messaging, (payload) => {
    callback(payload);
  });
};

export { messaging };

importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyAIitrAiiWKF3z-DkRgJHMAfSnRco5ojlg",
  authDomain: "tetugas-90d30.firebaseapp.com",
  projectId: "tetugas-90d30",
  storageBucket: "tetugas-90d30.firebasestorage.app",
  messagingSenderId: "308749485078",
  appId: "1:308749485078:web:caa9cf20cf897840d9e137",
  measurementId: "G-HVC111FHX3"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/vite.svg'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

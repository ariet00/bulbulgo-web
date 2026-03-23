importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: 'AIzaSyCPvDWGO04CPdjKC5l3zHGx7prj7xz85xY',
    authDomain: 'doska-f0532.firebaseapp.com',
    projectId: 'doska-f0532',
    storageBucket: 'doska-f0532.firebasestorage.app',
    messagingSenderId: '581148505696',
    appId: '1:581148505696:web:ceb27bea654837206a7505',
    measurementId: 'G-3326QFDKBL',
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/icon.png' // We can update this later if we have a specific icon
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Scripts for firebase and firebase messaging
// import {
//   getMessaging,
//   getToken,
// } from 'https://www.gstatic.com/firebasejs/9.18.0/firebase-messaging-compat.js';

// proper initialization
if( 'function' === typeof importScripts) {
  importScripts('https://www.gstatic.com/firebasejs/9.18.0/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/9.18.0/firebase-messaging-compat.js');

  // Initialize the Firebase app in the service worker by passing the generated config
  const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
  };

  firebase.initializeApp(firebaseConfig);
  // importScripts('script2.js');
  // addEventListener('message', onMessage);
  //
  // function onMessage(e) {
  //   // do some work here
  // }
}

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
    apiKey: "AIzaSyBhIbqPRNjmaw7rsm0qsLoC7pBtYgBjwwk",
    authDomain: "hyper-search-259de.firebaseapp.com",
    databaseURL: "https://hyper-search-259de-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "hyper-search-259de",
    storageBucket: "hyper-search-259de.appspot.com",
    messagingSenderId: "786618085756",
    appId: "1:786618085756:web:a3e4f8183139fd10b434f9",
    measurementId: "G-BKCGNYGRBK"
  };

  firebase.initializeApp(firebaseConfig);
  // importScripts('script2.js');
  // addEventListener('message', onMessage);
  //
  // function onMessage(e) {
  //   // do some work here
  // }
}

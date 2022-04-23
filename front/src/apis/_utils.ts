// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyCi8TfNLzuG1vmpyCB3Ezk0KRGy9_bRyt4',
  authDomain: 'icouple-fe019.firebaseapp.com',
  projectId: 'icouple-fe019',
  storageBucket: 'icouple-fe019.appspot.com',
  messagingSenderId: '1035717637806',
  appId: '1:1035717637806:web:b8ba6d89161a6daf4cdf3f',
  measurementId: 'G-BNP6DPCG9C',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export {
  app,
  analytics,
};

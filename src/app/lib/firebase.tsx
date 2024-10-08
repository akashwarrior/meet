// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCJindKbl8XvU7J3hCcN27afuHf4B66fGM",
  authDomain: "rd-share.firebaseapp.com",
  projectId: "rd-share",
  storageBucket: "rd-share.appspot.com",
  messagingSenderId: "1088409516421",
  appId: "1:1088409516421:web:61a6fa682d4e2e460c2cec"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db }
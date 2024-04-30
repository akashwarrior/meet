// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDHyTa_zZ1iREZtw-zQnx5poBytiC0_1uE",
    authDomain: "remote-desktop-56d73.firebaseapp.com",
    projectId: "remote-desktop-56d73",
    storageBucket: "remote-desktop-56d73.appspot.com",
    messagingSenderId: "192698454960",
    appId: "1:192698454960:web:73936370b4c80866c03c75",
    measurementId: "G-74NY7E87WN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
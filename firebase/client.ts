// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyD_5Q8KuJq2zgVUH-RhlHcsJapN3KjOwMw",
    authDomain: "jobi-63b24.firebaseapp.com",
    projectId: "jobi-63b24",
    storageBucket: "jobi-63b24.firebasestorage.app",
    messagingSenderId: "91934568418",
    appId: "1:91934568418:web:5ca4d2faf15817ec3ad3bb",
    measurementId: "G-R9MLM4513N"
};

// Initialize Firebase
const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);


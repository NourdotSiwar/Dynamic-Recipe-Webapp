// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBY-o1dezAvmBPgc1Ah4569o9u1H5s1jAM",
  authDomain: "dynamicrecipeapp.firebaseapp.com",
  projectId: "dynamicrecipeapp",
  storageBucket: "dynamicrecipeapp.firebasestorage.app",
  messagingSenderId: "694291481493",
  appId: "1:694291481493:web:5acdca11c599e5a9b1ac9c",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export {app, auth};
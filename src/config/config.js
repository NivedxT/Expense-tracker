// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAbhsh0KeJHD425VkYxo2oUFy0-MF0dkcg",
  authDomain: "expense-b1814.firebaseapp.com",
  projectId: "expense-b1814",
  storageBucket: "expense-b1814.firebasestorage.app",
  messagingSenderId: "758530492286",
  appId: "1:758530492286:web:3c36c60c9ef24ac9f3952f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth=getAuth(app);
export {app,auth};
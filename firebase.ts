import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDq3lmHDACIejkIMshrYk5cd8nF5zGnA_A",
  authDomain: "pokerole-system-game.firebaseapp.com",
  projectId: "pokerole-system-game",
  storageBucket: "pokerole-system-game.firebasestorage.app",
  messagingSenderId: "1003513148425",
  appId: "1:1003513148425:web:2fb5b9ce999637c3c674d8",
  measurementId: "G-K1V0DY6Z5G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC1HlXj7EkC7ojpJVNcBFbvNlJLZvbLvHc",
  authDomain: "bsp-notes.firebaseapp.com",
  projectId: "bsp-notes",
  storageBucket: "bsp-notes.firebasestorage.app",
  messagingSenderId: "835580107487",
  appId: "1:835580107487:web:aaf3a625addafc1b1b276a",
  measurementId: "G-62J6HHVTHZ",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const Fdb = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

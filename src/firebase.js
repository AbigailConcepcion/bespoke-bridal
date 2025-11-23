import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBYLAMuZ16aN1cGakDocDGc3Z5a5YQBpvI",
  authDomain: "bespoke-bridal.firebaseapp.com",
  projectId: "bespoke-bridal",
  storageBucket: "bespoke-bridal.firebasestorage.app",
  messagingSenderId: "663685473630",
  appId: "1:663685473630:web:b2029e592e377cf6b11bcf",
  measurementId: "G-NQKP58VQX0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services so the app can use them
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyCpZL9qCGg-WyDDc_T5eHu2850EIVBOQO8",
  authDomain: "sgate-2ba78.firebaseapp.com",
  projectId: "sgate-2ba78",
  storageBucket: "sgate-2ba78.firebasestorage.app",
  messagingSenderId: "970576997320",
  appId: "1:970576997320:web:08afd41a2094dcfe4beefd",
};
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);
export default app;

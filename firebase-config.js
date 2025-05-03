// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAT1YuUSoKvAC_q1yxmB8Ggt4vR6f51Nkc",
  authDomain: "telemediss.firebaseapp.com",
  databaseURL: "https://telemediss-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "telemediss",
  storageBucket: "telemediss.firebasestorage.app",
  messagingSenderId: "96895220603",
  appId: "1:96895220603:web:fc4c9d8c3bb243a1155bde",
  measurementId: "G-RSN040MZWR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Inisialisasi Firestore dan Auth
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
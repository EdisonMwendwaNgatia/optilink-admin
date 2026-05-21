import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCfCDCVJBLXd9DOPsBVFyFfOIXKZUAG2wI",
  authDomain: "student-innovation-hub.firebaseapp.com",
  databaseURL: "https://student-innovation-hub-default-rtdb.firebaseio.com",
  projectId: "student-innovation-hub",
  storageBucket: "student-innovation-hub.firebasestorage.app",
  messagingSenderId: "68503838806",
  appId: "1:68503838806:web:8527b5a66fffbd831b5bf7",
  measurementId: "G-WKXJFW24VJ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDsUtYn2SO2sIZk9zEEknTZfbcJP184TN0",
  authDomain: "medguard-ai-9f369.firebaseapp.com",
  projectId: "medguard-ai-9f369",
  storageBucket: "medguard-ai-9f369.firebasestorage.app",
  messagingSenderId: "322440675374",
  appId: "1:322440675374:web:a42d258d6c2c53b3821fbf",
  measurementId: "G-160KG1C813"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

// ✅ ADD THIS
const auth = getAuth(app);

// ✅ Export both
export { app , db, auth };
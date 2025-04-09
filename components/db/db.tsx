import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDIdzPun_redYTs1F-0OMJOSs2SBb67k8g",
  authDomain: "edumatica-interactiva-pg2.firebaseapp.com",
  projectId: "edumatica-interactiva-pg2",
  storageBucket: "edumatica-interactiva-pg2.firebasestorage.app",
  messagingSenderId: "349803094210",
  appId: "1:349803094210:web:ab2804d939692c02bbdb5b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
export { auth, db };
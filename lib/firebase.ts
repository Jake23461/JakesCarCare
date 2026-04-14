import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCY-TRVaKE_sHAymKNHshKy60strhJVqA0",
  authDomain: "valeting-1d9a7.firebaseapp.com",
  projectId: "valeting-1d9a7",
  storageBucket: "valeting-1d9a7.firebasestorage.app",
  messagingSenderId: "325979702496",
  appId: "1:325979702496:web:6035796b71fa948ebc7c85",
  measurementId: "G-7REC1ZQRNB",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

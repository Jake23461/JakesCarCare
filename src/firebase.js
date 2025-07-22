// Firebase initialization for the car valeting site
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCY-TRVaKE_sHAymKNHshKy60strhJVqA0",
  authDomain: "valeting-1d9a7.firebaseapp.com",
  projectId: "valeting-1d9a7",
  storageBucket: "valeting-1d9a7.firebasestorage.app",
  messagingSenderId: "325979702496",
  appId: "1:325979702496:web:6035796b71fa948ebc7c85",
  measurementId: "G-7REC1ZQRNB"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage }; 
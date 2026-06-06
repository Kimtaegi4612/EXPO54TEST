import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCLE2OXg8l90PSQRwCLK1Hf8RYMh2Pkte0",
  authDomain: "coupleapp-9bc73.firebaseapp.com",
  projectId: "coupleapp-9bc73",
  storageBucket: "coupleapp-9bc73.firebasestorage.app",
  messagingSenderId: "895749666931",
  appId: "1:895749666931:web:bfbc4cceebba9917fd5206"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDiM8yNkIBASqyJICWy9i9hHdgwcTnq8I0",
  authDomain: "shipmozo-a2d3f.firebaseapp.com",
  projectId: "shipmozo-a2d3f",
  storageBucket: "shipmozo-a2d3f.firebasestorage.app",
  messagingSenderId: "795497767596",
  appId: "1:795497767596:web:471e778476dd499d56b509",
  measurementId: "G-EXZRDGC9YB"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;

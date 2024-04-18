import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAKt4gWhn_lL8Q93bnVjf0DR4q3bg0dmto",
  authDomain: "pfe-azeyez.firebaseapp.com",
  projectId: "pfe-azeyez",
  storageBucket: "pfe-azeyez.appspot.com",
  messagingSenderId: "1067198107704",
  appId: "1:1067198107704:web:1b141093921f93091fd6cd",
  measurementId: "G-GLR1TV58D9"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app)
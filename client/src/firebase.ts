import { initializeApp } from "firebase/app"
import "firebase/firestore"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "boardman-test.firebaseapp.com",
  projectId: "boardman-test",
  storageBucket: "boardman-test.appspot.com",
  messagingSenderId: "97684627379",
  appId: "1:97684627379:web:a3c9f24b9e151331ff75c6",
}

export const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)

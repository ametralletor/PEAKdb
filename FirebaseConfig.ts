// Import the functions you need from the SDKs you need
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDJ9P3tUxea2nt8MvDyGSDW_QLBYGPf118",
  authDomain: "peakdb-56990.firebaseapp.com",
  projectId: "peakdb-56990",
  storageBucket: "peakdb-56990.firebasestorage.app",
  messagingSenderId: "1048069411630",
  appId: "1:1048069411630:web:e1d7b4e6467a817aea60bf"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});
export const db = getFirestore(app);
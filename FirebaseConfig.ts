import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getAuth, getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyDJ9P3tUxea2nt8MvDyGSDW_QLBYGPf118",
  authDomain: "peakdb-56990.firebaseapp.com",
  projectId: "peakdb-56990",
  storageBucket: "peakdb-56990.firebasestorage.app",
  messagingSenderId: "1048069411630",
  appId: "1:1048069411630:web:e1d7b4e6467a817aea60bf"
};


export const app = initializeApp(firebaseConfig);

let authInstance;
if (Platform.OS === 'web') {

  authInstance = getAuth(app);
} else {
  authInstance = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

export const auth = authInstance;
export const db = getFirestore(app);
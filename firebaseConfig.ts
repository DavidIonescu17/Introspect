// firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Your Firebase configuration object
const firebaseConfig = {
    apiKey: "AIzaSyCuFbuaNo4QXUG1hb1eKv8QlKZDtliSwX4",
    authDomain: "introspect-27f8d.firebaseapp.com",
    projectId: "introspect-27f8d",
    storageBucket: "introspect-27f8d.appspot.com0",
    messagingSenderId: "302094896535",
    appId: "1:302094896535:ios:5c6dd161845d6a948308d",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
  export const db = getFirestore(app);

  if (Platform.OS !== "web") {
    auth.setPersistence(getReactNativePersistence(AsyncStorage));
  }
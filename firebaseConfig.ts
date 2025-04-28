// firebase.js
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCuFbuaNo4QXUG1hb1eKv8QlKZDtliSwX4",
  authDomain: "introspect-27f8d.firebaseapp.com",
  projectId: "introspect-27f8d",
  storageBucket: "introspect-27f8d.appspot.com",
  messagingSenderId: "302094896535",
  appId: "1:302094896535:ios:5c6dd161845d6a948308d",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

// Initialize Firestore and Storage
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCwSmcyZPqjlG-BzV-O7BIlaoeWskTIbbA",
  authDomain: "smart-biz-card-767f9.firebaseapp.com",
  projectId: "smart-biz-card-767f9",
  storageBucket: "smart-biz-card-767f9.appspot.com",
  messagingSenderId: "265102957484",
  appId: "1:265102957484:web:9c4aff74fc394c3e6d7809",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
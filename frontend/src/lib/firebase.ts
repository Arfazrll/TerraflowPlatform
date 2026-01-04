import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCsg7KrqkFcrcE5ikmQRfTREH03o-7lDww",
  authDomain: "iottubes-eaf9d.firebaseapp.com",
  databaseURL: "https://iottubes-eaf9d-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "iottubes-eaf9d",
  storageBucket: "iottubes-eaf9d.firebasestorage.app",
  messagingSenderId: "697583958464",
  appId: "1:697583958464:web:0c0c189acb5f481ba67025"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
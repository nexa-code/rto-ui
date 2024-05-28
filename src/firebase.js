import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAMNCkJYVPqaHSVluXxV9wQRPGg7c93QxM",
    authDomain: "licensewatch-f317c.firebaseapp.com",
    projectId: "licensewatch-f317c",
    storageBucket: "licensewatch-f317c.appspot.com",
    messagingSenderId: "957155341911",
    appId: "1:957155341911:web:3bf59f1043caa4a9039512"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };

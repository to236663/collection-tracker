import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBXZhYnCiMoG57eOIqjbOGMDMEcGLGNjBg",
  authDomain: "collector-s-notebook.firebaseapp.com",
  projectId: "collector-s-notebook",
  storageBucket: "collector-s-notebook.firebasestorage.app",
  messagingSenderId: "752182968127",
  appId: "1:752182968127:web:9b84ef9d767808e1331d8a",
  measurementId: "G-FCPTMYWHXM"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

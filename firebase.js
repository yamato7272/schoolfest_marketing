// firebase.js
// Firebaseの初期化とFirestore参照のエクスポート用

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ここを書き換えてください
const firebaseConfig = {
  apiKey: "AIzaSyCvbtfyHw_VB4F2ap5bW17UbxzVwPKBWYE",
  authDomain: "schoolfest-marketing.firebaseapp.com",
  projectId: "schoolfest-marketing",
  storageBucket: "schoolfest-marketing.firebasestorage.app",
  messagingSenderId: "329641589997",
  appId: "1:329641589997:web:6a4bee1272b7ed6fe420e4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// dashboard/sales というドキュメントを参照
export const salesRef = doc(db, "dashboard", "sales");

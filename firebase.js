import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCvbtfyHw_VB4F2ap5bW17UbxzVwPKBWYE",
  authDomain: "schoolfest-marketing.firebaseapp.com",
  projectId: "schoolfest-marketing",
  storageBucket: "schoolfest-marketing.firebasestorage.app",
  messagingSenderId: "329641589997",
  appId: "1:329641589997:web:6a4bee1272b7ed6fe420e4"
};

// Firebase初期化
const app = initializeApp(firebaseConfig);

// Firestore取得
const db = getFirestore(app);

// sales/main ドキュメント参照
const salesRef = doc(db, "sales", "main");

// 他ファイルで使えるようにエクスポート
export { db, salesRef };

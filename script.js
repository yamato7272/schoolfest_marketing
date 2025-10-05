// --- Firebase Firestore連携 ---
import { salesRef } from './firebase.js';
import { getDoc, updateDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Firestoreのhidden配列でタイル状態を復元。totalは売上表示＆タイル開放トリガー。
let prevHiddenArr = [];
onSnapshot(salesRef, (docSnap) => {
  if (!docSnap.exists()) return;
  const data = docSnap.data();
  const progress = document.getElementById("progress");
  if (progress) progress.textContent = `売上本数: ${data.total}`;

  // hidden配列でタイル状態を復元（新規revealedは赤く点滅）
  const hiddenArr = Array.isArray(data.hidden) ? data.hidden : [];
  const prevSet = new Set(prevHiddenArr);
  revealedNumbers = new Set(hiddenArr);
  document.querySelectorAll('.box').forEach(box => {
    const idx = Number(box.dataset.index);
    if (revealedNumbers.has(idx)) {
      if (!prevSet.has(idx)) {
        // 新たにrevealedになったタイルは赤く点滅
        box.classList.add("flash-red");
        box.addEventListener("animationend", function handler() {
          box.classList.remove("flash-red");
          box.classList.add("revealed");
          box.removeEventListener("animationend", handler);
        });
      } else {
        box.classList.add("revealed");
      }
    } else {
      box.classList.remove("revealed");
    }
  });
  updateProgress();
  prevHiddenArr = [...hiddenArr];

  // index側ではhiddenの変更を受け取って表示するだけにする
  // hidden配列の管理（新しい番号を追加する処理）は calculation ページで行う
});

// hideRandomTile は削除（index.html は表示専用）

// ボタン押下時にtotalを加算
function addSales(num) {
  getDoc(salesRef).then((snap) => {
    if (!snap.exists()) return;
    const data = snap.data();
    const newTotal = (data.total || 0) + num;
    updateDoc(salesRef, { total: newTotal });
  });
}

document.getElementById("revealBtn1")?.addEventListener("click", () => addSales(1));
document.getElementById("revealBtn3")?.addEventListener("click", () => addSales(3));
document.getElementById("revealBtn10")?.addEventListener("click", () => addSales(10));

// --- ここから下は画像上のタイル生成・管理 ---

const grid = document.getElementById("grid");
// const revealBtn = document.getElementById("revealBtn");

const totalBoxes = 150;

let revealedNumbers = new Set();

// 画像上にタイルを150個生成（常に画像の上に重なる）
if (grid && grid.children.length === 0) {
  for (let i = 1; i <= totalBoxes; i++) {
    const div = document.createElement("div");
    div.classList.add("box");
    div.textContent = i;
    div.dataset.index = i;
    grid.appendChild(div);
  }
}

function updateProgress() {
  const revealedCount = revealedNumbers.size;
  const remaining = totalBoxes - revealedCount;
  const tileCountElem = document.getElementById("tileCount");
  if (tileCountElem) {
    tileCountElem.textContent = `開いたタイル: ${revealedCount} ／ ${totalBoxes}`;
  }

}

// Initialize progress display
updateProgress();

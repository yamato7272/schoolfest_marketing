// --- Firebase Firestore連携 ---
import { salesRef } from './firebase.js';
import { getDoc, updateDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Firestoreのtotalをリアルタイムで画面に反映
onSnapshot(salesRef, (docSnap) => {
  if (!docSnap.exists()) return;
  const data = docSnap.data();
  const progress = document.getElementById("progress");
  if (progress) progress.textContent = `売上本数: ${data.total}`;
});

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
const revealBtn = document.getElementById("revealBtn");

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
  progress.textContent = `Revealed: ${revealedCount}/${totalBoxes} (${remaining} remaining)`;

  if (revealedCount === totalBoxes) {
    revealBtn.textContent = "All revealed! 🎉";
    revealBtn.disabled = true;
  }
}

function revealBox(boxNumber) {
  if (revealedNumbers.has(boxNumber)) return;

  revealedNumbers.add(boxNumber);
  const box = document.querySelector(`.box[data-index='${boxNumber}']`);
  if (box) {
    // まず赤く点滅させてから透明にする
    box.classList.add("flash-red");
    box.addEventListener("animationend", function handler() {
      box.classList.remove("flash-red");
      box.classList.add("revealed");
      box.removeEventListener("animationend", handler);
    });
  }
  updateProgress();
}

// Random reveal button
revealBtn.addEventListener("click", () => {
  const remainingNumbers = [];
  for (let i = 1; i <= totalBoxes; i++) {
    if (!revealedNumbers.has(i)) {
      remainingNumbers.push(i);
    }
  }

  if (remainingNumbers.length === 0) {
    return;
  }

  const randomIndex = Math.floor(Math.random() * remainingNumbers.length);
  const randomBoxNumber = remainingNumbers[randomIndex];
  revealBox(randomBoxNumber);
});

// Initialize progress display
updateProgress();

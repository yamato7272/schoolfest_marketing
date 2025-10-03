// --- Firebase Firestore連携 ---
import { salesRef } from './firebase.js';
import { getDoc, updateDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Firestoreのtotalをリアルタイムで画面に反映し、10本ごとにタイルを1枚ランダムで不透明度を落とす
let lastTileCount = 0; // 前回の商を記録
onSnapshot(salesRef, (docSnap) => {
  if (!docSnap.exists()) return;
  const data = docSnap.data();
  const progress = document.getElementById("progress");
  if (progress) progress.textContent = `売上本数: ${data.total}`;

  // 10本ごとにタイルを1枚ランダムで不透明度を落とす
  const tileCount = Math.floor((data.total || 0) / 10);
  if (tileCount > lastTileCount) {
    for (let i = lastTileCount; i < tileCount; i++) {
      hideRandomTile();
    }
    lastTileCount = tileCount;
  }
});

// ランダムな未消去タイルを1枚選んで不透明度を落とす
function hideRandomTile() {
  const boxes = Array.from(document.querySelectorAll('.box'));
  const visibleBoxes = boxes.filter(box => !box.classList.contains('revealed'));
  if (visibleBoxes.length === 0) return;
  const randomIndex = Math.floor(Math.random() * visibleBoxes.length);
  const box = visibleBoxes[randomIndex];
  // 赤く点滅してから透明に
  box.classList.add("flash-red");
  box.addEventListener("animationend", function handler() {
    box.classList.remove("flash-red");
    box.classList.add("revealed");
    box.removeEventListener("animationend", handler);
  });
  revealedNumbers.add(Number(box.dataset.index));
  updateProgress();
}

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
  const tileCountElem = document.getElementById("tileCount");
  if (tileCountElem) {
    tileCountElem.textContent = `めくれたタイル: ${revealedCount} / ${totalBoxes}`;
  }

  if (revealedCount === totalBoxes) {
    if (revealBtn) {
      revealBtn.textContent = "All revealed! 🎉";
      revealBtn.disabled = true;
    }
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

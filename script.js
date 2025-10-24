// --- Firebase Firestore連携 ---
import { salesRef, db } from './firebase.js';
import { getDoc, updateDoc, onSnapshot, increment, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

  // 画像切り替え処理
  const container = document.querySelector('.container');
  if (container) {
    if ((data.total || 0) >= 1500 && hiddenArr.length >= 150) {
      container.style.backgroundImage = 'url("./img/LipoD_group2.png")';
    } else {
      container.style.backgroundImage = 'url("./img/LipoD_group1.png")';
    }
  }

  // index側ではhiddenの変更を受け取って表示するだけにする
  // hidden配列の管理（新しい番号を追加する処理）は calculation ページで行う
});

// hideRandomTile は削除（index.html は表示専用）

// ボタン押下時にtotalを加算
// addSales を原子的に行うため FieldValue.increment を使う

// JSTタイムスタンプを返す関数
function getJSTTimestamp() {
  const now = new Date();
  // 日本標準時に変換
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  // yyyy-mm-dd HH:MM:SS 形式
  const yyyy = jst.getUTCFullYear();
  const mm = String(jst.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(jst.getUTCDate()).padStart(2, '0');
  const hh = String(jst.getUTCHours()).padStart(2, '0');
  const mi = String(jst.getUTCMinutes()).padStart(2, '0');
  const ss = String(jst.getUTCSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

// salesドキュメント配下のlogsサブコレクション参照
const logsCollection = collection(salesRef, 'logs');

// 売上本数とJSTタイムスタンプをsales/logsサブコレクションに記録し、salesRefも更新
async function addSales(num) {
  try {
    await updateDoc(salesRef, { total: increment(num) });
    await addDoc(logsCollection, {
      timestamp: getJSTTimestamp(),
      count: num
    });
  } catch (err) {
    console.error('addSales or log error', err);
  }
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

/**
 * script.js
 * - このファイルは売上可視化ページのロジックを担当します。
 * - Firestoreと連携し、売上本数やタイルの状態をリアルタイムで同期。
 * - grid: 150個のタイルを自動生成し、売上に応じてタイルを隠す。
 * - salesInput: 売上本数を入力し、EnterでFirestoreに加算。
 * - progressBar, progressText: 売上進捗ゲージと数値表示。
 * - Firestoreのデータ構造: { total: 売上本数, hidden: 隠すタイルのindex配列 }
 * - 10本売れるごとにランダムなタイルが1つずつ隠れる。
 */

import { salesRef } from './firebase.js';
import { getDoc, updateDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// --- タイル150個生成 ---
const grid = document.getElementById("grid");
const tiles = [];
for (let i = 0; i < 150; i++) {
  const div = document.createElement("div");
  div.classList.add("tile"); // 1つ1つのタイル
  div.dataset.index = i;      // タイル番号
  grid.appendChild(div);
  tiles.push(div);
}

// --- 進捗バー・入力欄の取得 ---
const progressBar = document.getElementById("progressBar"); // 売上ゲージ
const progressText = document.getElementById("progressText"); // 売上数値
const input = document.getElementById("salesInput"); // 売上入力欄

// --- Firestoreリアルタイム同期 ---
onSnapshot(salesRef, (docSnap) => {
  if (!docSnap.exists()) return;
  const data = docSnap.data();

  // タイルの可視/不可視を更新
  tiles.forEach((tile, idx) => {
    tile.style.opacity = data.hidden.includes(idx) ? 0 : 1;
  });

  // ゲージと数値を更新
  const total = data.total;
  progressBar.style.width = `${Math.min(total / 1500 * 100, 100)}%`;
  progressText.textContent = `${total} / 1500`;
});

// --- 売上入力→Firestore更新 ---
input.addEventListener("keydown", async (e) => {
  if (e.key !== "Enter") return;
  const value = parseInt(input.value, 10); // 入力値を整数化
  if (isNaN(value) || value <= 0) return;

  const snap = await getDoc(salesRef);
  if (!snap.exists()) return;

  const data = snap.data();
  let newTotal = data.total + value;
  let hidden = [...data.hidden];

  // 10本ごとにランダムなタイルを追加で隠す
  const tilesToHide = Math.floor(newTotal / 10) - Math.floor(data.total / 10);
  for (let i = 0; i < tilesToHide; i++) {
    let rand;
    do {
      rand = Math.floor(Math.random() * 150);
    } while (hidden.includes(rand)); // 既に隠れているタイルは除外
    hidden.push(rand);
  }

  // Firestoreを更新
  await updateDoc(salesRef, {
    total: newTotal,
    hidden: hidden
  });

  input.value = ""; // 入力欄リセット
});

import { salesRef, db } from './firebase.js';
import {
  onSnapshot,
  getDoc,
  runTransaction,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const statusElem = document.getElementById('status');

let lastProcessedMultiple = null; // 最後に処理した(total / 10)の値を記録

function setStatus(msg) {
  if (statusElem) statusElem.textContent = msg;
}

onSnapshot(salesRef, (docSnap) => {
  if (!docSnap.exists()) return;
  const data = docSnap.data();
  const total = data.total || 0;
  setStatus(`total=${total}`);

  // totalが10の倍数になったか判定
  if (total % 10 !== 0) return;
  const multiple = total / 10;
  if (lastProcessedMultiple === multiple) {
    // 既に処理済み
    return;
  }

  // transactionでhidden配列へユニークなランダム番号を追加する
  runTransaction(db, async (t) => {
    const snap = await t.get(salesRef);
    if (!snap.exists()) return;
    const cur = snap.data();
    const curTotal = cur.total || 0;
    // 再確認: totalが依然として同じ倍数か
    if (curTotal % 10 !== 0) return;
    const curMultiple = curTotal / 10;
    // もし別のプロセスが先に処理していたらスキップ
    if (lastProcessedMultiple === curMultiple) return;

    const hiddenArr = Array.isArray(cur.hidden) ? cur.hidden.slice() : [];
    const totalBoxes = 150;

    // 未使用の番号を列挙
    const used = new Set(hiddenArr);
    const unused = [];
    for (let i = 1; i <= totalBoxes; i++) {
      if (!used.has(i)) unused.push(i);
    }
    if (unused.length === 0) return;

    // 1つランダムに選ぶ（仕様に合わせて必要なら複数回呼び出しで複数追加可能）
    const randIdx = Math.floor(Math.random() * unused.length);
    const pick = unused[randIdx];

    const newHidden = Array.from(new Set([...hiddenArr, pick])).sort((a, b) => a - b);
    t.update(salesRef, { hidden: newHidden });

    // 成功したらlastProcessedMultipleを更新
    lastProcessedMultiple = curMultiple;
    setStatus(`added ${pick} for total ${curTotal}`);
  }).catch((err) => {
    console.error('transaction error', err);
    setStatus('transaction error: ' + err.message);
  });
});

setStatus('ready');

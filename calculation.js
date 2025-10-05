
import { salesRef, db } from './firebase.js';
import { onSnapshot, runTransaction } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const statusElem = document.getElementById('status');

function setStatus(msg) {
  if (statusElem) statusElem.textContent = msg;
}

// total の 10 ごとの増分（Math.floor(total/10)）を永続的に追跡して
// 差分分だけ hidden に番号を追加する実装。
onSnapshot(salesRef, (docSnap) => {
  if (!docSnap.exists()) return;
  const data = docSnap.data();
  const total = data.total || 0;
  setStatus(`total=${total}`);

  const curCount = Math.floor(total / 10);

  // トランザクションで原子的に処理する
  runTransaction(db, async (t) => {
    const snap = await t.get(salesRef);
    if (!snap.exists()) return;
    const cur = snap.data() || {};
    const curTotal = cur.total || 0;

    const prevProcessed = Number.isInteger(cur.processedMultiple) ? cur.processedMultiple : 0;
    const latestCount = Math.floor(curTotal / 10);
    const needed = latestCount - prevProcessed;
    console.log('transaction start', { curTotal, prevProcessed, latestCount, needed });
    if (needed <= 0) return; // 既に処理済み

    const hiddenArr = Array.isArray(cur.hidden) ? cur.hidden.slice() : [];
    const totalBoxes = 150;
    const used = new Set(hiddenArr);
    const unused = [];
    for (let i = 1; i <= totalBoxes; i++) {
      if (!used.has(i)) unused.push(i);
    }
    if (unused.length === 0) {
      // もう追加できるタイルがない
      // 更新は行わないが processedMultiple を増やさない
      setStatus('no unused tiles left');
      console.log('no unused tiles left');
      return;
    }

    // needed 個までランダムに選ぶ（残数が足りない場合はできるだけ選ぶ）
    const picks = [];
    for (let k = 0; k < needed && unused.length > 0; k++) {
      const idx = Math.floor(Math.random() * unused.length);
      picks.push(unused[idx]);
      // remove selected
      unused.splice(idx, 1);
    }

    if (picks.length === 0) return;

    console.log('picks', picks);
    const newHidden = Array.from(new Set([...hiddenArr, ...picks])).sort((a, b) => a - b);
    const newProcessed = prevProcessed + picks.length;
    t.update(salesRef, { hidden: newHidden, processedMultiple: newProcessed });
    setStatus(`added ${picks.join(',')} (processed->${newProcessed})`);
    console.log('transaction commit', { newProcessed, picks });
  }).catch((err) => {
    console.error('transaction error', err);
    setStatus('transaction error: ' + (err && err.message ? err.message : String(err)));
  });
});

setStatus('ready');

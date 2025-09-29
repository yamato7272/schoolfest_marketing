const grid = document.getElementById("grid");
const revealBtn = document.getElementById("revealBtn");
const saveBtn = document.getElementById("saveBtn");
const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");
const progress = document.getElementById("progress");
const totalBoxes = 150;

let revealedNumbers = new Set();

// Create 150 boxes
for (let i = 1; i <= totalBoxes; i++) {
  const div = document.createElement("div");
  div.classList.add("box");
  div.textContent = i;
  div.dataset.index = i;
  grid.appendChild(div);
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

// --- CSV Download ---
saveBtn.addEventListener("click", () => {
  if (revealedNumbers.size === 0) {
    alert("No boxes revealed yet!");
    return;
  }
  const csvContent =
    "data:text/csv;charset=utf-8," +
    Array.from(revealedNumbers).join(",");
  const link = document.createElement("a");
  link.setAttribute("href", encodeURI(csvContent));
  link.setAttribute("download", "revealed_boxes.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// --- Trigger file input via upload button ---
uploadBtn.addEventListener("click", () => {
  fileInput.click();
});

// --- CSV Upload ---
fileInput.addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (event) {
    revealedNumbers = new Set(event.target.result.split(",").map(Number));
    // Reset all boxes
    document
      .querySelectorAll(".box")
      .forEach((b) => b.classList.remove("revealed"));
    // Reapply revealed state
    revealedNumbers.forEach((num) => {
      const box = document.querySelector(`.box[data-index='${num}']`);
      if (box) box.classList.add("revealed");
    });
    updateProgress();
  };
  reader.readAsText(file);
});

// --- Alert before closing window ---
window.addEventListener("beforeunload", function (e) {
  if (revealedNumbers.size > 0) {
    const confirmationMessage = "CSVを保存しましたか？";
    e.preventDefault();
    e.returnValue = confirmationMessage;
    return confirmationMessage;
  }
});

// Additional fallback for some browsers
window.addEventListener("unload", function (e) {
  if (revealedNumbers.size > 0) {
    // Note: unload alerts don't work in modern browsers, but keeping for compatibility
    alert("CSVを保存しましたか？");
  }
});

// Initialize progress display
updateProgress();

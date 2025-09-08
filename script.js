const passages = [
  "The quick brown fox jumps over the lazy dog.",
  "Typing fast and accurately saves time and effort."
];

const passageEl = document.getElementById("passage");
const inputArea = document.getElementById("inputArea");
const timeEl = document.getElementById("time");
const wpmEl = document.getElementById("wpm");
const accEl = document.getElementById("accuracy");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const finishBtn = document.getElementById("finishBtn");
const results = document.getElementById("results");
const finalWpm = document.getElementById("finalWpm");
const finalAcc = document.getElementById("finalAcc");
const nameInput = document.getElementById("nameInput");
const downloadCert = document.getElementById("downloadCert");

let selected = "";
let timer = 60;
let intervalId = null;
let totalTyped = 0;
let correctChars = 0;

function pickPassage() {
  selected = passages[Math.floor(Math.random() * passages.length)];
  passageEl.textContent = selected;
}

function startTest() {
  pickPassage();
  inputArea.value = "";
  inputArea.disabled = false;
  inputArea.focus();
  timer = 60;
  timeEl.textContent = timer;
  totalTyped = 0;
  correctChars = 0;
  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(() => {
    timer--;
    timeEl.textContent = timer;
    if (timer <= 0) finishTest();
  }, 1000);
}

function finishTest() {
  if (intervalId) clearInterval(intervalId);
  inputArea.disabled = true;

  const typed = inputArea.value;
  totalTyped = typed.length;
  let correct = 0;
  for (let i = 0; i < typed.length; i++) {
    if (i < selected.length && typed[i] === selected[i]) correct++;
  }
  correctChars = correct;

  const minutes = (60 - timer) / 60 || 1 / 60;
  const wpm = (correctChars / 5) / minutes;
  const accuracy = totalTyped ? (correctChars / totalTyped) * 100 : 0;

  wpmEl.textContent = Math.round(wpm);
  accEl.textContent = accuracy.toFixed(1);

  finalWpm.textContent = Math.round(wpm);
  finalAcc.textContent = accuracy.toFixed(1);
  results.hidden = false;
}

function resetTest() {
  if (intervalId) clearInterval(intervalId);
  inputArea.value = "";
  inputArea.disabled = true;
  timeEl.textContent = "60";
  wpmEl.textContent = "0";
  accEl.textContent = "0";
  results.hidden = true;
}

startBtn.addEventListener("click", startTest);
resetBtn.addEventListener("click", resetTest);
finishBtn.addEventListener("click", finishTest);

downloadCert.addEventListener("click", async () => {
  const name = nameInput.value.trim() || "Anonymous";
  const wpm = parseFloat(finalWpm.textContent);
  const accuracy = parseFloat(finalAcc.textContent);

  const res = await fetch("/generate_certificate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, wpm, accuracy }),
  });
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `certificate_${name.replace(/\\s+/g, "_")}.pdf`;
  a.click();
});


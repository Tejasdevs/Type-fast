const wordsList = [
  "keyboard","javascript","dynamic","performance","modern",
  "design","interface","practice","accuracy","challenge","syntax","random"
];

let timeLeft, timer, words, testWords, correctChars, totalTyped, wpmHistory = [];

const wordsDisplay = document.getElementById("wordsDisplay");
const typingInput = document.getElementById("typingInput");
const timeLeftEl = document.getElementById("timeLeft");
const wpmEl = document.getElementById("wpm");
const accuracyEl = document.getElementById("accuracy");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const timeSelect = document.getElementById("timeSelect");
const modal = document.getElementById("resultsModal");
const closeModal = document.getElementById("closeModal");
const finalWpm = document.getElementById("finalWpm");
const finalAccuracy = document.getElementById("finalAccuracy");
const finalChars = document.getElementById("finalChars");
const finalConsistency = document.getElementById("finalConsistency");
const wpmChartCanvas = document.getElementById("wpmChart");

function loadWords() {
  words = [];
  for (let i = 0; i < 60; i++) {
    words.push(wordsList[Math.floor(Math.random() * wordsList.length)]);
  }
  testWords = words.join(" ");
  wordsDisplay.innerHTML = "";

  for (let c of testWords) {
    const span = document.createElement("span");
    span.textContent = c;
    span.style.color = "#777";
    wordsDisplay.appendChild(span);
  }
}

function startTest() {
  resetState();
  loadWords();
  typingInput.disabled = false;
  typingInput.focus();
  startBtn.disabled = true;

  timer = setInterval(() => {
    timeLeft--;
    timeLeftEl.textContent = timeLeft;
    wpmHistory.push(calculateWPM());
    if (timeLeft <= 0) endTest();
  }, 1000);
}

function resetState() {
  clearInterval(timer);
  timeLeft = parseInt(timeSelect.value);
  timeLeftEl.textContent = timeLeft;
  correctChars = 0;
  totalTyped = 0;
  wpmHistory = [];
  wpmEl.textContent = "0";
  accuracyEl.textContent = "100%";
  typingInput.value = "";
}

function calculateWPM() {
  const minutes = Math.max((parseInt(timeSelect.value) - timeLeft) / 60, 0.01);
  const wordsTyped = totalTyped / 5;
  return Math.round(wordsTyped / minutes);
}

function calculateConsistency() {
  if (wpmHistory.length < 2) return "100%";
  const avg = wpmHistory.reduce((a,b) => a+b, 0) / wpmHistory.length;
  const variance = wpmHistory.reduce((a,b) => a + Math.pow(b - avg, 2), 0) / wpmHistory.length;
  const stdDev = Math.sqrt(variance);
  return Math.max(0, Math.round(100 - stdDev)) + "%";
}

function endTest() {
  clearInterval(timer);
  typingInput.disabled = true;
  startBtn.disabled = false;
  updateResults();
  showResults();
}

function updateResults() {
  finalWpm.textContent = calculateWPM();
  finalAccuracy.textContent = accuracyEl.textContent;
  finalChars.textContent = totalTyped;
  finalConsistency.textContent = calculateConsistency();
}

function showResults() {
  modal.classList.remove("hidden");
  if (Chart.getChart(wpmChartCanvas)) {
    Chart.getChart(wpmChartCanvas).destroy();
  }
  new Chart(wpmChartCanvas, {
    type: "line",
    data: {
      labels: Array.from({ length: wpmHistory.length }, (_, i) => i + 1),
      datasets: [{
        label: "WPM",
        data: wpmHistory,
        borderColor: "#4ade80",
        borderWidth: 2,
        fill: false,
        tension: 0.3
      }]
    },
    options: {
      scales: { y: { beginAtZero: true } }
    }
  });
}

function onUserInput() {
  if (timeLeft <= 0) return;

  const inputValue = typingInput.value;
  totalTyped = inputValue.length;
  correctChars = 0;

  const chars = wordsDisplay.querySelectorAll("span");

  for (let i = 0; i < chars.length; i++) {
    const char = testWords[i];
    const typedChar = inputValue[i];
    const span = chars[i];

    if (typedChar == null) {
      span.style.color = "#777";
    } else if (typedChar === char) {
      span.style.color = "#4ade80";
      correctChars++;
    } else {
      span.style.color = "#ef4444";
    }
    span.classList.remove("caret");
  }

  // caret
  if (chars[inputValue.length]) {
    chars[inputValue.length].classList.add("caret");
  }

  const acc = totalTyped === 0 ? 100 : Math.round((correctChars / totalTyped) * 100);
  accuracyEl.textContent = acc + "%";
  wpmEl.textContent = calculateWPM();

  if (inputValue.length >= testWords.length) endTest();
}

startBtn.addEventListener("click", startTest);
restartBtn.addEventListener("click", () => {
  resetState();
  loadWords();
});
typingInput.addEventListener("input", onUserInput);
closeModal.addEventListener("click", () => modal.classList.add("hidden"));

loadWords();


// === Added scoring & level changes ===
let score = 0;
let correctAnswers = 0;
let currentLevel = 1;

function updateScore(isCorrect) {
  if (isCorrect) {
    score += 5;
    correctAnswers++;
  } else {
    score -= 2;
  }
  if (correctAnswers >= 20) {
    currentLevel++;
    correctAnswers = 0;
    alert("Level Up! Welcome to Level " + currentLevel);
  }
  document.getElementById('score').textContent = score;
}

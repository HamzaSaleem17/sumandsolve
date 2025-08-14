// game.js - Core game logic for Sum & Solve

// --- DOM Elements ---
const startBtn = document.getElementById('start-btn');
const submitBtn = document.getElementById('submit-btn');
const restartBtn = document.getElementById('restart-btn');
const questionText = document.getElementById('question-text');
const answerInput = document.getElementById('answer-input');
const scoreDisplay = document.getElementById('score-display');
const levelDisplay = document.getElementById('level-display');
const questionsDisplay = document.getElementById('questions-display');
const badgeContainer = document.getElementById('badge-container');
const messageBox = document.getElementById('message-box');
const quizArea = document.getElementById('quiz-area');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreDisplay = document.getElementById('final-score');
const finalLevelDisplay = document.getElementById('final-level');

// --- Game State Variables ---
let score = 0;
let level = 1;
let questionsAnsweredInLevel = 0;
let questionsCorrectInLevel = 0;
let currentAnswer = 0;

// Cat Badges as SVGs
const badges = {
    1: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="%23667eea" d="M50,5A45,45,0,1,0,95,50,45,45,0,0,0,50,5ZM30,25a5,5,0,0,1,10,0V40a5,5,0,0,1-10,0V25Zm40,0a5,5,0,0,1,10,0V40a5,5,0,0,1-10,0V25Zm-3,50a3,3,0,0,1-6,0c0-10,12-10,12,0a3,3,0,0,1-6,0ZM50,60a10,10,0,1,1-10-10A10,10,0,0,1,50,60Z"/></svg>`,
    2: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="%23764ba2" d="M50,5A45,45,0,1,0,95,50,45,45,0,0,0,50,5ZM30,25a5,5,0,0,1,10,0V40a5,5,0,0,1-10,0V25Zm40,0a5,5,0,0,1,10,0V40a5,5,0,0,1-10,0V25Zm-3,50a3,3,0,0,1-6,0c0-10,12-10,12,0a3,3,0,0,1-6,0ZM50,60a10,10,0,1,1-10-10A10,10,0,0,1,50,60ZM75,15a5,5,0,0,1,10,0v10a5,5,0,0,1-10,0v-10Z"/><path fill="%23ffc107" d="M75,15 L75,25 L85,25 L85,15 Z" /></svg>`,
    3: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="%23f0ad4e" d="M50,5A45,45,0,1,0,95,50,45,45,0,0,0,50,5ZM30,25a5,5,0,0,1,10,0V40a5,5,0,0,1-10,0V25Zm40,0a5,5,0,0,1,10,0V40a5,5,0,0,1-10,0V25Zm-3,50a3,3,0,0,1-6,0c0-10,12-10,12,0a3,3,0,0,1-6,0ZM50,60a10,10,0,1,1-10-10A10,10,0,0,1,50,60Z"/><path fill="%23fff" d="M50,15 L60,35 L40,35 Z" /><path fill="%23667eea" d="M50,15a5,5,0,0,1,10,0v10a5,5,0,0,1-10,0V15Zm-10,0a5,5,0,0,1,10,0v10a5,5,0,0,1-10,0V15Z"/></svg>`,
    // Add more badges for higher levels
};

// --- Game Logic Functions ---

// Generate a question based on the current level
function generateQuestion() {
    let num1, num2, num3;
    let question = "";

    switch (level) {
        case 1: // Single digit addition
            num1 = Math.floor(Math.random() * 10);
            num2 = Math.floor(Math.random() * 10);
            question = `${num1} + ${num2}`;
            currentAnswer = num1 + num2;
            break;
        case 2: // Two digit addition
            num1 = Math.floor(Math.random() * 90) + 10;
            num2 = Math.floor(Math.random() * 90) + 10;
            question = `${num1} + ${num2}`;
            currentAnswer = num1 + num2;
            break;
        case 3: // Mix of single and two digit
            num1 = Math.floor(Math.random() * 90) + 10;
            num2 = Math.floor(Math.random() * 10);
            question = `${num1} + ${num2}`;
            currentAnswer = num1 + num2;
            break;
        case 4: // Two digit addition with three numbers
            num1 = Math.floor(Math.random() * 90) + 10;
            num2 = Math.floor(Math.random() * 90) + 10;
            num3 = Math.floor(Math.random() * 90) + 10;
            question = `${num1} + ${num2} + ${num3}`;
            currentAnswer = num1 + num2 + num3;
            break;
        default: // For levels > 4, keep increasing complexity
            const numCount = Math.min(level, 5); // Max 5 numbers to prevent screen overflow
            const digits = Math.floor(level / 2) + 1; // Increase digits every 2 levels
            let numbers = [];
            let sum = 0;
            for (let i = 0; i < numCount; i++) {
                let num = Math.floor(Math.random() * (10 ** digits - 10**(digits - 1))) + 10**(digits - 1);
                numbers.push(num);
                sum += num;
            }
            question = numbers.join(' + ');
            currentAnswer = sum;
            break;
    }
    
    questionText.textContent = question;
    answerInput.value = '';
    answerInput.focus();
}

// Update the display with current game stats
function updateDisplay() {
    scoreDisplay.textContent = score;
    levelDisplay.textContent = level;
    questionsDisplay.textContent = `${questionsAnsweredInLevel}/${20}`;
    const badgeSvg = badges[level] || badges[1]; // Fallback to level 1 badge if no specific badge exists
    badgeContainer.innerHTML = badgeSvg;
}

// End the game and display the final score
function endGame() {
    quizArea.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');
    finalScoreDisplay.textContent = score;
    finalLevelDisplay.textContent = level;
    saveHighScore(score, level);
}

// Check the user's answer
function checkAnswer() {
    const userAnswer = parseInt(answerInput.value, 10);

    // Provide visual feedback
    if (userAnswer === currentAnswer) {
        score += 5;
        questionsCorrectInLevel++;
        messageBox.textContent = 'Correct! +5 points';
        messageBox.className = 'message-box correct-answer';
        answerInput.classList.add('correct-border');
    } else {
        score -= 2;
        messageBox.textContent = `Incorrect! -2 points. The answer was ${currentAnswer}`;
        messageBox.className = 'message-box incorrect-answer';
        answerInput.classList.add('incorrect-border');
    }

    // After a brief delay, clear the message and border
    setTimeout(() => {
        messageBox.textContent = '';
        messageBox.className = 'message-box';
        answerInput.classList.remove('correct-border', 'incorrect-border');
        
        // Go to next question
        questionsAnsweredInLevel++;
        if (questionsCorrectInLevel >= 20) {
            level++;
            questionsCorrectInLevel = 0;
            questionsAnsweredInLevel = 0;
            messageBox.textContent = `Level Up! You are now at Level ${level}!`;
            messageBox.className = 'message-box correct-answer';
            setTimeout(() => {
                messageBox.textContent = '';
                messageBox.className = 'message-box';
            }, 2000);
        }
        
        updateDisplay();
        generateQuestion();
    }, 1500);

    // If game ends after 100 questions (or another metric you choose)
    // if (totalQuestions >= 100) {
    //     endGame();
    // }
}

// Save high score and level to local storage
function saveHighScore(currentScore, currentLevel) {
    let highScores = JSON.parse(localStorage.getItem('sumAndSolveHighScores')) || [];
    
    // Find if a score for this level exists
    const existingEntry = highScores.find(entry => entry.level === currentLevel);

    if (existingEntry) {
        // Update if the new score is higher
        if (currentScore > existingEntry.score) {
            existingEntry.score = currentScore;
        }
    } else {
        // Add a new entry
        highScores.push({ score: currentScore, level: currentLevel, date: new Date().toISOString() });
    }

    // Sort by score descending and keep top 10 (or a reasonable number)
    highScores.sort((a, b) => b.score - a.score);
    localStorage.setItem('sumAndSolveHighScores', JSON.stringify(highScores));
}

// --- Event Listeners ---

startBtn.addEventListener('click', () => {
    startScreen.classList.add('hidden');
    quizArea.classList.remove('hidden');
    score = 0;
    level = 1;
    questionsAnsweredInLevel = 0;
    questionsCorrectInLevel = 0;
    updateDisplay();
    generateQuestion();
});

submitBtn.addEventListener('click', () => {
    if (answerInput.value) {
        checkAnswer();
    }
});

// Allow user to press Enter to submit answer
answerInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && answerInput.value) {
        checkAnswer();
    }
});

restartBtn.addEventListener('click', () => {
    gameOverScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
});

// Handle mobile navigation menu
function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('active');
}

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        document.getElementById('navLinks').classList.remove('active');
    });
});

// Load the initial game state
window.onload = function() {
    updateDisplay();
};

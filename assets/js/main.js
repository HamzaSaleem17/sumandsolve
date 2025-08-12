let score = 0;
let level = 1;
let difficulty = 1;
let currentQuestion = {};
let totalQuestions = 0;
let correctAnswers = 0;
let gameActive = true;
let isProcessing = false;
let timerInterval;
let timeLeft;
let totalTime;

const difficultySettings = {
    1: { min: 1, max: 10, name: 'Beginner', points: 10, time: 8 },
    2: { min: 5, max: 15, name: 'Easy', points: 15, time: 7 },
    3: { min: 10, max: 20, name: 'Medium', points: 20, time: 6 },
    4: { min: 15, max: 25, name: 'Intermediate', points: 25, time: 5 },
    5: { min: 20, max: 30, name: 'Advanced', points: 30, time: 4 },
    6: { min: 25, max: 40, name: 'Expert', points: 35, time: 3.5 },
    7: { min: 30, max: 50, name: 'Master', points: 40, time: 3 },
};

const screens = {
    start: document.getElementById('startScreen'),
    game: document.getElementById('gameScreen'),
    gameOver: document.getElementById('gameOverScreen'),
};

const elements = {
    score: document.getElementById('score'),
    level: document.getElementById('level'),
    difficultyIndicator: document.getElementById('difficultyIndicator'),
    timerBar: document.getElementById('timerBar'),
    question: document.getElementById('question'),
    answers: document.querySelector('.answers'),
    feedback: document.getElementById('feedback'),
    finalScore: document.getElementById('finalScore'),
    performanceMessage: document.getElementById('performanceMessage'),
};

function startGame() {
    score = 0;
    level = 1;
    difficulty = 1;
    totalQuestions = 0;
    correctAnswers = 0;
    gameActive = true;
    isProcessing = false;
    updateStats();
    showScreen('game');
    startQuiz();
}

function startQuiz() {
    if (!gameActive) return;
    totalQuestions++;
    clearInterval(timerInterval);
    elements.feedback.classList.remove('show');
    elements.answers.innerHTML = '';
    generateQuestion();
    startTimer();
}

function generateQuestion() {
    const currentDifficulty = difficultySettings[difficulty] || difficultySettings[1];
    const num1 = Math.floor(Math.random() * (currentDifficulty.max - currentDifficulty.min + 1)) + currentDifficulty.min;
    const num2 = Math.floor(Math.random() * (currentDifficulty.max - currentDifficulty.min + 1)) + currentDifficulty.min;
    const correctAnswer = num1 + num2;
    
    currentQuestion = { num1, num2, correctAnswer };

    elements.question.textContent = `${num1} + ${num2} = ?`;

    const answerOptions = generateAnswerOptions(correctAnswer);
    answerOptions.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.textContent = option;
        btn.onclick = () => checkAnswer(btn, option);
        elements.answers.appendChild(btn);
    });
}

function generateAnswerOptions(correctAnswer) {
    const options = [correctAnswer];
    while (options.length < 4) {
        let wrongAnswer;
        do {
            wrongAnswer = correctAnswer + Math.floor(Math.random() * 10) - 5;
        } while (options.includes(wrongAnswer) || wrongAnswer <= 0);
        options.push(wrongAnswer);
    }
    return options.sort(() => Math.random() - 0.5);
}

function startTimer() {
    const currentDifficulty = difficultySettings[difficulty];
    totalTime = currentDifficulty.time;
    timeLeft = totalTime;
    elements.timerBar.style.width = '100%';
    elements.timerBar.style.backgroundColor = 'linear-gradient(to right, #2af598 0%, #009efd 100%)';

    timerInterval = setInterval(() => {
        timeLeft -= 0.05;
        const width = (timeLeft / totalTime) * 100;
        elements.timerBar.style.width = `${width}%`;

        if (width <= 25) {
            elements.timerBar.style.backgroundColor = '#dc3545';
        } else if (width <= 50) {
            elements.timerBar.style.backgroundColor = '#ffc107';
        }

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            handleIncorrectAnswer();
        }
    }, 50);
}

function checkAnswer(button, selectedAnswer) {
    if (isProcessing) return;
    isProcessing = true;

    clearInterval(timerInterval);
    const answerButtons = elements.answers.querySelectorAll('.answer-btn');

    if (selectedAnswer === currentQuestion.correctAnswer) {
        button.classList.add('correct');
        correctAnswers++;
        score += difficultySettings[difficulty].points;
        showFeedback('Correct!', '#28a745');
        
        // Adaptive difficulty increase
        if (correctAnswers % 3 === 0 && difficulty < 7) {
            difficulty++;
        }
    } else {
        button.classList.add('incorrect');
        // Find and highlight the correct answer
        answerButtons.forEach(btn => {
            if (parseInt(btn.textContent) === currentQuestion.correctAnswer) {
                btn.classList.add('correct');
            }
        });
        showFeedback(`Wrong! The answer was ${currentQuestion.correctAnswer}.`, '#dc3545');

        // Adaptive difficulty decrease
        if (difficulty > 1) {
            difficulty--;
        }
    }

    answerButtons.forEach(btn => btn.disabled = true);

    setTimeout(() => {
        isProcessing = false;
        if (totalQuestions >= 20) { // End the game after 20 questions
            endGame();
        } else {
            updateStats();
            startQuiz();
        }
    }, 1500);
}

function showFeedback(message, color) {
    elements.feedback.textContent = message;
    elements.feedback.style.color = color;
    elements.feedback.classList.add('show');
}

function updateStats() {
    elements.score.textContent = score;
    elements.level.textContent = difficulty;
    elements.difficultyIndicator.textContent = difficultySettings[difficulty].name;
}

function showScreen(screenName) {
    for (const key in screens) {
        screens[key].classList.remove('active');
    }
    screens[screenName].classList.add('active');
}

function endGame() {
    gameActive = false;
    clearInterval(timerInterval);
    showScreen('gameOver');
    elements.finalScore.textContent = score;
    
    let message = '';
    const percentage = (correctAnswers / totalQuestions) * 100;
    if (percentage >= 80) {
        message = "Excellent! You're a math master!";
        createConfetti();
    } else if (percentage >= 50) {
        message = "Good job! Keep practicing to improve.";
    } else {
        message = "Don't worry, every expert was once a beginner. Try again!";
    }
    elements.performanceMessage.textContent = message;
}

function resetGame() {
    showScreen('start');
    document.getElementById('confetti-container').innerHTML = '';
}

function createConfetti() {
    const confettiContainer = document.querySelector('.confetti-container') || (() => {
        const div = document.createElement('div');
        div.className = 'confetti-container';
        div.id = 'confetti-container';
        document.querySelector('.container').appendChild(div);
        return div;
    })();

    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            confettiContainer.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 3000);
        }, i * 50);
    }
}

function shareOnTwitter() {
    const text = `I just scored ${score} points on Sum & Solve! Can you beat my score?`;
    const url = 'https://sumandsolve.com';
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
}

function shareOnFacebook() {
    const url = 'https://sumandsolve.com';
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
}

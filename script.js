document.addEventListener('DOMContentLoaded', () => {
    // Game state
    let currentScore = parseInt(localStorage.getItem('userScore')) || 0;
    let currentLevel = parseInt(localStorage.getItem('currentLevel')) || 1;
    let correctAnswers = parseInt(localStorage.getItem('correctAnswers')) || 0;
    let currentQuestion = {};
    let isAnswering = false;

    // DOM elements
    const startQuizBtn = document.getElementById('start-quiz-btn');
    const quizSection = document.getElementById('quiz-section');
    const scoreDisplay = document.getElementById('score');
    const levelDisplay = document.getElementById('level');
    const progressDisplay = document.getElementById('progress');
    const questionDisplay = document.getElementById('question');
    const feedbackDisplay = document.getElementById('feedback');
    const answerButtons = document.querySelectorAll('.answer-button');
    const badgesContainer = document.getElementById('badges');

    // Initialize game
    function initGame() {
        updateDisplay();
        updateBadges();
        
        // Event listeners
        startQuizBtn.addEventListener('click', startQuiz);
        answerButtons.forEach(button => {
            button.addEventListener('click', handleAnswer);
        });
    }

    // Start the quiz
    function startQuiz() {
        quizSection.classList.remove('hidden');
        window.scrollTo({
            top: quizSection.offsetTop,
            behavior: 'smooth'
        });
        generateQuestion();
    }

    // Update display elements
    function updateDisplay() {
        scoreDisplay.textContent = currentScore;
        levelDisplay.textContent = currentLevel;
        progressDisplay.textContent = `${correctAnswers}/20`;
    }

    // Generate a new question based on current level
// Generate a new question based on current level
function generateQuestion() {
    // Reset feedback and button states
    feedbackDisplay.classList.add('hidden');
    answerButtons.forEach(button => {
        button.classList.remove('correct', 'incorrect');
        button.disabled = false;
    });

    // Generate question based on level
    let question, answer;
    
    switch(currentLevel) {
        case 1: // Single digit addition (avoiding 0)
            const num1 = Math.floor(Math.random() * 9) + 1; // 1-9
            const num2 = Math.floor(Math.random() * 9) + 1; // 1-9
            question = `${num1} + ${num2}`;
            answer = num1 + num2;
            break;
            
        case 2: // Two digit addition
            const num3 = Math.floor(Math.random() * 90) + 10;
            const num4 = Math.floor(Math.random() * 90) + 10;
            question = `${num3} + ${num4}`;
            answer = num3 + num4;
            break;
            
        case 3: // Mix of level 1 and 2
            if (Math.random() > 0.5) {
                // Single digit (avoiding 0)
                const num5 = Math.floor(Math.random() * 9) + 1; // 1-9
                const num6 = Math.floor(Math.random() * 9) + 1; // 1-9
                question = `${num5} + ${num6}`;
                answer = num5 + num6;
            } else {
                // Two digit
                const num7 = Math.floor(Math.random() * 90) + 10;
                const num8 = Math.floor(Math.random() * 90) + 10;
                question = `${num7} + ${num8}`;
                answer = num7 + num8;
            }
            break;
            
        case 4: // Two digit addition of three numbers
            const num9 = Math.floor(Math.random() * 90) + 10;
            const num10 = Math.floor(Math.random() * 90) + 10;
            const num11 = Math.floor(Math.random() * 90) + 10;
            question = `${num9} + ${num10} + ${num11}`;
            answer = num9 + num10 + num11;
            break;
            
        default: // For higher levels, increase complexity
            const complexity = Math.min(currentLevel, 10);
            const digitCount = Math.ceil(complexity / 2);
            const numCount = Math.min(Math.ceil(complexity / 3), 5);
            
            let numbers = [];
            let total = 0;
            let questionText = "";
            
            for (let i = 0; i < numCount; i++) {
                // Ensure minimum is at least 1 (avoid 0)
                const min = Math.max(1, Math.pow(10, digitCount - 1));
                const max = Math.pow(10, digitCount) - 1;
                const num = Math.floor(Math.random() * (max - min + 1)) + min;
                numbers.push(num);
                total += num;
                
                if (i > 0) questionText += " + ";
                questionText += num;
            }
            
            question = questionText;
            answer = total;
            break;
    }
    
    currentQuestion = { question, answer };
    questionDisplay.textContent = question;
    
    // Generate answer options
    const options = generateAnswerOptions(answer);
    answerButtons.forEach((button, index) => {
        button.textContent = options[index];
        button.dataset.answer = options[index];
    });
    
    isAnswering = false;
}

    // Generate answer options with the correct answer and random distractors
    function generateAnswerOptions(correctAnswer) {
        const options = [correctAnswer];
        
        // Generate 3 random options
        while (options.length < 4) {
            let option;
            const variation = Math.floor(Math.random() * 10) + 1;
            const sign = Math.random() > 0.5 ? 1 : -1;
            
            option = correctAnswer + (variation * sign);
            
            // Ensure option is positive and not already in the list
            if (option > 0 && !options.includes(option)) {
                options.push(option);
            }
        }
        
        // Shuffle options
        return options.sort(() => Math.random() - 0.5);
    }

    // Handle answer selection
    function handleAnswer(e) {
        if (isAnswering) return;
        
        isAnswering = true;
        const selectedAnswer = parseInt(e.target.dataset.answer);
        const isCorrect = selectedAnswer === currentQuestion.answer;
        
        // Update score
        if (isCorrect) {
            currentScore += 5;
            correctAnswers++;
            e.target.classList.add('correct');
            showFeedback('Correct! +5 points', 'correct');
            
            // Check if user has completed 20 correct answers
            if (correctAnswers >= 20) {
                levelUp();
            }
        } else {
            currentScore = Math.max(0, currentScore - 2); // Prevent negative scores
            e.target.classList.add('incorrect');
            showFeedback(`Incorrect! -2 points. The answer was ${currentQuestion.answer}`, 'incorrect');
        }
        
        // Save to localStorage
        localStorage.setItem('userScore', currentScore);
        localStorage.setItem('correctAnswers', correctAnswers);
        
        // Update display
        updateDisplay();
        
        // Disable all buttons
        answerButtons.forEach(button => {
            button.disabled = true;
        });
        
        // Generate new question after delay
        setTimeout(() => {
            generateQuestion();
        }, 1500);
    }

    // Show feedback message
    function showFeedback(message, type) {
        feedbackDisplay.textContent = message;
        feedbackDisplay.className = `feedback ${type}`;
        feedbackDisplay.classList.remove('hidden');
    }

    // Level up function
    function levelUp() {
        currentLevel++;
        correctAnswers = 0;
        
        localStorage.setItem('currentLevel', currentLevel);
        localStorage.setItem('correctAnswers', correctAnswers);
        
        // Show level up notification
        showNotification(`Congratulations! You've reached Level ${currentLevel}!`);
        
        // Update badges
        updateBadges();
    }

    // Update badges display
    function updateBadges() {
        badgesContainer.innerHTML = '';
        
        for (let i = 1; i <= currentLevel; i++) {
            const badge = document.createElement('div');
            badge.className = 'cat-badge';
            badge.title = `Level ${i} Cat`;
            
            const badgeImg = document.createElement('img');
            badgeImg.src = `images/cat-badge-level-${i}.png`;
            badgeImg.alt = `Level ${i} Cat Badge`;
            
            badge.appendChild(badgeImg);
            badgesContainer.appendChild(badge);
        }
    }

    // Show notification
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Initialize the game
    initGame();

});

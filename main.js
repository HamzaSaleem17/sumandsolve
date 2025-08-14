
        // Sound effects
        const sounds = {
            correct: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmFgU7k9n1unEiBC13yO/eizEIHWq+8+OWT'),
            incorrect: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmFgU7k9n1unEiBC13yO/eizEIHWq+8+OWT'),
            levelUp: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmFgU7k9n1unEiBC13yO/eizEIHWq+8+OWT')
        };
        // Game variables
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
            2: { min: 5, max: 20, name: 'Easy', points: 15, time: 10 },
            3: { min: 10, max: 50, name: 'Medium', points: 20, time: 12 },
            4: { min: 20, max: 100, name: 'Hard', points: 25, time: 15 },
            5: { min: 50, max: 200, name: 'Expert', points: 30, time: 18 }
        };
        // Navbar scroll effect
        window.addEventListener('scroll', function() {
            const navbar = document.getElementById('navbar');
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
        // Toggle mobile menu
        function toggleMenu() {
            const navLinks = document.getElementById('navLinks');
            navLinks.classList.toggle('active');
        }
        // Play sound effect
        function playSound(type) {
            if (document.getElementById('soundToggle').checked && sounds[type]) {
                sounds[type].currentTime = 0;
                sounds[type].play().catch(() => {});
            }
        }
        // Start game
        function startGame() {
            document.getElementById('startScreen').classList.remove('active');
            document.getElementById('gameScreen').classList.add('active');
            resetStats();
            
            // Set initial difficulty
            const difficultySelect = document.getElementById('difficultySelect');
            if (difficultySelect.value !== 'auto') {
                difficulty = parseInt(difficultySelect.value);
                level = difficulty;
            }
            
            generateQuestion();
        }
        // Reset stats
        function resetStats() {
            score = 0;
            level = 1;
            difficulty = 1;
            totalQuestions = 0;
            correctAnswers = 0;
            gameActive = true;
            isProcessing = false;
            updateStats();
        }
        // Update stats display
        function updateStats() {
            document.getElementById('score').textContent = score;
            document.getElementById('level').textContent = level;
            document.getElementById('difficultyIndicator').textContent = difficultySettings[difficulty].name;
        }
        // Generate question
        function generateQuestion() {
            if (!gameActive) return;
            
            clearInterval(timerInterval);
            
            // Show loading state
            document.getElementById('question').innerHTML = '<div class="loading"><i class="fas fa-spinner"></i> Loading...</div>';
            
            setTimeout(() => {
                const settings = difficultySettings[difficulty];
                const num1 = Math.floor(Math.random() * (settings.max - settings.min + 1)) + settings.min;
                const num2 = Math.floor(Math.random() * (settings.max - settings.min + 1)) + settings.min;
                const correctAnswer = num1 + num2;
                
                currentQuestion = {
                    num1: num1,
                    num2: num2,
                    answer: correctAnswer
                };
                
                document.getElementById('question').textContent = `${num1} + ${num2} = ?`;
                
                // Generate answer options
                const answers = [correctAnswer];
                while (answers.length < 4) {
                    const offset = Math.floor(Math.random() * 20) - 10;
                    const wrongAnswer = correctAnswer + offset;
                    if (wrongAnswer > 0 && !answers.includes(wrongAnswer)) {
                        answers.push(wrongAnswer);
                    }
                }
                
                // Shuffle answers
                answers.sort(() => Math.random() - 0.5);
                
                // Update answer buttons
                const answerBtns = document.querySelectorAll('.answer-btn');
                answerBtns.forEach((btn, index) => {
                    btn.textContent = answers[index];
                    btn.classList.remove('correct', 'incorrect');
                    btn.disabled = false;
                });
                
                document.getElementById('feedback').textContent = '';
                isProcessing = false;
                
                // Start timer
                startTimer();
            }, 300);
        }
        // Start timer
        function startTimer() {
            totalTime = difficultySettings[difficulty].time;
            timeLeft = totalTime;
            updateTimerBar();
            
            const animateTimer = () => {
                timeLeft -= 0.1;
                updateTimerBar();
                
                if (timeLeft <= 0) {
                    clearInterval(timerInterval);
                    handleTimeout();
                }
            };
            
            timerInterval = setInterval(animateTimer, 100);
        }
        // Update timer bar
        function updateTimerBar() {
            const percentage = Math.max(0, (timeLeft / totalTime) * 100);
            const timerBar = document.getElementById('timerBar');
            timerBar.style.width = percentage + '%';
            timerBar.setAttribute('aria-valuenow', Math.round(percentage));
            
            // Change color based on time left
            timerBar.classList.remove('warning', 'danger');
            if (percentage <= 20) {
                timerBar.classList.add('danger');
            } else if (percentage <= 40) {
                timerBar.classList.add('warning');
            }
        }
        // Handle timeout
        function handleTimeout() {
            if (isProcessing || !gameActive) return;
            
            isProcessing = true;
            totalQuestions++;
            
            // Mark all answers as incorrect
            document.querySelectorAll('.answer-btn').forEach(btn => {
                btn.disabled = true;
                if (parseInt(btn.textContent) === currentQuestion.answer) {
                    btn.classList.add('correct');
                }
            });
            
            document.getElementById('feedback').textContent = `Time's up! The answer was ${currentQuestion.answer}`;
            document.getElementById('feedback').className = 'feedback incorrect';
            
            playSound('incorrect');
            
            // Decrease difficulty on timeout
            if (difficulty > 1 && document.getElementById('difficultySelect').value === 'auto') {
                difficulty--;
                level = Math.max(1, level - 1);
            }
            
            updateStats();
            
            // Auto-proceed to next question or end game
            setTimeout(() => {
                if (totalQuestions >= 20) {
                    endGame();
                } else {
                    generateQuestion();
                }
            }, 1500);
        }
        // Check answer
        function checkAnswer(btn) {
            if (isProcessing || !gameActive) return;
            
            isProcessing = true;
            clearInterval(timerInterval);
            
            const selectedAnswer = parseInt(btn.textContent);
            const isCorrect = selectedAnswer === currentQuestion.answer;
            
            totalQuestions++;
            
            if (isCorrect) {
                btn.classList.add('correct');
                // Bonus points for speed
                const timeBonus = Math.floor((timeLeft / totalTime) * 5);
                score += difficultySettings[difficulty].points + timeBonus;
                correctAnswers++;
                document.getElementById('feedback').textContent = `Correct! +${difficultySettings[difficulty].points + timeBonus} points`;
                document.getElementById('feedback').className = 'feedback correct';
                
                playSound('correct');
                
                // Create particle effect
                if (document.getElementById('animationToggle').checked) {
                    createParticles(btn);
                }
                
                // Increase difficulty
                if (correctAnswers % 3 === 0 && difficulty < 5 && document.getElementById('difficultySelect').value === 'auto') {
                    difficulty++;
                    level++;
                    playSound('levelUp');
                    if (document.getElementById('animationToggle').checked) {
                        createConfetti();
                    }
                }
            } else {
                btn.classList.add('incorrect');
                // Show correct answer
                document.querySelectorAll('.answer-btn').forEach(b => {
                    if (parseInt(b.textContent) === currentQuestion.answer) {
                        b.classList.add('correct');
                    }
                });
                document.getElementById('feedback').textContent = `Incorrect! The answer was ${currentQuestion.answer}`;
                document.getElementById('feedback').className = 'feedback incorrect';
                
                playSound('incorrect');
                
                // Decrease difficulty
                if (difficulty > 1 && document.getElementById('difficultySelect').value === 'auto') {
                    difficulty--;
                    level = Math.max(1, level - 1);
                }
            }
            
            // Disable all buttons
            document.querySelectorAll('.answer-btn').forEach(b => b.disabled = true);
            
            updateStats();
            
            // Auto-proceed to next question or end game
            setTimeout(() => {
                if (totalQuestions >= 20) {
                    endGame();
                } else {
                    generateQuestion();
                }
            }, 1500);
        }
        // Create particle effect
        function createParticles(element) {
            const rect = element.getBoundingClientRect();
            const containerRect = document.querySelector('.game-card').getBoundingClientRect();
            
            for (let i = 0; i < 15; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.left = (rect.left - containerRect.left + rect.width / 2) + 'px';
                particle.style.top = (rect.top - containerRect.top + rect.height / 2) + 'px';
                particle.style.setProperty('--x', (Math.random() - 0.5) * 100 + 'px');
                particle.style.setProperty('--y', (Math.random() - 0.5) * 100 + 'px');
                particle.style.background = ['#667eea', '#764ba2', '#4caf50', '#8bc34a'][Math.floor(Math.random() * 4)];
                
                document.querySelector('.game-card').appendChild(particle);
                setTimeout(() => particle.remove(), 1000);
            }
        }
        // End game
        function endGame() {
            gameActive = false;
            clearInterval(timerInterval);
            document.getElementById('gameScreen').classList.remove('active');
            document.getElementById('gameOverScreen').classList.add('active');
            document.getElementById('finalScore').textContent = score;
            
            // Save high score
            saveHighScore(score);
            
            // Display high scores
            displayHighScores();
            
            const accuracy = (correctAnswers / totalQuestions * 100).toFixed(1);
            let message = '';
            
            if (accuracy >= 90) {
                message = 'Outstanding! You\'re a math wizard! 🌟';
            } else if (accuracy >= 70) {
                message = 'Great job! Keep practicing! 👏';
            } else if (accuracy >= 50) {
                message = 'Good effort! Practice makes perfect! 💪';
            } else {
                message = 'Keep trying! You\'ll get better! 📚';
            }
            
            document.getElementById('performanceMessage').textContent = 
                `${message} (Accuracy: ${accuracy}%)`;
        }
        // Save high score
        function saveHighScore(score) {
            const highScores = JSON.parse(localStorage.getItem('sumAndSolveHighScores') || '[]');
            const accuracy = (correctAnswers / totalQuestions * 100).toFixed(1);
            
            highScores.push({
                score: score,
                date: new Date().toLocaleDateString(),
                accuracy: accuracy
            });
            
            highScores.sort((a, b) => b.score - a.score);
            highScores.splice(10); // Keep top 10
            
            localStorage.setItem('sumAndSolveHighScores', JSON.stringify(highScores));
        }
        // Display high scores
        function displayHighScores() {
            const highScores = JSON.parse(localStorage.getItem('sumAndSolveHighScores') || '[]');
            const highScoresList = document.getElementById('highScoresList');
            
            if (highScores.length === 0) {
                highScoresList.innerHTML = '<p style="text-align: center; color: #666;">No high scores yet!</p>';
                return;
            }
            
            highScoresList.innerHTML = highScores.map((score, index) => `
                <div class="high-score-item">
                    <span>#${index + 1}</span>
                    <span>${score.score} points</span>
                    <span>${score.accuracy}%</span>
                    <span>${score.date}</span>
                </div>
            `).join('');
        }
        // Reset game
        function resetGame() {
            document.getElementById('gameOverScreen').classList.remove('active');
            document.getElementById('startScreen').classList.add('active');
        }
        // Create confetti
        function createConfetti() {
            const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];
            for (let i = 0; i < 30; i++) {
                setTimeout(() => {
                    const confetti = document.createElement('div');
                    confetti.className = 'confetti';
                    confetti.style.left = Math.random() * 100 + '%';
                    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                    confetti.style.animationDelay = Math.random() * 0.5 + 's';
                    document.querySelector('.game-card').appendChild(confetti);
                    
                    setTimeout(() => confetti.remove(), 3000);
                }, i * 50);
            }
        }
        // Share on Twitter
        function shareOnTwitter() {
            const text = `I just scored ${score} points on Sum & Solve! Can you beat my score?`;
            const url = 'https://sumandsolve.com';
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        }
        // Share on Facebook
        function shareOnFacebook() {
            const url = 'https://sumandsolve.com';
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        }
        // Smooth scroll to game section
        document.querySelector('.cta-button').addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector('#game').scrollIntoView({ behavior: 'smooth' });
        });
        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                document.getElementById('navLinks').classList.remove('active');
            });
        });
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            const navLinks = document.getElementById('navLinks');
            const menuToggle = document.querySelector('.menu-toggle');
            
            if (!navLinks.contains(event.target) && !menuToggle.contains(event.target)) {
                navLinks.classList.remove('active');
            }
        });
    
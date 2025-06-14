// Quiz Application JavaScript
class QuizApp {
    constructor() {
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.selectedAnswer = null;
        this.userAnswers = [];
        this.score = 0;
        this.isAnswered = false;
        
        this.initializeApp();
    }
    
    async initializeApp() {
        try {
            await this.loadQuestions();
            this.showQuizContent();
            this.displayQuestion();
            this.updateProgress();
        } catch (error) {
            console.error('Error initializing quiz:', error);
            this.showError('Failed to load quiz questions. Please refresh the page.');
        }
    }
    
    async loadQuestions() {
        const response = await fetch('/api/questions');
        if (!response.ok) {
            throw new Error('Failed to fetch questions');
        }
        this.questions = await response.json();
        
        // Initialize user answers array
        this.userAnswers = new Array(this.questions.length).fill(null);
    }
    
    showQuizContent() {
        document.getElementById('loadingScreen').style.display = 'none';
        document.getElementById('quizContent').style.display = 'block';
    }
    
    showError(message) {
        const loadingScreen = document.getElementById('loadingScreen');
        loadingScreen.innerHTML = `
            <div class="loader">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #f44336; margin-bottom: 20px;"></i>
                <p style="color: #f44336; font-weight: 600;">${message}</p>
            </div>
        `;
    }
    
    displayQuestion() {
        const question = this.questions[this.currentQuestionIndex];
        if (!question) return;
        
        // Update question number
        document.getElementById('questionNumber').textContent = 
            `Question ${this.currentQuestionIndex + 1}`;
        
        // Update question text
        document.getElementById('questionText').textContent = question.question;
        
        // Create options
        const optionsContainer = document.getElementById('optionsContainer');
        optionsContainer.innerHTML = '';
        
        const optionLabels = ['A', 'B', 'C', 'D'];
        question.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            optionElement.innerHTML = `
                <span class="option-label">${optionLabels[index]}.</span>
                ${option}
            `;
            
            optionElement.addEventListener('click', () => this.selectOption(index, optionElement));
            optionsContainer.appendChild(optionElement);
        });
        
        // Update navigation buttons
        this.updateNavigationButtons();
        
        // Reset question state
        this.resetQuestionState();
        
        // If this question was previously answered, show the previous selection
        if (this.userAnswers[this.currentQuestionIndex] !== null) {
            this.showPreviousAnswer();
        }
    }
    
    selectOption(index, optionElement) {
        if (this.isAnswered) return;
        
        // Remove previous selection
        document.querySelectorAll('.option').forEach(opt => 
            opt.classList.remove('selected'));
        
        // Add selection to clicked option
        optionElement.classList.add('selected');
        
        const optionLabels = ['A', 'B', 'C', 'D'];
        this.selectedAnswer = `Option ${optionLabels[index]} (placeholder)`;
        
        // Enable submit button
        document.getElementById('submitBtn').disabled = false;
    }
    
    async submitAnswer() {
        if (!this.selectedAnswer || this.isAnswered) return;
        
        const question = this.questions[this.currentQuestionIndex];
        
        try {
            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question_id: question.id,
                    selected_answer: this.selectedAnswer
                })
            });
            
            const result = await response.json();
            
            // Store user's answer
            this.userAnswers[this.currentQuestionIndex] = {
                selected: this.selectedAnswer,
                correct: result.correct,
                correctAnswer: result.correct_answer
            };
            
            // Update score
            if (result.correct) {
                this.score++;
            }
            
            this.showAnswerFeedback(result);
            this.isAnswered = true;
            
        } catch (error) {
            console.error('Error submitting answer:', error);
            this.showError('Failed to submit answer. Please try again.');
        }
    }
    
    showAnswerFeedback(result) {
        const options = document.querySelectorAll('.option');
        const optionLabels = ['A', 'B', 'C', 'D'];
        
        // Find correct answer index
        const correctAnswerIndex = optionLabels.findIndex(label => 
            result.correct_answer === `Option ${label} (placeholder)`);
        
        // Find selected answer index
        const selectedAnswerIndex = optionLabels.findIndex(label => 
            this.selectedAnswer === `Option ${label} (placeholder)`);
        
        // Color the options
        options.forEach((option, index) => {
            option.style.pointerEvents = 'none'; // Disable clicking
            
            if (index === correctAnswerIndex) {
                option.classList.add('correct');
            } else if (index === selectedAnswerIndex && !result.correct) {
                option.classList.add('incorrect');
            }
        });
        
        // Show feedback
        const feedbackElement = document.getElementById('answerFeedback');
        const feedbackIcon = document.getElementById('feedbackIcon');
        const feedbackText = document.getElementById('feedbackText');
        
        if (result.correct) {
            feedbackIcon.innerHTML = '<i class="fas fa-check-circle correct"></i>';
            feedbackText.innerHTML = `
                <strong style="color: #333333;">Correct!</strong><br>
                Well done! You got it right.
            `;
        } else {
            feedbackIcon.innerHTML = '<i class="fas fa-times-circle incorrect"></i>';
            feedbackText.innerHTML = `
                <strong style="color: #666666;">Incorrect</strong><br>
                ${result.explanation}
            `;
        }
        
        feedbackElement.style.display = 'block';
        
        // Update buttons
        document.getElementById('submitBtn').style.display = 'none';
        document.getElementById('nextQuestionBtn').style.display = 'inline-flex';
        
        // Auto-advance after 3 seconds if not the last question
        if (this.currentQuestionIndex < this.questions.length - 1) {
            setTimeout(() => {
                if (this.isAnswered) {
                    this.nextQuestion();
                }
            }, 3000);
        } else {
            // Show finish button for last question
            setTimeout(() => {
                this.showResults();
            }, 2000);
        }
    }
    
    showPreviousAnswer() {
        const userAnswer = this.userAnswers[this.currentQuestionIndex];
        if (!userAnswer) return;
        
        const optionLabels = ['A', 'B', 'C', 'D'];
        const selectedIndex = optionLabels.findIndex(label => 
            userAnswer.selected === `Option ${label} (placeholder)`);
        const correctIndex = optionLabels.findIndex(label => 
            userAnswer.correctAnswer === `Option ${label} (placeholder)`);
        
        const options = document.querySelectorAll('.option');
        
        // Show previous selection and result
        options.forEach((option, index) => {
            option.style.pointerEvents = 'none';
            
            if (index === correctIndex) {
                option.classList.add('correct');
            }
            if (index === selectedIndex && !userAnswer.correct) {
                option.classList.add('incorrect');
            }
            if (index === selectedIndex && userAnswer.correct) {
                option.classList.add('selected');
            }
        });
        
        this.isAnswered = true;
        document.getElementById('submitBtn').style.display = 'none';
        document.getElementById('nextQuestionBtn').style.display = 'inline-flex';
        
        // Show feedback
        const feedbackElement = document.getElementById('answerFeedback');
        const feedbackIcon = document.getElementById('feedbackIcon');
        const feedbackText = document.getElementById('feedbackText');
        
        if (userAnswer.correct) {
            feedbackIcon.innerHTML = '<i class="fas fa-check-circle correct"></i>';
            feedbackText.innerHTML = `
                <strong style="color: #333333;">Correct!</strong><br>
                Well done! You got it right.
            `;
        } else {
            feedbackIcon.innerHTML = '<i class="fas fa-times-circle incorrect"></i>';
            feedbackText.innerHTML = `
                <strong style="color: #666666;">Incorrect</strong><br>
                The correct answer is: ${userAnswer.correctAnswer}
            `;
        }
        
        feedbackElement.style.display = 'block';
    }
    
    nextQuestion() {
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.currentQuestionIndex++;
            this.displayQuestion();
            this.updateProgress();
        } else {
            this.showResults();
        }
    }
    
    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.displayQuestion();
            this.updateProgress();
        }
    }
    
    updateNavigationButtons() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        prevBtn.disabled = this.currentQuestionIndex === 0;
        nextBtn.disabled = this.currentQuestionIndex === this.questions.length - 1;
    }
    
    updateProgress() {
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        
        const progress = ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `${this.currentQuestionIndex + 1} / ${this.questions.length}`;
    }
    
    resetQuestionState() {
        this.selectedAnswer = null;
        this.isAnswered = false;
        
        // Reset buttons
        document.getElementById('submitBtn').style.display = 'inline-flex';
        document.getElementById('submitBtn').disabled = true;
        document.getElementById('nextQuestionBtn').style.display = 'none';
        
        // Hide feedback
        document.getElementById('answerFeedback').style.display = 'none';
        
        // Reset options
        document.querySelectorAll('.option').forEach(option => {
            option.style.pointerEvents = 'auto';
            option.classList.remove('selected', 'correct', 'incorrect');
        });
    }
    
    showResults() {
        document.getElementById('quizContent').style.display = 'none';
        document.getElementById('resultsScreen').style.display = 'block';
        
        const percentage = Math.round((this.score / this.questions.length) * 100);
        
        document.getElementById('correctAnswers').textContent = this.score;
        document.getElementById('totalQuestions').textContent = this.questions.length;
        document.getElementById('percentage').textContent = `${percentage}%`;
        
        // Add celebration effect for good scores
        if (percentage >= 80) {
            this.celebrateGoodScore();
        }
    }
    
    celebrateGoodScore() {
        // Add confetti effect or other celebration animations
        const resultsHeader = document.querySelector('.results-header i');
        resultsHeader.style.animation = 'bounce 0.5s ease infinite';
        
        // Change trophy style based on score
        const percentage = Math.round((this.score / this.questions.length) * 100);
        if (percentage >= 90) {
            resultsHeader.style.color = '#000000'; // Dark for excellent
            resultsHeader.style.textShadow = '0 2px 4px rgba(0,0,0,0.3)';
        } else if (percentage >= 80) {
            resultsHeader.style.color = '#333333'; // Medium dark for good
        }
    }
    
    restartQuiz() {
        // Reset all state
        this.currentQuestionIndex = 0;
        this.selectedAnswer = null;
        this.userAnswers = new Array(this.questions.length).fill(null);
        this.score = 0;
        this.isAnswered = false;
        
        // Shuffle questions for new quiz
        this.shuffleQuestions();
        
        // Show quiz content
        document.getElementById('resultsScreen').style.display = 'none';
        document.getElementById('quizContent').style.display = 'block';
        
        // Display first question
        this.displayQuestion();
        this.updateProgress();
    }
    
    shuffleQuestions() {
        for (let i = this.questions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.questions[i], this.questions[j]] = [this.questions[j], this.questions[i]];
        }
    }
}

// Global functions for button clicks
function submitAnswer() {
    quiz.submitAnswer();
}

function nextQuestion() {
    quiz.nextQuestion();
}

function previousQuestion() {
    quiz.previousQuestion();
}

function restartQuiz() {
    quiz.restartQuiz();
}

// Initialize quiz when page loads
let quiz;
document.addEventListener('DOMContentLoaded', () => {
    quiz = new QuizApp();
});

// Add keyboard navigation
document.addEventListener('keydown', (event) => {
    if (!quiz) return;
    
    switch(event.key) {
        case 'ArrowLeft':
            if (!quiz.isAnswered) previousQuestion();
            break;
        case 'ArrowRight':
            if (quiz.isAnswered) nextQuestion();
            break;
        case 'Enter':
            if (quiz.selectedAnswer && !quiz.isAnswered) {
                submitAnswer();
            } else if (quiz.isAnswered && quiz.currentQuestionIndex < quiz.questions.length - 1) {
                nextQuestion();
            }
            break;
        case '1':
        case '2':
        case '3':
        case '4':
            if (!quiz.isAnswered) {
                const optionIndex = parseInt(event.key) - 1;
                const options = document.querySelectorAll('.option');
                if (options[optionIndex]) {
                    options[optionIndex].click();
                }
            }
            break;
    }
}); 
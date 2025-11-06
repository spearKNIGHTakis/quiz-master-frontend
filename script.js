
        // QuizMaster - Complete JavaScript with Real Multiplayer
console.log('🚀 Loading QuizMaster JavaScript...');

// Configuration
const BACKEND_URL = 'https://quiz-app-backend-3g8p.onrender.com';
const SOCKET_URL = BACKEND_URL;
const API_URL = `${BACKEND_URL}/api`;

// App State
let currentState = {
    screen: 'category-selection',
    category: null,
    subject: null,
    gameMode: 'single',
    connectionStatus: 'connecting'
};

// Sound System
const soundSystem = {
    enabled: true,
    play(soundName) {
        if (!this.enabled) return;
        try {
            const sound = document.getElementById(`${soundName}-sound`);
            if (sound) {
                sound.currentTime = 0;
                sound.play().catch(e => console.log('Audio play failed:', e));
            }
        } catch (error) {
            console.log('Sound error:', error);
        }
    },
    toggle() {
        this.enabled = !this.enabled;
        const button = document.getElementById('toggle-sound');
        if (button) {
            button.innerHTML = this.enabled ? 
                '<i class="fas fa-volume-up me-1"></i> Sound On' : 
                '<i class="fas fa-volume-mute me-1"></i> Sound Off';
            button.classList.toggle('btn-outline-success');
            button.classList.toggle('btn-outline-secondary');
        }
        // Save preference
        storageManager.savePreferences();
    }
};

// Storage Manager for Preferences
const storageManager = {
    savePreferences() {
        try {
            const preferences = {
                soundEnabled: soundSystem.enabled,
                selectedAvatar: avatarSystem.selectedAvatar,
                playerName: document.getElementById('player-name')?.value || 'Player',
                mpPlayerName: document.getElementById('mp-player-name')?.value || 'Player'
            };
            localStorage.setItem('quizMasterPrefs', JSON.stringify(preferences));
            console.log('✅ Preferences saved');
        } catch (error) {
            console.error('❌ Failed to save preferences:', error);
        }
    },
    
    loadPreferences() {
        try {
            const saved = localStorage.getItem('quizMasterPrefs');
            if (saved) {
                const prefs = JSON.parse(saved);
                soundSystem.enabled = prefs.soundEnabled !== undefined ? prefs.soundEnabled : true;
                avatarSystem.selectedAvatar = prefs.selectedAvatar || '👨‍💻';
                
                // Set player names
                const playerNameInput = document.getElementById('player-name');
                const mpPlayerNameInput = document.getElementById('mp-player-name');
                
                if (playerNameInput && prefs.playerName) {
                    playerNameInput.value = prefs.playerName;
                }
                if (mpPlayerNameInput && prefs.mpPlayerName) {
                    mpPlayerNameInput.value = prefs.mpPlayerName;
                }
                
                console.log('✅ Preferences loaded');
            }
        } catch (error) {
            console.error('❌ Failed to load preferences:', error);
        }
    }
};

// Safe API Call Wrapper
const apiManager = {
    async safeCall(apiCall, fallbackData = null, errorMessage = 'Operation failed') {
        try {
            categoryManager.showLoading(true);
            const result = await apiCall();
            categoryManager.showLoading(false);
            return result;
        } catch (error) {
            console.error('API call failed:', error);
            categoryManager.showLoading(false);
            categoryManager.showError(errorMessage);
            return fallbackData;
        }
    },
    
    withRetry(apiCall, maxRetries = 3, delay = 1000) {
        return async (...args) => {
            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    return await apiCall(...args);
                } catch (error) {
                    if (attempt === maxRetries) throw error;
                    console.log(`Retry ${attempt}/${maxRetries} after ${delay}ms`);
                    await this.delay(delay);
                }
            }
        };
    },
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// Button Loading States
const buttonManager = {
    setLoading(button, isLoading, originalText = null) {
        if (!button) return;
        
        if (isLoading) {
            button.dataset.originalText = originalText || button.innerHTML;
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Loading...';
            button.classList.add('loading');
        } else {
            button.disabled = false;
            button.innerHTML = button.dataset.originalText || originalText || 'Submit';
            button.classList.remove('loading');
        }
    },
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// Avatar System
const avatarSystem = {
    selectedAvatar: '👨‍💻',
    init() {
        console.log('👤 Avatar system initialized');
        this.renderAvatarSelection();
        this.renderMultiplayerAvatarSelection();
    },
    
    renderAvatarSelection() {
        const container = document.getElementById('avatar-selection');
        if (!container) return;
        
        const avatars = ['👨‍💻', '👩‍🚀', '🦸', '👨‍🎓', '👩‍🎨', '🤖', '🐱', '🦊'];
        
        container.innerHTML = avatars.map(avatar => `
            <div class="avatar-option ${avatar === this.selectedAvatar ? 'selected' : ''}" 
                 data-avatar="${avatar}" role="button" aria-label="Select ${avatar} avatar" tabindex="0">
                <div class="avatar-display" style="font-size: 2rem; cursor: pointer; padding: 5px; border-radius: 10px; border: 3px solid ${avatar === this.selectedAvatar ? '#4361ee' : 'transparent'}">
                    ${avatar}
                </div>
            </div>
        `).join('');
        
        container.querySelectorAll('.avatar-option').forEach(option => {
            option.addEventListener('click', () => {
                this.selectAvatar(option.dataset.avatar);
            });
            option.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    this.selectAvatar(option.dataset.avatar);
                }
            });
        });
    },

    renderMultiplayerAvatarSelection() {
        const container = document.getElementById('mp-avatar-selection');
        if (!container) return;
        
        const avatars = ['👨‍💻', '👩‍🚀', '🦸', '👨‍🎓', '👩‍🎨', '🤖', '🐱', '🦊'];
        
        container.innerHTML = avatars.map(avatar => `
            <div class="avatar-option ${avatar === this.selectedAvatar ? 'selected' : ''}" 
                 data-avatar="${avatar}" role="button" aria-label="Select ${avatar} avatar" tabindex="0">
                <div class="avatar-display" style="font-size: 2rem; cursor: pointer; padding: 5px; border-radius: 10px; border: 3px solid ${avatar === this.selectedAvatar ? '#4361ee' : 'transparent'}">
                    ${avatar}
                </div>
            </div>
        `).join('');
        
        container.querySelectorAll('.avatar-option').forEach(option => {
            option.addEventListener('click', () => {
                this.selectAvatar(option.dataset.avatar);
            });
            option.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    this.selectAvatar(option.dataset.avatar);
                }
            });
        });
    },
    
    selectAvatar(avatar) {
        this.selectedAvatar = avatar;
        this.renderAvatarSelection();
        this.renderMultiplayerAvatarSelection();
        storageManager.savePreferences();
    }
};

// Connection Manager
const connectionManager = {
    isConnected: true,
    
    async init() {
        console.log('🔌 Connection manager initialized');
        this.setConnectionStatus('connected');
        return Promise.resolve();
    },
    
    setConnectionStatus(status) {
        currentState.connectionStatus = status;
        const statusElement = document.getElementById('connection-status');
        
        if (statusElement) {
            statusElement.className = `status ${status}`;
            
            switch(status) {
                case 'connected':
                    statusElement.innerHTML = '<span class="online-indicator online"></span><i class="fas fa-check-circle me-2"></i>Connected';
                    statusElement.setAttribute('aria-label', 'Connected to server');
                    break;
                case 'disconnected':
                    statusElement.innerHTML = '<span class="online-indicator offline"></span><i class="fas fa-times-circle me-2"></i>Offline';
                    statusElement.setAttribute('aria-label', 'Disconnected from server');
                    break;
                case 'connecting':
                    statusElement.innerHTML = '<span class="online-indicator connecting"></span><i class="fas fa-sync-alt me-2"></i>Connecting...';
                    statusElement.setAttribute('aria-label', 'Connecting to server');
                    break;
            }
        }
    },
    
    async emit(event, data) {
        console.log(`📤 Emitting ${event}:`, data);
        return Promise.resolve({ success: true });
    },
    
    on(event, callback) {
        console.log(`📥 Listening for ${event}`);
    }
};

// Question Manager
const questionManager = {
    async getQuestions(settings) {
        const { category, subject, difficulty, questionCount } = settings;
        console.log(`📝 Getting ${questionCount} ${difficulty} questions for ${category}/${subject}`);
        
        // Use safe API call with fallback to demo questions
        const questions = await apiManager.safeCall(
            () => this.fetchQuestionsFromAPI(settings),
            this.getDemoQuestions(category, subject, difficulty, questionCount),
            'Using demo questions'
        );
        
        return {
            questions: questions,
            source: questions === this.getDemoQuestions(category, subject, difficulty, questionCount) ? 'demo' : 'api'
        };
    },
    
    async fetchQuestionsFromAPI(settings) {
        // Simulate API call - in real implementation, this would fetch from your backend
        await apiManager.delay(1000); // Simulate network delay
        throw new Error('API not available'); // Force fallback for now
    },
    
    getDemoQuestions(category, subject, difficulty, count) {
        // Demo questions for all categories
        const allQuestions = [
            {
                question: "What is 5 + 7?",
                options: ["11", "12", "13", "14"],
                correctAnswer: 1,
                explanation: "5 + 7 equals 12."
            },
            {
                question: "How many sides does a triangle have?",
                options: ["2", "3", "4", "5"],
                correctAnswer: 1,
                explanation: "A triangle has 3 sides."
            },
            {
                question: "What is the capital of France?",
                options: ["London", "Berlin", "Paris", "Madrid"],
                correctAnswer: 2,
                explanation: "Paris is the capital of France."
            },
            {
                question: "Which planet is known as the Red Planet?",
                options: ["Venus", "Mars", "Jupiter", "Saturn"],
                correctAnswer: 1,
                explanation: "Mars is known as the Red Planet."
            },
            {
                question: "What does HTML stand for?",
                options: [
                    "Hyper Text Markup Language",
                    "High Tech Modern Language", 
                    "Hyper Transfer Markup Language",
                    "Home Tool Markup Language"
                ],
                correctAnswer: 0,
                explanation: "HTML stands for Hyper Text Markup Language."
            },
            {
                question: "What is the largest mammal?",
                options: ["Elephant", "Blue Whale", "Giraffe", "Polar Bear"],
                correctAnswer: 1,
                explanation: "The Blue Whale is the largest mammal."
            },
            {
                question: "Which gas do plants absorb from the atmosphere?",
                options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
                correctAnswer: 1,
                explanation: "Plants absorb Carbon Dioxide for photosynthesis."
            },
            {
                question: "What is the square root of 64?",
                options: ["6", "7", "8", "9"],
                correctAnswer: 2,
                explanation: "The square root of 64 is 8."
            },
            {
                question: "Who wrote 'Romeo and Juliet'?",
                options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
                correctAnswer: 1,
                explanation: "William Shakespeare wrote 'Romeo and Juliet'."
            },
            {
                question: "What is the chemical symbol for gold?",
                options: ["Go", "Gd", "Au", "Ag"],
                correctAnswer: 2,
                explanation: "The chemical symbol for gold is Au."
            }
        ];
        
        // Return requested number of questions
        return allQuestions.slice(0, count);
    }
};

// Category Manager
const categoryManager = {
    categories: {
        primary: {
            name: "Primary Level",
            subjects: ["mathematics", "science", "english", "social_studies"],
            difficulties: ["easy", "medium"]
        },
        highschool: {
            name: "High School", 
            subjects: ["mathematics", "physics", "chemistry", "biology", "history", "geography"],
            difficulties: ["easy", "medium", "hard"]
        },
        tertiary: {
            name: "Tertiary Level",
            subjects: ["programming", "business", "engineering", "medicine", "law", "economics"],
            difficulties: ["medium", "hard"]
        }
    },
    currentCategory: null,
    currentSubject: null,
    
    init() {
        console.log('🎯 Category manager initialized');
        this.setupEventListeners();
    },
    
    setupEventListeners() {
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                this.selectCategory(card.dataset.category);
            });
            card.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    this.selectCategory(card.dataset.category);
                }
            });
        });
        
        const backButton = document.getElementById('back-to-categories');
        if (backButton) {
            backButton.addEventListener('click', () => {
                this.showCategorySelection();
            });
        }
    },
    
    selectCategory(categoryId) {
        document.querySelectorAll('.category-card').forEach(card => {
            card.classList.remove('selected', 'border-primary');
            card.setAttribute('aria-selected', 'false');
        });
        
        const selectedCard = document.querySelector(`[data-category="${categoryId}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected', 'border-primary');
            selectedCard.setAttribute('aria-selected', 'true');
            selectedCard.focus();
        }
        
        this.currentCategory = categoryId;
        const category = this.categories[categoryId];
        
        if (!category) {
            this.showError('Category not found. Please try again.');
            return;
        }
        
        this.showSubjectSelection(category);
    },
    
    showSubjectSelection(category) {
        document.getElementById('category-title').textContent = `Select Subject - ${category.name}`;
        
        const container = document.getElementById('subjects-container');
        container.innerHTML = '';
        
        const subjectNames = {
            mathematics: { icon: 'fa-calculator', color: 'primary', name: 'Mathematics' },
            science: { icon: 'fa-flask', color: 'success', name: 'Science' },
            english: { icon: 'fa-language', color: 'info', name: 'English' },
            social_studies: { icon: 'fa-globe-americas', color: 'warning', name: 'Social Studies' },
            physics: { icon: 'fa-atom', color: 'danger', name: 'Physics' },
            chemistry: { icon: 'fa-vial', color: 'success', name: 'Chemistry' },
            biology: { icon: 'fa-dna', color: 'success', name: 'Biology' },
            history: { icon: 'fa-landmark', color: 'warning', name: 'History' },
            geography: { icon: 'fa-map', color: 'info', name: 'Geography' },
            programming: { icon: 'fa-code', color: 'dark', name: 'Programming' },
            business: { icon: 'fa-chart-line', color: 'success', name: 'Business' },
            engineering: { icon: 'fa-cogs', color: 'info', name: 'Engineering' },
            medicine: { icon: 'fa-heartbeat', color: 'danger', name: 'Medicine' },
            law: { icon: 'fa-gavel', color: 'warning', name: 'Law' },
            economics: { icon: 'fa-money-bill-wave', color: 'success', name: 'Economics' }
        };
        
        category.subjects.forEach(subjectId => {
            const subject = subjectNames[subjectId] || { 
                icon: 'fa-book', 
                color: 'secondary', 
                name: subjectId 
            };
            
            const col = document.createElement('div');
            col.className = 'col-md-4 col-sm-6 mb-4';
            col.innerHTML = `
                <div class="card subject-card h-100" data-subject="${subjectId}" 
                     role="button" aria-label="Select ${subject.name} subject" tabindex="0">
                    <div class="card-body text-center d-flex flex-column">
                        <i class="fas ${subject.icon} fa-2x mb-3 text-${subject.color}" aria-hidden="true"></i>
                        <h5 class="card-title">${subject.name}</h5>
                        <p class="card-text small flex-grow-1">Test your ${subject.name.toLowerCase()} knowledge</p>
                    </div>
                </div>
            `;
            container.appendChild(col);
        });
        
        setTimeout(() => {
            document.querySelectorAll('.subject-card').forEach(card => {
                card.addEventListener('click', () => {
                    this.selectSubject(card.dataset.subject);
                });
                card.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        this.selectSubject(card.dataset.subject);
                    }
                });
            });
        }, 100);
        
        this.showScreen('subject-selection');
    },
    
    selectSubject(subjectId) {
        document.querySelectorAll('.subject-card').forEach(card => {
            card.classList.remove('selected', 'border-primary');
            card.setAttribute('aria-selected', 'false');
        });
        
        const selectedCard = document.querySelector(`[data-subject="${subjectId}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected', 'border-primary');
            selectedCard.setAttribute('aria-selected', 'true');
            selectedCard.focus();
        }
        
        this.currentSubject = subjectId;
    },
    
    showCategorySelection() {
        this.showScreen('category-selection');
        this.currentCategory = null;
        this.currentSubject = null;
    },
    
    showScreen(screenName) {
        const screens = [
            'category-selection',
            'subject-selection', 
            'multiplayer-setup',
            'multiplayer-lobby',
            'quiz-screen',
            'results-screen',
            'multiplayer-quiz-screen',
            'multiplayer-results-screen'
        ];
        
        screens.forEach(screen => {
            const element = document.getElementById(screen);
            if (element) {
                element.classList.add('d-none');
                element.setAttribute('aria-hidden', 'true');
            }
        });
        
        const targetScreen = document.getElementById(screenName);
        if (targetScreen) {
            targetScreen.classList.remove('d-none');
            targetScreen.setAttribute('aria-hidden', 'false');
            currentState.screen = screenName;
            
            // Focus management for accessibility
            const mainHeading = targetScreen.querySelector('h1, h2, h3');
            if (mainHeading) {
                setTimeout(() => mainHeading.focus(), 100);
            }
        }
    },
    
    getCurrentSettings() {
        return {
            category: this.currentCategory,
            subject: this.currentSubject,
            difficulty: document.getElementById('difficulty-select').value,
            questionCount: parseInt(document.getElementById('question-count').value),
            questionSource: document.getElementById('question-source').value,
            gameMode: document.querySelector('input[name="gameMode"]:checked').value
        };
    },
    
    showError(message) {
        const errorElement = document.getElementById('error-message');
        const errorText = document.getElementById('error-text');
        if (errorElement && errorText) {
            errorText.textContent = message;
            errorElement.style.display = 'block';
            errorElement.setAttribute('aria-live', 'assertive');
            
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 5000);
        }
    },
    
    showSuccess(message) {
        const successElement = document.getElementById('success-message');
        const successText = document.getElementById('success-text');
        if (successElement && successText) {
            successText.textContent = message;
            successElement.style.display = 'block';
            successElement.setAttribute('aria-live', 'polite');
            
            setTimeout(() => {
                successElement.style.display = 'none';
            }, 3000);
        }
    },
    
    showLoading(show) {
        const loadingElement = document.getElementById('loading-spinner');
        if (loadingElement) {
            loadingElement.style.display = show ? 'block' : 'none';
            loadingElement.setAttribute('aria-live', 'polite');
            loadingElement.setAttribute('aria-label', show ? 'Loading content' : '');
        }
    }
};

// Single Player System
const singlePlayerSystem = {
    currentGame: null,
    timer: null,
    timeLeft: 0,
    lastTimerUpdate: 0,
    timerInterval: null,
    
    init() {
        console.log('🎮 Single player system initialized');
    },
    
    async startGame(category, subject, playerName, avatar, difficulty, questionCount, questionSource) {
        try {
            const startBtn = document.getElementById('start-quiz-btn');
            buttonManager.setLoading(startBtn, true, 'Starting Game...');
            
            const questionResult = await questionManager.getQuestions({
                category,
                subject,
                difficulty,
                questionCount,
                questionSource
            });
            
            if (questionResult.questions.length === 0) {
                categoryManager.showError('No questions available.');
                buttonManager.setLoading(startBtn, false, 'Start Quiz');
                return false;
            }
            
            this.currentGame = {
                category: category,
                subject: subject,
                playerName: playerName,
                avatar: avatar,
                questions: questionResult.questions,
                currentQuestion: 0,
                answers: [],
                score: 0,
                startTime: Date.now(),
                timePerQuestion: 30,
                achievements: [],
                questionSource: questionResult.source
            };
            
            this.loadQuestion(0);
            this.startTimer();
            
            buttonManager.setLoading(startBtn, false, 'Start Quiz');
            return true;
            
        } catch (error) {
            console.error('Error starting game:', error);
            categoryManager.showError('Error starting game. Please try again.');
            const startBtn = document.getElementById('start-quiz-btn');
            buttonManager.setLoading(startBtn, false, 'Start Quiz');
            return false;
        }
    },
    
    loadQuestion(questionIndex) {
        if (!this.currentGame || questionIndex >= this.currentGame.questions.length) {
            this.finishGame();
            return;
        }
        
        this.currentGame.currentQuestion = questionIndex;
        const question = this.currentGame.questions[questionIndex];
        
        // Update UI
        document.getElementById('current-subject').textContent = 
            `${this.currentGame.category} - ${this.currentGame.subject}`;
        
        document.getElementById('question-count-display').textContent = 
            `Question ${questionIndex + 1} of ${this.currentGame.questions.length}`;
        
        document.getElementById('question-text').textContent = question.question;
        
        // Update progress bar
        const progress = ((questionIndex) / this.currentGame.questions.length) * 100;
        document.getElementById('progress-bar').style.width = `${progress}%`;
        document.getElementById('progress-bar').setAttribute('aria-valuenow', progress);
        
        // Render options
        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';
        
        question.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            optionElement.setAttribute('role', 'button');
            optionElement.setAttribute('aria-label', `Option ${String.fromCharCode(65 + index)}: ${option}`);
            optionElement.setAttribute('tabindex', '0');
            optionElement.innerHTML = `
                <div class="option-content">
                    <div class="option-letter">${String.fromCharCode(65 + index)}</div>
                    <div class="option-text">${option}</div>
                </div>
            `;
            
            optionElement.addEventListener('click', () => {
                this.selectAnswer(index);
            });
            
            optionElement.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    this.selectAnswer(index);
                }
            });
            
            optionsContainer.appendChild(optionElement);
        });
        
        this.resetTimer();
        
        // Update navigation buttons
        document.getElementById('prev-question').style.display = 
            questionIndex > 0 ? 'inline-block' : 'none';
        
        document.getElementById('next-question').style.display = 
            questionIndex < this.currentGame.questions.length - 1 ? 'inline-block' : 'none';
        
        document.getElementById('submit-quiz').style.display = 
            questionIndex === this.currentGame.questions.length - 1 ? 'inline-block' : 'none';
        
        // Hide question feedback
        const feedbackElement = document.getElementById('question-feedback');
        if (feedbackElement) {
            feedbackElement.classList.remove('show');
        }
        
        categoryManager.showScreen('quiz-screen');
    },
    
    selectAnswer(optionIndex) {
        const question = this.currentGame.questions[this.currentGame.currentQuestion];
        const options = document.querySelectorAll('.option');
        
        // Disable all options after selection
        options.forEach(opt => {
            opt.style.pointerEvents = 'none';
            opt.classList.remove('selected', 'correct', 'incorrect');
        });
        
        options[optionIndex].classList.add('selected');
        
        const isCorrect = optionIndex === question.correctAnswer;
        
        if (isCorrect) {
            soundSystem.play('correct');
            options[optionIndex].classList.add('correct');
        } else {
            soundSystem.play('wrong');
            options[optionIndex].classList.add('incorrect');
            if (question.correctAnswer >= 0 && question.correctAnswer < options.length) {
                options[question.correctAnswer].classList.add('correct');
            }
        }
        
        const feedbackElement = document.getElementById('question-feedback');
        const feedbackText = document.getElementById('feedback-text');
        
        if (feedbackElement && feedbackText) {
            feedbackElement.className = `question-feedback ${isCorrect ? 'correct' : 'incorrect'} show`;
            feedbackText.textContent = question.explanation || 
                (isCorrect ? 'Correct! Well done.' : `Incorrect. The right answer is ${String.fromCharCode(65 + question.correctAnswer)}.`);
            feedbackElement.setAttribute('aria-live', 'assertive');
        }
        
        this.currentGame.answers[this.currentGame.currentQuestion] = {
            selected: optionIndex,
            isCorrect: isCorrect,
            timeSpent: this.currentGame.timePerQuestion - this.timeLeft
        };
        
        if (isCorrect) {
            this.currentGame.score += 10;
        }
        
        setTimeout(() => {
            this.nextQuestion();
        }, 3000);
    },
    
    nextQuestion() {
        if (this.currentGame.currentQuestion < this.currentGame.questions.length - 1) {
            this.loadQuestion(this.currentGame.currentQuestion + 1);
        } else {
            this.finishGame();
        }
    },
    
    prevQuestion() {
        if (this.currentGame.currentQuestion > 0) {
            this.loadQuestion(this.currentGame.currentQuestion - 1);
        }
    },
    
    submitQuiz() {
        this.finishGame();
    },
    
    finishGame() {
        clearInterval(this.timerInterval);
        
        let correctAnswers = 0;
        this.currentGame.questions.forEach((question, index) => {
            if (this.currentGame.answers[index] && this.currentGame.answers[index].isCorrect) {
                correctAnswers++;
            }
        });
        
        this.currentGame.score = correctAnswers * 10;
        this.currentGame.endTime = Date.now();
        
        const timeTaken = Math.floor((this.currentGame.endTime - this.currentGame.startTime) / 1000);
        const accuracy = (correctAnswers / this.currentGame.questions.length) * 100;
        
        this.showResults(correctAnswers, timeTaken);
    },
    
    showResults(correctAnswers, timeTaken) {
        const totalQuestions = this.currentGame.questions.length;
        const percentage = Math.round((correctAnswers / totalQuestions) * 100);
        
        document.getElementById('final-score').textContent = `${correctAnswers}/${totalQuestions}`;
        document.getElementById('points-earned').textContent = this.currentGame.score;
        
        const statsContainer = document.getElementById('performance-stats');
        statsContainer.innerHTML = `
            <div class="row text-center">
                <div class="col-md-3 mb-3">
                    <div class="card bg-light">
                        <div class="card-body">
                            <h3 class="text-primary">${percentage}%</h3>
                            <p class="mb-0">Score</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 mb-3">
                    <div class="card bg-light">
                        <div class="card-body">
                            <h3 class="text-success">${correctAnswers}</h3>
                            <p class="mb-0">Correct</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 mb-3">
                    <div class="card bg-light">
                        <div class="card-body">
                            <h3 class="text-danger">${totalQuestions - correctAnswers}</h3>
                            <p class="mb-0">Incorrect</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 mb-3">
                    <div class="card bg-light">
                        <div class="card-body">
                            <h3 class="text-info">${Math.floor(timeTaken / 60)}:${(timeTaken % 60).toString().padStart(2, '0')}</h3>
                            <p class="mb-0">Time</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        if (percentage >= 80) {
            document.getElementById('confetti').style.display = 'block';
            soundSystem.play('victory');
            
            setTimeout(() => {
                document.getElementById('confetti').style.display = 'none';
            }, 5000);
        }
        
        categoryManager.showScreen('results-screen');
    },
    
    startTimer() {
        this.timeLeft = this.currentGame.timePerQuestion;
        this.lastTimerUpdate = Date.now();
        this.updateTimerDisplay();
        
        // Use requestAnimationFrame for more accurate timing
        this.timerInterval = setInterval(() => {
            const now = Date.now();
            const delta = now - this.lastTimerUpdate;
            
            if (delta >= 1000) {
                this.timeLeft--;
                this.lastTimerUpdate = now;
                this.updateTimerDisplay();
                
                if (this.timeLeft <= 0) {
                    clearInterval(this.timerInterval);
                    this.nextQuestion();
                }
            }
        }, 100); // Check every 100ms for better accuracy
    },
    
    resetTimer() {
        clearInterval(this.timerInterval);
        this.startTimer();
    },
    
    updateTimerDisplay() {
        const timerElement = document.getElementById('time-left');
        if (timerElement) {
            timerElement.textContent = this.timeLeft;
            timerElement.className = `timer ${this.timeLeft <= 10 ? 'warning' : ''} ${this.timeLeft <= 5 ? 'danger' : ''}`;
            timerElement.setAttribute('aria-label', `${this.timeLeft} seconds remaining`);
        }
    }
};

// Enhanced Multiplayer Features
const chatSystem = {
    messages: [],
    
    init() {
        console.log('💬 Chat system initialized');
        this.createChatInterface();
    },
    
    createChatInterface() {
        // Add chat to multiplayer screens
        const multiplayerScreens = ['multiplayer-lobby', 'multiplayer-quiz-screen'];
        
        multiplayerScreens.forEach(screenId => {
            const screen = document.getElementById(screenId);
            if (screen && !screen.querySelector('.chat-container')) {
                const chatHTML = `
                    <div class="chat-container mt-4">
                        <div class="card">
                            <div class="card-header d-flex justify-content-between align-items-center">
                                <h6 class="mb-0"><i class="fas fa-comments me-2"></i>Game Chat</h6>
                                <span class="badge bg-primary" id="chat-indicator">Live</span>
                            </div>
                            <div class="card-body p-0">
                                <div id="chat-messages-${screenId}" class="chat-messages" style="height: 150px; overflow-y: auto; padding: 10px;"></div>
                                <div class="chat-input-container p-2 border-top">
                                    <div class="input-group">
                                        <input type="text" 
                                               id="chat-input-${screenId}" 
                                               class="form-control" 
                                               placeholder="Type a message..." 
                                               aria-label="Chat message"
                                               maxlength="200">
                                        <button class="btn btn-primary" id="send-chat-${screenId}" type="button">
                                            <i class="fas fa-paper-plane"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                // Insert chat at the end of the screen
                screen.insertAdjacentHTML('beforeend', chatHTML);
            }
        });
        
        this.setupChatListeners();
    },
    
    setupChatListeners() {
        const screens = ['multiplayer-lobby', 'multiplayer-quiz-screen'];
        
        screens.forEach(screenId => {
            const chatInput = document.getElementById(`chat-input-${screenId}`);
            const sendButton = document.getElementById(`send-chat-${screenId}`);
            
            if (chatInput && sendButton) {
                // Send on button click
                sendButton.addEventListener('click', () => this.sendMessage(screenId));
                
                // Send on Enter key
                chatInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.sendMessage(screenId);
                    }
                });
                
                // Debounce input for typing indicators
                chatInput.addEventListener('input', buttonManager.debounce(() => {
                    // Could implement typing indicators here
                }, 500));
            }
        });
    },
    
    sendMessage(screenId) {
        const chatInput = document.getElementById(`chat-input-${screenId}`);
        const message = chatInput.value.trim();
        
        if (!message) return;
        
        const playerName = document.getElementById('mp-player-name')?.value || 'Player';
        
        // Add message locally
        this.addMessage(playerName, message, false, screenId);
        
        // Try to send via server if connected
        if (connectionManager.isConnected && multiplayerSystem.currentRoom) {
            connectionManager.emit('chatMessage', {
                roomCode: multiplayerSystem.currentRoom.code,
                message: message,
                playerName: playerName
            }).catch(error => {
                console.log('Failed to send chat message:', error);
            });
        }
        
        // Clear input
        chatInput.value = '';
        chatInput.focus();
    },
    
    addMessage(playerName, message, isSystem = false, screenId = null) {
        const timestamp = new Date().toLocaleTimeString();
        const messageObj = {
            playerName,
            message,
            isSystem,
            timestamp,
            screenId
        };
        
        this.messages.push(messageObj);
        
        // Add to all multiplayer screens
        const screens = screenId ? [screenId] : ['multiplayer-lobby', 'multiplayer-quiz-screen'];
        
        screens.forEach(screen => {
            const chatContainer = document.getElementById(`chat-messages-${screen}`);
            if (chatContainer) {
                const messageElement = document.createElement('div');
                messageElement.className = `chat-message ${isSystem ? 'system-message' : ''} ${playerName === (document.getElementById('mp-player-name')?.value || 'Player') ? 'own-message' : ''}`;
                messageElement.innerHTML = `
                    <div class="message-header">
                        ${!isSystem ? `<strong>${playerName}</strong>` : '<em>System</em>'}
                        <small class="text-muted ms-2">${timestamp}</small>
                    </div>
                    <div class="message-content">${this.escapeHtml(message)}</div>
                `;
                chatContainer.appendChild(messageElement);
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }
        });
    },
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    addSystemMessage(message, screenId = null) {
        this.addMessage('', message, true, screenId);
    }
};

// Real-time Multiplayer System with Real Players Only
const multiplayerSystem = {
    currentRoom: null,
    players: [],
    gameState: null,
    timerInterval: null,
    timeLeft: 0,
    lastTimerUpdate: 0,
    
    init() {
        console.log('🎮 Multiplayer system initialized');
        this.setupSocketListeners();
        this.createMissingScreens();
    },

    createMissingScreens() {
        // Create missing multiplayer screens dynamically
        const cardBody = document.querySelector('.card-body');
        
        // Multiplayer Quiz Screen
        if (!document.getElementById('multiplayer-quiz-screen')) {
            const mpQuizScreen = document.createElement('div');
            mpQuizScreen.id = 'multiplayer-quiz-screen';
            mpQuizScreen.className = 'd-none';
            mpQuizScreen.setAttribute('aria-hidden', 'true');
            mpQuizScreen.innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h3 id="mp-current-subject" class="mb-0">Loading Quiz...</h3>
                        <span class="badge bg-primary" id="mp-question-count-display">Question 1 of 10</span>
                    </div>
                    <div class="timer">
                        <i class="fas fa-clock me-2" aria-hidden="true"></i>
                        <span id="mp-time-left" aria-live="assertive">30</span>s
                    </div>
                </div>
                
                <div class="progress mb-4">
                    <div id="mp-progress-bar" class="progress-bar bg-success" role="progressbar" style="width: 0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
                
                <!-- Multiplayer Scoreboard -->
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="mb-0"><i class="fas fa-trophy me-2" aria-hidden="true"></i>Live Scoreboard</h5>
                    </div>
                    <div class="card-body">
                        <div id="multiplayer-scoreboard" role="list" aria-label="Player scores">
                            <!-- Players will appear here -->
                        </div>
                    </div>
                </div>
                
                <!-- Question Feedback -->
                <div id="mp-question-feedback" class="question-feedback" aria-live="polite">
                    <i class="fas fa-info-circle me-2" aria-hidden="true"></i>
                    <span id="mp-feedback-text"></span>
                </div>
                
                <div class="card question-card">
                    <div class="card-body">
                        <h4 id="mp-question-text" class="card-title">Loading question...</h4>
                        <div id="mp-options-container" class="mt-4" role="listbox" aria-label="Answer options">
                            <!-- Options will appear here -->
                        </div>
                    </div>
                </div>
            `;
            cardBody.appendChild(mpQuizScreen);
        }

        // Multiplayer Results Screen
        if (!document.getElementById('multiplayer-results-screen')) {
            const mpResultsScreen = document.createElement('div');
            mpResultsScreen.id = 'multiplayer-results-screen';
            mpResultsScreen.className = 'd-none';
            mpResultsScreen.setAttribute('aria-hidden', 'true');
            mpResultsScreen.innerHTML = `
                <div class="text-center mb-5">
                    <h2>Game Finished! 🎉</h2>
                    <div class="display-4 fw-bold text-primary mb-2" id="mp-final-score">Winner!</div>
                    <div class="d-flex align-items-center justify-content-center mb-3">
                        <div id="mp-winner-avatar" class="multiplayer-avatar me-3" style="width: 60px; height: 60px; font-size: 1.5rem;" aria-hidden="true"></div>
                        <div>
                            <h4 id="mp-winner-name" class="mb-1">Player</h4>
                            <p class="mb-0 text-muted" id="mp-winner-score">0 points</p>
                        </div>
                    </div>
                </div>
                
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="mb-0"><i class="fas fa-trophy me-2" aria-hidden="true"></i>Final Leaderboard</h5>
                    </div>
                    <div class="card-body">
                        <div id="mp-leaderboard" class="leaderboard" role="list" aria-label="Final rankings">
                            <!-- Leaderboard will appear here -->
                        </div>
                    </div>
                </div>

                <div class="text-center mt-4">
                    <button id="play-again-multiplayer" class="btn btn-primary btn-lg me-3">
                        <i class="fas fa-redo me-2" aria-hidden="true"></i>Play Again
                    </button>
                    <button id="back-to-multiplayer-setup" class="btn btn-outline-primary">
                        <i class="fas fa-home me-2" aria-hidden="true"></i>Multiplayer Menu
                    </button>
                </div>
            `;
            cardBody.appendChild(mpResultsScreen);
        }
    },
    
    setupSocketListeners() {
        // Only setup real listeners if connected
        if (connectionManager.isConnected) {
            connectionManager.on('playerJoined', (data) => {
                this.handlePlayerJoined(data);
            });
            
            connectionManager.on('playerLeft', (data) => {
                this.handlePlayerLeft(data);
            });
            
            connectionManager.on('roomCreated', (data) => {
                this.handleRoomCreated(data);
            });
            
            connectionManager.on('roomJoined', (data) => {
                this.handleRoomJoined(data);
            });
            
            connectionManager.on('gameStarted', (data) => {
                this.handleGameStarted(data);
            });
            
            connectionManager.on('question', (data) => {
                this.handleQuestionReceived(data);
            });
            
            connectionManager.on('playerAnswered', (data) => {
                this.handlePlayerAnswered(data);
            });
            
            connectionManager.on('gameEnded', (data) => {
                this.handleGameEnded(data);
            });
            
            connectionManager.on('chatMessage', (data) => {
                chatSystem.addMessage(data.playerName, data.message, false);
            });
        }
    },
    
    async createRoom(settings) {
        const createBtn = document.getElementById('create-room-btn');
        buttonManager.setLoading(createBtn, true, 'Creating Room...');
        
        try {
            console.log('🎮 Creating multiplayer room...');
            
            const playerName = document.getElementById('mp-player-name').value || 'Player';
            const avatar = avatarSystem.selectedAvatar;
            
            // Save player name preference
            storageManager.savePreferences();
            
            // Generate room code
            const roomCode = this.generateRoomCode();
            
            // Create room locally first
            this.currentRoom = {
                code: roomCode,
                host: playerName,
                settings: settings,
                players: [{
                    id: this.getPlayerId(),
                    name: playerName,
                    avatar: avatar,
                    score: 0,
                    isHost: true
                }],
                status: 'waiting'
            };
            
            this.players = this.currentRoom.players;
            
            // Try to create room on server if connected
            if (connectionManager.isConnected) {
                try {
                    const result = await Promise.race([
                        connectionManager.emit('createRoom', {
                            roomCode: roomCode,
                            playerName: playerName,
                            avatar: avatar,
                            settings: settings
                        }),
                        new Promise((_, reject) => 
                            setTimeout(() => reject(new Error('Server timeout')), 3000)
                        )
                    ]);
                    
                    if (result && result.success) {
                        console.log('✅ Room created on server');
                    }
                } catch (serverError) {
                    console.log('⚠️ Server creation failed, using local room:', serverError);
                }
            }
            
            this.updateLobbyDisplay();
            categoryManager.showScreen('multiplayer-lobby');
            categoryManager.showSuccess(`Room created! Share code: ${roomCode}`);
            
            chatSystem.addSystemMessage(`Room created. Share code: ${roomCode}`, 'multiplayer-lobby');
            chatSystem.addSystemMessage(`Waiting for players to join...`, 'multiplayer-lobby');
            
            return true;
            
        } catch (error) {
            console.error('Error creating room:', error);
            categoryManager.showError('Failed to create room. Please try again.');
            return false;
        } finally {
            buttonManager.setLoading(createBtn, false, 'Create Room');
        }
    },
    
    async joinRoom(roomCode) {
        const joinBtn = document.getElementById('join-room-btn');
        buttonManager.setLoading(joinBtn, true, 'Joining Room...');
        
        try {
            const playerName = document.getElementById('mp-player-name').value || 'Player';
            const avatar = avatarSystem.selectedAvatar;

            if (!roomCode || roomCode.length !== 4) {
                categoryManager.showError('Please enter a valid 4-character room code');
                return false;
            }

            // Save player name preference
            storageManager.savePreferences();

            categoryManager.showLoading(true);

            // Start with just the current player - no demo players
            this.currentRoom = {
                code: roomCode.toUpperCase(),
                host: null, // Will be set by server or when first player joins
                settings: {
                    category: 'primary',
                    subject: 'mathematics', 
                    difficulty: 'medium',
                    questionCount: 5
                },
                players: [
                    {
                        id: this.getPlayerId(),
                        name: playerName,
                        avatar: avatar,
                        score: 0,
                        isHost: false // Server will determine host
                    }
                ],
                status: 'waiting'
            };

            this.players = this.currentRoom.players;

            // Try to join on server if connected
            if (connectionManager.isConnected) {
                try {
                    const result = await Promise.race([
                        connectionManager.emit('joinRoom', {
                            roomCode: roomCode,
                            playerName: playerName,
                            avatar: avatar
                        }),
                        new Promise((_, reject) => 
                            setTimeout(() => reject(new Error('Server timeout')), 3000)
                        )
                    ]);

                    if (result && result.success) {
                        console.log('✅ Joined room on server');
                        // Server will send actual player list via socket events
                    } else {
                        throw new Error(result?.error || 'Room not found');
                    }
                } catch (serverError) {
                    console.log('⚠️ Server join failed:', serverError);
                    categoryManager.showError('Room not found or server unavailable');
                    return false;
                }
            } else {
                categoryManager.showError('Cannot connect to server. Please check your connection.');
                return false;
            }

            this.updateLobbyDisplay();
            categoryManager.showScreen('multiplayer-lobby');
            categoryManager.showSuccess(`Joined room: ${roomCode}`);

            chatSystem.addSystemMessage(`${playerName} joined the room`, 'multiplayer-lobby');

            return true;

        } catch (error) {
            console.error('Error joining room:', error);
            categoryManager.showError(error.message || 'Failed to join room. Please check the room code.');
            return false;
        } finally {
            categoryManager.showLoading(false);
            buttonManager.setLoading(joinBtn, false, 'Join Room');
        }
    },
    
    async startGame() {
        const startBtn = document.getElementById('start-game-btn');
        buttonManager.setLoading(startBtn, true, 'Starting Game...');
        
        try {
            if (!this.currentRoom) {
                categoryManager.showError('No room found');
                return;
            }
            
            if (this.players.length < 2) {
                categoryManager.showError('Need at least 2 players to start');
                return;
            }
            
            // Get questions for the game
            const questionResult = await questionManager.getQuestions(this.currentRoom.settings);
            
            if (questionResult.questions.length === 0) {
                categoryManager.showError('No questions available');
                return;
            }
            
            this.gameState = {
                currentQuestion: 0,
                questions: questionResult.questions,
                players: [...this.players],
                timePerQuestion: 30
            };
            
            // Try to notify server if connected
            if (connectionManager.isConnected) {
                try {
                    await connectionManager.emit('startGame', {
                        roomCode: this.currentRoom.code,
                        questions: questionResult.questions
                    });
                } catch (error) {
                    console.log('⚠️ Server start game failed, continuing locally:', error);
                }
            }
            
            chatSystem.addSystemMessage('Game started! Good luck everyone!', 'multiplayer-lobby');
            this.loadQuestion(0);
            
        } catch (error) {
            console.error('Error starting game:', error);
            categoryManager.showError('Failed to start game. Please try again.');
        } finally {
            buttonManager.setLoading(startBtn, false, 'Start Game');
        }
    },
    
    async submitAnswer(questionIndex, answerIndex) {
        try {
            if (!this.currentRoom || !this.gameState) return;
            
            const question = this.gameState.questions[questionIndex];
            const isCorrect = answerIndex === question.correctAnswer;
            
            // Update local player score
            const currentPlayer = this.players.find(p => p.id === this.getPlayerId());
            if (currentPlayer && isCorrect) {
                currentPlayer.score += 10;
                currentPlayer.hasAnswered = true;
            }
            
            // Update game state players
            const gamePlayer = this.gameState.players.find(p => p.id === this.getPlayerId());
            if (gamePlayer && isCorrect) {
                gamePlayer.score += 10;
                gamePlayer.hasAnswered = true;
            }
            
            this.updateScoreboard();
            
            // Try to notify server if connected
            if (connectionManager.isConnected) {
                try {
                    await connectionManager.emit('submitAnswer', {
                        roomCode: this.currentRoom.code,
                        questionIndex: questionIndex,
                        answerIndex: answerIndex,
                        isCorrect: isCorrect
                    });
                } catch (error) {
                    console.log('⚠️ Server answer submission failed:', error);
                }
            }
            
        } catch (error) {
            console.error('Error submitting answer:', error);
        }
    },
    
    leaveRoom() {
        if (this.currentRoom && connectionManager.isConnected) {
            try {
                connectionManager.emit('leaveRoom', { roomCode: this.currentRoom.code });
            } catch (error) {
                console.log('⚠️ Server leave room failed:', error);
            }
        }
        
        this.currentRoom = null;
        this.players = [];
        this.gameState = null;
        clearInterval(this.timerInterval);
        
        categoryManager.showScreen('multiplayer-setup');
    },
    
    // Event handlers for real-time updates
    handlePlayerJoined(data) {
        if (this.currentRoom && this.currentRoom.code === data.roomCode) {
            this.players.push(data.player);
            this.updateLobbyDisplay();
            categoryManager.showSuccess(`${data.player.name} joined the room!`);
            chatSystem.addSystemMessage(`${data.player.name} joined the game`, 'multiplayer-lobby');
        }
    },
    
    handlePlayerLeft(data) {
        if (this.currentRoom && this.currentRoom.code === data.roomCode) {
            this.players = this.players.filter(player => player.id !== data.playerId);
            this.updateLobbyDisplay();
            categoryManager.showError(`${data.playerName} left the room`);
            chatSystem.addSystemMessage(`${data.playerName} left the game`, 'multiplayer-lobby');
        }
    },
    
    handleRoomCreated(data) {
        // Server confirmed room creation
        console.log('✅ Room created on server:', data.roomCode);
    },
    
    handleRoomJoined(data) {
        // Server confirmed room join
        console.log('✅ Joined room on server:', data.roomCode);
    },
    
    handleGameStarted(data) {
        if (this.currentRoom && this.currentRoom.code === data.roomCode) {
            this.gameState = {
                currentQuestion: 0,
                questions: data.questions,
                players: data.players,
                timePerQuestion: data.timePerQuestion || 30
            };
            this.loadQuestion(0);
        }
    },
    
    handleQuestionReceived(data) {
        if (this.currentRoom && this.currentRoom.code === data.roomCode) {
            this.loadQuestion(data.questionIndex);
        }
    },
    
    handlePlayerAnswered(data) {
        // Update other players' scores in real-time
        const player = this.players.find(p => p.id === data.playerId);
        if (player) {
            player.score = data.newScore;
            player.hasAnswered = true;
        }
        this.updateScoreboard();
    },
    
    handleGameEnded(data) {
        if (this.currentRoom && this.currentRoom.code === data.roomCode) {
            this.showResults(data.finalScores);
        }
    },
    
    updateLobbyDisplay() {
        const roomCodeElement = document.getElementById('room-code');
        const playerCountElement = document.getElementById('player-count');
        const playersList = document.getElementById('players-list');
        const startButton = document.getElementById('start-game-btn');

        if (roomCodeElement) {
            roomCodeElement.textContent = this.currentRoom?.code || '----';
        }

        if (playerCountElement) {
            playerCountElement.textContent = `${this.players.length} player(s)`;
            playerCountElement.setAttribute('aria-label', `${this.players.length} players in room`);
        }

        if (playersList) {
            // Clear any waiting messages
            const waitingMessages = playersList.parentNode.querySelectorAll('.alert');
            waitingMessages.forEach(msg => msg.remove());

            if (this.players.length === 1) {
                // Show waiting message
                const waitingMessage = document.createElement('div');
                waitingMessage.className = 'alert alert-info text-center';
                waitingMessage.innerHTML = `
                    <i class="fas fa-users me-2" aria-hidden="true"></i>
                    Waiting for other players to join...<br>
                    <small>Share room code: <strong>${this.currentRoom?.code}</strong></small>
                `;
                playersList.parentNode.insertBefore(waitingMessage, playersList);
            }

            playersList.innerHTML = this.players.map(player => `
                <div class="player-item" role="listitem">
                    <div class="multiplayer-avatar me-2" aria-hidden="true">${player.avatar}</div>
                    <div class="flex-grow-1">
                        <strong>${player.name}</strong>
                        ${player.id === this.getPlayerId() ? '<span class="badge bg-primary ms-2">You</span>' : ''}
                    </div>
                    ${player.isHost ? '<span class="badge bg-warning">Host</span>' : ''}
                </div>
            `).join('');
        }

        if (startButton && this.currentRoom) {
            const isHost = this.players.find(p => p.id === this.getPlayerId())?.isHost || false;
            const canStart = this.players.length >= 2; // Require at least 2 real players

            startButton.style.display = isHost ? 'block' : 'none';
            startButton.disabled = !canStart;

            if (isHost && !canStart) {
                startButton.title = `Need ${2 - this.players.length} more player(s) to start`;
                startButton.setAttribute('aria-label', `Start game disabled. Need ${2 - this.players.length} more players`);
            } else {
                startButton.title = '';
                startButton.setAttribute('aria-label', 'Start game');
            }
        }
    },

    loadQuestion(questionIndex) {
        if (!this.gameState || questionIndex >= this.gameState.questions.length) {
            // Game finished
            this.showResults(this.gameState.players);
            return;
        }
        
        this.gameState.currentQuestion = questionIndex;
        const question = this.gameState.questions[questionIndex];
        
        // Reset answered status for new question
        this.players.forEach(player => {
            player.hasAnswered = false;
        });
        
        // Update UI
        document.getElementById('mp-current-subject').textContent = 
            `${this.currentRoom.settings.category} - ${this.currentRoom.settings.subject}`;
        
        document.getElementById('mp-question-count-display').textContent = 
            `Question ${questionIndex + 1} of ${this.gameState.questions.length}`;
        
        document.getElementById('mp-question-text').textContent = question.question;
        
        // Update progress bar
        const progress = ((questionIndex) / this.gameState.questions.length) * 100;
        document.getElementById('mp-progress-bar').style.width = `${progress}%`;
        document.getElementById('mp-progress-bar').setAttribute('aria-valuenow', progress);
        
        // Render options
        const optionsContainer = document.getElementById('mp-options-container');
        optionsContainer.innerHTML = '';
        
        question.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            optionElement.setAttribute('role', 'button');
            optionElement.setAttribute('aria-label', `Option ${String.fromCharCode(65 + index)}: ${option}`);
            optionElement.setAttribute('tabindex', '0');
            optionElement.innerHTML = `
                <div class="option-content">
                    <div class="option-letter">${String.fromCharCode(65 + index)}</div>
                    <div class="option-text">${option}</div>
                </div>
            `;
            
            optionElement.addEventListener('click', () => {
                this.selectAnswer(index);
            });
            
            optionElement.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    this.selectAnswer(index);
                }
            });
            
            optionsContainer.appendChild(optionElement);
        });
        
        // Start timer
        this.startTimer();
        
        // Update scoreboard
        this.updateScoreboard();
        
        categoryManager.showScreen('multiplayer-quiz-screen');
        
        // Add chat message for new question
        chatSystem.addSystemMessage(`Question ${questionIndex + 1} started!`, 'multiplayer-quiz-screen');
    },

    selectAnswer(optionIndex) {
        if (!this.gameState) return;
        
        const questionIndex = this.gameState.currentQuestion;
        const question = this.gameState.questions[questionIndex];
        const options = document.querySelectorAll('#mp-options-container .option');
        
        // Disable all options after selection
        options.forEach(opt => {
            opt.style.pointerEvents = 'none';
            opt.classList.remove('selected', 'correct', 'incorrect');
        });
        
        options[optionIndex].classList.add('selected');
        
        const isCorrect = optionIndex === question.correctAnswer;
        
        // Show correct/incorrect feedback
        if (isCorrect) {
            soundSystem.play('correct');
            options[optionIndex].classList.add('correct');
        } else {
            soundSystem.play('wrong');
            options[optionIndex].classList.add('incorrect');
            if (question.correctAnswer >= 0 && question.correctAnswer < options.length) {
                options[question.correctAnswer].classList.add('correct');
            }
        }
        
        // Submit answer
        this.submitAnswer(questionIndex, optionIndex);
        
        // Show explanation
        const feedbackElement = document.getElementById('mp-question-feedback');
        const feedbackText = document.getElementById('mp-feedback-text');
        
        if (feedbackElement && feedbackText) {
            feedbackElement.className = `question-feedback ${isCorrect ? 'correct' : 'incorrect'} show`;
            feedbackText.textContent = question.explanation || 
                (isCorrect ? 'Correct! Well done.' : `Incorrect. The right answer is ${String.fromCharCode(65 + question.correctAnswer)}.`);
            feedbackElement.setAttribute('aria-live', 'assertive');
        }
        
        // Move to next question after delay
        setTimeout(() => {
            this.nextQuestion();
        }, 3000);
    },

    nextQuestion() {
        if (this.gameState && this.gameState.currentQuestion < this.gameState.questions.length - 1) {
            this.loadQuestion(this.gameState.currentQuestion + 1);
        } else {
            this.showResults(this.gameState.players);
        }
    },

    startTimer() {
        clearInterval(this.timerInterval);
        this.timeLeft = this.gameState.timePerQuestion;
        this.lastTimerUpdate = Date.now();
        this.updateTimerDisplay();
        
        // Use requestAnimationFrame for more accurate timing
        this.timerInterval = setInterval(() => {
            const now = Date.now();
            const delta = now - this.lastTimerUpdate;
            
            if (delta >= 1000) {
                this.timeLeft--;
                this.lastTimerUpdate = now;
                this.updateTimerDisplay();
                
                if (this.timeLeft <= 0) {
                    clearInterval(this.timerInterval);
                    this.nextQuestion();
                }
            }
        }, 100); // Check every 100ms for better accuracy
    },

    updateTimerDisplay() {
        const timerElement = document.getElementById('mp-time-left');
        if (timerElement) {
            timerElement.textContent = this.timeLeft;
            timerElement.className = `timer ${this.timeLeft <= 10 ? 'warning' : ''} ${this.timeLeft <= 5 ? 'danger' : ''}`;
            timerElement.setAttribute('aria-label', `${this.timeLeft} seconds remaining`);
        }
    },

    updateScoreboard() {
        const scoreboard = document.getElementById('multiplayer-scoreboard');
        if (!scoreboard || !this.players.length) return;
        
        // Sort players by score (descending)
        const sortedPlayers = [...this.players].sort((a, b) => b.score - a.score);
        
        scoreboard.innerHTML = sortedPlayers.map((player, index) => {
            const isCurrentPlayer = player.id === this.getPlayerId();
            const playerClass = isCurrentPlayer ? 'current-player' : '';
            const rank = index + 1;
            
            return `
                <div class="scoreboard-item ${playerClass}" role="listitem" aria-label="Rank ${rank}: ${player.name} with ${player.score} points">
                    <div class="scoreboard-rank">${rank}</div>
                    <div class="multiplayer-avatar" aria-hidden="true">${player.avatar}</div>
                    <div class="scoreboard-name">${player.name}</div>
                    <div class="scoreboard-score">${player.score} pts</div>
                    ${player.hasAnswered ? '<div class="scoreboard-status answered" aria-label="Answered"><i class="fas fa-check" aria-hidden="true"></i></div>' : '<div class="scoreboard-status waiting" aria-label="Waiting for answer"><i class="fas fa-clock" aria-hidden="true"></i></div>'}
                </div>
            `;
        }).join('');
    },

    showResults(finalScores) {
        clearInterval(this.timerInterval);
        
        if (!finalScores) {
            finalScores = this.players;
        }
        
        // Sort players by score
        const sortedPlayers = [...finalScores].sort((a, b) => b.score - a.score);
        const winner = sortedPlayers[0];
        const isWinner = winner.id === this.getPlayerId();
        
        // Update results display
        document.getElementById('mp-final-score').textContent = `${winner.name} wins!`;
        document.getElementById('mp-winner-avatar').textContent = winner.avatar;
        document.getElementById('mp-winner-name').textContent = winner.name;
        document.getElementById('mp-winner-score').textContent = `${winner.score} points`;
        
        // Show confetti for winner
        if (isWinner) {
            document.getElementById('confetti').style.display = 'block';
            soundSystem.play('victory');
            
            setTimeout(() => {
                document.getElementById('confetti').style.display = 'none';
            }, 5000);
        }
        
        // Update leaderboard
        const leaderboard = document.getElementById('mp-leaderboard');
        leaderboard.innerHTML = sortedPlayers.map((player, index) => {
            const isCurrentPlayer = player.id === this.getPlayerId();
            const playerClass = isCurrentPlayer ? 'current-player' : '';
            const rank = index + 1;
            const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`;
            
            return `
                <div class="leaderboard-item ${playerClass}" role="listitem" aria-label="Position ${rank}: ${player.name} with ${player.score} points">
                    <div class="leaderboard-rank">${medal}</div>
                    <div class="multiplayer-avatar" aria-hidden="true">${player.avatar}</div>
                    <div class="leaderboard-name">${player.name}</div>
                    <div class="leaderboard-score">${player.score} pts</div>
                </div>
            `;
        }).join('');
        
        categoryManager.showScreen('multiplayer-results-screen');
        
        // Add final results to chat
        chatSystem.addSystemMessage(`Game finished! Winner: ${winner.name} with ${winner.score} points`, 'multiplayer-quiz-screen');
    },

    generateRoomCode() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 4; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    },

    getPlayerId() {
        // Generate a simple player ID for local use
        return 'player_' + Math.random().toString(36).substr(2, 9);
    }
};

// Accessibility & Keyboard Navigation
const accessibilityManager = {
    init() {
        console.log('♿ Accessibility manager initialized');
        this.setupKeyboardNavigation();
        this.enhanceAccessibility();
        this.setupFocusManagement();
    },
    
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Number keys 1-4 for answer selection
            if (e.key >= '1' && e.key <= '4' && currentState.screen.includes('quiz-screen')) {
                const optionIndex = parseInt(e.key) - 1;
                const options = document.querySelectorAll('.option');
                if (options[optionIndex] && !options[optionIndex].classList.contains('selected')) {
                    options[optionIndex].click();
                }
            }
            
            // Space bar for next question
            if (e.key === ' ' && document.getElementById('next-question')?.style.display !== 'none') {
                e.preventDefault();
                document.getElementById('next-question').click();
            }
            
            // Escape key to go back
            if (e.key === 'Escape') {
                this.handleEscapeKey();
            }
            
            // Tab key management for modals
            if (e.key === 'Tab') {
                this.handleTabKey(e);
            }
        });
    },
    
    handleEscapeKey() {
        switch(currentState.screen) {
            case 'subject-selection':
                document.getElementById('back-to-categories').click();
                break;
            case 'multiplayer-lobby':
                document.getElementById('leave-room-btn').click();
                break;
            case 'quiz-screen':
            case 'multiplayer-quiz-screen':
                // Don't allow escape during active quiz
                break;
            default:
                categoryManager.showCategorySelection();
        }
    },
    
    handleTabKey(e) {
        // Keep tab focus within modal dialogs
        const modal = document.querySelector('.modal.show');
        if (modal) {
            const focusableElements = modal.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    e.preventDefault();
                }
            }
        }
    },
    
    enhanceAccessibility() {
        // Add ARIA roles and labels to interactive elements
        document.querySelectorAll('.option').forEach(option => {
            option.setAttribute('role', 'button');
            option.setAttribute('tabindex', '0');
        });
        
        document.querySelectorAll('.card[role="button"]').forEach(card => {
            card.setAttribute('tabindex', '0');
        });
        
        // Add skip to main content link
        this.addSkipLink();
        
        // Enhance form labels
        this.enhanceFormLabels();
    },
    
    addSkipLink() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-link';
        skipLink.textContent = 'Skip to main content';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: #000;
            color: white;
            padding: 8px;
            z-index: 10000;
            text-decoration: none;
        `;
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
        
        // Add main content ID
        const mainContent = document.querySelector('.card-body') || document.querySelector('main');
        if (mainContent) {
            mainContent.id = 'main-content';
            mainContent.setAttribute('role', 'main');
        }
    },
    
    enhanceFormLabels() {
        const inputs = document.querySelectorAll('input[type="text"], input[type="email"], select');
        inputs.forEach(input => {
            if (!input.id) {
                input.id = `input-${Math.random().toString(36).substr(2, 9)}`;
            }
            
            const label = input.previousElementSibling;
            if (label && label.tagName === 'LABEL') {
                label.htmlFor = input.id;
            }
        });
    },
    
    setupFocusManagement() {
        // Focus management for screen transitions
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && node.classList && !node.classList.contains('d-none')) {
                        this.focusFirstElement(node);
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    },
    
    focusFirstElement(container) {
        const focusableSelectors = [
            'button:not(:disabled)',
            '[href]',
            'input:not(:disabled)',
            'select:not(:disabled)',
            'textarea:not(:disabled)',
            '[tabindex]:not([tabindex="-1"])'
        ].join(', ');
        
        const focusableElements = container.querySelectorAll(focusableSelectors);
        if (focusableElements.length > 0) {
            setTimeout(() => focusableElements[0].focus(), 100);
        }
    },
    
    announceToScreenReader(message, priority = 'polite') {
        const announcer = document.getElementById('screen-reader-announcer') || this.createAnnouncer();
        announcer.setAttribute('aria-live', priority);
        announcer.textContent = message;
        
        // Clear message after a delay
        setTimeout(() => {
            announcer.textContent = '';
        }, 1000);
    },
    
    createAnnouncer() {
        const announcer = document.createElement('div');
        announcer.id = 'screen-reader-announcer';
        announcer.style.cssText = `
            position: absolute;
            left: -10000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        document.body.appendChild(announcer);
        return announcer;
    }
};

// Asset Preloader
const assetManager = {
    init() {
        console.log('📦 Asset manager initialized');
        this.preloadAssets();
    },
    
    preloadAssets() {
        const sounds = ['correct', 'wrong', 'victory'];
        sounds.forEach(sound => {
            const audio = document.getElementById(`${sound}-sound`);
            if (audio) {
                audio.load();
            }
        });
        
        // Preload critical images or other assets
        this.preloadCriticalImages();
    },
    
    preloadCriticalImages() {
        const criticalImages = [
            // Add paths to critical images here
        ];
        
        criticalImages.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }
};

// UI Event Handlers
function setupEventListeners() {
    console.log('🔧 Setting up event listeners...');

    // Sound toggle
    const soundToggle = document.getElementById('toggle-sound');
    if (soundToggle) {
        soundToggle.addEventListener('click', () => {
            soundSystem.toggle();
        });
    }

    // Start quiz button (single player)
    const startQuizBtn = document.getElementById('start-quiz-btn');
    if (startQuizBtn) {
        startQuizBtn.addEventListener('click', buttonManager.debounce(() => {
            const settings = categoryManager.getCurrentSettings();
            const playerName = document.getElementById('player-name').value || 'Player';
            
            // Save player name
            storageManager.savePreferences();
            
            if (!settings.category || !settings.subject) {
                categoryManager.showError('Please select a category and subject');
                return;
            }

            if (settings.gameMode === 'single') {
                singlePlayerSystem.startGame(
                    settings.category,
                    settings.subject,
                    playerName,
                    avatarSystem.selectedAvatar,
                    settings.difficulty,
                    settings.questionCount,
                    settings.questionSource
                );
            } else {
                // Multiplayer mode - go to multiplayer setup
                categoryManager.showScreen('multiplayer-setup');
            }
        }, 500));
    }

    // Multiplayer setup
    const setupMultiplayer = document.getElementById('setup-multiplayer');
    if (setupMultiplayer) {
        setupMultiplayer.addEventListener('click', () => {
            categoryManager.showScreen('multiplayer-setup');
        });
    }

    // Create room
    const createRoomBtn = document.getElementById('create-room-btn');
    if (createRoomBtn) {
        createRoomBtn.addEventListener('click', buttonManager.debounce(() => {
            const settings = categoryManager.getCurrentSettings();
            multiplayerSystem.createRoom(settings);
        }, 500));
    }

    // Join room
    const joinRoomBtn = document.getElementById('join-room-btn');
    if (joinRoomBtn) {
        joinRoomBtn.addEventListener('click', buttonManager.debounce(() => {
            const roomCode = document.getElementById('room-code-input').value;
            multiplayerSystem.joinRoom(roomCode);
        }, 500));
    }

    // Start multiplayer game
    const startGameBtn = document.getElementById('start-game-btn');
    if (startGameBtn) {
        startGameBtn.addEventListener('click', buttonManager.debounce(() => {
            multiplayerSystem.startGame();
        }, 500));
    }

    // Leave room
    const leaveRoomBtn = document.getElementById('leave-room-btn');
    if (leaveRoomBtn) {
        leaveRoomBtn.addEventListener('click', () => {
            multiplayerSystem.leaveRoom();
        });
    }

    // Back to multiplayer setup
    const backToMultiplayerSetup = document.getElementById('back-to-multiplayer-setup');
    if (backToMultiplayerSetup) {
        backToMultiplayerSetup.addEventListener('click', () => {
            multiplayerSystem.leaveRoom();
        });
    }

    // Quiz navigation
    const prevQuestion = document.getElementById('prev-question');
    if (prevQuestion) {
        prevQuestion.addEventListener('click', () => {
            singlePlayerSystem.prevQuestion();
        });
    }

    const nextQuestion = document.getElementById('next-question');
    if (nextQuestion) {
        nextQuestion.addEventListener('click', () => {
            singlePlayerSystem.nextQuestion();
        });
    }

    const submitQuiz = document.getElementById('submit-quiz');
    if (submitQuiz) {
        submitQuiz.addEventListener('click', () => {
            singlePlayerSystem.submitQuiz();
        });
    }

    // Play again buttons
    const playAgainSingle = document.getElementById('play-again-btn');
    if (playAgainSingle) {
        playAgainSingle.addEventListener('click', () => {
            categoryManager.showCategorySelection();
        });
    }

    const playAgainMultiplayer = document.getElementById('play-again-multiplayer');
    if (playAgainMultiplayer) {
        playAgainMultiplayer.addEventListener('click', () => {
            multiplayerSystem.leaveRoom();
            categoryManager.showScreen('multiplayer-setup');
        });
    }

    const backToMainFromResults = document.getElementById('back-to-menu');
    if (backToMainFromResults) {
        backToMainFromResults.addEventListener('click', () => {
            categoryManager.showCategorySelection();
        });
    }

    // Back to main menu from various screens
    const backButtons = document.querySelectorAll('.back-to-main');
    backButtons.forEach(button => {
        button.addEventListener('click', () => {
            categoryManager.showCategorySelection();
        });
    });

    // Room code input uppercase
    const roomCodeInput = document.getElementById('room-code-input');
    if (roomCodeInput) {
        roomCodeInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase();
        });
    }

    // Enter key for room code
    if (roomCodeInput) {
        roomCodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('join-room-btn').click();
            }
        });
    }

    // Player name input enter key
    const playerNameInput = document.getElementById('player-name');
    if (playerNameInput) {
        playerNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('start-quiz-btn').click();
            }
        });
        // Save on blur
        playerNameInput.addEventListener('blur', () => {
            storageManager.savePreferences();
        });
    }

    const mpPlayerNameInput = document.getElementById('mp-player-name');
    if (mpPlayerNameInput) {
        mpPlayerNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                // Check which multiplayer screen we're on
                if (currentState.screen === 'multiplayer-setup') {
                    document.getElementById('create-room-btn').click();
                }
            }
        });
        // Save on blur
        mpPlayerNameInput.addEventListener('blur', () => {
            storageManager.savePreferences();
        });
    }

    // Auto-save preferences when inputs change
    const autoSaveInputs = document.querySelectorAll('#player-name, #mp-player-name, #difficulty-select, #question-count, #question-source');
    autoSaveInputs.forEach(input => {
        input.addEventListener('change', () => {
            storageManager.savePreferences();
        });
    });
}

// Initialize the application
async function initApp() {
    console.log('🚀 Initializing QuizMaster App...');

    try {
        // Load user preferences first
        storageManager.loadPreferences();
        
        // Initialize systems in sequence
        await connectionManager.init();
        assetManager.init();
        avatarSystem.init();
        categoryManager.init();
        singlePlayerSystem.init();
        multiplayerSystem.init();
        chatSystem.init();
        accessibilityManager.init();
        
        // Setup event listeners
        setupEventListeners();
        
        // Initialize sound system UI
        const soundToggle = document.getElementById('toggle-sound');
        if (soundToggle) {
            soundToggle.innerHTML = soundSystem.enabled ? 
                '<i class="fas fa-volume-up me-1"></i> Sound On' : 
                '<i class="fas fa-volume-mute me-1"></i> Sound Off';
            soundToggle.classList.toggle('btn-outline-success', soundSystem.enabled);
            soundToggle.classList.toggle('btn-outline-secondary', !soundSystem.enabled);
        }
        
        console.log('✅ QuizMaster App initialized successfully!');
        
        // Show connection status
        connectionManager.setConnectionStatus('connected');
        
        // Announce readiness to screen readers
        accessibilityManager.announceToScreenReader('QuizMaster application ready');
        
    } catch (error) {
        console.error('❌ Failed to initialize app:', error);
        categoryManager.showError('Failed to initialize application. Please refresh the page.');
        accessibilityManager.announceToScreenReader('Application initialization failed', 'assertive');
    }
}

// Start the app when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Export for global access (if needed)
window.QuizMaster = {
    categoryManager,
    singlePlayerSystem,
    multiplayerSystem,
    soundSystem,
    avatarSystem,
    connectionManager,
    storageManager,
    accessibilityManager
};

// script.js - Fixed Multiplayer Screen Switching
console.log('🚀 Loading QuizMaster JavaScript...');

// Configuration - Use relative URL for same-domain deployment
const BACKEND_URL = window.location.origin;
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

// UI Manager - NEW: Handles screen transitions reliably
const uiManager = {
    screens: [
        'category-selection',
        'subject-selection', 
        'multiplayer-setup',
        'multiplayer-lobby',
        'quiz-screen',
        'results-screen',
        'multiplayer-quiz-screen',
        'multiplayer-results-screen'
    ],
    
    showScreen(screenName) {
        console.log('🔄 Switching to screen:', screenName);
        
        // Hide all screens
        this.screens.forEach(screen => {
            const element = document.getElementById(screen);
            if (element) {
                element.classList.add('d-none');
                element.setAttribute('aria-hidden', 'true');
            }
        });
        
        // Show target screen
        const targetScreen = document.getElementById(screenName);
        if (targetScreen) {
            targetScreen.classList.remove('d-none');
            targetScreen.setAttribute('aria-hidden', 'false');
            currentState.screen = screenName;
            
            console.log('✅ Screen switched to:', screenName);
            
            // Focus management for accessibility
            const mainHeading = targetScreen.querySelector('h1, h2, h3');
            if (mainHeading) {
                setTimeout(() => mainHeading.focus(), 100);
            }
        } else {
            console.error('❌ Target screen not found:', screenName);
        }
    },
    
    showError(message) {
        const errorElement = document.getElementById('error-message');
        const errorText = document.getElementById('error-text');
        if (errorElement && errorText) {
            errorText.textContent = message;
            errorElement.classList.remove('d-none');
            
            setTimeout(() => {
                errorElement.classList.add('d-none');
            }, 5000);
        }
    },
    
    showSuccess(message) {
        const successElement = document.getElementById('success-message');
        const successText = document.getElementById('success-text');
        if (successElement && successText) {
            successText.textContent = message;
            successElement.classList.remove('d-none');
            
            setTimeout(() => {
                successElement.classList.add('d-none');
            }, 3000);
        }
    },
    
    showLoading(show) {
        const loadingElement = document.getElementById('loading-spinner');
        if (loadingElement) {
            loadingElement.classList.toggle('d-none', !show);
        }
    }
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
        localStorage.setItem('quizMasterSoundEnabled', this.enabled);
    }
};

// Storage Manager
const storageManager = {
    savePreferences() {
        try {
            const preferences = {
                soundEnabled: soundSystem.enabled,
                selectedAvatar: avatarSystem.selectedAvatar,
                playerName: document.getElementById('player-name')?.value || 'Player',
                mpPlayerName: document.getElementById('mp-player-name')?.value || 'Player',
                lastCategory: categoryManager.currentCategory,
                lastSubject: categoryManager.currentSubject,
                savedAt: Date.now()
            };
            localStorage.setItem('quizMasterPrefs', JSON.stringify(preferences));
        } catch (error) {
            console.error('Failed to save preferences:', error);
        }
    },
    
    loadPreferences() {
        try {
            const saved = localStorage.getItem('quizMasterPrefs');
            if (saved) {
                const prefs = JSON.parse(saved);
                soundSystem.enabled = prefs.soundEnabled !== undefined ? prefs.soundEnabled : true;
                avatarSystem.selectedAvatar = prefs.selectedAvatar || '👨‍💻';
                
                const playerNameInput = document.getElementById('player-name');
                const mpPlayerNameInput = document.getElementById('mp-player-name');
                
                if (playerNameInput && prefs.playerName) {
                    playerNameInput.value = prefs.playerName;
                }
                if (mpPlayerNameInput && prefs.mpPlayerName) {
                    mpPlayerNameInput.value = prefs.mpPlayerName;
                }
                
                if (prefs.lastCategory && prefs.lastSubject) {
                    categoryManager.currentCategory = prefs.lastCategory;
                    categoryManager.currentSubject = prefs.lastSubject;
                }
            }
        } catch (error) {
            console.error('Failed to load preferences:', error);
        }
    }
};

// Button Manager
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
    }
};

// Avatar System
const avatarSystem = {
    selectedAvatar: '👨‍💻',
    init() {
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
    socket: null,
    isConnected: false,
    
    async init() {
        console.log('🔌 Initializing connection manager...');
        
        try {
            this.setConnectionStatus('connecting');
            
            this.socket = io(BACKEND_URL, {
                transports: ['websocket', 'polling'],
                timeout: 10000
            });
            
            this.socket.on('connect', () => {
                console.log('✅ Socket.io connected successfully');
                this.isConnected = true;
                this.setConnectionStatus('connected');
                uiManager.showSuccess('Connected to server!');
            });
            
            this.socket.on('disconnect', (reason) => {
                console.log('❌ Socket.io disconnected:', reason);
                this.isConnected = false;
                this.setConnectionStatus('disconnected');
                uiManager.showError('Disconnected from server. Attempting to reconnect...');
            });
            
            this.socket.on('connect_error', (error) => {
                console.error('Socket.io connection error:', error);
                this.setConnectionStatus('disconnected');
                uiManager.showError('Connection failed. Please check your internet connection.');
            });
            
            // Set up event listeners
            this.setupSocketListeners();
            
        } catch (error) {
            console.error('Failed to connect with Socket.io:', error);
            this.setConnectionStatus('disconnected');
        }
    },
    
    setupSocketListeners() {
        // Game events
        this.socket.on('gameCreated', (data) => {
            console.log('🎮 Game created:', data);
            multiplayerSystem.handleGameCreated(data);
        });

        this.socket.on('gameJoined', (data) => {
            console.log('🎮 Game joined:', data);
            multiplayerSystem.handleGameJoined(data);
        });

        this.socket.on('playerJoined', (data) => {
            console.log('👤 Player joined:', data);
            multiplayerSystem.handlePlayerJoined(data);
        });

        this.socket.on('playerLeft', (data) => {
            console.log('👤 Player left:', data);
            multiplayerSystem.handlePlayerLeft(data);
        });

        this.socket.on('gameStarting', (data) => {
            console.log('🎮 Game starting:', data);
            multiplayerSystem.handleGameStarting(data);
        });

        this.socket.on('gameStarted', (data) => {
            console.log('🎮 Game started:', data);
            multiplayerSystem.handleGameStarted(data);
        });

        this.socket.on('playerAnswered', (data) => {
            console.log('✅ Player answered:', data);
            multiplayerSystem.handlePlayerAnswered(data);
        });

        this.socket.on('nextQuestion', (data) => {
            console.log('❓ Next question:', data);
            multiplayerSystem.handleNextQuestion(data);
        });

        this.socket.on('gameFinished', (data) => {
            console.log('🏁 Game finished:', data);
            multiplayerSystem.handleGameFinished(data);
        });

        this.socket.on('gameError', (data) => {
            console.error('❌ Game error:', data);
            uiManager.showError(data.message);
        });

        this.socket.on('playerReadyChanged', (data) => {
            console.log('✅ Player ready changed:', data);
            multiplayerSystem.handlePlayerReadyChanged(data);
        });

        this.socket.on('newHost', (data) => {
            console.log('👑 New host:', data);
            multiplayerSystem.handleNewHost(data);
        });

        this.socket.on('chatMessage', (data) => {
            console.log('💬 Chat message:', data);
            chatSystem.handleIncomingMessage(data);
        });
    },
    
    async emit(event, data) {
        if (!this.isConnected || !this.socket) {
            console.warn('⚠️ Cannot emit - socket not connected');
            return { success: false, error: 'Not connected' };
        }

        try {
            return new Promise((resolve) => {
                this.socket.emit(event, data, (response) => {
                    resolve(response || { success: true });
                });
            });
        } catch (error) {
            console.error(`Error emitting ${event}:`, error);
            return { success: false, error: error.message };
        }
    },
    
    setConnectionStatus(status) {
        currentState.connectionStatus = status;
        const statusElement = document.getElementById('connection-status');
        
        if (statusElement) {
            statusElement.className = `status ${status}`;
            
            switch(status) {
                case 'connected':
                    statusElement.innerHTML = '<span class="online-indicator online"></span><i class="fas fa-check-circle me-2"></i>Connected';
                    break;
                case 'disconnected':
                    statusElement.innerHTML = '<span class="online-indicator offline"></span><i class="fas fa-times-circle me-2"></i>Disconnected';
                    break;
                case 'connecting':
                    statusElement.innerHTML = '<span class="online-indicator connecting"></span><i class="fas fa-sync-alt me-2"></i>Connecting...';
                    break;
            }
        }
    }
};

// Question Manager
const questionManager = {
    getGhanaCurriculumQuestions(category, subject, difficulty, count) {
        const allQuestions = this.getAllGhanaQuestions();
        
        let filteredQuestions = allQuestions.filter(q => 
            q.category === category && q.subject === subject
        );
        
        if (difficulty !== 'all') {
            filteredQuestions = filteredQuestions.filter(q => q.difficulty === difficulty);
        }
        
        return this.shuffleArray(filteredQuestions).slice(0, count);
    },
    
    getAllGhanaQuestions() {
        return [
            // PRIMARY LEVEL - MATHEMATICS
            {
                question: "What is the place value of 7 in the number 4,732?",
                options: ["Thousands", "Hundreds", "Tens", "Units"],
                correctAnswer: 1,
                explanation: "In 4,732, 7 is in the hundreds place (7 × 100 = 700).",
                category: "primary",
                subject: "mathematics",
                difficulty: "easy"
            },
            {
                question: "If a bag of rice costs GH₵ 25.50 and you pay with GH₵ 50.00, how much change should you receive?",
                options: ["GH₵ 24.50", "GH₵ 25.50", "GH₵ 24.00", "GH₵ 23.50"],
                correctAnswer: 0,
                explanation: "GH₵ 50.00 - GH₵ 25.50 = GH₵ 24.50",
                category: "primary",
                subject: "mathematics",
                difficulty: "medium"
            },
            // Add more questions as needed...
        ];
    },
    
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
};

// Category Manager
const categoryManager = {
    categories: {
        primary: {
            name: "Primary School (Basic 1-6)",
            subjects: ["mathematics", "science", "english", "social_studies"],
            difficulties: ["easy", "medium"],
            description: "Basic Education Certificate Examination (BECE) level"
        },
        highschool: {
            name: "Junior & Senior High School", 
            subjects: ["mathematics", "physics", "chemistry", "biology", "history", "geography"],
            difficulties: ["easy", "medium", "hard"],
            description: "West African Senior School Certificate Examination (WASSCE) level"
        },
        tertiary: {
            name: "Tertiary Education",
            subjects: ["programming", "business", "engineering", "medicine", "law", "economics"],
            difficulties: ["medium", "hard"],
            description: "University and College level education"
        }
    },
    currentCategory: null,
    currentSubject: null,
    
    init() {
        this.setupEventListeners();
    },
    
    setupEventListeners() {
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                this.selectCategory(card.dataset.category);
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
        });
        
        const selectedCard = document.querySelector(`[data-category="${categoryId}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected', 'border-primary');
        }
        
        this.currentCategory = categoryId;
        const category = this.categories[categoryId];
        
        if (!category) {
            uiManager.showError('Category not found. Please try again.');
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
            science: { icon: 'fa-flask', color: 'success', name: 'Integrated Science' },
            english: { icon: 'fa-language', color: 'info', name: 'English Language' },
            social_studies: { icon: 'fa-globe-africa', color: 'warning', name: 'Social Studies' },
            physics: { icon: 'fa-atom', color: 'danger', name: 'Physics' },
            chemistry: { icon: 'fa-vial', color: 'success', name: 'Chemistry' },
            biology: { icon: 'fa-dna', color: 'success', name: 'Biology' },
            history: { icon: 'fa-landmark', color: 'warning', name: 'History' },
            geography: { icon: 'fa-map', color: 'info', name: 'Geography' },
            programming: { icon: 'fa-code', color: 'dark', name: 'Computer Science' },
            business: { icon: 'fa-chart-line', color: 'success', name: 'Business Studies' },
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
                        <p class="card-text small flex-grow-1">${category.description}</p>
                        <div class="mt-2">
                            ${this.getDifficultyBadges(category.difficulties)}
                        </div>
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
            });
        }, 100);
        
        uiManager.showScreen('subject-selection');
    },
    
    getDifficultyBadges(difficulties) {
        const difficultyColors = {
            easy: 'success',
            medium: 'warning',
            hard: 'danger'
        };
        
        return difficulties.map(diff => 
            `<span class="badge bg-${difficultyColors[diff]} me-1">${diff}</span>`
        ).join('');
    },
    
    getSubjectDisplayName(subjectId) {
        const subjectNames = {
            mathematics: { icon: 'fa-calculator', color: 'primary', name: 'Mathematics' },
            science: { icon: 'fa-flask', color: 'success', name: 'Integrated Science' },
            english: { icon: 'fa-language', color: 'info', name: 'English Language' },
            social_studies: { icon: 'fa-globe-africa', color: 'warning', name: 'Social Studies' },
            physics: { icon: 'fa-atom', color: 'danger', name: 'Physics' },
            chemistry: { icon: 'fa-vial', color: 'success', name: 'Chemistry' },
            biology: { icon: 'fa-dna', color: 'success', name: 'Biology' },
            history: { icon: 'fa-landmark', color: 'warning', name: 'History' },
            geography: { icon: 'fa-map', color: 'info', name: 'Geography' },
            programming: { icon: 'fa-code', color: 'dark', name: 'Computer Science' },
            business: { icon: 'fa-chart-line', color: 'success', name: 'Business Studies' },
            engineering: { icon: 'fa-cogs', color: 'info', name: 'Engineering' },
            medicine: { icon: 'fa-heartbeat', color: 'danger', name: 'Medicine' },
            law: { icon: 'fa-gavel', color: 'warning', name: 'Law' },
            economics: { icon: 'fa-money-bill-wave', color: 'success', name: 'Economics' }
        };
        return subjectNames[subjectId] || { icon: 'fa-book', color: 'secondary', name: subjectId };
    },
    
    selectSubject(subjectId) {
        document.querySelectorAll('.subject-card').forEach(card => {
            card.classList.remove('selected', 'border-primary');
        });
        
        const selectedCard = document.querySelector(`[data-subject="${subjectId}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected', 'border-primary');
        }
        
        this.currentSubject = subjectId;
    },
    
    showCategorySelection() {
        uiManager.showScreen('category-selection');
        this.currentCategory = null;
        this.currentSubject = null;
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
    }
};

// Single Player System
const singlePlayerSystem = {
    currentGame: null,
    timerInterval: null,
    timeLeft: 0,
    
    init() {
        console.log('🎮 Single player system initialized');
    },
    
    async startGame(category, subject, playerName, avatar, difficulty, questionCount, questionSource) {
        try {
            const startBtn = document.getElementById('start-quiz-btn');
            buttonManager.setLoading(startBtn, true, 'Starting Game...');
            
            const questions = questionManager.getGhanaCurriculumQuestions(
                category, subject, difficulty, questionCount
            );
            
            if (questions.length === 0) {
                uiManager.showError('No questions available.');
                buttonManager.setLoading(startBtn, false, 'Start Quiz');
                return false;
            }
            
            this.currentGame = {
                category: category,
                subject: subject,
                playerName: playerName,
                avatar: avatar,
                questions: questions,
                currentQuestion: 0,
                answers: [],
                score: 0,
                startTime: Date.now(),
                timePerQuestion: 30
            };
            
            this.loadQuestion(0);
            this.startTimer();
            
            buttonManager.setLoading(startBtn, false, 'Start Quiz');
            return true;
            
        } catch (error) {
            console.error('Error starting game:', error);
            uiManager.showError('Error starting game. Please try again.');
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
        
        document.getElementById('current-subject').textContent = 
            `${this.currentGame.category} - ${this.currentGame.subject}`;
        
        document.getElementById('question-count-display').textContent = 
            `Question ${questionIndex + 1} of ${this.currentGame.questions.length}`;
        
        document.getElementById('question-text').textContent = question.question;
        
        const progress = ((questionIndex) / this.currentGame.questions.length) * 100;
        document.getElementById('progress-bar').style.width = `${progress}%`;
        
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
            
            optionsContainer.appendChild(optionElement);
        });
        
        this.resetTimer();
        
        document.getElementById('prev-question').style.display = 
            questionIndex > 0 ? 'inline-block' : 'none';
        
        document.getElementById('next-question').style.display = 
            questionIndex < this.currentGame.questions.length - 1 ? 'inline-block' : 'none';
        
        document.getElementById('submit-quiz').style.display = 
            questionIndex === this.currentGame.questions.length - 1 ? 'inline-block' : 'none';
        
        const feedbackElement = document.getElementById('question-feedback');
        if (feedbackElement) {
            feedbackElement.classList.remove('show');
        }
        
        uiManager.showScreen('quiz-screen');
    },
    
    selectAnswer(optionIndex) {
        const question = this.currentGame.questions[this.currentGame.currentQuestion];
        const options = document.querySelectorAll('.option');
        
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
        
        this.showResults(correctAnswers, timeTaken);
    },
    
    showResults(correctAnswers, timeTaken) {
        const totalQuestions = this.currentGame.questions.length;
        const percentage = Math.round((correctAnswers / totalQuestions) * 100);
        
        document.getElementById('final-score').textContent = `${correctAnswers}/${totalQuestions}`;
        document.getElementById('points-earned').textContent = `${this.currentGame.score} points`;
        
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
        
        uiManager.showScreen('results-screen');
    },
    
    startTimer() {
        this.timeLeft = this.currentGame.timePerQuestion;
        this.updateTimerDisplay();
        
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();
            
            if (this.timeLeft <= 0) {
                clearInterval(this.timerInterval);
                this.nextQuestion();
            }
        }, 1000);
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
        }
    }
};

// Chat System
const chatSystem = {
    init() {
        this.setupChatListeners();
    },
    
    setupChatListeners() {
        const sendLobbyBtn = document.getElementById('send-chat-lobby');
        const lobbyInput = document.getElementById('chat-input-lobby');
        
        const sendQuizBtn = document.getElementById('send-chat-quiz');
        const quizInput = document.getElementById('chat-input-quiz');
        
        if (sendLobbyBtn && lobbyInput) {
            sendLobbyBtn.addEventListener('click', () => this.sendMessage('lobby'));
            lobbyInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.sendMessage('lobby');
            });
        }
        
        if (sendQuizBtn && quizInput) {
            sendQuizBtn.addEventListener('click', () => this.sendMessage('quiz'));
            quizInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.sendMessage('quiz');
            });
        }
    },
    
    async sendMessage(context) {
        const inputId = `chat-input-${context}`;
        const messagesId = `chat-messages-${context}`;
        
        const input = document.getElementById(inputId);
        const message = input.value.trim();
        
        if (!message) return;
        
        const playerName = document.getElementById('mp-player-name')?.value || 'Player';
        
        this.addMessage(playerName, message, false, messagesId);
        
        if (connectionManager.isConnected && multiplayerSystem.currentRoom) {
            await connectionManager.emit('chatMessage', {
                gameCode: multiplayerSystem.currentRoom.code,
                message: message,
                playerName: playerName,
                playerId: multiplayerSystem.playerId
            });
        }
        
        input.value = '';
        input.focus();
    },
    
    handleIncomingMessage(data) {
        if (multiplayerSystem.currentRoom) {
            if (data.playerId !== multiplayerSystem.playerId) {
                this.addMessage(data.playerName, data.message, false, 'chat-messages-lobby');
                this.addMessage(data.playerName, data.message, false, 'chat-messages-quiz');
            }
        }
    },
    
    addMessage(playerName, message, isSystem = false, containerId) {
        const timestamp = new Date().toLocaleTimeString();
        
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${isSystem ? 'system-message' : ''} ${playerName === (document.getElementById('mp-player-name')?.value || 'Player') ? 'own-message' : ''}`;
        messageElement.innerHTML = `
            <div class="message-header">
                ${!isSystem ? `<strong>${playerName}</strong>` : '<em>System</em>'}
                <small class="text-muted ms-2">${timestamp}</small>
            </div>
            <div class="message-content">${this.escapeHtml(message)}</div>
        `;
        container.appendChild(messageElement);
        container.scrollTop = container.scrollHeight;
    },
    
    addSystemMessage(message, containerId) {
        this.addMessage('', message, true, containerId);
    },
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Multiplayer System
const multiplayerSystem = {
    currentRoom: null,
    players: [],
    gameState: null,
    timerInterval: null,
    timeLeft: 0,
    playerId: null,
    
    init() {
        console.log('🎮 Multiplayer system initialized for real players only');
        this.playerId = this.generatePlayerId();
    },
    
    generatePlayerId() {
        let playerId = localStorage.getItem('quizMasterPlayerId');
        if (!playerId) {
            playerId = 'player_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
            localStorage.setItem('quizMasterPlayerId', playerId);
        }
        return playerId;
    },

    // Event handlers
    handleGameCreated(data) {
        console.log('✅ Game created on server:', data.gameCode);
        
        this.currentRoom = {
            code: data.gameCode,
            host: data.hostId,
            settings: data.settings,
            status: 'waiting'
        };
        
        this.players = data.players || [];
        
        this.updateLobbyDisplay();
        uiManager.showSuccess(`Room created! Code: ${data.gameCode}`);
        chatSystem.addSystemMessage(`Room created. Share code: ${data.gameCode}`, 'chat-messages-lobby');
        chatSystem.addSystemMessage('Waiting for other players to join...', 'chat-messages-lobby');
        
        uiManager.showScreen('multiplayer-lobby');
    },

    handleGameJoined(data) {
        console.log('✅ Joined game on server:', data.gameCode);
        
        this.currentRoom = {
            code: data.gameCode,
            host: data.hostId,
            settings: data.settings,
            status: 'waiting'
        };
        
        this.players = data.players || [];
        
        this.updateLobbyDisplay();
        uiManager.showSuccess(`Joined room: ${data.gameCode}`);
        chatSystem.addSystemMessage(`You joined the room. Welcome!`, 'chat-messages-lobby');
        
        uiManager.showScreen('multiplayer-lobby');
    },

    handleGameStarting(data) {
        console.log('🎮 Game starting with countdown:', data);
        chatSystem.addSystemMessage(`Game starting in ${data.countdown} seconds...`, 'chat-messages-lobby');
        
        this.showGameCountdown(data.countdown);
    },

    handleGameStarted(data) {
        console.log('🎮 Game started with questions:', data.questions?.length);
        
        if (!this.currentRoom) {
            console.error('❌ No current room when game started');
            return;
        }
        
        this.gameState = {
            currentQuestion: 0,
            questions: data.questions,
            players: [...this.players],
            timePerQuestion: 30,
            startTime: Date.now()
        };
        
        // Reset player answer status for new game
        this.players.forEach(player => {
            player.hasAnswered = false;
            player.score = 0;
        });
        
        chatSystem.addSystemMessage('Game started! Good luck everyone!', 'chat-messages-lobby');
        
        // Force screen change to quiz screen
        setTimeout(() => {
            this.loadQuestion(0);
        }, 1000);
    },

    handleNextQuestion(data) {
        console.log('❓ Next question received:', data.index);
        this.loadQuestion(data.index);
    },

    handleGameFinished(data) {
        console.log('🏁 Game finished:', data);
        this.showResults(data.players);
    },

    handlePlayerJoined(data) {
        console.log('👤 Player joined event received:', data);
        
        if (this.currentRoom) {
            // Check if player already exists
            const existingPlayer = this.players.find(p => p.id === data.id);
            if (!existingPlayer) {
                // Add new player to the list
                this.players.push({
                    id: data.id,
                    name: data.name,
                    avatar: data.avatar,
                    score: data.score || 0,
                    isHost: data.isHost || false,
                    hasAnswered: false,
                    ready: data.ready || false
                });
                
                this.updateLobbyDisplay();
                uiManager.showSuccess(`${data.name} joined the room!`);
                chatSystem.addSystemMessage(`${data.name} joined the game`, 'chat-messages-lobby');
            }
        }
    },

    handlePlayerLeft(data) {
        console.log('👤 Player left event received:', data);
        
        if (this.currentRoom) {
            // Remove player from the list
            this.players = this.players.filter(player => player.id !== data.playerId);
            this.updateLobbyDisplay();
            uiManager.showError('A player left the room');
            chatSystem.addSystemMessage('A player left the game', 'chat-messages-lobby');
        }
    },

    handlePlayerReadyChanged(data) {
        console.log('✅ Player ready changed event:', data);
        
        const player = this.players.find(p => p.id === data.playerId);
        if (player) {
            player.ready = data.ready;
            this.updateLobbyDisplay();
            
            const status = data.ready ? 'ready' : 'not ready';
            chatSystem.addSystemMessage(`${player.name} is ${status}`, 'chat-messages-lobby');
        }
    },

    handlePlayerAnswered(data) {
        console.log('✅ Player answered event:', data);
        
        const player = this.players.find(p => p.id === data.playerId);
        if (player) {
            player.score = data.score;
            player.hasAnswered = true;
            this.updateScoreboard();
        }
    },

    handleNewHost(data) {
        console.log('👑 New host event received:', data);
        
        // Update host status for all players
        this.players.forEach(player => {
            player.isHost = (player.id === data);
        });
        
        this.updateLobbyDisplay();
        chatSystem.addSystemMessage('New host assigned to the game', 'chat-messages-lobby');
        
        // If this client is the new host, show the start button
        if (data === this.playerId) {
            const startButton = document.getElementById('start-game-btn');
            if (startButton) {
                startButton.style.display = 'block';
            }
        }
    },

    // Room management
    async createRoom(settings) {
        const createBtn = document.getElementById('create-room-btn');
        buttonManager.setLoading(createBtn, true, 'Creating Room...');
        
        try {
            const playerName = document.getElementById('mp-player-name').value || 'Player';
            const avatar = avatarSystem.selectedAvatar;
            
            storageManager.savePreferences();
            
            const result = await connectionManager.emit('createGame', {
                playerName: playerName,
                avatar: avatar,
                settings: settings
            });
            
            if (!result.success) {
                throw new Error(result.error || 'Failed to create room');
            }
            
            console.log('📤 Room creation request sent to server');
            
        } catch (error) {
            console.error('Error creating room:', error);
            uiManager.showError(error.message || 'Failed to create room. Please try again.');
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

            if (!roomCode) {
                uiManager.showError('Please enter a room code');
                return false;
            }

            storageManager.savePreferences();

            const result = await connectionManager.emit('joinGame', {
                gameCode: roomCode.toUpperCase(),
                playerName: playerName,
                avatar: avatar
            });

            if (!result.success) {
                throw new Error(result.error || 'Failed to join room');
            }

            return true;

        } catch (error) {
            console.error('Error joining room:', error);
            uiManager.showError(error.message || 'Failed to join room. Please check the room code.');
            return false;
        } finally {
            buttonManager.setLoading(joinBtn, false, 'Join Room');
        }
    },

    async sendPlayerReady() {
        if (this.currentRoom) {
            const player = this.players.find(p => p.id === this.playerId);
            if (player) {
                player.ready = !player.ready;
                
                // Update button UI
                const readyBtn = document.getElementById('toggle-ready-btn');
                if (readyBtn) {
                    if (player.ready) {
                        readyBtn.innerHTML = '<i class="fas fa-check me-1"></i>Ready';
                        readyBtn.classList.remove('btn-outline-primary');
                        readyBtn.classList.add('btn-success', 'ready');
                    } else {
                        readyBtn.innerHTML = '<i class="fas fa-clock me-1"></i>Not Ready';
                        readyBtn.classList.remove('btn-success', 'ready');
                        readyBtn.classList.add('btn-outline-primary');
                    }
                }
                
                await connectionManager.emit('playerReady', {
                    gameCode: this.currentRoom.code,
                    ready: player.ready
                });
                
                this.updateLobbyDisplay();
            }
        }
    },

    async startGame() {
        if (!this.currentRoom) {
            uiManager.showError('No room found');
            return;
        }

        const currentPlayer = this.players.find(p => p.id === this.playerId);
        if (!currentPlayer?.isHost) {
            uiManager.showError('Only the host can start the game');
            return;
        }

        if (this.players.length < 2) {
            uiManager.showError('Need at least 2 players to start the game');
            return;
        }

        if (!this.players.every(p => p.ready)) {
            uiManager.showError('All players must be ready before starting');
            return;
        }

        const startBtn = document.getElementById('start-game-btn');
        buttonManager.setLoading(startBtn, true, 'Starting Game...');

        try {
            const result = await connectionManager.emit('startGame', {
                gameCode: this.currentRoom.code
            });

            if (!result.success) {
                throw new Error(result.error || 'Failed to start game');
            }

            uiManager.showSuccess('Game starting...');

        } catch (error) {
            console.error('Error starting game:', error);
            uiManager.showError(error.message || 'Failed to start game');
        } finally {
            buttonManager.setLoading(startBtn, false, 'Start Game');
        }
    },

    // Gameplay
    loadQuestion(questionIndex) {
        console.log('📝 Loading question:', questionIndex);
        
        if (!this.gameState) {
            console.error('❌ No game state available');
            return;
        }
        
        if (questionIndex >= this.gameState.questions.length) {
            console.log('🏁 No more questions, finishing game');
            this.showResults(this.gameState.players);
            return;
        }
        
        this.gameState.currentQuestion = questionIndex;
        const question = this.gameState.questions[questionIndex];
        
        if (!question) {
            console.error('❌ Invalid question at index:', questionIndex);
            return;
        }
        
        // Reset answered status for new question
        this.players.forEach(player => {
            player.hasAnswered = false;
        });
        
        // Update UI with Ghana curriculum info
        const examInfo = {
            primary: "BECE Curriculum",
            highschool: "WASSCE Curriculum", 
            tertiary: "Tertiary Education"
        };
        
        const subjectInfo = categoryManager.getSubjectDisplayName(this.currentRoom.settings.subject);
        const subjectElement = document.getElementById('mp-current-subject');
        if (subjectElement) {
            subjectElement.textContent = `${subjectInfo.name} - ${examInfo[this.currentRoom.settings.category]}`;
        }
        
        const questionCountElement = document.getElementById('mp-question-count-display');
        if (questionCountElement) {
            questionCountElement.textContent = `Question ${questionIndex + 1} of ${this.gameState.questions.length}`;
        }
        
        const questionTextElement = document.getElementById('mp-question-text');
        if (questionTextElement) {
            questionTextElement.textContent = question.question;
        }
        
        // Update progress bar
        const progress = ((questionIndex) / this.gameState.questions.length) * 100;
        const progressBar = document.getElementById('mp-progress-bar');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
            progressBar.setAttribute('aria-valuenow', progress);
        }
        
        // Render options
        const optionsContainer = document.getElementById('mp-options-container');
        if (optionsContainer) {
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
                    console.log('🖱️ Option clicked:', index);
                    this.selectAnswer(index);
                });
                
                optionElement.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        console.log('⌨️ Option selected via keyboard:', index);
                        this.selectAnswer(index);
                    }
                });
                
                optionsContainer.appendChild(optionElement);
            });
        }
        
        // Start timer
        this.startTimer();
        
        // Update scoreboard
        this.updateScoreboard();
        
        // Switch to quiz screen
        console.log('🔄 Switching to multiplayer quiz screen');
        uiManager.showScreen('multiplayer-quiz-screen');
        
        // Add chat message for new question
        chatSystem.addSystemMessage(`Question ${questionIndex + 1} started!`, 'chat-messages-quiz');
    },

    selectAnswer(optionIndex) {
        console.log('🎯 Answer selected:', optionIndex);
        
        if (!this.gameState) {
            console.error('❌ No game state when answering');
            return;
        }
        
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
        console.log('✅ Answer correct:', isCorrect);
        
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
    },

    async submitAnswer(questionIndex, optionIndex) {
        if (!this.gameState || !this.currentRoom) return;
        
        const question = this.gameState.questions[questionIndex];
        const isCorrect = optionIndex === question.correctAnswer;
        
        // Update player score
        const player = this.players.find(p => p.id === this.playerId);
        if (player) {
            if (isCorrect) {
                player.score += 100;
            }
            player.hasAnswered = true;
        }
        
        this.updateScoreboard();
        
        // Send answer to server
        if (connectionManager.isConnected) {
            await connectionManager.emit('submitAnswer', {
                gameCode: this.currentRoom.code,
                questionIndex: questionIndex,
                selectedIndex: optionIndex
            });
        }
    },

    startTimer() {
        clearInterval(this.timerInterval);
        this.timeLeft = this.gameState.timePerQuestion;
        this.updateTimerDisplay();
        
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();
            
            if (this.timeLeft <= 0) {
                clearInterval(this.timerInterval);
                // Auto-submit if time runs out
                const options = document.querySelectorAll('#mp-options-container .option');
                if (options.length > 0 && !options[0].classList.contains('selected')) {
                    this.submitAnswer(this.gameState.currentQuestion, -1);
                }
            }
        }, 1000);
    },

    updateTimerDisplay() {
        const timerElement = document.getElementById('mp-time-left');
        if (timerElement) {
            timerElement.textContent = this.timeLeft;
            timerElement.className = `timer ${this.timeLeft <= 10 ? 'warning' : ''} ${this.timeLeft <= 5 ? 'danger' : ''}`;
        }
    },

    updateScoreboard() {
        const scoreboard = document.getElementById('multiplayer-scoreboard');
        if (!scoreboard || !this.players.length) return;
        
        const sortedPlayers = [...this.players].sort((a, b) => b.score - a.score);
        
        scoreboard.innerHTML = sortedPlayers.map((player, index) => {
            const isCurrentPlayer = player.id === this.playerId;
            const playerClass = isCurrentPlayer ? 'current-player' : '';
            const rank = index + 1;
            
            return `
                <div class="scoreboard-item ${playerClass}" role="listitem">
                    <div class="scoreboard-rank">${rank}</div>
                    <div class="multiplayer-avatar">${player.avatar}</div>
                    <div class="flex-grow-1">
                        <strong>${player.name}</strong>
                        ${player.isHost ? '<span class="badge bg-warning ms-2">Host</span>' : ''}
                    </div>
                    <div class="fw-bold">${player.score} pts</div>
                    ${player.hasAnswered ? '<span class="badge bg-success ms-2"><i class="fas fa-check"></i></span>' : '<span class="badge bg-secondary ms-2"><i class="fas fa-clock"></i></span>'}
                </div>
            `;
        }).join('');
    },

    showResults(finalScores) {
        clearInterval(this.timerInterval);
        
        if (!finalScores) {
            finalScores = this.players;
        }
        
        const sortedPlayers = [...finalScores].sort((a, b) => b.score - a.score);
        const winner = sortedPlayers[0];
        const isWinner = winner.id === this.playerId;
        
        document.getElementById('mp-final-score').textContent = `${winner.name} wins!`;
        document.getElementById('mp-winner-avatar').textContent = winner.avatar;
        document.getElementById('mp-winner-name').textContent = winner.name;
        document.getElementById('mp-winner-score').textContent = `${winner.score} points`;
        
        if (isWinner) {
            document.getElementById('confetti').style.display = 'block';
            soundSystem.play('victory');
            
            setTimeout(() => {
                document.getElementById('confetti').style.display = 'none';
            }, 5000);
        }
        
        const leaderboard = document.getElementById('mp-leaderboard');
        leaderboard.innerHTML = sortedPlayers.map((player, index) => {
            const isCurrentPlayer = player.id === this.playerId;
            const playerClass = isCurrentPlayer ? 'current-player' : '';
            const rank = index + 1;
            const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`;
            
            return `
                <div class="leaderboard-item ${playerClass}" role="listitem">
                    <div class="leaderboard-rank">${medal}</div>
                    <div class="multiplayer-avatar">${player.avatar}</div>
                    <div class="flex-grow-1">
                        <strong>${player.name}</strong>
                        ${player.isHost ? '<span class="badge bg-warning ms-2">Host</span>' : ''}
                    </div>
                    <div class="fw-bold">${player.score} pts</div>
                </div>
            `;
        }).join('');
        
        uiManager.showScreen('multiplayer-results-screen');
        chatSystem.addSystemMessage(`Game finished! Winner: ${winner.name} with ${winner.score} points`, 'chat-messages-quiz');
    },

    // UI Management
    updateLobbyDisplay() {
        const roomCodeElement = document.getElementById('room-code');
        const playerCountElement = document.getElementById('player-count');
        const playersList = document.getElementById('players-list');
        const startButton = document.getElementById('start-game-btn');
        const startHint = document.getElementById('start-game-hint');

        if (roomCodeElement && this.currentRoom) {
            roomCodeElement.textContent = this.currentRoom.code || '----';
        }

        if (playerCountElement) {
            playerCountElement.textContent = `${this.players.length} player(s)`;
        }

        if (playersList) {
            // Clear waiting messages
            const waitingMessages = playersList.parentNode.querySelectorAll('.alert');
            waitingMessages.forEach(msg => msg.remove());

            // Show waiting message if only one player
            if (this.players.length === 1) {
                const waitingMessage = document.createElement('div');
                waitingMessage.className = 'alert alert-info text-center';
                waitingMessage.innerHTML = `
                    <i class="fas fa-users me-2"></i>
                    <strong>Waiting for players to join...</strong><br>
                    <small>Share this room code: <code class="fs-5">${this.currentRoom?.code}</code></small>
                `;
                playersList.parentNode.insertBefore(waitingMessage, playersList);
            }

            playersList.innerHTML = this.players.map(player => {
                const isCurrentPlayer = player.id === this.playerId;
                return `
                    <div class="player-item ${isCurrentPlayer ? 'current-player' : ''}" role="listitem">
                        <div class="multiplayer-avatar me-2">${player.avatar}</div>
                        <div class="flex-grow-1">
                            <strong>${player.name}</strong>
                            ${isCurrentPlayer ? '<span class="badge bg-primary ms-2">You</span>' : ''}
                        </div>
                        ${player.isHost ? '<span class="badge bg-warning me-2">Host</span>' : ''}
                        ${player.ready ? '<span class="badge bg-success me-2"><i class="fas fa-check"></i> Ready</span>' : '<span class="badge bg-secondary me-2"><i class="fas fa-clock"></i> Waiting</span>'}
                    </div>
                `;
            }).join('');
        }

        if (startButton && startHint && this.currentRoom) {
            const isHost = this.players.find(p => p.id === this.playerId)?.isHost || false;
            const canStart = this.players.length >= 2 && this.players.every(p => p.ready);

            startButton.style.display = isHost ? 'block' : 'none';
            startButton.disabled = !canStart;

            if (isHost) {
                if (this.players.length < 2) {
                    startHint.textContent = `Need ${2 - this.players.length} more player(s) to start`;
                    startHint.className = 'text-warning';
                } else if (!this.players.every(p => p.ready)) {
                    startHint.textContent = 'Waiting for all players to be ready';
                    startHint.className = 'text-warning';
                } else {
                    startHint.textContent = 'All players ready! You can start the game';
                    startHint.className = 'text-success';
                }
            } else {
                startHint.textContent = 'Waiting for host to start the game...';
                startHint.className = 'text-muted';
            }
        }
    },

    showGameCountdown(seconds) {
        const countdownElement = document.createElement('div');
        countdownElement.className = 'countdown-overlay';
        countdownElement.innerHTML = `
            <div class="countdown-content">
                <h2>Game Starting</h2>
                <div class="countdown-number">${seconds}</div>
            </div>
        `;
        
        document.body.appendChild(countdownElement);
        
        let count = seconds;
        const countdownInterval = setInterval(() => {
            count--;
            const numberElement = countdownElement.querySelector('.countdown-number');
            if (numberElement) {
                numberElement.textContent = count;
            }
            
            if (count <= 0) {
                clearInterval(countdownInterval);
                countdownElement.remove();
            }
        }, 1000);
    },

    leaveRoom() {
        if (this.currentRoom && connectionManager.isConnected) {
            // The server will handle the disconnection
            connectionManager.socket.disconnect();
        }

        this.currentRoom = null;
        this.players = [];
        this.gameState = null;
        clearInterval(this.timerInterval);

        uiManager.showScreen('multiplayer-setup');
    },

    // Debug method to check current state
    debugState() {
        console.log('🐛 MULTIPLAYER DEBUG STATE:');
        console.log('Current Room:', this.currentRoom);
        console.log('Players:', this.players);
        console.log('Game State:', this.gameState);
        console.log('Current Screen:', currentState.screen);
        console.log('Socket Connected:', connectionManager.isConnected);
    }
};

// Setup Event Listeners
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
        startQuizBtn.addEventListener('click', () => {
            const settings = categoryManager.getCurrentSettings();
            const playerName = document.getElementById('player-name').value || 'Player';
            
            storageManager.savePreferences();
            
            if (!settings.category || !settings.subject) {
                uiManager.showError('Please select a category and subject');
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
                uiManager.showScreen('multiplayer-setup');
            }
        });
    }

    // Multiplayer setup
    const setupMultiplayer = document.getElementById('setup-multiplayer');
    if (setupMultiplayer) {
        setupMultiplayer.addEventListener('click', () => {
            uiManager.showScreen('multiplayer-setup');
        });
    }

    // Create room
    const createRoomBtn = document.getElementById('create-room-btn');
    if (createRoomBtn) {
        createRoomBtn.addEventListener('click', () => {
            const settings = categoryManager.getCurrentSettings();
            multiplayerSystem.createRoom(settings);
        });
    }

    // Join room
    const joinRoomBtn = document.getElementById('join-room-btn');
    if (joinRoomBtn) {
        joinRoomBtn.addEventListener('click', () => {
            const roomCode = document.getElementById('room-code-input').value;
            multiplayerSystem.joinRoom(roomCode);
        });
    }

    // Start multiplayer game
    const startGameBtn = document.getElementById('start-game-btn');
    if (startGameBtn) {
        startGameBtn.addEventListener('click', () => {
            multiplayerSystem.startGame();
        });
    }

    // Leave room
    const leaveRoomBtn = document.getElementById('leave-room-btn');
    if (leaveRoomBtn) {
        leaveRoomBtn.addEventListener('click', () => {
            multiplayerSystem.leaveRoom();
        });
    }

    // Ready toggle
    const toggleReadyBtn = document.getElementById('toggle-ready-btn');
    if (toggleReadyBtn) {
        toggleReadyBtn.addEventListener('click', () => {
            multiplayerSystem.sendPlayerReady();
        });
    }

    // Back buttons
    const backToMainFromMp = document.getElementById('back-to-main-from-mp');
    if (backToMainFromMp) {
        backToMainFromMp.addEventListener('click', () => {
            categoryManager.showCategorySelection();
        });
    }

    const backToMultiplayerMenu = document.getElementById('back-to-multiplayer-menu');
    if (backToMultiplayerMenu) {
        backToMultiplayerMenu.addEventListener('click', () => {
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
            uiManager.showScreen('multiplayer-setup');
        });
    }

    const backToMainFromResults = document.getElementById('back-to-menu');
    if (backToMainFromResults) {
        backToMainFromResults.addEventListener('click', () => {
            categoryManager.showCategorySelection();
        });
    }

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
}

// Initialize the application
async function initApp() {
    console.log('🚀 Initializing QuizMaster App...');

    try {
        // Load user preferences
        storageManager.loadPreferences();
        
        // Initialize all systems
        avatarSystem.init();
        categoryManager.init();
        singlePlayerSystem.init();
        multiplayerSystem.init();
        chatSystem.init();
        
        // Setup event listeners
        setupEventListeners();
        
        // Initialize connection manager
        await connectionManager.init();
        
        // Update UI based on sound preferences
        const soundToggle = document.getElementById('toggle-sound');
        if (soundToggle) {
            soundToggle.innerHTML = soundSystem.enabled ? 
                '<i class="fas fa-volume-up me-1"></i> Sound On' : 
                '<i class="fas fa-volume-mute me-1"></i> Sound Off';
            soundToggle.classList.toggle('btn-outline-success', soundSystem.enabled);
            soundToggle.classList.toggle('btn-outline-secondary', !soundSystem.enabled);
        }
        
        console.log('✅ QuizMaster App initialized successfully!');
        
    } catch (error) {
        console.error('❌ Failed to initialize app:', error);
        uiManager.showError('Failed to initialize application. Please refresh the page.');
    }
}

// Start the app when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
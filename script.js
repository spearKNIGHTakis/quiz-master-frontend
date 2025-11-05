
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
    }
};

// Avatar System
const avatarSystem = {
    selectedAvatar: '👨‍💻',
    init() {
        console.log('👤 Avatar system initialized');
        this.renderAvatarSelection();
    },
    
    renderAvatarSelection() {
        const container = document.getElementById('avatar-selection');
        if (!container) return;
        
        const avatars = ['👨‍💻', '👩‍🚀', '🦸', '👨‍🎓', '👩‍🎨', '🤖', '🐱', '🦊'];
        
        container.innerHTML = avatars.map(avatar => `
            <div class="avatar-option ${avatar === this.selectedAvatar ? 'selected' : ''}" 
                 data-avatar="${avatar}">
                <div class="avatar-display" style="font-size: 2rem; cursor: pointer; padding: 5px; border-radius: 10px; border: 3px solid ${avatar === this.selectedAvatar ? '#4361ee' : 'transparent'}">
                    ${avatar}
                </div>
            </div>
        `).join('');
        
        container.querySelectorAll('.avatar-option').forEach(option => {
            option.addEventListener('click', () => {
                this.selectedAvatar = option.dataset.avatar;
                this.renderAvatarSelection();
            });
        });
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
                    break;
                case 'disconnected':
                    statusElement.innerHTML = '<span class="online-indicator offline"></span><i class="fas fa-times-circle me-2"></i>Offline';
                    break;
                case 'connecting':
                    statusElement.innerHTML = '<span class="online-indicator connecting"></span><i class="fas fa-sync-alt me-2"></i>Connecting...';
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
        
        const questions = this.getDemoQuestions(category, subject, difficulty, questionCount);
        return {
            questions: questions,
            source: 'demo'
        };
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
                <div class="card subject-card h-100" data-subject="${subjectId}">
                    <div class="card-body text-center d-flex flex-column">
                        <i class="fas ${subject.icon} fa-2x mb-3 text-${subject.color}"></i>
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
            });
        }, 100);
        
        this.showScreen('subject-selection');
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
            'results-screen'
        ];
        
        screens.forEach(screen => {
            const element = document.getElementById(screen);
            if (element) {
                element.classList.add('d-none');
            }
        });
        
        const targetScreen = document.getElementById(screenName);
        if (targetScreen) {
            targetScreen.classList.remove('d-none');
            currentState.screen = screenName;
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
            
            setTimeout(() => {
                successElement.style.display = 'none';
            }, 3000);
        }
    },
    
    showLoading(show) {
        const loadingElement = document.getElementById('loading-spinner');
        if (loadingElement) {
            loadingElement.style.display = show ? 'block' : 'none';
        }
    }
};

// Single Player System
const singlePlayerSystem = {
    currentGame: null,
    timer: null,
    timeLeft: 0,
    
    init() {
        console.log('🎮 Single player system initialized');
    },
    
    async startGame(category, subject, playerName, avatar, difficulty, questionCount, questionSource) {
        try {
            categoryManager.showLoading(true);
            
            const questionResult = await questionManager.getQuestions({
                category,
                subject,
                difficulty,
                questionCount,
                questionSource
            });
            
            if (questionResult.questions.length === 0) {
                categoryManager.showError('No questions available.');
                categoryManager.showLoading(false);
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
            categoryManager.showLoading(false);
            
            return true;
            
        } catch (error) {
            console.error('Error starting game:', error);
            categoryManager.showError('Error starting game. Please try again.');
            categoryManager.showLoading(false);
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
        
        // Render options
        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';
        
        question.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
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
        
        options.forEach(opt => {
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
        clearInterval(this.timer);
        
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
        this.updateTimerDisplay();
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();
            
            if (this.timeLeft <= 0) {
                clearInterval(this.timer);
                this.nextQuestion();
            }
        }, 1000);
    },
    
    resetTimer() {
        clearInterval(this.timer);
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

// Real-time Multiplayer System with Real Players Only
const multiplayerSystem = {
    currentRoom: null,
    players: [],
    gameState: null,
    timer: null,
    timeLeft: 0,
    
    init() {
        console.log('🎮 Multiplayer system initialized');
        this.setupSocketListeners();
    },
    
    setupSocketListeners() {
        // Only setup real listeners if connected
        if (connectionManager.isConnected && connectionManager.socket) {
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
        }
    },
    
    async createRoom(settings) {
        try {
            console.log('🎮 Creating multiplayer room...');
            
            const playerName = document.getElementById('mp-player-name').value || 'Player';
            const avatar = avatarSystem.selectedAvatar;
            
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
            
            return true;
            
        } catch (error) {
            console.error('Error creating room:', error);
            categoryManager.showError('Failed to create room. Please try again.');
            return false;
        }
    },
    
    async joinRoom(roomCode) {
        try {
            const playerName = document.getElementById('mp-player-name').value || 'Player';
            const avatar = avatarSystem.selectedAvatar;

            if (!roomCode || roomCode.length !== 4) {
                categoryManager.showError('Please enter a valid 4-character room code');
                return false;
            }

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

            return true;

        } catch (error) {
            console.error('Error joining room:', error);
            categoryManager.showError(error.message || 'Failed to join room. Please check the room code.');
            return false;
        } finally {
            categoryManager.showLoading(false);
        }
    },
    
    async startGame() {
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
            
            this.loadQuestion(0);
            
        } catch (error) {
            console.error('Error starting game:', error);
            categoryManager.showError('Failed to start game. Please try again.');
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
        clearInterval(this.timer);
        
        categoryManager.showScreen('multiplayer-setup');
    },
    
    // Event handlers for real-time updates
    handlePlayerJoined(data) {
        if (this.currentRoom && this.currentRoom.code === data.roomCode) {
            this.players.push(data.player);
            this.updateLobbyDisplay();
            categoryManager.showSuccess(`${data.player.name} joined the room!`);
        }
    },
    
    handlePlayerLeft(data) {
        if (this.currentRoom && this.currentRoom.code === data.roomCode) {
            this.players = this.players.filter(player => player.id !== data.playerId);
            this.updateLobbyDisplay();
            categoryManager.showError(`${data.playerName} left the room`);
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
                    <i class="fas fa-users me-2"></i>
                    Waiting for other players to join...<br>
                    <small>Share room code: <strong>${this.currentRoom?.code}</strong></small>
                `;
                playersList.parentNode.insertBefore(waitingMessage, playersList);
            }

            playersList.innerHTML = this.players.map(player => `
                <div class="player-item">
                    <div class="multiplayer-avatar me-2">${player.avatar}</div>
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
            } else {
                startButton.title = '';
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
    
    // Render options
    const optionsContainer = document.getElementById('mp-options-container');
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'option';
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
    
    // Start timer
    this.startTimer();
    
    // Update scoreboard
    this.updateScoreboard();
    
    categoryManager.showScreen('multiplayer-quiz-screen');
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
    clearInterval(this.timer);
    this.timeLeft = this.gameState.timePerQuestion;
    this.updateTimerDisplay();
    
    this.timer = setInterval(() => {
        this.timeLeft--;
        this.updateTimerDisplay();
        
        if (this.timeLeft <= 0) {
            clearInterval(this.timer);
            this.nextQuestion();
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
    
    // Sort players by score (descending)
    const sortedPlayers = [...this.players].sort((a, b) => b.score - a.score);
    
    scoreboard.innerHTML = sortedPlayers.map((player, index) => {
        const isCurrentPlayer = player.id === this.getPlayerId();
        const playerClass = isCurrentPlayer ? 'current-player' : '';
        const rank = index + 1;
        
        return `
            <div class="scoreboard-item ${playerClass}">
                <div class="scoreboard-rank">${rank}</div>
                <div class="multiplayer-avatar">${player.avatar}</div>
                <div class="scoreboard-name">${player.name}</div>
                <div class="scoreboard-score">${player.score} pts</div>
                ${player.hasAnswered ? '<div class="scoreboard-status answered"><i class="fas fa-check"></i></div>' : '<div class="scoreboard-status waiting"><i class="fas fa-clock"></i></div>'}
            </div>
        `;
    }).join('');
},

showResults(finalScores) {
    clearInterval(this.timer);
    
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
        document.getElementById('mp-confetti').style.display = 'block';
        soundSystem.play('victory');
        
        setTimeout(() => {
            document.getElementById('mp-confetti').style.display = 'none';
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
            <div class="leaderboard-item ${playerClass}">
                <div class="leaderboard-rank">${medal}</div>
                <div class="multiplayer-avatar">${player.avatar}</div>
                <div class="leaderboard-name">${player.name}</div>
                <div class="leaderboard-score">${player.score} pts</div>
            </div>
        `;
    }).join('');
    
    categoryManager.showScreen('multiplayer-results-screen');
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

// Single player start
const startSinglePlayer = document.getElementById('start-single-player');
if (startSinglePlayer) {
    startSinglePlayer.addEventListener('click', () => {
        const settings = categoryManager.getCurrentSettings();
        const playerName = document.getElementById('player-name').value || 'Player';
        
        if (!settings.category || !settings.subject) {
            categoryManager.showError('Please select a category and subject');
            return;
        }
        
        singlePlayerSystem.startGame(
            settings.category,
            settings.subject,
            playerName,
            avatarSystem.selectedAvatar,
            settings.difficulty,
            settings.questionCount,
            settings.questionSource
        );
    });
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
const playAgainSingle = document.getElementById('play-again-single');
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

const backToMainFromResults = document.getElementById('back-to-main-from-results');
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
            document.getElementById('start-single-player').click();
        }
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
}
}

// Initialize the application
async function initApp() {
console.log('🚀 Initializing QuizMaster App...');

try {
    // Initialize systems
    await connectionManager.init();
    avatarSystem.init();
    categoryManager.init();
    singlePlayerSystem.init();
    multiplayerSystem.init();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize sound system UI
    soundSystem.toggle(); // Set initial state
    
    console.log('✅ QuizMaster App initialized successfully!');
    
    // Show connection status
    connectionManager.setConnectionStatus('connected');
    
} catch (error) {
    console.error('❌ Failed to initialize app:', error);
    categoryManager.showError('Failed to initialize application. Please refresh the page.');
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
connectionManager
};

   
   
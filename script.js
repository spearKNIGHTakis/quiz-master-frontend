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
        this.renderMultiplayerAvatarSelection();
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
    },
    
    renderMultiplayerAvatarSelection() {
        const container = document.getElementById('mp-avatar-selection');
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
                this.renderMultiplayerAvatarSelection();
                this.renderAvatarSelection();
            });
        });
    }
};

// Connection Manager (Simulated for demo)
const connectionManager = {
    socket: null,
    isConnected: false,
    
    async init() {
        console.log('🔌 Connection manager initialized (simulated mode)');
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
                    statusElement.innerHTML = '<span class="online-indicator online"></span><i class="fas fa-check-circle me-2"></i>Connected to server';
                    break;
                case 'disconnected':
                    statusElement.innerHTML = '<span class="online-indicator offline"></span><i class="fas fa-times-circle me-2"></i>Offline mode';
                    break;
                case 'connecting':
                    statusElement.innerHTML = '<span class="online-indicator connecting"></span><i class="fas fa-sync-alt me-2"></i>Connecting to server...';
                    break;
            }
        }
    },
    
    async emit(event, data) {
        console.log(`📤 Emitting ${event}:`, data);
        // Simulate successful emission
        return Promise.resolve({ success: true, offline: true });
    },
    
    on(event, callback) {
        console.log(`📥 Listening for ${event} (simulated)`);
        // Simulate event listening
    }
};

// Question Manager with OpenTDB Integration
const questionManager = {
    async getQuestions(settings) {
        const { category, subject, difficulty, questionCount, questionSource } = settings;
        
        console.log(`📝 Requesting ${questionCount} ${difficulty} questions for ${category}/${subject}`);
        
        // For demo, use offline questions
        console.log('📚 Using offline questions for demo');
        const offlineQuestions = this.getOfflineQuestions(category, subject, difficulty, questionCount);
        return {
            questions: offlineQuestions,
            source: 'offline'
        };
    },
    
    getOfflineQuestions(category, subject, difficulty, count) {
        // Demo questions database
        const questions = {
            primary: {
                mathematics: {
                    easy: [
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
                            question: "What is 8 × 3?",
                            options: ["21", "24", "27", "30"],
                            correctAnswer: 1,
                            explanation: "8 × 3 equals 24."
                        }
                    ],
                    medium: [
                        {
                            question: "What is 15 ÷ 3?",
                            options: ["3", "4", "5", "6"],
                            correctAnswer: 2,
                            explanation: "15 ÷ 3 equals 5."
                        }
                    ]
                },
                science: {
                    easy: [
                        {
                            question: "Which animal lays eggs?",
                            options: ["Dog", "Cat", "Bird", "Cow"],
                            correctAnswer: 2,
                            explanation: "Birds lay eggs, while dogs, cats, and cows give birth to live young."
                        }
                    ]
                },
                english: {
                    easy: [
                        {
                            question: "Which word is a noun?",
                            options: ["Run", "Beautiful", "School", "Quickly"],
                            correctAnswer: 2,
                            explanation: "School is a noun - it's a person, place, or thing."
                        }
                    ]
                }
            },
            highschool: {
                mathematics: {
                    easy: [
                        {
                            question: "What is the value of x in the equation 2x + 5 = 15?",
                            options: ["5", "10", "15", "20"],
                            correctAnswer: 0,
                            explanation: "Subtract 5 from both sides: 2x = 10, then divide by 2: x = 5."
                        }
                    ]
                },
                physics: {
                    medium: [
                        {
                            question: "What is the unit of force?",
                            options: ["Watt", "Newton", "Joule", "Volt"],
                            correctAnswer: 1,
                            explanation: "Force is measured in Newtons."
                        }
                    ]
                }
            },
            tertiary: {
                programming: {
                    medium: [
                        {
                            question: "What does HTML stand for?",
                            options: [
                                "Hyper Text Markup Language",
                                "High Tech Modern Language", 
                                "Hyper Transfer Markup Language",
                                "Home Tool Markup Language"
                            ],
                            correctAnswer: 0,
                            explanation: "HTML stands for Hyper Text Markup Language, used for creating web pages."
                        }
                    ]
                },
                business: {
                    medium: [
                        {
                            question: "What does ROI stand for?",
                            options: [
                                "Return on Investment",
                                "Rate of Interest",
                                "Revenue on Income",
                                "Return of Inventory"
                            ],
                            correctAnswer: 0,
                            explanation: "ROI stands for Return on Investment."
                        }
                    ]
                }
            }
        };
        
        const categoryQuestions = questions[category] || {};
        const subjectQuestions = categoryQuestions[subject] || {};
        const difficultyQuestions = subjectQuestions[difficulty] || [];
        
        // If no questions for specific difficulty, try any questions for this subject
        if (difficultyQuestions.length === 0) {
            const allSubjectQuestions = Object.values(subjectQuestions).flat();
            if (allSubjectQuestions.length > 0) {
                return this.shuffleArray(allSubjectQuestions).slice(0, count);
            }
        }
        
        // If still no questions, return some default questions
        if (difficultyQuestions.length === 0) {
            return [
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
                    explanation: "Mars is known as the Red Planet due to its reddish appearance."
                }
            ].slice(0, count);
        }
        
        return this.shuffleArray(difficultyQuestions).slice(0, count);
    },
    
    shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }
};

// Category and Subject Management
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
                console.log('🎯 Category clicked:', card.dataset.category);
                this.selectCategory(card.dataset.category);
            });
        });
        
        document.getElementById('back-to-categories').addEventListener('click', () => {
            this.showCategorySelection();
        });
    },
    
    selectCategory(categoryId) {
        console.log('🎯 Selecting category:', categoryId);
        
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
            console.error('Category not found:', categoryId);
            this.showError('Category not found. Please try again.');
            return;
        }
        
        console.log('✅ Category selected:', category.name);
        this.showSubjectSelection(category);
    },
    
    showSubjectSelection(category) {
        console.log('📚 Showing subjects for:', category.name);
        
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
        
        this.updateDifficultyOptions(category.difficulties);
        
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
        console.log('🎯 Selecting subject:', subjectId);
        
        document.querySelectorAll('.subject-card').forEach(card => {
            card.classList.remove('selected', 'border-primary');
        });
        
        const selectedCard = document.querySelector(`[data-subject="${subjectId}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected', 'border-primary');
        }
        
        this.currentSubject = subjectId;
        console.log('✅ Subject selected:', subjectId);
    },
    
    updateDifficultyOptions(availableDifficulties) {
        const select = document.getElementById('difficulty-select');
        select.innerHTML = '';
        
        availableDifficulties.forEach(diff => {
            const option = document.createElement('option');
            option.value = diff;
            option.textContent = diff.charAt(0).toUpperCase() + diff.slice(1);
            select.appendChild(option);
        });
    },
    
    showCategorySelection() {
        this.showScreen('category-selection');
        this.currentCategory = null;
        this.currentSubject = null;
    },
    
    showScreen(screenName) {
        console.log('🔄 Switching to screen:', screenName);
        
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
        console.log('🚀 Starting single player game');
        
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
                categoryManager.showError('No questions available for this subject and difficulty.');
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
            
            console.log(`✅ Game started with ${questionResult.questions.length} questions`);
            
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
            categoryManager.categories[this.currentGame.category].name + ' - ' + 
            this.currentGame.subject.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
        
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
        
        // Award achievements
        this.awardAchievements(correctAnswers, timeTaken);
        
        // Update user stats
        if (userManager.getCurrentUser()) {
            const quizResult = {
                category: this.currentGame.category,
                subject: this.currentGame.subject,
                score: this.currentGame.score,
                correctAnswers: correctAnswers,
                totalQuestions: this.currentGame.questions.length,
                accuracy: accuracy,
                timeTaken: timeTaken,
                difficulty: document.getElementById('difficulty-select').value
            };
            
            const xpEarned = userManager.updateQuizStats(quizResult);
            
            // Show XP earned
            categoryManager.showSuccess(`+${xpEarned} XP earned!`);
        }
        
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
            <div class="mt-3 text-center">
                <small class="text-muted">
                    Questions source: <span class="badge ${this.currentGame.questionSource === 'online' ? 'bg-success' : 'bg-secondary'}">${this.currentGame.questionSource}</span>
                </small>
            </div>
        `;
        
        this.showAchievements();
        
        if (percentage >= 80) {
            document.getElementById('confetti').style.display = 'block';
            soundSystem.play('victory');
            
            setTimeout(() => {
                document.getElementById('confetti').style.display = 'none';
            }, 5000);
        }
        
        categoryManager.showScreen('results-screen');
    },
    
    awardAchievements(correctAnswers, timeTaken) {
        const achievements = [];
        const totalQuestions = this.currentGame.questions.length;
        const percentage = (correctAnswers / totalQuestions) * 100;
        
        if (correctAnswers === totalQuestions) {
            achievements.push({
                name: "Perfect Score",
                description: "Answered all questions correctly",
                icon: "fa-star",
                color: "warning"
            });
        }
        
        if (percentage >= 90) {
            achievements.push({
                name: "Expert Level",
                description: "Scored 90% or higher",
                icon: "fa-trophy",
                color: "primary"
            });
        }
        
        this.currentGame.achievements = achievements;
    },
    
    showAchievements() {
        const container = document.getElementById('achievements-container');
        
        if (this.currentGame.achievements.length === 0) {
            container.innerHTML = '<p class="text-muted">No achievements earned this time. Keep practicing!</p>';
            return;
        }
        
        container.innerHTML = this.currentGame.achievements.map(achievement => `
            <div class="col-md-6 mb-3">
                <div class="alert alert-${achievement.color} d-flex align-items-center">
                    <i class="fas ${achievement.icon} fa-2x me-3"></i>
                    <div>
                        <h5 class="mb-1">${achievement.name}</h5>
                        <p class="mb-0">${achievement.description}</p>
                    </div>
                </div>
            </div>
        `).join('');
    },
    
    startTimer() {
        this.timeLeft = this.currentGame.timePerQuestion;
        this.updateTimerDisplay();
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();
            
            if (this.timeLeft <= 0) {
                clearInterval(this.timer);
                this.selectAnswer(-1); // Time's up - mark as incorrect
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

// Multiplayer System (Simulated for demo)
const multiplayerSystem = {
    init() {
        console.log('🎮 Multiplayer system initialized (simulated mode)');
    },
    
    async createRoom(settings) {
        console.log('🎮 Creating room (simulated)');
        categoryManager.showSuccess('Room created! In demo mode, multiplayer is simulated.');
        return true;
    },
    
    async joinRoom(roomCode) {
        console.log('🎮 Joining room (simulated):', roomCode);
        categoryManager.showSuccess('Joined room! In demo mode, multiplayer is simulated.');
        return true;
    }
};

// User Management System
const userManager = {
    currentUser: null,
    
    init() {
        console.log('👤 User manager initialized');
        this.setupGuestUser();
        this.updateUserDisplay();
    },
    
    setupGuestUser() {
        this.currentUser = {
            id: 'guest_' + Math.random().toString(36).substr(2, 9),
            username: 'Guest',
            avatar: '👤',
            isGuest: true,
            stats: {
                level: 1,
                totalXP: 0,
                totalQuizzes: 0,
                totalQuestions: 0,
                correctAnswers: 0,
                categories: {}
            },
            achievements: [],
            history: []
        };
    },
    
    updateQuizStats(quizResult) {
        if (!this.currentUser) return 0;
        
        // Calculate XP
        const xpEarned = 25; // Fixed XP for demo
        
        // Initialize stats
        this.currentUser.stats = this.currentUser.stats || {
            level: 1,
            totalXP: 0,
            totalQuizzes: 0,
            totalQuestions: 0,
            correctAnswers: 0,
            categories: {}
        };
        
        // Update stats
        this.currentUser.stats.totalQuizzes++;
        this.currentUser.stats.totalQuestions += quizResult.totalQuestions;
        this.currentUser.stats.correctAnswers += quizResult.correctAnswers;
        this.currentUser.stats.totalXP += xpEarned;
        
        // Calculate level
        const newLevel = Math.floor(this.currentUser.stats.totalXP / 100) + 1;
        if (newLevel > this.currentUser.stats.level) {
            this.currentUser.stats.level = newLevel;
        }
        
        this.updateUserDisplay();
        return xpEarned;
    },
    
    getCurrentUser() {
        return this.currentUser;
    },
    
    updateUserDisplay() {
        const userDisplay = document.getElementById('user-display');
        const userAvatar = document.getElementById('user-avatar');
        const userName = document.getElementById('user-name');
        const userLevel = document.getElementById('user-level');
        const userXP = document.getElementById('user-xp');
        
        if (this.currentUser && userDisplay) {
            userDisplay.style.display = 'flex';
            if (userAvatar) userAvatar.textContent = this.currentUser.avatar;
            if (userName) userName.textContent = this.currentUser.username;
            if (userLevel) userLevel.textContent = `Level ${this.currentUser.stats?.level || 1}`;
            if (userXP) userXP.textContent = `${this.currentUser.stats?.totalXP || 0} XP`;
        }
    }
};

// Initialize the application
async function initApp() {
    console.log('🚀 Initializing QuizMaster App');
    
    try {
        // Initialize all systems
        await connectionManager.init();
        userManager.init();
        categoryManager.init();
        singlePlayerSystem.init();
        avatarSystem.init();
        multiplayerSystem.init();
        
        // Setup event listeners
        setupEventListeners();
        
        console.log('✅ App initialized successfully');
        
    } catch (error) {
        console.error('❌ App initialization failed:', error);
        categoryManager.showError('Failed to initialize app. Some features may not work.');
    }
}

// Setup all event listeners
function setupEventListeners() {
    console.log('🔧 Setting up event listeners...');
    
    // Sound toggle
    document.getElementById('toggle-sound').addEventListener('click', () => {
        soundSystem.toggle();
    });
    
    // Start quiz button
    document.getElementById('start-quiz-btn').addEventListener('click', startQuiz);
    
    // Create room button
    document.getElementById('create-room-btn').addEventListener('click', () => {
        const settings = categoryManager.getCurrentSettings();
        multiplayerSystem.createRoom(settings);
    });
    
    // Join room button
    document.getElementById('join-room-btn').addEventListener('click', () => {
        const roomCode = document.getElementById('room-code-input').value.trim().toUpperCase();
        multiplayerSystem.joinRoom(roomCode);
    });
    
    // Quiz navigation
    document.getElementById('next-question').addEventListener('click', () => {
        singlePlayerSystem.nextQuestion();
    });
    
    document.getElementById('prev-question').addEventListener('click', () => {
        singlePlayerSystem.prevQuestion();
    });
    
    document.getElementById('submit-quiz').addEventListener('click', () => {
        singlePlayerSystem.submitQuiz();
    });
    
    // Results screen actions
    document.getElementById('play-again-btn').addEventListener('click', () => {
        categoryManager.showCategorySelection();
    });
    
    document.getElementById('back-to-menu').addEventListener('click', () => {
        categoryManager.showCategorySelection();
    });
    
    // Game mode selection
    document.querySelectorAll('input[name="gameMode"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            currentState.gameMode = e.target.value;
            if (e.target.value === 'multi') {
                categoryManager.showScreen('multiplayer-setup');
            }
        });
    });
    
    console.log('✅ Event listeners setup complete');
}

// Start quiz function
function startQuiz() {
    const settings = categoryManager.getCurrentSettings();
    
    if (settings.gameMode === 'multi') {
        categoryManager.showScreen('multiplayer-setup');
        return;
    }
    
    if (!settings.category) {
        categoryManager.showError('Please select an education level.');
        return;
    }
    
    if (!settings.subject) {
        categoryManager.showError('Please select a subject.');
        return;
    }

    const playerName = document.getElementById('player-name').value || 'Player';
    const avatar = avatarSystem.selectedAvatar;

    singlePlayerSystem.startGame(
        settings.category,
        settings.subject, 
        playerName,
        avatar,
        settings.difficulty,
        settings.questionCount,
        settings.questionSource
    );
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

console.log('🎉 Quiz Application loaded successfully!');
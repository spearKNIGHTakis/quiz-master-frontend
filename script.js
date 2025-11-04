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
        button.innerHTML = this.enabled ? 
            '<i class="fas fa-volume-up me-1"></i> Sound On' : 
            '<i class="fas fa-volume-mute me-1"></i> Sound Off';
        button.classList.toggle('btn-outline-success');
        button.classList.toggle('btn-outline-secondary');
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
                this.renderAvatarSelection(); // Sync both selections
            });
        });
    }
};

// Socket simulation (replace with real socket.io in production)
const socket = {
    id: 'player_' + Math.random().toString(36).substring(2, 9),
    on: (event, callback) => {
        console.log(`Socket listening for: ${event}`);
        // In real implementation, this would be: connectionManager.socket.on(event, callback)
    },
    emit: (event, data) => {
        console.log(`Socket emitting: ${event}`, data);
        // In real implementation, this would be: connectionManager.socket.emit(event, data)
    }
};

// Connection Manager
const connectionManager = {
    socket: null,
    isConnected: false,
    
    async init() {
        try {
            console.log('🔌 Initializing connection manager...');
            
            // Try to connect to WebSocket
            await this.connectWebSocket();
            
            // Set up periodic health checks
            setInterval(() => this.checkConnection(), 30000);
            
        } catch (error) {
            console.error('Connection manager init failed:', error);
            this.setConnectionStatus('disconnected');
        }
    },
    
    async connectWebSocket() {
        return new Promise((resolve, reject) => {
            try {
                console.log('🔄 Connecting to WebSocket...');
                this.setConnectionStatus('connecting');
                
                // Simulate connection with 70% success rate
                setTimeout(() => {
                    if (Math.random() > 0.3) {
                        this.socket = socket;
                        this.isConnected = true;
                        this.setConnectionStatus('connected');
                        console.log('✅ WebSocket connected successfully');
                        resolve();
                    } else {
                        this.setConnectionStatus('disconnected');
                        console.log('❌ WebSocket connection failed');
                        reject(new Error('Connection failed'));
                    }
                }, 2000);
                
            } catch (error) {
                this.setConnectionStatus('disconnected');
                reject(error);
            }
        });
    },
    
    setConnectionStatus(status) {
        currentState.connectionStatus = status;
        const statusElement = document.getElementById('connection-status');
        const indicator = statusElement?.querySelector('.online-indicator');
        
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
    
    async checkConnection() {
        if (!this.isConnected) {
            await this.connectWebSocket();
        }
    },
    
    async emit(event, data) {
        if (this.isConnected && this.socket) {
            this.socket.emit(event, data);
        } else {
            console.log(`📤 Would emit ${event} (offline mode)`);
        }
    },
    
    on(event, callback) {
        if (this.isConnected && this.socket) {
            this.socket.on(event, callback);
        }
    }
};

// Enhanced Question Manager with OpenTDB Integration
const questionManager = {
    async getQuestions(settings) {
        const { category, subject, difficulty, questionCount, questionSource } = settings;
        
        console.log(`📝 Requesting ${questionCount} ${difficulty} questions for ${category}/${subject}`);
        
        let onlineFirst = questionSource === 'auto' || questionSource === 'online';
        let fallbackToOffline = questionSource === 'auto' || questionSource === 'offline';
        
        if (onlineFirst && currentState.connectionStatus === 'connected') {
            try {
                console.log('🌐 Attempting to fetch questions from OpenTDB...');
                
                const apiQuestions = await this.fetchFromOpenTDB(category, subject, difficulty, questionCount);
                
                if (apiQuestions.length > 0) {
                    console.log(`✅ Using ${apiQuestions.length} OpenTDB questions`);
                    return {
                        questions: apiQuestions,
                        source: 'online'
                    };
                } else {
                    console.log('⚠️ No questions from OpenTDB, falling back to offline');
                    if (fallbackToOffline) {
                        categoryManager.showError('Online questions unavailable. Using offline questions.');
                    }
                }
            } catch (error) {
                console.error('❌ OpenTDB API failed:', error);
                if (fallbackToOffline) {
                    categoryManager.showError('Online questions unavailable. Using offline questions.');
                }
            }
        }
        
        // Fallback to offline questions
        if (fallbackToOffline) {
            console.log('📚 Using offline questions');
            const offlineQuestions = this.getOfflineQuestions(category, subject, difficulty, questionCount);
            return {
                questions: offlineQuestions,
                source: 'offline'
            };
        }
        
        throw new Error('No questions available with current settings');
    },
    
    async fetchFromOpenTDB(category, subject, difficulty, count) {
        try {
            const categoryMap = this.getOpenTDBCategory(category, subject);
            if (!categoryMap) {
                console.log(`No OpenTDB category mapping for ${category}/${subject}`);
                return [];
            }
            
            // Map difficulty levels
            const difficultyMap = {
                'easy': 'easy',
                'medium': 'medium', 
                'hard': 'hard'
            };
            
            const apiDifficulty = difficultyMap[difficulty] || 'medium';
            
            console.log(`🔗 Fetching from OpenTDB: Category ${categoryMap.id}, Difficulty ${apiDifficulty}`);
            
            const response = await fetch(
                `https://opentdb.com/api.php?amount=${count}&category=${categoryMap.id}&difficulty=${apiDifficulty}&type=multiple&encode=url3986`
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.response_code !== 0) {
                console.warn(`OpenTDB API warning: Response code ${data.response_code}`);
                // Handle specific response codes
                if (data.response_code === 1) {
                    console.log('No results - trying with fewer questions');
                    return await this.fetchFromOpenTDB(category, subject, difficulty, Math.floor(count / 2));
                }
                return [];
            }
            
            if (!data.results || data.results.length === 0) {
                console.log('No questions returned from OpenTDB');
                return [];
            }
            
            const formattedQuestions = data.results.map(q => this.formatOpenTDBQuestion(q));
            console.log(`✅ Successfully formatted ${formattedQuestions.length} questions from OpenTDB`);
            
            return formattedQuestions;
            
        } catch (error) {
            console.error('❌ OpenTDB fetch error:', error);
            throw error;
        }
    },
    
    getOpenTDBCategory(category, subject) {
        // Comprehensive mapping of your app categories to OpenTDB categories
        const categoryMap = {
            // Primary Level
            primary: {
                mathematics: { id: 19, name: 'Science: Mathematics' },
                science: { id: 17, name: 'Science & Nature' },
                english: { id: 10, name: 'Entertainment: Books' }, // Using books for English
                social_studies: { id: 23, name: 'History' },
                general: { id: 9, name: 'General Knowledge' }
            },
            // High School Level  
            highschool: {
                mathematics: { id: 19, name: 'Science: Mathematics' },
                physics: { id: 17, name: 'Science & Nature' },
                chemistry: { id: 17, name: 'Science & Nature' },
                biology: { id: 17, name: 'Science & Nature' },
                history: { id: 23, name: 'History' },
                geography: { id: 22, name: 'Geography' },
                computers: { id: 18, name: 'Science: Computers' },
                general: { id: 9, name: 'General Knowledge' }
            },
            // Tertiary Level
            tertiary: {
                programming: { id: 18, name: 'Science: Computers' },
                business: { id: 9, name: 'General Knowledge' },
                engineering: { id: 17, name: 'Science & Nature' },
                medicine: { id: 17, name: 'Science & Nature' },
                law: { id: 9, name: 'General Knowledge' },
                economics: { id: 9, name: 'General Knowledge' },
                general: { id: 9, name: 'General Knowledge' }
            }
        };
        
        const mappedCategory = categoryMap[category]?.[subject] || categoryMap.primary.general;
        console.log(`🗺️ Category mapping: ${category}/${subject} -> OpenTDB ${mappedCategory.id} (${mappedCategory.name})`);
        
        return mappedCategory;
    },
    
    formatOpenTDBQuestion(apiQuestion) {
        try {
            // Decode URL-encoded text
            const decodedQuestion = this.decodeURLEncoded(apiQuestion.question);
            const decodedCorrect = this.decodeURLEncoded(apiQuestion.correct_answer);
            const decodedIncorrect = apiQuestion.incorrect_answers.map(ans => this.decodeURLEncoded(ans));
            
            // Combine and shuffle options
            const allOptions = [...decodedIncorrect, decodedCorrect];
            const shuffledOptions = this.shuffleArray([...allOptions]);
            
            // Find correct answer index after shuffling
            const correctIndex = shuffledOptions.findIndex(opt => opt === decodedCorrect);
            
            if (correctIndex === -1) {
                console.error('Could not find correct answer after shuffling');
                return null;
            }
            
            return {
                question: decodedQuestion,
                options: shuffledOptions,
                correctAnswer: correctIndex,
                explanation: `From OpenTDB | Category: ${this.decodeURLEncoded(apiQuestion.category)} | Difficulty: ${apiQuestion.difficulty}`,
                source: 'opentdb',
                originalCategory: apiQuestion.category,
                originalDifficulty: apiQuestion.difficulty
            };
            
        } catch (error) {
            console.error('Error formatting OpenTDB question:', error);
            return null;
        }
    },
    
    decodeURLEncoded(text) {
        try {
            return decodeURIComponent(text.replace(/\+/g, ' '));
        } catch (error) {
            console.error('Error decoding text:', text, error);
            return text;
        }
    },
    
    shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    },
    
    getOfflineQuestions(category, subject, difficulty, count) {
        // Your existing offline questions database
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
        
        return this.shuffleArray(difficultyQuestions).slice(0, count);
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
        console.log('🎮 Single player system ready');
        // Bind methods to maintain 'this' context
        this.startGame = this.startGame.bind(this);
        this.loadQuestion = this.loadQuestion.bind(this);
        this.selectAnswer = this.selectAnswer.bind(this);
        this.nextQuestion = this.nextQuestion.bind(this);
        this.prevQuestion = this.prevQuestion.bind(this);
        this.submitQuiz = this.submitQuiz.bind(this);
        this.finishGame = this.finishGame.bind(this);
        this.startTimer = this.startTimer.bind(this);
        this.resetTimer = this.resetTimer.bind(this);
    },
    
    async startGame(category, subject, playerName, avatar, difficulty, questionCount, questionSource) {
        console.log('🚀 Starting single player game with OpenTDB integration');
        
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
            
            console.log(`✅ Game started with ${questionResult.questions.length} questions from ${questionResult.source}`);
            
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
        
        const sourceBadge = document.getElementById('question-source-badge');
        sourceBadge.textContent = this.currentGame.questionSource === 'online' ? 'Online' : 'Offline';
        sourceBadge.className = `badge ms-2 ${this.currentGame.questionSource === 'online' ? 'bg-success' : 'bg-secondary'}`;
        
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
        
        document.getElementById('multiplayer-status').classList.add('d-none');
        
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
        
        if (currentState.connectionStatus === 'connected') {
            connectionManager.emit('quizCompleted', {
                playerName: this.currentGame.playerName,
                category: this.currentGame.category,
                subject: this.currentGame.subject,
                score: this.currentGame.score,
                correctAnswers: correctAnswers,
                totalQuestions: this.currentGame.questions.length,
                timeTaken: timeTaken
            });
        }
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
        
        const avgTimePerQuestion = timeTaken / totalQuestions;
        if (avgTimePerQuestion < 10) {
            achievements.push({
                name: "Speed Demon",
                description: "Answered quickly (under 10s per question)",
                icon: "fa-bolt",
                color: "success"
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
        const progressElement = document.getElementById('timer-progress');
        
        if (timerElement) {
            timerElement.textContent = this.timeLeft;
            timerElement.className = `timer ${this.timeLeft <= 10 ? 'warning' : ''} ${this.timeLeft <= 5 ? 'danger' : ''}`;
        }
        
        if (progressElement) {
            const progress = (this.timeLeft / this.currentGame.timePerQuestion) * 100;
            progressElement.style.width = `${progress}%`;
            progressElement.className = `progress-bar ${this.timeLeft <= 10 ? 'bg-warning' : 'bg-success'} ${this.timeLeft <= 5 ? 'bg-danger' : ''}`;
        }
    }
};

// Multiplayer System
const multiplayerSystem = {
    currentRoom: null,
    players: [],
    gameState: null,
    
    init() {
        console.log('🎮 Multiplayer system ready');
        // Bind methods to maintain 'this' context
        this.createRoom = this.createRoom.bind(this);
        this.joinRoom = this.joinRoom.bind(this);
        this.leaveRoom = this.leaveRoom.bind(this);
        this.startMultiplayerGame = this.startMultiplayerGame.bind(this);
        this.handlePlayerJoined = this.handlePlayerJoined.bind(this);
        this.handlePlayerLeft = this.handlePlayerLeft.bind(this);
        this.handleGameStarted = this.handleGameStarted.bind(this);
        this.handleQuestionReceived = this.handleQuestionReceived.bind(this);
        this.handleAnswerSubmitted = this.handleAnswerSubmitted.bind(this);
        this.handleGameEnded = this.handleGameEnded.bind(this);
        this.submitMultiplayerAnswer = this.submitMultiplayerAnswer.bind(this);
    },
    
    async createRoom(settings) {
        try {
            console.log('🎮 Creating multiplayer room...');
            
            const playerName = document.getElementById('player-name').value || 'Anonymous';
            const avatar = avatarSystem.selectedAvatar;
            
            if (currentState.connectionStatus !== 'connected') {
                categoryManager.showError('Cannot create room while offline. Please check your connection.');
                return false;
            }
            
            const roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
            
            this.currentRoom = {
                code: roomCode,
                host: playerName,
                settings: settings,
                players: [{
                    id: socket.id,
                    name: playerName,
                    avatar: avatar,
                    score: 0,
                    ready: true
                }],
                gameState: 'waiting'
            };
            
            this.players = this.currentRoom.players;
            
            await connectionManager.emit('createRoom', {
                roomCode: roomCode,
                host: playerName,
                settings: settings
            });
            
            this.updateLobbyDisplay();
            categoryManager.showScreen('multiplayer-lobby');
            
            console.log('✅ Room created:', roomCode);
            return true;
            
        } catch (error) {
            console.error('Error creating room:', error);
            categoryManager.showError('Failed to create room. Please try again.');
            return false;
        }
    },
    
    async joinRoom(roomCode) {
        try {
            const playerName = document.getElementById('player-name').value || 'Anonymous';
            const avatar = avatarSystem.selectedAvatar;
            
            if (currentState.connectionStatus !== 'connected') {
                categoryManager.showError('Cannot join room while offline. Please check your connection.');
                return false;
            }
            
            await connectionManager.emit('joinRoom', {
                roomCode: roomCode,
                playerName: playerName,
                avatar: avatar
            });
            
            this.currentRoom = {
                code: roomCode,
                players: []
            };
            
            categoryManager.showScreen('multiplayer-lobby');
            return true;
            
        } catch (error) {
            console.error('Error joining room:', error);
            categoryManager.showError('Failed to join room. Please check the room code and try again.');
            return false;
        }
    },
    
    leaveRoom() {
        if (this.currentRoom) {
            connectionManager.emit('leaveRoom', { roomCode: this.currentRoom.code });
            this.currentRoom = null;
            this.players = [];
            this.gameState = null;
        }
        
        categoryManager.showScreen('multiplayer-setup');
    },
    
    async startMultiplayerGame() {
        try {
            if (!this.currentRoom || this.currentRoom.players.length < 1) {
                categoryManager.showError('Need at least 2 players to start the game');
                return;
            }
            
            await connectionManager.emit('startGame', { roomCode: this.currentRoom.code });
            
        } catch (error) {
            console.error('Error starting multiplayer game:', error);
            categoryManager.showError('Failed to start game. Please try again.');
        }
    },
    
    updateLobbyDisplay() {
        const playersList = document.getElementById('players-list');
        const roomCodeElement = document.getElementById('room-code');
        const playerCountElement = document.getElementById('player-count');
        const startButton = document.getElementById('start-game-btn');
        
        if (roomCodeElement) {
            roomCodeElement.textContent = this.currentRoom?.code || '----';
        }
        
        if (playerCountElement) {
            playerCountElement.textContent = this.currentRoom?.players.length || 0;
        }
        
        if (playersList && this.currentRoom) {
            playersList.innerHTML = this.currentRoom.players.map(player => `
                <div class="player-item">
                    <div class="multiplayer-avatar me-2">${player.avatar}</div>
                    <div class="flex-grow-1">
                        <strong>${player.name}</strong>
                        ${player.id === socket.id ? '<span class="badge bg-primary ms-2">You</span>' : ''}
                    </div>
                    ${this.currentRoom.host === player.name ? '<span class="badge bg-warning">Host</span>' : ''}
                </div>
            `).join('');
        }
        
        if (startButton) {
            const isHost = this.currentRoom?.host === socket.id;
            const canStart = this.currentRoom?.players.length >= 1;
            
            startButton.style.display = isHost ? 'block' : 'none';
            startButton.disabled = !canStart;
        }
    },
    
    // Event handlers
    handlePlayerJoined(playerData) {
        if (this.currentRoom) {
            this.currentRoom.players.push(playerData);
            this.updateLobbyDisplay();
            categoryManager.showSuccess(`${playerData.name} joined the room!`);
        }
    },
    
    handlePlayerLeft(playerId) {
        if (this.currentRoom) {
            const playerIndex = this.currentRoom.players.findIndex(p => p.id === playerId);
            if (playerIndex !== -1) {
                const playerName = this.currentRoom.players[playerIndex].name;
                this.currentRoom.players.splice(playerIndex, 1);
                this.updateLobbyDisplay();
                categoryManager.showError(`${playerName} left the room`);
            }
        }
    },
    
    handleGameStarted(gameData) {
        this.gameState = {
            currentQuestion: 0,
            questions: gameData.questions,
            players: gameData.players,
            timePerQuestion: 30
        };
        
        this.loadMultiplayerQuestion(0);
    },
    
    handleQuestionReceived(questionData) {
        // Handle receiving a new question from server
        this.loadMultiplayerQuestion(questionData.questionIndex);
    },
    
    handleAnswerSubmitted(answerData) {
        // Update player scores when answers are submitted
        const player = this.players.find(p => p.id === answerData.playerId);
        if (player) {
            player.score = answerData.newScore;
        }
        this.updateScoreboard();
    },
    
    handleGameEnded(finalScores) {
        this.showMultiplayerResults(finalScores);
    },
    
    loadMultiplayerQuestion(questionIndex) {
        if (!this.gameState || questionIndex >= this.gameState.questions.length) {
            return;
        }
        
        this.gameState.currentQuestion = questionIndex;
        const question = this.gameState.questions[questionIndex];
        
        // Update UI similar to single player but with multiplayer elements
        document.getElementById('current-subject').textContent = 
            `Multiplayer - ${this.currentRoom.settings.category} - ${this.currentRoom.settings.subject}`;
        
        document.getElementById('question-count-display').textContent = 
            `Question ${questionIndex + 1} of ${this.gameState.questions.length}`;
        
        document.getElementById('question-text').textContent = question.question;
        
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
                this.submitMultiplayerAnswer(index);
            });
            
            optionsContainer.appendChild(optionElement);
        });
        
        // Show multiplayer status
        document.getElementById('multiplayer-status').classList.remove('d-none');
        this.updateScoreboard();
        
        categoryManager.showScreen('quiz-screen');
        
        // Start timer for multiplayer question
        this.startMultiplayerTimer();
    },
    
    submitMultiplayerAnswer(optionIndex) {
        if (!this.gameState || !this.currentRoom) return;
        
        const question = this.gameState.questions[this.gameState.currentQuestion];
        const isCorrect = optionIndex === question.correctAnswer;
        
        connectionManager.emit('submitAnswer', {
            roomCode: this.currentRoom.code,
            questionIndex: this.gameState.currentQuestion,
            answerIndex: optionIndex,
            isCorrect: isCorrect,
            timeRemaining: this.timeLeft || 0
        });
        
        // Visual feedback
        const options = document.querySelectorAll('.option');
        options.forEach(opt => opt.classList.remove('selected', 'correct', 'incorrect'));
        
        if (options[optionIndex]) {
            options[optionIndex].classList.add('selected');
            options[optionIndex].classList.add(isCorrect ? 'correct' : 'incorrect');
        }
        
        if (question.correctAnswer >= 0 && question.correctAnswer < options.length) {
            options[question.correctAnswer].classList.add('correct');
        }
    },
    
    startMultiplayerTimer() {
        this.timeLeft = this.gameState.timePerQuestion;
        // Similar to single player timer but with multiplayer specific logic
    },
    
    updateScoreboard() {
        const scoreboard = document.getElementById('multiplayer-scoreboard');
        if (!scoreboard || !this.players) return;
        
        const sortedPlayers = [...this.players].sort((a, b) => b.score - a.score);
        
        scoreboard.innerHTML = sortedPlayers.map(player => `
            <div class="player-score ${player.id === socket.id ? 'current-player' : ''}">
                <span class="player-avatar-small">${player.avatar}</span>
                <span class="player-name">${player.name}</span>
                <span class="player-points">${player.score} pts</span>
            </div>
        `).join('');
    },
    
    showMultiplayerResults(finalScores) {
        const sortedScores = finalScores.sort((a, b) => b.score - a.score);
        const winner = sortedScores[0];
        
        document.getElementById('final-score').textContent = `${winner.name} wins!`;
        
        const statsContainer = document.getElementById('performance-stats');
        statsContainer.innerHTML = sortedScores.map((player, index) => `
            <div class="player-result ${index === 0 ? 'winner' : ''}">
                <div class="rank">#${index + 1}</div>
                <div class="player-avatar">${player.avatar}</div>
                <div class="player-info">
                    <div class="player-name">${player.name}</div>
                    <div class="player-score">${player.score} points</div>
                </div>
                ${index === 0 ? '<div class="trophy"><i class="fas fa-trophy"></i></div>' : ''}
            </div>
        `).join('');
        
        categoryManager.showScreen('results-screen');
        
        if (winner.id === socket.id) {
            document.getElementById('confetti').style.display = 'block';
            soundSystem.play('victory');
            
            setTimeout(() => {
                document.getElementById('confetti').style.display = 'none';
            }, 5000);
        }
    }
};

// User Management System
const userManager = {
    currentUser: null,
    users: JSON.parse(localStorage.getItem('quizAppUsers')) || {},
    
    init() {
        console.log('👤 User manager initialized');
        this.loadCurrentUser();
        this.setupEventListeners();
    },
    
    loadCurrentUser() {
        const savedUser = localStorage.getItem('quizAppCurrentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.updateUserDisplay();
            this.showUserProfile();
        }
    },
    
    saveCurrentUser() {
        if (this.currentUser) {
            localStorage.setItem('quizAppCurrentUser', JSON.stringify(this.currentUser));
            this.users[this.currentUser.username] = this.currentUser;
            localStorage.setItem('quizAppUsers', JSON.stringify(this.users));
        }
    },
    
    getCurrentUser() {
        return this.currentUser;
    },
    
    setupEventListeners() {
        // Edit profile button
        const editProfileBtn = document.getElementById('edit-profile');
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => {
                this.handleEditProfile();
            });
        }
        
        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }
    },
    
    handleEditProfile() {
        // Simple profile editing - just change avatar for now
        const avatars = ['👨‍💻', '👩‍🚀', '🦸', '👨‍🎓', '👩‍🎨', '🤖', '🐱', '🦊'];
        const currentIndex = avatars.indexOf(this.currentUser.avatar);
        const nextIndex = (currentIndex + 1) % avatars.length;
        
        this.currentUser.avatar = avatars[nextIndex];
        this.saveCurrentUser();
        this.updateUserDisplay();
        categoryManager.showSuccess('Avatar updated!');
    },
    
    handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('quizAppCurrentUser');
            this.currentUser = null;
            this.hideUserProfile();
            categoryManager.showSuccess('Logged out successfully');
        }
    },
    
    updateQuizStats(quizResult) {
        if (!this.currentUser) return 0;
        
        // Calculate XP based on performance
        const baseXP = 10;
        const accuracyBonus = Math.floor((quizResult.accuracy / 100) * 20);
        const speedBonus = quizResult.timeTaken < 300 ? 10 : 0; // Bonus for completing under 5 minutes
        const difficultyMultiplier = quizResult.difficulty === 'hard' ? 1.5 : quizResult.difficulty === 'medium' ? 1.2 : 1;
        
        const xpEarned = Math.floor((baseXP + accuracyBonus + speedBonus) * difficultyMultiplier);
        
        // Update user stats
        this.currentUser.stats = this.currentUser.stats || {};
        this.currentUser.stats.totalQuizzes = (this.currentUser.stats.totalQuizzes || 0) + 1;
        this.currentUser.stats.totalQuestions = (this.currentUser.stats.totalQuestions || 0) + quizResult.totalQuestions;
        this.currentUser.stats.correctAnswers = (this.currentUser.stats.correctAnswers || 0) + quizResult.correctAnswers;
        this.currentUser.stats.totalXP = (this.currentUser.stats.totalXP || 0) + xpEarned;
        
        // Update category stats
        if (!this.currentUser.stats.categories) {
            this.currentUser.stats.categories = {};
        }
        
        const categoryKey = `${quizResult.category}_${quizResult.subject}`;
        if (!this.currentUser.stats.categories[categoryKey]) {
            this.currentUser.stats.categories[categoryKey] = {
                quizzesPlayed: 0,
                correctAnswers: 0,
                totalQuestions: 0,
                bestScore: 0
            };
        }
        
        const categoryStats = this.currentUser.stats.categories[categoryKey];
        categoryStats.quizzesPlayed++;
        categoryStats.correctAnswers += quizResult.correctAnswers;
        categoryStats.totalQuestions += quizResult.totalQuestions;
        
        if (quizResult.accuracy > categoryStats.bestScore) {
            categoryStats.bestScore = quizResult.accuracy;
        }
        
        // Calculate level based on total XP (100 XP per level)
        const newLevel = Math.floor(this.currentUser.stats.totalXP / 100) + 1;
        const leveledUp = newLevel > (this.currentUser.stats.level || 1);
        
        if (leveledUp) {
            this.currentUser.stats.level = newLevel;
            categoryManager.showSuccess(`🎉 Level Up! You reached level ${newLevel}!`);
        }
        
        this.saveCurrentUser();
        this.updateUserDisplay();
        
        return xpEarned;
    },
    
    updateUserDisplay() {
        const userDisplay = document.getElementById('user-display');
        const userAvatar = document.getElementById('user-avatar');
        const userName = document.getElementById('user-name');
        const userLevel = document.getElementById('user-level');
        const userXP = document.getElementById('user-xp');
        
        const profileAvatar = document.getElementById('profile-avatar');
        const profileUsername = document.getElementById('profile-username');
        const profileLevel = document.getElementById('profile-level');
        const profileXP = document.getElementById('profile-xp');
        const profileXPNeeded = document.getElementById('profile-xp-needed');
        const profileNextLevel = document.getElementById('profile-next-level');
        const profileProgress = document.getElementById('profile-progress');
        const profileQuizzes = document.getElementById('profile-quizzes');
        const profileAccuracy = document.getElementById('profile-accuracy');
        const profileAchievements = document.getElementById('profile-achievements');
        
        if (this.currentUser) {
            // Update header display
            if (userDisplay) userDisplay.style.display = 'flex';
            if (userAvatar) userAvatar.textContent = this.currentUser.avatar;
            if (userName) userName.textContent = this.currentUser.username;
            if (userLevel) userLevel.textContent = `Level ${this.currentUser.stats?.level || 1}`;
            if (userXP) userXP.textContent = `${this.currentUser.stats?.totalXP || 0} XP`;
            
            // Update profile section
            if (profileAvatar) profileAvatar.textContent = this.currentUser.avatar;
            if (profileUsername) profileUsername.textContent = this.currentUser.username;
            if (profileLevel) profileLevel.textContent = this.currentUser.stats?.level || 1;
            if (profileXP) profileXP.textContent = this.currentUser.stats?.totalXP || 0;
            
            const currentLevel = this.currentUser.stats?.level || 1;
            const currentXP = this.currentUser.stats?.totalXP || 0;
            const xpForCurrentLevel = (currentLevel - 1) * 100;
            const xpForNextLevel = currentLevel * 100;
            const progress = ((currentXP - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;
            
            if (profileXPNeeded) profileXPNeeded.textContent = xpForNextLevel;
            if (profileNextLevel) profileNextLevel.textContent = currentLevel + 1;
            if (profileProgress) profileProgress.style.width = `${Math.min(progress, 100)}%`;
            
            if (profileQuizzes) profileQuizzes.textContent = this.currentUser.stats?.totalQuizzes || 0;
            
            const accuracy = this.currentUser.stats?.totalQuestions ? 
                Math.round(((this.currentUser.stats.correctAnswers || 0) / this.currentUser.stats.totalQuestions) * 100) : 0;
            if (profileAccuracy) profileAccuracy.textContent = `${accuracy}%`;
            
            if (profileAchievements) profileAchievements.textContent = this.currentUser.achievements?.length || 0;
        } else {
            if (userDisplay) userDisplay.style.display = 'none';
        }
    },
    
    showUserProfile() {
        const userProfile = document.getElementById('user-profile');
        if (userProfile) {
            userProfile.classList.remove('d-none');
        }
    },
    
    hideUserProfile() {
        const userProfile = document.getElementById('user-profile');
        if (userProfile) {
            userProfile.classList.add('d-none');
        }
    }
};

// Initialize the application
async function initApp() {
    console.log('🚀 Initializing QuizMaster App');
    
    try {
        // Initialize systems in order
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
        if (roomCode.length !== 4) {
            categoryManager.showError('Please enter a valid 4-character room code');
            return;
        }
        multiplayerSystem.joinRoom(roomCode);
    });
    
    // Leave room button
    document.getElementById('leave-room-btn').addEventListener('click', () => {
        multiplayerSystem.leaveRoom();
    });
    
    // Start multiplayer game button
    document.getElementById('start-game-btn').addEventListener('click', () => {
        multiplayerSystem.startMultiplayerGame();
    });
    
    // Quiz navigation
    document.getElementById('next-question').addEventListener('click', () => {
        if (currentState.gameMode === 'multi') {
            multiplayerSystem.nextQuestion();
        } else {
            singlePlayerSystem.nextQuestion();
        }
    });
    
    document.getElementById('prev-question').addEventListener('click', () => {
        if (currentState.gameMode === 'multi') {
            // Multiplayer doesn't support going back
        } else {
            singlePlayerSystem.prevQuestion();
        }
    });
    
    document.getElementById('submit-quiz').addEventListener('click', () => {
        if (currentState.gameMode === 'multi') {
            multiplayerSystem.finishGame();
        } else {
            singlePlayerSystem.submitQuiz();
        }
    });
    
    // Results screen actions
    document.getElementById('play-again-btn').addEventListener('click', () => {
        if (currentState.gameMode === 'multi') {
            categoryManager.showScreen('multiplayer-lobby');
        } else {
            categoryManager.showSubjectSelection(categoryManager.categories[categoryManager.currentCategory]);
        }
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
            } else {
                // Stay on subject selection for single player
            }
        });
    });
    
    console.log('✅ Event listeners setup complete');
}

// Start quiz function
function startQuiz() {
    const settings = categoryManager.getCurrentSettings();
    
    if (settings.gameMode === 'multi') {
        multiplayerSystem.showMultiplayerSetup();
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

// Export for global access (development only)
window.QuizApp = {
    categoryManager,
    singlePlayerSystem,
    multiplayerSystem,
    connectionManager,
    userManager,
    soundSystem,
    avatarSystem
};

console.log('🎉 Quiz Application loaded successfully!');
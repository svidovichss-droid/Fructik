// games.js
// Образовательные игры система
class EducationalGames {
    constructor() {
        this.games = {
            math: {
                id: 'math',
                name: {
                    ru: 'Математические задачи',
                    en: 'Math Problems'
                },
                description: {
                    ru: 'Решайте веселые математические задачки',
                    en: 'Solve fun math problems'
                },
                icon: '🧮',
                difficulty: ['easy', 'medium', 'hard'],
                generateProblem: (difficulty) => this.generateMathProblem(difficulty),
                checkAnswer: (problem, answer) => this.checkMathAnswer(problem, answer)
            },
            words: {
                id: 'words',
                name: {
                    ru: 'Словарные игры',
                    en: 'Vocabulary Games'
                },
                description: {
                    ru: 'Расширяйте словарный запас',
                    en: 'Expand your vocabulary'
                },
                icon: '🔤',
                difficulty: ['easy', 'medium'],
                generateProblem: (difficulty) => this.generateWordProblem(difficulty),
                checkAnswer: (problem, answer) => this.checkWordAnswer(problem, answer)
            },
            logic: {
                id: 'logic',
                name: {
                    ru: 'Логические задачи',
                    en: 'Logic Problems'
                },
                description: {
                    ru: 'Развивайте логическое мышление',
                    en: 'Develop logical thinking'
                },
                icon: '🎯',
                difficulty: ['medium', 'hard'],
                generateProblem: (difficulty) => this.generateLogicProblem(difficulty),
                checkAnswer: (problem, answer) => this.checkLogicAnswer(problem, answer)
            }
        };
        
        this.currentGame = null;
        this.currentProblem = null;
        this.score = 0;
        this.streak = 0;
        this.history = [];
        
        this.initialize();
    }
    
    initialize() {
        // Загрузка прогресса
        this.loadProgress();
        
        // Настройка обработчиков событий
        this.setupEventListeners();
    }
    
    // Загрузка прогресса
    loadProgress() {
        try {
            const saved = localStorage.getItem('games_progress');
            if (saved) {
                const progress = JSON.parse(saved);
                this.score = progress.score || 0;
                this.history = progress.history || [];
                
                // Обновление глобального состояния
                window.appState.setState(state => ({
                    ...state,
                    user: {
                        ...state.user,
                        gameProgress: progress.gameProgress || {}
                    }
                }), 'Load game progress');
            }
        } catch (error) {
            console.warn('Failed to load games progress:', error);
        }
    }
    
    // Сохранение прогресса
    saveProgress() {
        try {
            const progress = {
                score: this.score,
                history: this.history.slice(-50), // Сохраняем последние 50 игр
                gameProgress: window.appState.state.user.gameProgress || {},
                lastPlayed: Date.now()
            };
            localStorage.setItem('games_progress', JSON.stringify(progress));
        } catch (error) {
            console.warn('Failed to save games progress:', error);
        }
    }
    
    // Настройка обработчиков событий
    setupEventListeners() {
        // Обработчики будут добавлены после загрузки DOM
        document.addEventListener('DOMContentLoaded', () => {
            const gameCards = document.querySelectorAll('.game-card');
            gameCards.forEach(card => {
                card.addEventListener('click', () => {
                    const gameId = card.dataset.game;
                    this.startGame(gameId);
                });
            });
            
            // Закрытие панели игр
            document.getElementById('closeGames')?.addEventListener('click', () => {
                this.hideGamesPanel();
            });
            
            // Кнопка открытия игр
            document.getElementById('gamesButton')?.addEventListener('click', () => {
                this.showGamesPanel();
            });
        });
    }
    
    // Показ панели игр
    showGamesPanel() {
        const panel = document.getElementById('gamesPanel');
        if (panel) {
            panel.classList.add('active');
            window.appState.setState(state => ({
                ...state,
                ui: { ...state.ui, gamesPanelOpen: true }
            }), 'Show games panel');
        }
    }
    
    // Скрытие панели игр
    hideGamesPanel() {
        const panel = document.getElementById('gamesPanel');
        if (panel) {
            panel.classList.remove('active');
            window.appState.setState(state => ({
                ...state,
                ui: { ...state.ui, gamesPanelOpen: false }
            }), 'Hide games panel');
        }
    }
    
    // Начало игры
    startGame(gameId) {
        if (!this.games[gameId]) {
            console.error('Game not found:', gameId);
            return;
        }
        
        this.currentGame = gameId;
        this.currentProblem = null;
        this.streak = 0;
        
        this.hideGamesPanel();
        this.showGameInterface();
        this.generateNewProblem();
        
        // Логирование начала игры
        window.performanceMonitor?.logMetric('game_started', 1, { game: gameId });
        window.METRICS.userEngagement.gamesPlayed++;
    }
    
    // Показ интерфейса игры
    showGameInterface() {
        // Создание интерфейса игры
        const gameInterface = `
            <div class="game-interface">
                <div class="game-header">
                    <button class="game-back-btn" id="gameBackBtn">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <h3 id="gameTitle">${this.games[this.currentGame].name[window.i18n?.getCurrentLanguage() || 'ru']}</h3>
                    <div class="game-stats">
                        <span id="gameScore">${this.score}</span>
                        <span>очков</span>
                    </div>
                </div>
                
                <div class="game-content">
                    <div class="problem-container" id="problemContainer">
                        <!-- Задача будет здесь -->
                    </div>
                    
                    <div class="answer-container" id="answerContainer">
                        <!-- Поле для ответа -->
                    </div>
                    
                    <div class="game-feedback" id="gameFeedback">
                        <!-- Обратная связь -->
                    </div>
                </div>
                
                <div class="game-controls">
                    <button class="game-btn hint-btn" id="hintBtn">
                        <i class="fas fa-lightbulb"></i>
                        Подсказка
                    </button>
                    <button class="game-btn submit-btn" id="submitBtn">
                        Проверить
                    </button>
                    <button class="game-btn next-btn hidden" id="nextBtn">
                        Следующая задача
                    </button>
                </div>
            </div>
        `;
        
        // Вставка в чат
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            const gameMessage = document.createElement('div');
            gameMessage.className = 'game-message';
            gameMessage.innerHTML = gameInterface;
            chatMessages.appendChild(gameMessage);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // Настройка обработчиков
            this.setupGameEventListeners();
        }
    }
    
    // Настройка обработчиков событий игры
    setupGameEventListeners() {
        document.getElementById('gameBackBtn')?.addEventListener('click', () => {
            this.endGame();
        });
        
        document.getElementById('submitBtn')?.addEventListener('click', () => {
            this.checkAnswer();
        });
        
        document.getElementById('nextBtn')?.addEventListener('click', () => {
            this.generateNewProblem();
        });
        
        document.getElementById('hintBtn')?.addEventListener('click', () => {
            this.showHint();
        });
    }
    
    // Генерация новой задачи
    generateNewProblem() {
        if (!this.currentGame) return;
        
        const difficulty = this.getDifficulty();
        this.currentProblem = this.games[this.currentGame].generateProblem(difficulty);
        
        this.updateProblemDisplay();
        this.resetGameUI();
    }
    
    // Получение сложности на основе счета
    getDifficulty() {
        if (this.score < 100) return 'easy';
        if (this.score < 300) return 'medium';
        return 'hard';
    }
    
    // Обновление отображения задачи
    updateProblemDisplay() {
        const container = document.getElementById('problemContainer');
        const answerContainer = document.getElementById('answerContainer');
        
        if (container && answerContainer && this.currentProblem) {
            container.innerHTML = `
                <div class="problem-text">${this.currentProblem.question}</div>
                ${this.currentProblem.options ? `
                    <div class="problem-options">
                        ${this.currentProblem.options.map((option, index) => `
                            <label class="problem-option">
                                <input type="radio" name="answer" value="${option}">
                                <span>${option}</span>
                            </label>
                        `).join('')}
                    </div>
                ` : `
                    <div class="answer-input">
                        <input type="text" id="gameAnswerInput" placeholder="Введите ваш ответ...">
                    </div>
                `}
            `;
            
            // Скрываем кнопку "Следующая"
            document.getElementById('nextBtn')?.classList.add('hidden');
            document.getElementById('submitBtn')?.classList.remove('hidden');
        }
    }
    
    // Сброс UI игры
    resetGameUI() {
        const feedback = document.getElementById('gameFeedback');
        if (feedback) {
            feedback.innerHTML = '';
            feedback.className = 'game-feedback';
        }
    }
    
    // Проверка ответа
    checkAnswer() {
        if (!this.currentProblem || !this.currentGame) return;
        
        let userAnswer;
        if (this.currentProblem.options) {
            const selected = document.querySelector('input[name="answer"]:checked');
            userAnswer = selected?.value;
        } else {
            userAnswer = document.getElementById('gameAnswerInput')?.value;
        }
        
        if (!userAnswer) {
            this.showFeedback('Пожалуйста, введите ответ', 'error');
            return;
        }
        
        const isCorrect = this.games[this.currentGame].checkAnswer(this.currentProblem, userAnswer);
        
        if (isCorrect) {
            this.handleCorrectAnswer();
        } else {
            this.handleIncorrectAnswer();
        }
        
        this.saveProgress();
    }
    
    // Обработка правильного ответа
    handleCorrectAnswer() {
        const points = this.calculatePoints();
        this.score += points;
        this.streak++;
        
        this.showFeedback(`Правильно! +${points} очков`, 'success');
        this.updateScoreDisplay();
        
        // Показ кнопки "Следующая"
        document.getElementById('nextBtn')?.classList.remove('hidden');
        document.getElementById('submitBtn')?.classList.add('hidden');
        
        // Обновление глобального состояния
        this.updateGameProgress(true);
        
        // Логирование
        window.performanceMonitor?.logMetric('game_correct_answer', points, {
            game: this.currentGame,
            streak: this.streak
        });
    }
    
    // Обработка неправильного ответа
    handleIncorrectAnswer() {
        this.streak = 0;
        
        this.showFeedback(`Неправильно. Правильный ответ: ${this.currentProblem.answer}`, 'error');
        
        // Показ кнопки "Следующая"
        document.getElementById('nextBtn')?.classList.remove('hidden');
        document.getElementById('submitBtn')?.classList.add('hidden');
        
        // Обновление глобального состояния
        this.updateGameProgress(false);
        
        window.performanceMonitor?.logMetric('game_incorrect_answer', 0, {
            game: this.currentGame
        });
    }
    
    // Расчет очков
    calculatePoints() {
        const basePoints = 10;
        const streakBonus = Math.min(this.streak * 2, 20); // Максимум +20 за серию
        const difficultyMultiplier = this.getDifficulty() === 'hard' ? 1.5 : 
                                   this.getDifficulty() === 'medium' ? 1.2 : 1;
        
        return Math.round((basePoints + streakBonus) * difficultyMultiplier);
    }
    
    // Обновление прогресса игры
    updateGameProgress(isCorrect) {
        const gameProgress = window.appState.state.user.gameProgress || {};
        const gameId = this.currentGame;
        
        if (!gameProgress[gameId]) {
            gameProgress[gameId] = {
                played: 0,
                correct: 0,
                bestStreak: 0,
                totalPoints: 0
            };
        }
        
        gameProgress[gameId].played++;
        gameProgress[gameId].totalPoints += this.score;
        
        if (isCorrect) {
            gameProgress[gameId].correct++;
            gameProgress[gameId].bestStreak = Math.max(gameProgress[gameId].bestStreak, this.streak);
        }
        
        window.appState.setState(state => ({
            ...state,
            user: {
                ...state.user,
                gameProgress
            }
        }), 'Update game progress');
    }
    
    // Показ подсказки
    showHint() {
        if (!this.currentProblem?.hint) return;
        
        this.showFeedback(`Подсказка: ${this.currentProblem.hint}`, 'hint');
        
        // Штраф за использование подсказки
        this.score = Math.max(0, this.score - 5);
        this.updateScoreDisplay();
    }
    
    // Показ обратной связи
    showFeedback(message, type) {
        const feedback = document.getElementById('gameFeedback');
        if (feedback) {
            feedback.innerHTML = message;
            feedback.className = `game-feedback ${type}`;
        }
    }
    
    // Обновление отображения счета
    updateScoreDisplay() {
        const scoreElement = document.getElementById('gameScore');
        if (scoreElement) {
            scoreElement.textContent = this.score;
        }
    }
    
    // Завершение игры
    endGame() {
        this.currentGame = null;
        this.currentProblem = null;
        
        // Удаление интерфейса игры
        const gameMessage = document.querySelector('.game-message');
        if (gameMessage) {
            gameMessage.remove();
        }
        
        // Показ итогов
        this.showGameResults();
    }
    
    // Показ результатов игры
    showGameResults() {
        const totalGames = this.history.length;
        const todayGames = this.history.filter(game => {
            return new Date(game.timestamp).toDateString() === new Date().toDateString();
        }).length;
        
        const message = `🎮 Игра завершена!\n\n📊 Статистика:\n• Всего игр: ${totalGames}\n• Игр сегодня: ${todayGames}\n• Общий счет: ${this.score}\n\nПродолжайте в том же духе! ✨`;
        
        // Добавление сообщения в чат
        window.addMessageToChat('assistant', message);
        
        // Сохранение в историю
        this.history.push({
            game: this.currentGame,
            score: this.score,
            timestamp: Date.now()
        });
    }
    
    // Генерация математической задачи
    generateMathProblem(difficulty) {
        const operations = ['+', '-', '*', '/'];
        let a, b, operation, answer, question;
        
        switch (difficulty) {
            case 'easy':
                a = Math.floor(Math.random() * 10) + 1;
                b = Math.floor(Math.random() * 10) + 1;
                operation = operations[Math.floor(Math.random() * 2)]; // + или -
                break;
            case 'medium':
                a = Math.floor(Math.random() * 20) + 1;
                b = Math.floor(Math.random() * 20) + 1;
                operation = operations[Math.floor(Math.random() * 4)];
                break;
            case 'hard':
                a = Math.floor(Math.random() * 50) + 1;
                b = Math.floor(Math.random() * 50) + 1;
                operation = operations[Math.floor(Math.random() * 4)];
                break;
        }
        
        // Убедимся, что деление целое
        if (operation === '/') {
            b = Math.floor(Math.random() * 10) + 1;
            a = b * (Math.floor(Math.random() * 10) + 1);
        }
        
        switch (operation) {
            case '+': answer = a + b; break;
            case '-': answer = a - b; break;
            case '*': answer = a * b; break;
            case '/': answer = a / b; break;
        }
        
        question = `Сколько будет ${a} ${operation} ${b}?`;
        
        return {
            question,
            answer: answer.toString(),
            hint: 'Попробуйте посчитать внимательно!',
            options: difficulty !== 'hard' ? [
                (answer - 2).toString(),
                answer.toString(),
                (answer + 2).toString(),
                (answer * 2).toString()
            ].sort(() => Math.random() - 0.5) : null
        };
    }
    
    // Проверка математического ответа
    checkMathAnswer(problem, userAnswer) {
        return parseFloat(userAnswer) === parseFloat(problem.answer);
    }
    
    // Генерация словарной задачи
    generateWordProblem(difficulty) {
        const words = {
            easy: [
                { word: "КНИГА", synonym: "ЛИТЕРАТУРА" },
                { word: "ДОМ", synonym: "ЖИЛИЩЕ" },
                { word: "СОЛНЦЕ", synonym: "СВЕТИЛО" }
            ],
            medium: [
                { word: "ЭНТУЗИАЗМ", synonym: "ВООДУШЕВЛЕНИЕ" },
                { word: "ПРЕПЯТСТВИЕ", synonym: "ПРЕГРАДА" },
                { word: "УМЕНИЕ", synonym: "НАВЫК" }
            ]
        };
        
        const wordList = words[difficulty] || words.easy;
        const selected = wordList[Math.floor(Math.random() * wordList.length)];
        
        return {
            question: `Найдите синоним к слову "${selected.word}"`,
            answer: selected.synonym,
            hint: `Подумайте о словах, близких по значению к "${selected.word}"`
        };
    }
    
    // Проверка словарного ответа
    checkWordAnswer(problem, userAnswer) {
        return userAnswer.toUpperCase() === problem.answer.toUpperCase();
    }
    
    // Генерация логической задачи
    generateLogicProblem(difficulty) {
        const problems = {
            medium: [
                {
                    question: "Если все кошки - животные, и все животные - млекопитающие, то все кошки - млекопитающие?",
                    answer: "ДА"
                },
                {
                    question: "2 + 2 = 5?",
                    answer: "НЕТ"
                }
            ],
            hard: [
                {
                    question: "У отца Марии пять дочерей: Чача, Чичи, Чече, Чочо. Как зовут пятую дочь?",
                    answer: "МАРИЯ"
                },
                {
                    question: "Что может бежать, но не ходить?",
                    answer: "РЕКА"
                }
            ]
        };
        
        const problemList = problems[difficulty] || problems.medium;
        const selected = problemList[Math.floor(Math.random() * problemList.length)];
        
        return {
            question: selected.question,
            answer: selected.answer,
            hint: 'Внимательно прочитайте условие задачи'
        };
    }
    
    // Проверка логического ответа
    checkLogicAnswer(problem, userAnswer) {
        return userAnswer.toUpperCase() === problem.answer.toUpperCase();
    }
    
    // Получение статистики игр
    getGameStats() {
        const gameProgress = window.appState.state.user.gameProgress || {};
        const totalPlayed = Object.values(gameProgress).reduce((sum, game) => sum + game.played, 0);
        const totalCorrect = Object.values(gameProgress).reduce((sum, game) => sum + game.correct, 0);
        const accuracy = totalPlayed > 0 ? (totalCorrect / totalPlayed) * 100 : 0;
        
        return {
            totalPlayed,
            totalCorrect,
            accuracy: Math.round(accuracy),
            totalPoints: this.score,
            favoriteGame: this.getFavoriteGame()
        };
    }
    
    // Получение любимой игры
    getFavoriteGame() {
        const gameProgress = window.appState.state.user.gameProgress || {};
        let favorite = null;
        let maxPlayed = 0;
        
        Object.entries(gameProgress).forEach(([gameId, stats]) => {
            if (stats.played > maxPlayed) {
                maxPlayed = stats.played;
                favorite = gameId;
            }
        });
        
        return favorite;
    }
}

// Создание глобального экземпляра
window.educationalGames = new EducationalGames();

console.log('🎮 Educational Games system initialized');

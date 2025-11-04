[file name]: achievements.js
[file content begin]
// achievements.js
// Система достижений и мотивации
class AchievementSystem {
    constructor() {
        this.achievements = {
            firstMessage: {
                id: 'firstMessage',
                title: {
                    ru: 'Первый шаг',
                    en: 'First Step'
                },
                description: {
                    ru: 'Отправили первое сообщение',
                    en: 'Sent first message'
                },
                icon: '💬',
                points: 10,
                unlocked: false,
                condition: (state) => state.user.messagesSent >= 1
            },
            chatMaster: {
                id: 'chatMaster',
                title: {
                    ru: 'Мастер общения',
                    en: 'Chat Master'
                },
                description: {
                    ru: 'Отправили 10 сообщений',
                    en: 'Sent 10 messages'
                },
                icon: '🎯',
                points: 25,
                unlocked: false,
                condition: (state) => state.user.messagesSent >= 10
            },
            quickLearner: {
                id: 'quickLearner',
                title: {
                    ru: 'Быстрый ученик',
                    en: 'Quick Learner'
                },
                description: {
                    ru: 'Задали 5 разных вопросов',
                    en: 'Asked 5 different questions'
                },
                icon: '🚀',
                points: 30,
                unlocked: false,
                condition: (state) => state.user.uniqueQuestions >= 5
            },
            homeworkHelper: {
                id: 'homeworkHelper',
                title: {
                    ru: 'Помощник с домашкой',
                    en: 'Homework Helper'
                },
                description: {
                    ru: 'Попросили помощи с домашним заданием 3 раза',
                    en: 'Asked for homework help 3 times'
                },
                icon: '📚',
                points: 20,
                unlocked: false,
                condition: (state) => state.user.homeworkRequests >= 3
            },
            gameLover: {
                id: 'gameLover',
                title: {
                    ru: 'Любитель игр',
                    en: 'Game Lover'
                },
                description: {
                    ru: 'Сыграли в 3 разные игры',
                    en: 'Played 3 different games'
                },
                icon: '🎮',
                points: 40,
                unlocked: false,
                condition: (state) => Object.keys(state.user.gameProgress || {}).length >= 3
            },
            fruitCollector: {
                id: 'fruitCollector',
                title: {
                    ru: 'Собиратель фруктов',
                    en: 'Fruit Collector'
                },
                description: {
                    ru: 'Получили ответы с 10 разными фруктовыми эмодзи',
                    en: 'Got responses with 10 different fruit emojis'
                },
                icon: '🍓',
                points: 50,
                unlocked: false,
                condition: (state) => state.user.uniqueFruits >= 10
            },
            nightOwl: {
                id: 'nightOwl',
                title: {
                    ru: 'Ночная сова',
                    en: 'Night Owl'
                },
                description: {
                    ru: 'Использовали чат поздно вечером',
                    en: 'Used chat late at night'
                },
                icon: '🌙',
                points: 15,
                unlocked: false,
                condition: (state) => {
                    const hour = new Date().getHours();
                    return hour >= 22 || hour <= 4;
                }
            },
            consistentLearner: {
                id: 'consistentLearner',
                title: {
                    ru: 'Постоянный ученик',
                    en: 'Consistent Learner'
                },
                description: {
                    ru: 'Использовали чат 5 дней подряд',
                    en: 'Used chat for 5 consecutive days'
                },
                icon: '📅',
                points: 60,
                unlocked: false,
                condition: (state) => state.user.consecutiveDays >= 5
            },
            questionMaster: {
                id: 'questionMaster',
                title: {
                    ru: 'Мастер вопросов',
                    en: 'Question Master'
                },
                description: {
                    ru: 'Задали 20 вопросов',
                    en: 'Asked 20 questions'
                },
                icon: '❓',
                points: 75,
                unlocked: false,
                condition: (state) => state.user.totalQuestions >= 20
            },
            superStudent: {
                id: 'superStudent',
                title: {
                    ru: 'Супер-ученик',
                    en: 'Super Student'
                },
                description: {
                    ru: 'Разблокировали все достижения',
                    en: 'Unlocked all achievements'
                },
                icon: '🏆',
                points: 100,
                unlocked: false,
                condition: (state) => {
                    const unlocked = state.user.achievements || [];
                    return unlocked.length >= Object.keys(this.achievements).length - 1;
                }
            }
        };
        
        this.initialize();
    }
    
    initialize() {
        // Загрузка прогресса из localStorage
        this.loadProgress();
        
        // Подписка на изменения состояния
        window.appState.subscribe('user', (newUser, oldUser) => {
            this.checkAchievements(newUser);
        });
        
        // Проверка достижений при загрузке
        setTimeout(() => {
            this.checkAchievements(window.appState.state.user);
        }, 1000);
    }
    
    // Загрузка прогресса
    loadProgress() {
        try {
            const saved = localStorage.getItem('achievements_progress');
            if (saved) {
                const progress = JSON.parse(saved);
                Object.keys(this.achievements).forEach(achievementId => {
                    if (progress[achievementId]) {
                        this.achievements[achievementId].unlocked = true;
                    }
                });
            }
        } catch (error) {
            console.warn('Failed to load achievements progress:', error);
        }
    }
    
    // Сохранение прогресса
    saveProgress() {
        try {
            const progress = {};
            Object.keys(this.achievements).forEach(achievementId => {
                if (this.achievements[achievementId].unlocked) {
                    progress[achievementId] = true;
                }
            });
            localStorage.setItem('achievements_progress', JSON.stringify(progress));
        } catch (error) {
            console.warn('Failed to save achievements progress:', error);
        }
    }
    
    // Проверка достижений
    checkAchievements(userState) {
        const unlocked = [];
        
        Object.keys(this.achievements).forEach(achievementId => {
            const achievement = this.achievements[achievementId];
            
            if (!achievement.unlocked && achievement.condition(userState)) {
                achievement.unlocked = true;
                unlocked.push(achievement);
                
                // Показ уведомления
                this.showAchievementNotification(achievement);
                
                // Обновление глобального состояния
                window.appState.setState(state => ({
                    ...state,
                    user: {
                        ...state.user,
                        achievements: [...(state.user.achievements || []), achievementId]
                    }
                }), `Achievement unlocked: ${achievementId}`);
            }
        });
        
        if (unlocked.length > 0) {
            this.saveProgress();
            this.updateMetrics(unlocked);
        }
        
        return unlocked;
    }
    
    // Показ уведомления о достижении
    showAchievementNotification(achievement) {
        if (!window.APP_CONFIG?.notifications?.achievementPopups) return;
        
        const toast = document.getElementById('achievementToast');
        const title = document.getElementById('achievementTitle');
        const desc = document.getElementById('achievementDesc');
        
        if (toast && title && desc) {
            const lang = window.i18n?.getCurrentLanguage() || 'ru';
            
            title.textContent = window.i18n?.t('achievementUnlocked') || 'Достижение разблокировано!';
            desc.textContent = `${achievement.title[lang]} - ${achievement.description[lang]}`;
            
            toast.classList.add('show');
            
            // Автоматическое скрытие
            setTimeout(() => {
                toast.classList.remove('show');
            }, 5000);
            
            // Воспроизведение звука (если разрешено)
            if (window.APP_CONFIG?.notifications?.sound) {
                this.playAchievementSound();
            }
        }
    }
    
    // Воспроизведение звука достижения
    playAchievementSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
            oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
            oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (error) {
            console.warn('Could not play achievement sound:', error);
        }
    }
    
    // Обновление метрик
    updateMetrics(unlockedAchievements) {
        window.METRICS.userEngagement.achievementsUnlocked += unlockedAchievements.length;
        
        // Логирование в аналитику
        unlockedAchievements.forEach(achievement => {
            window.performanceMonitor?.logMetric('achievement_unlocked', achievement.points, {
                achievement: achievement.id,
                title: achievement.title.en
            });
        });
    }
    
    // Получение списка достижений
    getAchievements() {
        const lang = window.i18n?.getCurrentLanguage() || 'ru';
        
        return Object.values(this.achievements).map(achievement => ({
            ...achievement,
            title: achievement.title[lang],
            description: achievement.description[lang],
            progress: this.getAchievementProgress(achievement)
        }));
    }
    
    // Получение прогресса достижения
    getAchievementProgress(achievement) {
        const userState = window.appState.state.user;
        return achievement.condition(userState) ? 100 : 0;
    }
    
    // Получение статистики
    getStats() {
        const total = Object.keys(this.achievements).length;
        const unlocked = Object.values(this.achievements).filter(a => a.unlocked).length;
        const totalPoints = Object.values(this.achievements)
            .filter(a => a.unlocked)
            .reduce((sum, a) => sum + a.points, 0);
        
        return {
            total,
            unlocked,
            progress: Math.round((unlocked / total) * 100),
            totalPoints,
            nextAchievement: this.getNextAchievement()
        };
    }
    
    // Получение следующего достижения
    getNextAchievement() {
        const unlockedIds = window.appState.state.user.achievements || [];
        const next = Object.values(this.achievements)
            .find(achievement => !unlockedIds.includes(achievement.id));
        
        return next || null;
    }
    
    // Сброс прогресса
    resetProgress() {
        Object.keys(this.achievements).forEach(achievementId => {
            this.achievements[achievementId].unlocked = false;
        });
        
        this.saveProgress();
        
        window.appState.setState(state => ({
            ...state,
            user: {
                ...state.user,
                achievements: []
            }
        }), 'Reset achievements');
    }
}

// Создание глобального экземпляра
window.achievementSystem = new AchievementSystem();

console.log('🏆 Achievement System initialized');
[file content end]
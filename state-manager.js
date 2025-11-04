// state-manager.js
// Умное управление состоянием приложения
class AppState {
    constructor() {
        this.state = {
            chats: [],
            currentChat: null,
            ui: {
                sidebarOpen: false,
                gamesPanelOpen: false,
                loading: false,
                theme: 'light',
                language: 'ru'
            },
            network: {
                online: navigator.onLine,
                lastSync: null,
                pendingMessages: []
            },
            user: {
                achievements: [],
                gameProgress: {},
                preferences: {},
                messagesSent: 0,
                uniqueQuestions: 0,
                homeworkRequests: 0,
                uniqueFruits: 0,
                consecutiveDays: 0,
                totalQuestions: 0
            },
            performance: {
                messagesRendered: 0,
                lastOptimization: Date.now(),
                sessionStart: Date.now()
            }
        };
        this.listeners = new Map();
        this.history = [];
        this.maxHistoryLength = 50;
        
        // Автоматическое восстановление состояния
        this.initialize();
    }
    
    async initialize() {
        await this.restoreState();
    }
    
    // Установка состояния с уведомлением подписчиков
    setState(updater, description = 'State update') {
        const prevState = this.deepClone(this.state);
        
        if (typeof updater === 'function') {
            this.state = updater(this.state);
        } else {
            this.state = this.mergeDeep(this.state, updater);
        }
        
        // Сохранение в историю для отладки
        this.addToHistory(prevState, this.state, description);
        
        // Уведомление подписчиков
        this.notifyListeners(prevState, this.state);
        
        // Автосохранение важных данных
        this.autoSave();
        
        return this.state;
    }
    
    // Подписка на изменения состояния
    subscribe(key, listener) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        this.listeners.get(key).add(listener);
        
        return () => this.unsubscribe(key, listener);
    }
    
    // Отписка от изменений
    unsubscribe(key, listener) {
        const keyListeners = this.listeners.get(key);
        if (keyListeners) {
            keyListeners.delete(listener);
        }
    }
    
    // Уведомление подписчиков
    notifyListeners(prevState, nextState) {
        for (const [key, listeners] of this.listeners) {
            const prevValue = this.getValueByPath(prevState, key);
            const nextValue = this.getValueByPath(nextState, key);
            
            if (!this.isEqual(prevValue, nextValue)) {
                listeners.forEach(listener => {
                    try {
                        listener(nextValue, prevValue, key);
                    } catch (error) {
                        console.error(`Error in state listener for ${key}:`, error);
                    }
                });
            }
        }
    }
    
    // Получение значения по пути
    getValueByPath(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }
    
    // Глубокое клонирование
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj);
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        
        const cloned = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloned[key] = this.deepClone(obj[key]);
            }
        }
        return cloned;
    }
    
    // Глубокое сравнение
    isEqual(a, b) {
        if (a === b) return true;
        if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
        
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);
        
        if (keysA.length !== keysB.length) return false;
        
        return keysA.every(key => this.isEqual(a[key], b[key]));
    }
    
    // Глубокое слияние
    mergeDeep(target, source) {
        const output = Object.assign({}, target);
        
        if (this.isObject(target) && this.isObject(source)) {
            Object.keys(source).forEach(key => {
                if (this.isObject(source[key])) {
                    if (!(key in target)) {
                        Object.assign(output, { [key]: source[key] });
                    } else {
                        output[key] = this.mergeDeep(target[key], source[key]);
                    }
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }
        
        return output;
    }
    
    isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    }
    
    // Добавление в историю изменений
    addToHistory(prevState, nextState, description) {
        this.history.push({
            timestamp: Date.now(),
            description,
            prevState: this.deepClone(prevState),
            nextState: this.deepClone(nextState)
        });
        
        // Ограничение размера истории
        if (this.history.length > this.maxHistoryLength) {
            this.history.shift();
        }
    }
    
    // Отмена последнего изменения
    undo() {
        if (this.history.length > 0) {
            const lastChange = this.history.pop();
            this.state = lastChange.prevState;
            this.notifyListeners(lastChange.nextState, this.state);
            return true;
        }
        return false;
    }
    
    // Автосохранение важных данных
    autoSave() {
        const importantData = {
            chats: this.state.chats,
            currentChat: this.state.currentChat,
            user: this.state.user
        };
        
        try {
            localStorage.setItem('fruitChatState', JSON.stringify(importantData));
        } catch (error) {
            console.warn('Auto-save failed:', error);
        }
    }
    
    // Восстановление состояния
    async restoreState() {
        try {
            const saved = localStorage.getItem('fruitChatState');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.setState(state => ({
                    ...state,
                    chats: parsed.chats || [],
                    currentChat: parsed.currentChat,
                    user: { ...state.user, ...parsed.user }
                }), 'Restore from storage');
                console.log('✅ Состояние восстановлено из localStorage');
                return true;
            }
        } catch (error) {
            console.error('State restoration failed:', error);
        }
        console.log('ℹ️ Состояние не найдено в localStorage, используется начальное состояние');
        return false;
    }
    
    // Сброс состояния
    resetState() {
        this.state = {
            chats: [],
            currentChat: null,
            ui: {
                sidebarOpen: false,
                gamesPanelOpen: false,
                loading: false,
                theme: 'light',
                language: 'ru'
            },
            network: {
                online: navigator.onLine,
                lastSync: null,
                pendingMessages: []
            },
            user: {
                achievements: [],
                gameProgress: {},
                preferences: {},
                messagesSent: 0,
                uniqueQuestions: 0,
                homeworkRequests: 0,
                uniqueFruits: 0,
                consecutiveDays: 0,
                totalQuestions: 0
            },
            performance: {
                messagesRendered: 0,
                lastOptimization: Date.now(),
                sessionStart: Date.now()
            }
        };
        this.history = [];
        this.notifyListeners({}, this.state);
        console.log('🔄 Состояние приложения сброшено');
    }
    
    // Получение статистики
    getStats() {
        return {
            totalChats: this.state.chats.length,
            totalMessages: this.state.chats.reduce((sum, chat) => sum + chat.messages.length, 0),
            sessionDuration: Date.now() - this.state.performance.sessionStart,
            achievementsUnlocked: this.state.user.achievements.length
        };
    }
}

// Создание глобального экземпляра
window.appState = new AppState();

console.log('🧠 State Manager initialized');

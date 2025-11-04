// i18n.js
// Система международной поддержки
class I18n {
    constructor() {
        this.languages = {
            ru: {
                // Основной интерфейс
                mainTitle: "🍓 Фруктик Чат 🍍",
                subtitle: "Помогаю в учёбе и отвечаю на вопросы!",
                mobileSubtitle: "Помощник в учёбе",
                
                // Боковая панель
                sidebarTitle: "Мои чаты",
                sidebarDescription: "Здесь отображаются все ваши чаты с Фруктиком",
                chatsCountText: "Всего чатов:",
                clearAllText: "Очистить все",
                apiSettingsText: "Настройки API",
                newChatText: "Новый чат",
                
                // Сообщения
                typingText: "Фруктик печатает",
                emptyChatTitle: "Начни новый разговор!",
                emptyChatDescription: "Напиши что-нибудь Фруктику, чтобы начать общение.",
                emptyChatHelp: "✨ Фруктик поможет с:",
                
                // Быстрые кнопки
                homeworkText: "Домашка",
                explainText: "Объясни",
                factText: "Факт",
                
                // Плейсхолдеры
                messagePlaceholder: "Напиши сообщение Фруктику... 🍓",
                apiKeyPlaceholder: "Введите ваш Hugging Face API ключ",
                
                // Модальные окна
                apiModalTitle: "🔑 Настройки API ключа",
                apiModalDescription1: "Для работы с Hugging Face API требуется ваш собственный ключ.",
                apiModalDescription2: "Получите ключ на",
                testApiText: "Проверить ключ",
                saveApiText: "Сохранить ключ",
                
                voiceModalTitle: "🎤 Голосовой ввод",
                startRecordText: "Начать запись",
                useText: "Использовать текст",
                voiceStatusReady: "Нажмите 'Начать запись' и говорите...",
                voiceStatusRecording: "Запись идет... Говорите сейчас",
                voiceStatusProcessing: "Обрабатываем речь...",
                
                exportModalTitle: "📤 Экспорт чата",
                exportDescription: "Выберите формат для экспорта текущего чата:",
                exportButtonText: "Экспортировать",
                
                // Игры
                gamesTitle: "🎮 Образовательные игры",
                mathGameTitle: "Математические задачи",
                mathGameDesc: "Решайте веселые математические задачки",
                wordsGameTitle: "Словарные игры",
                wordsGameDesc: "Расширяйте словарный запас",
                logicGameTitle: "Логические задачи",
                logicGameDesc: "Развивайте логическое мышление",
                
                // Достижения
                achievementUnlocked: "Достижение разблокировано!",
                
                // Статусы
                statusNewChat: "Новый чат создан!",
                statusChatLoaded: "Чат загружен",
                statusChatDeleted: "Чат удален!",
                statusAllCleared: "Все чаты очищены",
                statusConnecting: "Фруктик думает...",
                statusConnected: "Фруктик ответил!",
                statusOnline: "Соединение восстановлено!",
                statusOffline: "Отсутствует интернет-соединение",
                
                // Ошибки
                errorLoading: "Ошибка загрузки приложения",
                errorLoadingChats: "Ошибка загрузки чатов",
                errorSavingChats: "Ошибка сохранения чатов",
                errorNoApiKey: "Ошибка: API ключ не настроен",
                errorNetwork: "Проблемы с сетью. Проверьте подключение к интернету",
                errorMessageTooLong: "Сообщение слишком длинное",
                errorSending: "Произошла ошибка при отправке сообщения",
                
                // Подсказки
                tipFirstMessage: "💡 Попробуйте спросить о домашнем задании или попросите объяснить сложную тему!",
                tipLongMessage: "📝 Совет: Разбейте сложный вопрос на несколько простых для лучшего понимания"
            },
            en: {
                // Main interface
                mainTitle: "🍓 Fruity Chat 🍍",
                subtitle: "Helping with studies and answering questions!",
                mobileSubtitle: "Study Assistant",
                
                // Sidebar
                sidebarTitle: "My Chats",
                sidebarDescription: "Here are all your chats with Fruity",
                chatsCountText: "Total chats:",
                clearAllText: "Clear all",
                apiSettingsText: "API Settings",
                newChatText: "New Chat",
                
                // Messages
                typingText: "Fruity is typing",
                emptyChatTitle: "Start a new conversation!",
                emptyChatDescription: "Write something to Fruity to start chatting.",
                emptyChatHelp: "✨ Fruity can help with:",
                
                // Quick buttons
                homeworkText: "Homework",
                explainText: "Explain",
                factText: "Fact",
                
                // Placeholders
                messagePlaceholder: "Write a message to Fruity... 🍓",
                apiKeyPlaceholder: "Enter your Hugging Face API key",
                
                // Modals
                apiModalTitle: "🔑 API Key Settings",
                apiModalDescription1: "Your own key is required for Hugging Face API.",
                apiModalDescription2: "Get your key at",
                testApiText: "Test Key",
                saveApiText: "Save Key",
                
                voiceModalTitle: "🎤 Voice Input",
                startRecordText: "Start Recording",
                useText: "Use Text",
                voiceStatusReady: "Click 'Start Recording' and speak...",
                voiceStatusRecording: "Recording... Speak now",
                voiceStatusProcessing: "Processing speech...",
                
                exportModalTitle: "📤 Export Chat",
                exportDescription: "Choose format for exporting current chat:",
                exportButtonText: "Export",
                
                // Games
                gamesTitle: "🎮 Educational Games",
                mathGameTitle: "Math Problems",
                mathGameDesc: "Solve fun math problems",
                wordsGameTitle: "Vocabulary Games",
                wordsGameDesc: "Expand your vocabulary",
                logicGameTitle: "Logic Problems",
                logicGameDesc: "Develop logical thinking",
                
                // Achievements
                achievementUnlocked: "Achievement unlocked!",
                
                // Statuses
                statusNewChat: "New chat created!",
                statusChatLoaded: "Chat loaded",
                statusChatDeleted: "Chat deleted!",
                statusAllCleared: "All chats cleared",
                statusConnecting: "Fruity is thinking...",
                statusConnected: "Fruity replied!",
                statusOnline: "Connection restored!",
                statusOffline: "No internet connection",
                
                // Errors
                errorLoading: "Error loading application",
                errorLoadingChats: "Error loading chats",
                errorSavingChats: "Error saving chats",
                errorNoApiKey: "Error: API key not configured",
                errorNetwork: "Network issues. Check your internet connection",
                errorMessageTooLong: "Message too long",
                errorSending: "Error sending message",
                
                // Tips
                tipFirstMessage: "💡 Try asking about homework or request explanation of a complex topic!",
                tipLongMessage: "📝 Tip: Break complex questions into simpler ones for better understanding"
            }
        };
        
        this.currentLang = this.detectLanguage();
        this.fallbackLang = 'ru';
    }
    
    // Автоопределение языка
    detectLanguage() {
        const browserLang = navigator.language.split('-')[0];
        return this.languages[browserLang] ? browserLang : this.fallbackLang;
    }
    
    // Установка языка
    setLanguage(lang) {
        if (this.languages[lang]) {
            this.currentLang = lang;
            this.updateUI();
            window.appState.setState(state => ({
                ...state,
                ui: { ...state.ui, language: lang }
            }), 'Language change');
            return true;
        }
        return false;
    }
    
    // Получение перевода
    t(key, params = {}) {
        let translation = this.languages[this.currentLang]?.[key] || 
                         this.languages[this.fallbackLang]?.[key] || 
                         key;
        
        // Замена параметров
        if (Object.keys(params).length > 0) {
            Object.keys(params).forEach(param => {
                translation = translation.replace(`{{${param}}}`, params[param]);
            });
        }
        
        return translation;
    }
    
    // Обновление интерфейса
    updateUI() {
        const elements = document.querySelectorAll('[id]');
        elements.forEach(element => {
            const translation = this.t(element.id);
            if (translation && translation !== element.id) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });
    }
    
    // Получение списка доступных языков
    getAvailableLanguages() {
        return Object.keys(this.languages).map(code => ({
            code,
            name: this.getLanguageName(code),
            nativeName: this.getNativeLanguageName(code)
        }));
    }
    
    getLanguageName(code) {
        const names = {
            ru: 'Russian',
            en: 'English'
        };
        return names[code] || code;
    }
    
    getNativeLanguageName(code) {
        const names = {
            ru: 'Русский',
            en: 'English'
        };
        return names[code] || code;
    }
    
    // Получение текущего языка
    getCurrentLanguage() {
        return this.currentLang;
    }
}

// Создание глобального экземпляра
window.i18n = new I18n();

console.log('🌍 i18n system initialized');

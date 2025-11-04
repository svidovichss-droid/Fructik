[file name]: script.js
[file content begin]
// script.js
// Основной скрипт приложения с интеграцией всех систем
const API_CONFIG = {
    url: 'https://router.huggingface.co/v1/chat/completions',
    key: null
};

const MODEL = "deepseek-ai/DeepSeek-V3.2-Exp:novita";

const FRUIT_EMOJIS = [
    { emoji: '🍓', weight: 10 },
    { emoji: '🍍', weight: 8 },
    { emoji: '🍇', weight: 7 },
    { emoji: '🍉', weight: 9 },
    { emoji: '🍊', weight: 8 },
    { emoji: '🍋', weight: 7 },
    { emoji: '🍌', weight: 9 },
    { emoji: '🍎', weight: 8 },
    { emoji: '🍑', weight: 6 },
    { emoji: '🍒', weight: 7 },
    { emoji: '🥭', weight: 5 },
    { emoji: '🫐', weight: 6 },
    { emoji: '🍐', weight: 5 },
    { emoji: '🥝', weight: 4 },
    { emoji: '🍅', weight: 3 },
    { emoji: '🥥', weight: 2 },
    { emoji: '🍈', weight: 3 },
    { emoji: '🍏', weight: 7 },
    { emoji: '🫒', weight: 2 },
    { emoji: '🌰', weight: 1 }
];

let fruitRainInterval = null;
let activeFruits = new Set();
const API_KEY_STORAGE_KEY = 'huggingface_api_key_custom';

// Ускоренная инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Расширенная инициализация Фруктик Чата v2.0...');
    initializeApp();
});

async function initializeApp() {
    const startTime = performance.now();
    
    try {
        // Параллельная загрузка всех систем
        await Promise.all([
            loadConfig(),
            loadCustomApiKey(),
            window.appState.restoreState(),
            window.i18n.updateUI()
        ]);
        
        // Настройка систем
        setupEventListeners();
        setupSwipeGestures();
        setupApiKeyModal();
        
        // Запуск фоновых процессов
        startContinuousFruitRain();
        initializePWA();
        updateOnlineStatus();
        
        // Обновление интерфейса
        updateChatsCounter();
        renderChat();
        
        const loadTime = performance.now() - startTime;
        window.performanceMonitor.logMetric('app_load_time', loadTime);
        
        console.log('✅ Приложение полностью инициализировано за', loadTime.toFixed(2), 'ms');
        
        // Показ приветственного сообщения
        showWelcomeMessage();
        
    } catch (error) {
        console.error('❌ Ошибка инициализации приложения:', error);
        window.performanceMonitor.logError('app_initialization', error);
        window.showStatus(window.i18n.t('errorLoading'), 'error');
    }
}

// Загрузка конфигурации
async function loadConfig() {
    return new Promise((resolve) => {
        if (!API_CONFIG.key) {
            console.warn('⚠️ API ключ не настроен');
        } else {
            console.log('✅ API ключ настроен');
        }
        resolve();
    });
}

// Загрузка API ключа
async function loadCustomApiKey() {
    return new Promise((resolve) => {
        try {
            const savedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
            if (savedKey) {
                API_CONFIG.key = savedKey;
                console.log('🔑 Загружен кастомный API ключ');
            } else if (window.API_KEYS && window.API_KEYS.huggingface) {
                API_CONFIG.key = window.API_KEYS.huggingface;
                console.log('🔑 Используется API ключ из конфигурации');
            } else {
                console.warn('⚠️ API ключ не найден');
            }
        } catch (error) {
            console.error('Ошибка загрузки API ключа:', error);
        }
        resolve();
    });
}

// Настройка обработчиков событий
function setupEventListeners() {
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const newChatButton = document.getElementById('newChatButton');
    const menuButton = document.getElementById('menuButton');
    const closeSidebar = document.getElementById('closeSidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const clearAllChats = document.getElementById('clearAllChats');
    const chatContainer = document.querySelector('.chat-container');
    const changeApiKeyBtn = document.getElementById('changeApiKey');

    // Обработчики для поля ввода сообщения
    messageInput.addEventListener('input', function() {
        handleMessageInput();
        updateCharacterCount();
        autoResizeTextarea(this);
    });
    
    messageInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (messageInput.value.trim() && !window.appState.state.ui.loading) {
                sendMessage();
            }
        }
    });
    
    messageInput.addEventListener('paste', handlePaste);
    messageInput.addEventListener('focus', () => messageInput.classList.add('focused'));
    messageInput.addEventListener('blur', () => messageInput.classList.remove('focused'));

    // Основные кнопки
    sendButton.addEventListener('click', sendMessage);
    newChatButton.addEventListener('click', createNewChat);
    menuButton.addEventListener('click', openSidebar);
    clearAllChats.addEventListener('click', clearAllChatsHandler);

    // Боковая панель
    closeSidebar.addEventListener('click', closeSidebarFunction);
    sidebarOverlay.addEventListener('click', closeSidebarFunction);

    // Быстрые кнопки вопросов
    document.querySelectorAll('.helper-btn').forEach(btn => {
        if (btn.id && btn.id.startsWith('quickQuestion')) {
            btn.addEventListener('click', function() {
                const question = this.getAttribute('data-question');
                document.getElementById('messageInput').value = question;
                handleMessageInput();
                updateCharacterCount();
                autoResizeTextarea(document.getElementById('messageInput'));
                
                // Трекинг использования быстрых кнопок
                window.performanceMonitor.logMetric('quick_button_used', 1, {
                    button: this.id,
                    question: question.substring(0, 50)
                });
            });
        }
    });

    // Скрытая кнопка API
    if (changeApiKeyBtn) {
        changeApiKeyBtn.addEventListener('click', function() {
            closeSidebarFunction();
            setTimeout(() => {
                showApiKeyModal();
            }, 350);
        });
    }

    // Фокус на поле ввода при клике на чат
    chatContainer.addEventListener('click', function(e) {
        if (!e.target.closest('.header') && 
            !e.target.closest('.chats-sidebar') && 
            !window.appState.state.ui.sidebarOpen) {
            messageInput.focus();
        }
    });

    // Глобальные обработчики клавиш
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeSidebarFunction();
            window.educationalGames.hideGamesPanel();
        }
        
        // Горячие клавиши
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'n':
                    e.preventDefault();
                    createNewChat();
                    break;
                case 'k':
                    e.preventDefault();
                    messageInput.focus();
                    break;
                case '/':
                    e.preventDefault();
                    openSidebar();
                    break;
            }
        }
    });

    // Предупреждение при закрытии страницы
    window.addEventListener('beforeunload', function(e) {
        if (window.appState.state.ui.loading) {
            e.preventDefault();
            e.returnValue = 'Сообщение отправляется. Вы уверены, что хотите уйти?';
        }
    });

    // Адаптация к виртуальной клавиатуре
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', function() {
            setTimeout(scrollToBottom, 100);
        });
    }
    
    // Сетевые события
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
}

// Настройка свайп-жестов
function setupSwipeGestures() {
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let isSwiping = false;
    const SWIPE_THRESHOLD = 60;
    const SIDEBAR_SWIPE_AREA = 25;

    const chatContainer = document.querySelector('.chat-container');
    const sidebar = document.getElementById('chatsSidebar');
    const overlay = document.getElementById('sidebarOverlay');

    chatContainer.addEventListener('touchstart', function(e) {
        if (isKeyboardOpen()) return;
        
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        currentX = startX;
        isSwiping = true;
        
        sidebar.style.transition = 'none';
    }, { passive: true });

    chatContainer.addEventListener('touchmove', function(e) {
        if (!isSwiping) return;
        
        currentX = e.touches[0].clientX;
        const diffX = currentX - startX;
        const diffY = Math.abs(e.touches[0].clientY - startY);

        if (Math.abs(diffX) > diffY && Math.abs(diffX) > 10) {
            e.preventDefault();
            
            if (startX <= SIDEBAR_SWIPE_AREA && diffX > 0) {
                const swipeDistance = Math.min(diffX, window.innerWidth * 0.8);
                const progress = swipeDistance / (window.innerWidth * 0.8);
                
                sidebar.style.transform = `translateX(${-100 + (progress * 100)}%)`;
                sidebar.style.opacity = progress.toString();
                
                overlay.style.display = 'block';
                overlay.style.opacity = (progress * 0.5).toString();
            }
        }
    }, { passive: false });

    chatContainer.addEventListener('touchend', function() {
        if (!isSwiping) return;
        isSwiping = false;
        
        sidebar.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease';
        
        const diffX = currentX - startX;
        
        if (diffX > SWIPE_THRESHOLD && startX <= SIDEBAR_SWIPE_AREA) {
            openSidebar();
        } else {
            sidebar.style.transform = 'translateX(-100%)';
            sidebar.style.opacity = '0';
            overlay.style.opacity = '0';
            setTimeout(() => {
                if (!sidebar.classList.contains('active')) {
                    overlay.style.display = 'none';
                }
            }, 300);
        }
    }, { passive: true });
}

// Настройка модального окна API ключа
function setupApiKeyModal() {
    const modal = document.getElementById('apiKeyModal');
    const closeBtn = document.getElementById('closeApiKeyModal');
    const saveBtn = document.getElementById('saveApiKey');
    const testBtn = document.getElementById('testApiKey');
    const apiKeyInput = document.getElementById('apiKeyInput');
    const statusEl = document.getElementById('apiKeyStatus');
    
    // Скрываем поле ввода API ключа и связанные элементы
    apiKeyInput.style.display = 'none';
    statusEl.style.display = 'none';
    testBtn.style.display = 'none';
    saveBtn.style.display = 'none';
    
    closeBtn.addEventListener('click', hideApiKeyModal);
    
    saveBtn.addEventListener('click', async function() {
        const key = apiKeyInput.value.trim();
        // Функционал сохранения скрыт
    });
    
    testBtn.addEventListener('click', async function() {
        // Функционал тестирования скрыт
    });
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            hideApiKeyModal();
        }
    });
}

// Функции чата (адаптированные для работы с state manager)
function loadChats() {
    // Загрузка происходит через state manager
    updateChatsCounter();
}

function createNewChat() {
    const newChat = {
        id: generateChatId(),
        title: window.i18n.t('newChatText'),
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    window.appState.setState(state => ({
        ...state,
        chats: [...state.chats, newChat],
        currentChat: newChat.id
    }), 'Create new chat');
    
    renderChat();
    renderChatsList();
    closeSidebarFunction();
    
    const messageInput = document.getElementById('messageInput');
    messageInput.focus();
    
    window.showStatus(window.i18n.t('statusNewChat'), 'success');
    
    // Обновление метрик
    window.METRICS.userEngagement.chatsCreated++;
}

function deleteChat(chatId, event) {
    if (event) event.stopPropagation();
    
    const chats = window.appState.state.chats;
    if (chats.length <= 1) {
        window.showStatus('Нельзя удалить единственный чат!', 'error');
        return;
    }
    
    if (confirm('Вы уверены, что хотите удалить этот чат? Все сообщения будут потеряны.')) {
        window.appState.setState(state => {
            const newChats = state.chats.filter(chat => chat.id !== chatId);
            let newCurrentChat = state.currentChat;
            
            if (state.currentChat === chatId) {
                newCurrentChat = newChats.length > 0 ? newChats[newChats.length - 1].id : null;
            }
            
            return {
                ...state,
                chats: newChats,
                currentChat: newCurrentChat
            };
        }, `Delete chat: ${chatId}`);
        
        renderChat();
        renderChatsList();
        window.showStatus(window.i18n.t('statusChatDeleted'), 'success');
    }
}

// Остальные функции остаются аналогичными, но адаптируются для работы с state manager
// ... (остальной код функций чата)

// Интеграция с другими системами
function showWelcomeMessage() {
    const currentChat = window.appState.state.chats.find(c => c.id === window.appState.state.currentChat);
    if (!currentChat || currentChat.messages.length === 0) {
        setTimeout(() => {
            const tips = [
                "💡 " + window.i18n.t('tipFirstMessage'),
                "🎮 Нажмите на иконку игры в правом верхнем углу для образовательных игр",
                "🎤 Используйте голосовой ввод для быстрого ввода сообщений",
                "📤 Экспортируйте важные чаты для сохранения истории"
            ];
            
            const randomTip = tips[Math.floor(Math.random() * tips.length)];
            window.showStatus(randomTip, 'info');
        }, 2000);
    }
}

// Глобальные функции для HTML
window.loadChat = function(chatId) {
    window.appState.setState(state => ({
        ...state,
        currentChat: chatId
    }), `Load chat: ${chatId}`);
    
    renderChat();
    closeSidebarFunction();
    document.getElementById('messageInput').focus();
    window.showStatus(window.i18n.t('statusChatLoaded'), 'success');
};

window.deleteChat = deleteChat;
window.addMessageToChat = addMessageToChat;
window.showStatus = showStatus;
window.generateChatId = generateChatId;

console.log('🧩 Основной скрипт Фруктик Чата v2.0 загружен!');

// Подписка на изменения состояния для автоматического обновления UI
window.appState.subscribe('chats', (newChats, oldChats) => {
    updateChatsCounter();
    renderChatsList();
});

window.appState.subscribe('currentChat', (newChat, oldChat) => {
    renderChat();
});

window.appState.subscribe('ui.sidebarOpen', (isOpen) => {
    const sidebar = document.getElementById('chatsSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (isOpen) {
        sidebar.classList.add('active');
        sidebar.style.transform = 'translateX(0)';
        sidebar.style.opacity = '1';
        overlay.style.display = 'block';
        setTimeout(() => {
            overlay.classList.add('active');
            overlay.style.opacity = '0.5';
        }, 10);
        document.body.style.overflow = 'hidden';
        renderChatsList();
    } else {
        sidebar.classList.remove('active');
        sidebar.style.transform = 'translateX(-100%)';
        sidebar.style.opacity = '0';
        overlay.classList.remove('active');
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 300);
        document.body.style.overflow = '';
    }
});
[file content end]
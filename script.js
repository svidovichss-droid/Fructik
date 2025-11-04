// script.js
// Полностью прописанный основной скрипт с интеграцией всех систем
const API_CONFIG = {
    url: 'https://api-inference.huggingface.co/models/deepseek-ai/DeepSeek-V2-Chat',
    key: null
};

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
const MAX_MESSAGE_LENGTH = 1000;
const MAX_CHATS = 20;

// Ускоренная инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Расширенная инициализация Фруктик Чата v2.0...');
    initializeApp();
});

async function initializeApp() {
    const startTime = performance.now();
    
    try {
        // Инициализация систем в правильном порядке
        await initializeSystems();
        
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
        if (window.performanceMonitor) {
            window.performanceMonitor.logMetric('app_load_time', loadTime);
        }
        
        console.log('✅ Приложение полностью инициализировано за', loadTime.toFixed(2), 'ms');
        
        // Показ приветственного сообщения
        showWelcomeMessage();
        
    } catch (error) {
        console.error('❌ Ошибка инициализации приложения:', error);
        showStatus('Ошибка загрузки приложения', 'error');
    }
}

// Правильная инициализация всех систем
async function initializeSystems() {
    console.log('🔄 Инициализация систем...');
    
    // 1. Сначала загружаем API ключ
    await loadCustomApiKey();
    
    // 2. Инициализируем состояние приложения
    if (window.appState) {
        await window.appState.restoreState();
        console.log('✅ State manager initialized');
    } else {
        console.error('❌ State manager not found');
    }
    
    // 3. Инициализируем другие системы
    if (window.i18n) {
        window.i18n.updateUI();
        console.log('✅ i18n system initialized');
    }
    
    // 4. Инициализируем системы если они существуют
    if (window.performanceMonitor) {
        console.log('✅ Performance monitor initialized');
    }
    
    if (window.achievementSystem) {
        console.log('✅ Achievement system initialized');
    }
    
    if (window.educationalGames) {
        console.log('✅ Educational games initialized');
    }
    
    if (window.voiceRecorder) {
        console.log('✅ Voice recorder initialized');
    }
    
    if (window.exportUtils) {
        console.log('✅ Export utils initialized');
    }
    
    // 5. Проверяем API ключ
    if (!API_CONFIG.key) {
        console.warn('⚠️ API ключ не настроен');
        // Показываем уведомление о необходимости настройки API
        setTimeout(() => {
            showStatus('Для работы чата требуется настройка API ключа', 'warning');
        }, 2000);
    } else {
        console.log('✅ API ключ настроен');
    }
}

// Загрузка API ключа
async function loadCustomApiKey() {
    return new Promise((resolve) => {
        try {
            // Сначала проверяем кастомный ключ
            const savedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
            if (savedKey) {
                API_CONFIG.key = savedKey;
                console.log('🔑 Загружен кастомный API ключ');
            } 
            // Затем проверяем ключ из конфигурации
            else if (window.API_KEYS && window.API_KEYS.huggingface) {
                API_CONFIG.key = window.API_KEYS.huggingface;
                console.log('🔑 Используется API ключ из конфигурации');
            } 
            // Если ключей нет, используем null
            else {
                API_CONFIG.key = null;
                console.warn('⚠️ API ключ не найден');
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки API ключа:', error);
            API_CONFIG.key = null;
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
    if (messageInput) {
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
    }

    // Основные кнопки
    if (sendButton) sendButton.addEventListener('click', sendMessage);
    if (newChatButton) newChatButton.addEventListener('click', createNewChat);
    if (menuButton) menuButton.addEventListener('click', openSidebar);
    if (clearAllChats) clearAllChats.addEventListener('click', clearAllChatsHandler);

    // Боковая панель
    if (closeSidebar) closeSidebar.addEventListener('click', closeSidebarFunction);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebarFunction);

    // Быстрые кнопки вопросов
    document.querySelectorAll('.helper-btn').forEach(btn => {
        if (btn.id && btn.id.startsWith('quickQuestion')) {
            btn.addEventListener('click', function() {
                const question = this.getAttribute('data-question');
                const messageInput = document.getElementById('messageInput');
                if (messageInput) {
                    messageInput.value = question;
                    handleMessageInput();
                    updateCharacterCount();
                    autoResizeTextarea(messageInput);
                    
                    // Трекинг использования быстрых кнопок
                    if (window.performanceMonitor) {
                        window.performanceMonitor.logMetric('quick_button_used', 1, {
                            button: this.id,
                            question: question.substring(0, 50)
                        });
                    }
                }
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
    if (chatContainer) {
        chatContainer.addEventListener('click', function(e) {
            if (!e.target.closest('.header') && 
                !e.target.closest('.chats-sidebar') && 
                !window.appState.state.ui.sidebarOpen) {
                const messageInput = document.getElementById('messageInput');
                if (messageInput) messageInput.focus();
            }
        });
    }

    // Глобальные обработчики клавиш
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeSidebarFunction();
            if (window.educationalGames) {
                window.educationalGames.hideGamesPanel();
            }
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
                    const messageInput = document.getElementById('messageInput');
                    if (messageInput) messageInput.focus();
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

    // Кнопки игр и экспорта
    const gamesButton = document.getElementById('gamesButton');
    const exportButton = document.getElementById('exportButton');
    
    if (gamesButton) {
        gamesButton.addEventListener('click', function() {
            if (window.educationalGames) {
                window.educationalGames.showGamesPanel();
            }
        });
    }
    
    if (exportButton) {
        exportButton.addEventListener('click', function() {
            if (window.exportUtils) {
                window.exportUtils.showExportModal();
            }
        });
    }
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

    if (!chatContainer || !sidebar || !overlay) return;

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
    
    if (!modal || !closeBtn) return;
    
    // Скрываем поле ввода API ключа и связанные элементы
    if (apiKeyInput) apiKeyInput.style.display = 'none';
    if (statusEl) statusEl.style.display = 'none';
    if (testBtn) testBtn.style.display = 'none';
    if (saveBtn) saveBtn.style.display = 'none';
    
    closeBtn.addEventListener('click', hideApiKeyModal);
    
    if (saveBtn) {
        saveBtn.addEventListener('click', async function() {
            const key = apiKeyInput.value.trim();
            // Функционал сохранения скрыт
        });
    }
    
    if (testBtn) {
        testBtn.addEventListener('click', async function() {
            // Функционал тестирования скрыт
        });
    }
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            hideApiKeyModal();
        }
    });
}

// Показать модальное окно API ключа
function showApiKeyModal() {
    const modal = document.getElementById('apiKeyModal');
    if (modal) {
        modal.style.display = 'block';
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
    }
}

// Скрыть модальное окно API ключа
function hideApiKeyModal() {
    const modal = document.getElementById('apiKeyModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

// Запуск непрерывного фруктового дождя
function startContinuousFruitRain() {
    const config = window.APP_CONFIG?.fruitRain || {
        density: 18,
        spawnInterval: 120,
        speed: { min: 5, max: 10 },
        size: { min: 22, max: 36 },
        opacity: { min: 0.6, max: 0.9 }
    };
    
    if (fruitRainInterval) {
        clearInterval(fruitRainInterval);
    }
    
    createInitialFruits(config.density);
    
    fruitRainInterval = setInterval(() => {
        if (activeFruits.size < config.density) {
            createSingleFruit(config);
        }
    }, config.spawnInterval);
    
    console.log('🌧️ Непрерывный фруктовый дождь запущен');
}

// Создание начальных фруктов
function createInitialFruits(count) {
    const config = window.APP_CONFIG?.fruitRain;
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            createSingleFruit(config);
        }, Math.random() * 2000);
    }
}

// Создание одного фрукта
function createSingleFruit(config) {
    const rainContainer = document.getElementById('fruitRain');
    if (!rainContainer) return;
    
    const fruit = document.createElement('div');
    const fruitId = 'fruit_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    fruit.id = fruitId;
    fruit.className = 'fruit';
    
    fruit.textContent = getWeightedRandomFruit();
    fruit.style.left = Math.random() * 100 + 'vw';
    
    const animations = ['straight', 'left', 'right', 'sway', 'spiral', 'bounce'];
    const randomAnimation = animations[Math.floor(Math.random() * animations.length)];
    fruit.classList.add(randomAnimation);
    
    const duration = (Math.random() * (config.speed.max - config.speed.min) + config.speed.min) + 's';
    fruit.style.animationDuration = duration;
    
    fruit.style.animationDelay = (Math.random() * 2) + 's';
    
    const size = Math.random() * (config.size.max - config.size.min) + config.size.min;
    fruit.style.fontSize = size + 'px';
    
    const opacity = (Math.random() * (config.opacity.max - config.opacity.min) + config.opacity.min).toFixed(2);
    fruit.style.setProperty('--fruit-opacity', opacity);
    fruit.style.opacity = opacity;
    
    const hueRotate = Math.random() * 60 - 30;
    fruit.style.filter += ` hue-rotate(${hueRotate}deg)`;
    
    if (Math.random() < 0.1) {
        fruit.classList.add('special');
        if (Math.random() < 0.5) {
            fruit.classList.add('glow');
        }
    }
    
    fruit.style.zIndex = Math.floor(Math.random() * 10) - 5;
    
    rainContainer.appendChild(fruit);
    activeFruits.add(fruitId);
    
    const animationTime = (parseFloat(duration) + parseFloat(fruit.style.animationDelay)) * 1000;
    setTimeout(() => {
        if (document.getElementById(fruitId)) {
            document.getElementById(fruitId).remove();
            activeFruits.delete(fruitId);
        }
    }, animationTime);
    
    return fruitId;
}

// Получение случайного фрукта с учетом весов
function getWeightedRandomFruit() {
    const totalWeight = FRUIT_EMOJIS.reduce((sum, fruit) => sum + fruit.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const fruit of FRUIT_EMOJIS) {
        random -= fruit.weight;
        if (random <= 0) {
            return fruit.emoji;
        }
    }
    
    return FRUIT_EMOJIS[0].emoji;
}

// Остановка фруктового дождя
function stopFruitRain() {
    if (fruitRainInterval) {
        clearInterval(fruitRainInterval);
        fruitRainInterval = null;
    }
    
    const rainContainer = document.getElementById('fruitRain');
    if (rainContainer) {
        rainContainer.innerHTML = '';
    }
    
    activeFruits.clear();
}

// Автоматическое изменение размера текстового поля
function autoResizeTextarea(textarea) {
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
}

// Обработка ввода сообщения
function handleMessageInput() {
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    
    if (!messageInput || !sendButton) return;
    
    const message = messageInput.value.trim();
    sendButton.disabled = !message || window.appState.state.ui.loading;
}

// Обновление счетчика символов
function updateCharacterCount() {
    const messageInput = document.getElementById('messageInput');
    const charCount = document.getElementById('charCount');
    
    if (!messageInput || !charCount) return;
    
    const count = messageInput.value.length;
    charCount.textContent = `${count}/${MAX_MESSAGE_LENGTH}`;
    
    if (count > MAX_MESSAGE_LENGTH * 0.9) {
        charCount.classList.add('warning');
    } else {
        charCount.classList.remove('warning');
    }
}

// Обработка вставки текста
function handlePaste(e) {
    const pastedText = e.clipboardData.getData('text');
    if (pastedText.length > MAX_MESSAGE_LENGTH) {
        e.preventDefault();
        const trimmedText = pastedText.substring(0, MAX_MESSAGE_LENGTH);
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.value = trimmedText;
            showStatus('Текст обрезан до допустимой длины', 'info');
            updateCharacterCount();
            autoResizeTextarea(messageInput);
        }
    }
}

// Проверка открытой клавиатуры
function isKeyboardOpen() {
    return window.visualViewport && (window.visualViewport.height < window.innerHeight * 0.7);
}

// Открытие боковой панели
function openSidebar() {
    hideKeyboard();
    window.appState.setState(state => ({
        ...state,
        ui: { ...state.ui, sidebarOpen: true }
    }), 'Open sidebar');
}

// Закрытие боковой панели
function closeSidebarFunction() {
    window.appState.setState(state => ({
        ...state,
        ui: { ...state.ui, sidebarOpen: false }
    }), 'Close sidebar');
    
    setTimeout(() => {
        const messageInput = document.getElementById('messageInput');
        if (messageInput) messageInput.focus();
    }, 350);
}

// Скрытие клавиатуры
function hideKeyboard() {
    if (document.activeElement) {
        document.activeElement.blur();
    }
}

// Создание нового чата
function createNewChat() {
    const newChat = {
        id: generateChatId(),
        title: window.i18n ? window.i18n.t('newChatText') : 'Новый чат',
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
    if (messageInput) messageInput.focus();
    
    showStatus(window.i18n ? window.i18n.t('statusNewChat') : 'Новый чат создан!', 'success');
    
    // Обновление метрик
    if (window.METRICS) {
        window.METRICS.userEngagement.chatsCreated++;
    }
}

// Генерация ID чата
function generateChatId() {
    return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Загрузка конкретного чата
function loadChat(chatId) {
    window.appState.setState(state => ({
        ...state,
        currentChat: chatId
    }), `Load chat: ${chatId}`);
    
    renderChat();
    closeSidebarFunction();
    const messageInput = document.getElementById('messageInput');
    if (messageInput) messageInput.focus();
    showStatus(window.i18n ? window.i18n.t('statusChatLoaded') : 'Чат загружен', 'success');
}

// Удаление чата
function deleteChat(chatId, event) {
    if (event) event.stopPropagation();
    
    const chats = window.appState.state.chats;
    if (chats.length <= 1) {
        showStatus('Нельзя удалить единственный чат!', 'error');
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
        showStatus(window.i18n ? window.i18n.t('statusChatDeleted') : 'Чат удален!', 'success');
    }
}

// Очистка всех чатов
function clearAllChatsHandler() {
    const chats = window.appState.state.chats;
    if (chats.length === 0) {
        showStatus('Нет чатов для очистки', 'info');
        return;
    }
    
    if (confirm('Вы уверены, что хотите удалить ВСЕ чаты? Это действие нельзя отменить.')) {
        window.appState.setState(state => ({
            ...state,
            chats: [],
            currentChat: null
        }), 'Clear all chats');
        
        createNewChat();
        showStatus(window.i18n ? window.i18n.t('statusAllCleared') : 'Все чаты очищены', 'success');
    }
}

// Обновление заголовка чата
function updateChatTitle(chatId, newTitle) {
    window.appState.setState(state => ({
        ...state,
        chats: state.chats.map(chat => 
            chat.id === chatId 
                ? { ...chat, title: newTitle.substring(0, 50), updatedAt: new Date().toISOString() }
                : chat
        )
    }), `Update chat title: ${chatId}`);
}

// Отрисовка списка чатов
function renderChatsList() {
    const chatsList = document.getElementById('chatsList');
    if (!chatsList) return;
    
    const chats = window.appState.state.chats;
    
    if (chats.length === 0) {
        chatsList.innerHTML = `
            <div class="text-center text-white/70 py-8">
                <i class="fas fa-comments text-2xl mb-2"></i>
                <p>Нет сохраненных чатов</p>
            </div>
        `;
        return;
    }
    
    const sortedChats = [...chats].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    
    chatsList.innerHTML = sortedChats.map(chat => `
        <div class="chat-item ${chat.id === window.appState.state.currentChat ? 'active' : ''}">
            <div class="chat-item-content" onclick="loadChat('${chat.id}')">
                <div class="chat-header">
                    <div class="chat-title">${escapeHtml(chat.title)}</div>
                    <div class="chat-date">${formatDate(chat.updatedAt)}</div>
                </div>
                <div class="chat-preview">${getChatPreview(chat)}</div>
            </div>
            <button class="delete-chat-btn" onclick="deleteChat('${chat.id}', event)">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
}

// Получение превью чата
function getChatPreview(chat) {
    if (chat.messages.length === 0) return 'Пока нет сообщений';
    
    const lastMessage = chat.messages[chat.messages.length - 1];
    const content = lastMessage.content.substring(0, 40);
    return lastMessage.role === 'user' ? `Вы: ${content}...` : `Фруктик: ${content}...`;
}

// Форматирование даты
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) return 'Только что';
    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    if (diffDays === 1) return 'Вчера';
    if (diffDays < 7) return `${diffDays} дн назад`;
    return date.toLocaleDateString('ru-RU');
}

// Обновление счетчика чатов
function updateChatsCounter() {
    const counter = document.getElementById('chatsCount');
    if (counter) {
        counter.textContent = window.appState.state.chats.length;
    }
}

// Отрисовка текущего чата
function renderChat() {
    const chatMessages = document.getElementById('chatMessages');
    const currentChatId = window.appState.state.currentChat;
    const chats = window.appState.state.chats;
    
    if (!chatMessages) return;
    
    if (!currentChatId || chats.length === 0) {
        chatMessages.innerHTML = getEmptyChatHTML();
        return;
    }
    
    const currentChat = chats.find(chat => chat.id === currentChatId);
    if (!currentChat) {
        chatMessages.innerHTML = getEmptyChatHTML();
        return;
    }
    
    chatMessages.innerHTML = '';
    
    if (currentChat.messages.length === 0) {
        chatMessages.innerHTML = getEmptyChatHTML();
        return;
    }
    
    currentChat.messages.forEach(message => {
        addMessageToChat(message.role, message.content, false);
    });
    
    scrollToBottom();
}

// HTML для пустого чата
function getEmptyChatHTML() {
    return `
        <div class="empty-chat">
            <div class="empty-chat-icon">🍓</div>
            <h2 class="text-2xl font-bold mb-2">${window.i18n ? window.i18n.t('emptyChatTitle') : 'Начни новый разговор!'}</h2>
            <p class="text-lg mb-4">${window.i18n ? window.i18n.t('emptyChatDescription') : 'Напиши что-нибудь Фруктику, чтобы начать общение.'}</p>
            <div class="text-sm text-gray-600 max-w-md">
                <p class="font-semibold mb-2">${window.i18n ? window.i18n.t('emptyChatHelp') : '✨ Фруктик поможет с:'}</p>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-left">
                    <div class="flex items-center gap-2">
                        <span>📚</span> Домашними заданиями
                    </div>
                    <div class="flex items-center gap-2">
                        <span>🎯</span> Объяснением сложных тем
                    </div>
                    <div class="flex items-center gap-2">
                        <span>📖</span> Подготовкой к урокам
                    </div>
                    <div class="flex items-center gap-2">
                        <span>💡</span> Решением задач
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Показать статус сообщение
function showStatus(message, type = 'info') {
    const statusEl = document.getElementById('statusMessage');
    if (!statusEl) return;
    
    statusEl.textContent = message;
    statusEl.className = 'status-message';
    
    const typeClass = {
        success: 'status-success',
        error: 'status-error',
        warning: 'status-warning',
        info: 'status-info'
    }[type] || 'status-info';
    
    statusEl.classList.add(typeClass);
    statusEl.style.display = 'block';
    
    const duration = type === 'error' ? 5000 : 3000;
    setTimeout(() => {
        statusEl.style.display = 'none';
    }, duration);
}

// Показать индикатор набора
function showTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.classList.remove('hidden');
    }
    scrollToBottom();
}

// Скрыть индикатор набора
function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.classList.add('hidden');
    }
}

// Прокрутка к низу
function scrollToBottom() {
    const container = document.getElementById('chatMessages');
    if (container) {
        setTimeout(() => {
            container.scrollTop = container.scrollHeight;
        }, 100);
    }
}

// Экранирование HTML
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Ускоренная функция отправки сообщения
async function sendMessage() {
    if (window.appState.state.ui.loading) {
        showStatus('Подождите, сообщение отправляется...', 'warning');
        return;
    }
    
    if (!API_CONFIG.key) {
        showStatus(window.i18n ? window.i18n.t('errorNoApiKey') : 'Ошибка: API ключ не настроен', 'error');
        showApiKeyModal();
        return;
    }
    
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    
    if (!messageInput || !sendButton) return;
    
    let message = messageInput.value.trim();
    
    if (!message) {
        showStatus('Введите сообщение', 'error');
        messageInput.focus();
        return;
    }
    
    if (message.length > MAX_MESSAGE_LENGTH) {
        showStatus(window.i18n ? window.i18n.t('errorMessageTooLong') : 'Сообщение слишком длинное', 'error');
        return;
    }
    
    if (!navigator.onLine) {
        showStatus(window.i18n ? window.i18n.t('errorNetwork') : 'Проблемы с сетью. Проверьте подключение к интернету', 'error');
        return;
    }
    
    // Установка состояния загрузки
    window.appState.setState(state => ({
        ...state,
        ui: { ...state.ui, loading: true }
    }), 'Start sending message');
    
    sendButton.disabled = true;
    sendButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    
    const emptyChat = document.querySelector('.empty-chat');
    if (emptyChat) {
        emptyChat.remove();
    }
    
    addMessageToChat('user', message);
    messageInput.value = '';
    updateCharacterCount();
    autoResizeTextarea(messageInput);
    
    const currentChat = window.appState.state.chats.find(chat => chat.id === window.appState.state.currentChat);
    if (currentChat) {
        // Обновление чата с новым сообщением
        window.appState.setState(state => ({
            ...state,
            chats: state.chats.map(chat => 
                chat.id === currentChat.id 
                    ? {
                          ...chat,
                          messages: [...chat.messages, { role: 'user', content: message }],
                          updatedAt: new Date().toISOString()
                      }
                    : chat
            )
        }), 'Add user message to chat');
        
        // Обновление заголовка если это первое сообщение
        if (currentChat.messages.length === 0) {
            const title = message.length > 20 ? message.substring(0, 20) + '...' : message;
            updateChatTitle(currentChat.id, title);
        }
    }
    
    showTypingIndicator();
    showStatus(window.i18n ? window.i18n.t('statusConnecting') : 'Фруктик думает...', 'info');
    
    const startTime = performance.now();
    
    try {
        const response = await callHuggingFaceAPI(currentChat);
        const aiResponse = response.choices[0].message.content;
        
        // Обновление чата с ответом AI
        if (currentChat) {
            window.appState.setState(state => ({
                ...state,
                chats: state.chats.map(chat => 
                    chat.id === currentChat.id 
                        ? {
                              ...chat,
                              messages: [...chat.messages, { role: 'assistant', content: aiResponse }],
                              updatedAt: new Date().toISOString()
                          }
                        : chat
                )
            }), 'Add AI response to chat');
        }
        
        hideTypingIndicator();
        addMessageToChat('assistant', aiResponse);
        showStatus(window.i18n ? window.i18n.t('statusConnected') : 'Фруктик ответил!', 'success');
        
        // Обновление метрик
        if (window.performanceMonitor) {
            const responseTime = window.performanceMonitor.trackMessageResponse(startTime, true);
        }
        if (window.METRICS) {
            window.METRICS.userEngagement.messagesSent++;
        }
        
    } catch (error) {
        handleAPIError(error);
        if (window.performanceMonitor) {
            window.performanceMonitor.trackMessageResponse(startTime, false);
        }
    } finally {
        window.appState.setState(state => ({
            ...state,
            ui: { ...state.ui, loading: false }
        }), 'Finish sending message');
        
        sendButton.disabled = false;
        sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
        const messageInput = document.getElementById('messageInput');
        if (messageInput) messageInput.focus();
    }
}

// Оптимизированный API вызов
async function callHuggingFaceAPI(currentChat) {
    const messagesForAPI = [
        { 
            role: 'system', 
            content: `Ты - Фруктик, дружелюбный помощник для детей младшего школьного возраста. Твоя главная задача - помогать в учебе, соблюдая абсолютно правильную грамматику русского языка.

ОСОБЫЕ ПРАВИЛА:
1. Всегда отвечай грамотно, без ошибок - ты образец для ребенка
2. Используй простые, понятные предложения
3. Объясняй сложные темы доступным языком
4. Будь терпеливым и поддерживающим
5. Используй 1-2 эмодзи в ответе для дружелюбия
6. Не давай готовых ответов на домашние задания, а объясняй как решать
7. Поощряй любопытство и задавание вопросов

ПРИМЕРЫ ПРАВИЛЬНЫХ ОТВЕТОВ:
"Привет! Я Фруктик 🍎 Помогу тебе с уроками. Что ты хочешь узнать?"
"Молодец, что спросил! Давай разберем эту задачу по шагам 🧩"
"Запомни: 'жи-ши' пиши с буквой 'и'. Это правило русского языка ✏️"` 
        },
        ...(currentChat ? currentChat.messages.slice(-6) : []) // Уменьшено количество сообщений для ускорения
    ];
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // Таймаут 12 секунд
    
    const response = await fetch(API_CONFIG.url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${API_CONFIG.key}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: "deepseek-ai/DeepSeek-V2-Chat",
            messages: messagesForAPI,
            max_tokens: 600, // Уменьшено количество токенов
            temperature: 0.7,
            stream: false
        }),
        signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
            const errorData = await response.json();
            errorMessage = errorData.error?.message || errorData.error?.code || errorMessage;
        } catch (e) {
            const errorText = await response.text();
            if (errorText) {
                errorMessage = errorText;
            }
        }
        throw new Error(errorMessage);
    }
    
    return await response.json();
}

// Обработка ошибок API
function handleAPIError(error) {
    console.error('API Error:', error);
    hideTypingIndicator();
    
    let userMessage = window.i18n ? window.i18n.t('errorSending') : 'Произошла ошибка при отправке сообщения';
    
    if (error.message.includes('401') || error.message.includes('authentication')) {
        userMessage = 'Ошибка авторизации API. Проверьте настройки ключа.';
        setTimeout(() => {
            showApiKeyModal();
        }, 1000);
    } else if (error.message.includes('429')) {
        userMessage = 'Слишком много запросов. Попробуйте позже.';
    } else if (error.message.includes('network') || error.message.includes('Failed to fetch')) {
        userMessage = window.i18n ? window.i18n.t('errorNetwork') : 'Проблемы с сетью. Проверьте подключение к интернету';
    } else if (error.message.includes('quota') || error.message.includes('limit')) {
        userMessage = 'Превышен лимит API. Попробуйте позже.';
    } else if (error.name === 'AbortError') {
        userMessage = 'Время ожидания ответа истекло. Попробуйте еще раз.';
    }
    
    showStatus(userMessage, 'error');
    addMessageToChat('assistant', `Извини, произошла ошибка: ${userMessage}. Попробуй отправить сообщение еще раз. 🍓`);
}

// Добавление сообщения в чат
function addMessageToChat(role, content, animate = true) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    const emptyChat = document.querySelector('.empty-chat');
    if (emptyChat) {
        emptyChat.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${animate ? 'message-enter' : ''}`;
    
    const isUser = role === 'user';
    
    messageDiv.innerHTML = `
        <div class="message-row ${isUser ? 'user' : ''}">
            <div class="${isUser ? 'user-avatar blackberry-glow' : 'bot-avatar'}">
                <div class="sparkle-ring"></div>
                <div class="avatar-emoji-container">
                    <span class="avatar-emoji">${isUser ? '🫐' : getWeightedRandomFruit()}</span>
                </div>
            </div>
            <div class="chat-bubble ${isUser ? 'user-bubble' : 'bot-bubble'}">
                <div class="message-content">${escapeHtml(content)}</div>
                <div class="message-time">${new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    
    // Ускоренная прокрутка
    requestAnimationFrame(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });
}

// Инициализация PWA
function initializePWA() {
    if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('PWA режим');
    }
}

// Обновление статуса онлайн
function updateOnlineStatus() {
    if (navigator.onLine) {
        showStatus(window.i18n ? window.i18n.t('statusOnline') : 'Соединение восстановлено!', 'success');
    } else {
        showStatus(window.i18n ? window.i18n.t('statusOffline') : 'Отсутствует интернет-соединение', 'error');
    }
}

// Показать приветственное сообщение
function showWelcomeMessage() {
    const currentChat = window.appState.state.chats.find(c => c.id === window.appState.state.currentChat);
    if (!currentChat || currentChat.messages.length === 0) {
        setTimeout(() => {
            const tips = [
                "💡 " + (window.i18n ? window.i18n.t('tipFirstMessage') : 'Попробуйте спросить о домашнем задании или попросите объяснить сложную тему!'),
                "🎮 Нажмите на иконку игры в правом верхнем углу для образовательных игр",
                "🎤 Используйте голосовой ввод для быстрого ввода сообщений",
                "📤 Экспортируйте важные чаты для сохранения истории"
            ];
            
            const randomTip = tips[Math.floor(Math.random() * tips.length)];
            showStatus(randomTip, 'info');
        }, 2000);
    }
}

// Глобальные функции для HTML
window.loadChat = loadChat;
window.deleteChat = deleteChat;
window.addMessageToChat = addMessageToChat;
window.showStatus = showStatus;
window.generateChatId = generateChatId;

console.log('🧩 Основной скрипт Фруктик Чата v2.0 загружен!');

// Подписка на изменения состояния для автоматического обновления UI
if (window.appState) {
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
        
        if (sidebar && overlay) {
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
        }
    });

    window.appState.subscribe('ui.loading', (isLoading) => {
        const sendButton = document.getElementById('sendButton');
        if (sendButton) {
            sendButton.disabled = isLoading;
            sendButton.innerHTML = isLoading 
                ? '<i class="fas fa-spinner fa-spin"></i>' 
                : '<i class="fas fa-paper-plane"></i>';
        }
    });
} else {
    console.error('❌ State manager not available for subscriptions');
}
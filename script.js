// script.js
// Полностью прописанный скрипт Фруктик Чата с ускоренным временем ответа и детскими улучшениями

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

// Конфигурация детских настроек
const KIDS_CONFIG = {
    bigButtons: true,
    soundEffects: true,
    simpleLanguage: false,
    highContrast: false,
    floatingCharacters: true,
    currentTheme: 'default',
    fontSize: 'normal',
    volume: 80,
    rewardsEnabled: true
};

// Звуковые эффекты (base64 encoded minimal sounds)
const SOUND_EFFECTS = {
    messageSent: createSound(800, 0.1),
    messageReceived: createSound(600, 0.1),
    celebration: createSound([800, 1000, 1200], 0.3),
    error: createSound(300, 0.2),
    success: createSound([1000, 1200], 0.2),
    click: createSound(500, 0.05)
};

// Сообщения для поощрения
const ENCOURAGEMENT_MESSAGES = [
    "Молодец! Ты отлично справляешься! 🌟",
    "У тебя прекрасно получается! 🎉",
    "Так держать! Ты умничка! 💫",
    "Великолепно! Продолжай в том же духе! 🚀",
    "Твои успехи впечатляют! 🌈",
    "Ты делаешь большие успехи! ⭐",
    "Превосходно! Ты быстро учишься! 🌠",
    "Замечательная работа! Ты звезда! ✨"
];

let chats = [];
let currentChatId = null;
let isSending = false;
const MAX_CHATS = 15;
const MAX_MESSAGE_LENGTH = 1000;

let fruitRainInterval = null;
let activeFruits = new Set();
let kidsFeaturesInitialized = false;
let messageCount = 0;

const API_KEY_STORAGE_KEY = 'huggingface_api_key_custom';

// Создание простых звуков с Web Audio API
function createSound(freq, duration) {
    return {
        play: function() {
            if (!KIDS_CONFIG.soundEffects) return;
            
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                if (Array.isArray(freq)) {
                    oscillator.frequency.setValueAtTime(freq[0], audioContext.currentTime);
                    oscillator.frequency.linearRampToValueAtTime(freq[1], audioContext.currentTime + duration);
                } else {
                    oscillator.frequency.value = freq;
                }
                
                gainNode.gain.value = KIDS_CONFIG.volume / 100;
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + duration);
            } catch (error) {
                console.log('Web Audio API не поддерживается');
            }
        }
    };
}

// Ускоренная инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Ускоренная инициализация Фруктик Чата...');
    initializeApp();
});

async function initializeApp() {
    try {
        // Параллельная загрузка конфигурации и данных
        await Promise.all([
            loadConfig(),
            loadCustomApiKey()
        ]);
        
        loadChats();
        setupEventListeners();
        setupSwipeGestures();
        setupApiKeyModal();
        
        // Инициализация детских функций
        if (window.APP_CONFIG && window.APP_CONFIG.kidsMode.enabled) {
            initializeKidsFeatures();
            kidsFeaturesInitialized = true;
        }
        
        startContinuousFruitRain();
        
        document.documentElement.setAttribute('data-theme', 'light');
        initializePWA();
        updateChatsCounter();
        
        console.log('✅ Приложение полностью инициализировано с детскими функциями');
    } catch (error) {
        console.error('❌ Ошибка инициализации приложения:', error);
        showStatus('Ошибка загрузки приложения', 'error');
    }
}

// Инициализация детских функций
function initializeKidsFeatures() {
    console.log('🎮 Инициализация детских функций...');
    
    loadKidsSettings();
    setupKidsEventListeners();
    applyKidsSettings();
    createFloatingCharacters();
    setupRewardSystem();
    
    console.log('✅ Детские функции инициализированы');
}

// Загрузка детских настроек из localStorage
function loadKidsSettings() {
    try {
        const savedSettings = localStorage.getItem('fruitChatKidsSettings');
        if (savedSettings) {
            const parsedSettings = JSON.parse(savedSettings);
            Object.assign(KIDS_CONFIG, parsedSettings);
            console.log('🔧 Детские настройки загружены');
        }
    } catch (error) {
        console.error('Ошибка загрузки детских настроек:', error);
    }
}

// Сохранение детских настроек в localStorage
function saveKidsSettings() {
    try {
        localStorage.setItem('fruitChatKidsSettings', JSON.stringify(KIDS_CONFIG));
        console.log('🔧 Детские настройки сохранены');
    } catch (error) {
        console.error('Ошибка сохранения детских настроек:', error);
    }
}

// Настройка обработчиков событий для детских элементов
function setupKidsEventListeners() {
    // Кнопка звука
    const soundToggle = document.getElementById('soundToggle');
    if (soundToggle) {
        soundToggle.addEventListener('click', toggleSound);
    }
    
    // Кнопка праздника
    const celebrationBtn = document.getElementById('celebrationBtn');
    if (celebrationBtn) {
        celebrationBtn.addEventListener('click', startCelebration);
    }
    
    // Кнопка настроек
    const kidsSettingsBtn = document.getElementById('kidsSettingsBtn');
    if (kidsSettingsBtn) {
        kidsSettingsBtn.addEventListener('click', showKidsSettingsModal);
    }
    
    // Кнопки детской панели инструментов
    const colorChanger = document.getElementById('colorChanger');
    if (colorChanger) {
        colorChanger.addEventListener('click', showKidsSettingsModal);
    }
    
    const fontSizeToggle = document.getElementById('fontSizeToggle');
    if (fontSizeToggle) {
        fontSizeToggle.addEventListener('click', toggleFontSize);
    }
    
    const highContrastToggle = document.getElementById('highContrastToggle');
    if (highContrastToggle) {
        highContrastToggle.addEventListener('click', toggleHighContrast);
    }
    
    const bigButtonsToggle = document.getElementById('bigButtonsToggle');
    if (bigButtonsToggle) {
        bigButtonsToggle.addEventListener('click', toggleBigButtons);
    }
    
    // Модальное окно детских настроек
    const closeKidsSettingsModal = document.getElementById('closeKidsSettingsModal');
    if (closeKidsSettingsModal) {
        closeKidsSettingsModal.addEventListener('click', hideKidsSettingsModal);
    }
    
    const saveKidsSettings = document.getElementById('saveKidsSettings');
    if (saveKidsSettings) {
        saveKidsSettings.addEventListener('click', saveKidsSettingsHandler);
    }
    
    const resetKidsSettings = document.getElementById('resetKidsSettings');
    if (resetKidsSettings) {
        resetKidsSettings.addEventListener('click', resetKidsSettingsHandler);
    }
    
    // Выбор цветовой темы
    document.querySelectorAll('.color-theme-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const theme = this.getAttribute('data-theme');
            changeColorTheme(theme);
        });
    });
    
    // Ползунок громкости
    const volumeSlider = document.getElementById('volumeSlider');
    if (volumeSlider) {
        volumeSlider.addEventListener('input', function() {
            KIDS_CONFIG.volume = this.value;
            document.getElementById('volumeValue').textContent = this.value + '%';
            updateVolumeSlider();
        });
    }
    
    // Переключатели в модальном окне
    const bigButtonsToggleModal = document.getElementById('bigButtonsToggleModal');
    if (bigButtonsToggleModal) {
        bigButtonsToggleModal.addEventListener('change', function() {
            KIDS_CONFIG.bigButtons = this.checked;
        });
    }
    
    const soundEffectsToggleModal = document.getElementById('soundEffectsToggleModal');
    if (soundEffectsToggleModal) {
        soundEffectsToggleModal.addEventListener('change', function() {
            KIDS_CONFIG.soundEffects = this.checked;
        });
    }
    
    const simpleLanguageToggleModal = document.getElementById('simpleLanguageToggleModal');
    if (simpleLanguageToggleModal) {
        simpleLanguageToggleModal.addEventListener('change', function() {
            KIDS_CONFIG.simpleLanguage = this.checked;
        });
    }
    
    const highContrastToggleModal = document.getElementById('highContrastToggleModal');
    if (highContrastToggleModal) {
        highContrastToggleModal.addEventListener('change', function() {
            KIDS_CONFIG.highContrast = this.checked;
        });
    }
    
    const floatingCharactersToggleModal = document.getElementById('floatingCharactersToggleModal');
    if (floatingCharactersToggleModal) {
        floatingCharactersToggleModal.addEventListener('change', function() {
            KIDS_CONFIG.floatingCharacters = this.checked;
            toggleFloatingCharacters();
        });
    }
}

// Применение детских настроек
function applyKidsSettings() {
    applyBigButtons();
    applySimpleLanguage();
    applyHighContrast();
    applyColorTheme();
    applyFontSize();
    updateSoundButton();
    updateVolumeSlider();
    toggleFloatingCharacters();
    
    // Установить значения в модальном окне
    setModalValues();
}

// Установка значений в модальном окне
function setModalValues() {
    const bigButtonsToggleModal = document.getElementById('bigButtonsToggleModal');
    const soundEffectsToggleModal = document.getElementById('soundEffectsToggleModal');
    const simpleLanguageToggleModal = document.getElementById('simpleLanguageToggleModal');
    const highContrastToggleModal = document.getElementById('highContrastToggleModal');
    const floatingCharactersToggleModal = document.getElementById('floatingCharactersToggleModal');
    const volumeSlider = document.getElementById('volumeSlider');
    
    if (bigButtonsToggleModal) bigButtonsToggleModal.checked = KIDS_CONFIG.bigButtons;
    if (soundEffectsToggleModal) soundEffectsToggleModal.checked = KIDS_CONFIG.soundEffects;
    if (simpleLanguageToggleModal) simpleLanguageToggleModal.checked = KIDS_CONFIG.simpleLanguage;
    if (highContrastToggleModal) highContrastToggleModal.checked = KIDS_CONFIG.highContrast;
    if (floatingCharactersToggleModal) floatingCharactersToggleModal.checked = KIDS_CONFIG.floatingCharacters;
    if (volumeSlider) {
        volumeSlider.value = KIDS_CONFIG.volume;
        document.getElementById('volumeValue').textContent = KIDS_CONFIG.volume + '%';
    }
    
    // Обновить активную тему
    document.querySelectorAll('.color-theme-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-theme') === KIDS_CONFIG.currentTheme) {
            btn.classList.add('active');
        }
    });
}

// Применение больших кнопок
function applyBigButtons() {
    const body = document.body;
    if (KIDS_CONFIG.bigButtons) {
        body.classList.add('kid-friendly-buttons');
    } else {
        body.classList.remove('kid-friendly-buttons');
    }
}

// Применение простого языка
function applySimpleLanguage() {
    const body = document.body;
    if (KIDS_CONFIG.simpleLanguage) {
        body.classList.add('simple-language');
        // Упростить текст в интерфейсе
        simplifyInterfaceText();
    } else {
        body.classList.remove('simple-language');
        restoreInterfaceText();
    }
}

// Применение высокой контрастности
function applyHighContrast() {
    const body = document.body;
    if (KIDS_CONFIG.highContrast) {
        body.classList.add('high-contrast');
    } else {
        body.classList.remove('high-contrast');
    }
}

// Применение цветовой темы
function applyColorTheme() {
    const body = document.body;
    // Удаляем все темы
    body.classList.remove('theme-ocean', 'theme-forest', 'theme-candy');
    
    if (KIDS_CONFIG.currentTheme !== 'default') {
        body.classList.add(`theme-${KIDS_CONFIG.currentTheme}`);
    }
}

// Применение размера шрифта
function applyFontSize() {
    const body = document.body;
    if (KIDS_CONFIG.fontSize === 'large') {
        body.classList.add('kid-friendly-text');
    } else {
        body.classList.remove('kid-friendly-text');
    }
}

// Упрощение текста интерфейса
function simplifyInterfaceText() {
    // Упрощаем текст быстрых кнопок
    const quickQuestion1 = document.getElementById('quickQuestion1');
    const quickQuestion2 = document.getElementById('quickQuestion2');
    const quickQuestion3 = document.getElementById('quickQuestion3');
    const quickQuestion4 = document.getElementById('quickQuestion4');
    
    if (quickQuestion1) quickQuestion1.innerHTML = '<span>📚</span> Помощь';
    if (quickQuestion2) quickQuestion2.innerHTML = '<span>🎯</span> Объясни';
    if (quickQuestion3) quickQuestion3.innerHTML = '<span>💡</span> Факт';
    if (quickQuestion4) quickQuestion4.innerHTML = '<span>📖</span> Сказка';
    
    // Упрощаем заголовки
    const headerTitle = document.querySelector('.header h1');
    if (headerTitle) {
        headerTitle.textContent = '🍓 Фруктик 🍍';
    }
}

// Восстановление оригинального текста интерфейса
function restoreInterfaceText() {
    const quickQuestion1 = document.getElementById('quickQuestion1');
    const quickQuestion2 = document.getElementById('quickQuestion2');
    const quickQuestion3 = document.getElementById('quickQuestion3');
    const quickQuestion4 = document.getElementById('quickQuestion4');
    
    if (quickQuestion1) quickQuestion1.innerHTML = '<span>📚</span> Домашка';
    if (quickQuestion2) quickQuestion2.innerHTML = '<span>🎯</span> Объясни';
    if (quickQuestion3) quickQuestion3.innerHTML = '<span>💡</span> Факт';
    if (quickQuestion4) quickQuestion4.innerHTML = '<span>📖</span> Сказка';
    
    const headerTitle = document.querySelector('.header h1');
    if (headerTitle) {
        headerTitle.textContent = '🍓 Фруктик Чат 🍍';
    }
}

// Переключение звука
function toggleSound() {
    KIDS_CONFIG.soundEffects = !KIDS_CONFIG.soundEffects;
    updateSoundButton();
    saveKidsSettings();
    
    if (KIDS_CONFIG.soundEffects) {
        playSound('celebration');
        showStatus('Звуки включены! 🎵', 'success');
    } else {
        showStatus('Звуки выключены 🔇', 'info');
    }
}

// Обновление кнопки звука
function updateSoundButton() {
    const soundBtn = document.getElementById('soundToggle');
    if (!soundBtn) return;
    
    const icon = soundBtn.querySelector('i');
    
    if (KIDS_CONFIG.soundEffects) {
        icon.className = 'fas fa-volume-up';
        soundBtn.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
        soundBtn.title = 'Выключить звуки';
    } else {
        icon.className = 'fas fa-volume-mute';
        soundBtn.style.background = 'linear-gradient(135deg, #ff6b6b, #ee5a52)';
        soundBtn.title = 'Включить звуки';
    }
}

// Обновление ползунка громкости
function updateVolumeSlider() {
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeValue = document.getElementById('volumeValue');
    
    if (volumeSlider && volumeValue) {
        volumeSlider.value = KIDS_CONFIG.volume;
        volumeValue.textContent = KIDS_CONFIG.volume + '%';
    }
}

// Воспроизведение звука
function playSound(soundName) {
    if (!KIDS_CONFIG.soundEffects) return;
    
    try {
        const sound = SOUND_EFFECTS[soundName];
        if (sound) {
            sound.play();
        }
    } catch (error) {
        console.error('Ошибка воспроизведения звука:', error);
    }
}

// Запуск праздничной анимации
function startCelebration() {
    playSound('celebration');
    
    // Анимация праздника для чата
    const chatContainer = document.querySelector('.chat-container');
    if (chatContainer) {
        chatContainer.classList.add('celebrating');
        
        // Убрать анимацию через 1.5 секунды
        setTimeout(() => {
            chatContainer.classList.remove('celebrating');
        }, 1500);
    }
    
    // Создание конфетти
    createConfetti();
    
    // Показать праздничное сообщение
    showStatus('Ура! Праздник! 🎉', 'success');
    
    // Добавить праздничное сообщение от Фруктика
    if (currentChatId) {
        const celebrationMessages = [
            "Ура! Давайте праздновать! 🎉",
            "Вот это веселье! 🥳",
            "Какой замечательный день! 🌟",
            "Я так рад празднику! 🎊",
            "Танцуем! 💃🕺"
        ];
        
        const randomMessage = celebrationMessages[Math.floor(Math.random() * celebrationMessages.length)];
        addMessageToChat('assistant', randomMessage);
        
        // Сохраняем в историю чата
        const currentChat = chats.find(chat => chat.id === currentChatId);
        if (currentChat) {
            currentChat.messages.push({ role: 'assistant', content: randomMessage });
            currentChat.updatedAt = new Date().toISOString();
            saveChats();
        }
    }
}

// Создание конфетти
function createConfetti() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'];
    
    for (let i = 0; i < 75; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.width = (Math.random() * 15 + 8) + 'px';
            confetti.style.height = (Math.random() * 15 + 8) + 'px';
            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
            confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
            confetti.style.animationDelay = (Math.random() * 2) + 's';
            
            document.body.appendChild(confetti);
            
            // Удалить конфетти после анимации
            setTimeout(() => {
                if (confetti.parentNode) {
                    confetti.parentNode.removeChild(confetti);
                }
            }, 5000);
        }, i * 30);
    }
}

// Создание плавающих персонажей
function createFloatingCharacters() {
    // Персонажи уже добавлены в HTML, просто обновляем их видимость
    toggleFloatingCharacters();
}

// Переключение плавающих персонажей
function toggleFloatingCharacters() {
    const characters = document.querySelectorAll('.floating-character');
    characters.forEach(character => {
        if (KIDS_CONFIG.floatingCharacters) {
            character.style.display = 'block';
        } else {
            character.style.display = 'none';
        }
    });
}

// Переключение размера шрифта
function toggleFontSize() {
    if (KIDS_CONFIG.fontSize === 'normal') {
        KIDS_CONFIG.fontSize = 'large';
        applyFontSize();
        showStatus('Шрифт увеличен! 🔍', 'success');
    } else {
        KIDS_CONFIG.fontSize = 'normal';
        applyFontSize();
        showStatus('Шрифт обычного размера', 'info');
    }
    
    saveKidsSettings();
    playSound('click');
}

// Переключение высокой контрастности
function toggleHighContrast() {
    KIDS_CONFIG.highContrast = !KIDS_CONFIG.highContrast;
    applyHighContrast();
    saveKidsSettings();
    
    if (KIDS_CONFIG.highContrast) {
        showStatus('Высокая контрастность включена', 'success');
    } else {
        showStatus('Обычный режим', 'info');
    }
    
    playSound('click');
}

// Переключение больших кнопок
function toggleBigButtons() {
    KIDS_CONFIG.bigButtons = !KIDS_CONFIG.bigButtons;
    applyBigButtons();
    saveKidsSettings();
    
    if (KIDS_CONFIG.bigButtons) {
        showStatus('Большие кнопки включены! 👆', 'success');
    } else {
        showStatus('Обычные кнопки', 'info');
    }
    
    playSound('click');
}

// Показать модальное окно детских настроек
function showKidsSettingsModal() {
    const modal = document.getElementById('kidsSettingsModal');
    if (!modal) return;
    
    // Установить текущие значения
    setModalValues();
    
    modal.style.display = 'block';
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
    
    playSound('click');
}

// Скрыть модальное окно детских настроек
function hideKidsSettingsModal() {
    const modal = document.getElementById('kidsSettingsModal');
    if (!modal) return;
    
    modal.classList.remove('active');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

// Обработчик сохранения детских настроек
function saveKidsSettingsHandler() {
    // Обновляем настройки из модального окна
    const bigButtonsToggleModal = document.getElementById('bigButtonsToggleModal');
    const soundEffectsToggleModal = document.getElementById('soundEffectsToggleModal');
    const simpleLanguageToggleModal = document.getElementById('simpleLanguageToggleModal');
    const highContrastToggleModal = document.getElementById('highContrastToggleModal');
    const floatingCharactersToggleModal = document.getElementById('floatingCharactersToggleModal');
    
    if (bigButtonsToggleModal) KIDS_CONFIG.bigButtons = bigButtonsToggleModal.checked;
    if (soundEffectsToggleModal) KIDS_CONFIG.soundEffects = soundEffectsToggleModal.checked;
    if (simpleLanguageToggleModal) KIDS_CONFIG.simpleLanguage = simpleLanguageToggleModal.checked;
    if (highContrastToggleModal) KIDS_CONFIG.highContrast = highContrastToggleModal.checked;
    if (floatingCharactersToggleModal) KIDS_CONFIG.floatingCharacters = floatingCharactersToggleModal.checked;
    
    // Применяем настройки
    applyKidsSettings();
    
    // Сохраняем и закрываем
    saveKidsSettings();
    hideKidsSettingsModal();
    showStatus('Настройки сохранены! ✅', 'success');
    playSound('success');
}

// Обработчик сброса настроек
function resetKidsSettingsHandler() {
    if (confirm('Вернуть все настройки к значениям по умолчанию?')) {
        // Сброс к значениям по умолчанию
        KIDS_CONFIG.bigButtons = true;
        KIDS_CONFIG.soundEffects = true;
        KIDS_CONFIG.simpleLanguage = false;
        KIDS_CONFIG.highContrast = false;
        KIDS_CONFIG.floatingCharacters = true;
        KIDS_CONFIG.currentTheme = 'default';
        KIDS_CONFIG.fontSize = 'normal';
        KIDS_CONFIG.volume = 80;
        
        // Применяем и сохраняем
        applyKidsSettings();
        saveKidsSettings();
        
        showStatus('Настройки сброшены! 🔄', 'success');
        playSound('success');
    }
}

// Смена цветовой темы
function changeColorTheme(theme) {
    KIDS_CONFIG.currentTheme = theme;
    applyColorTheme();
    saveKidsSettings();
    
    const themeNames = {
        'default': 'Стандартная',
        'ocean': 'Океан',
        'forest': 'Лес',
        'candy': 'Конфетная'
    };
    
    showStatus(`Тема изменена: ${themeNames[theme]}`, 'success');
    playSound('click');
    
    // Обновить активную кнопку темы
    document.querySelectorAll('.color-theme-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-theme') === theme) {
            btn.classList.add('active');
        }
    });
}

// Настройка системы поощрений
function setupRewardSystem() {
    if (!KIDS_CONFIG.rewardsEnabled) return;
    
    console.log('🎁 Система поощрений активирована');
}

// Показать случайное поощрение
function showRandomEncouragement() {
    if (!KIDS_CONFIG.rewardsEnabled) return;
    
    const randomMessage = ENCOURAGEMENT_MESSAGES[Math.floor(Math.random() * ENCOURAGEMENT_MESSAGES.length)];
    showStatus(randomMessage, 'success');
    playSound('success');
}

// Показать специальное поощрение
function showSpecialEncouragement() {
    if (!KIDS_CONFIG.rewardsEnabled) return;
    
    const specialMessages = [
        "🎊 Ты просто супер! 10 сообщений! 🎊",
        "🌟 Вау! Целых 10 вопросов! Ты любознательный! 🌟",
        "🚀 Невероятно! Ты задал 10 вопросов! Продолжай! 🚀"
    ];
    
    const randomMessage = specialMessages[Math.floor(Math.random() * specialMessages.length)];
    showStatus(randomMessage, 'success');
    playSound('celebration');
    startCelebration();
}

// Создание звезд награды
function createRewardStars() {
    if (!KIDS_CONFIG.rewardsEnabled) return;
    
    const starsContainer = document.getElementById('rewardStars');
    if (!starsContainer) return;
    
    for (let i = 0; i < 15; i++) {
        const star = document.createElement('div');
        star.className = 'reward-star';
        star.innerHTML = '⭐';
        star.style.left = Math.random() * 100 + 'vw';
        star.style.animationDelay = (Math.random() * 2) + 's';
        star.style.fontSize = (Math.random() * 20 + 15) + 'px';
        
        starsContainer.appendChild(star);
        
        // Удалить звезду после анимации
        setTimeout(() => {
            if (star.parentNode) {
                star.parentNode.removeChild(star);
            }
        }, 3000);
    }
}

// Оптимизированная загрузка API ключа
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

// Мгновенная загрузка конфигурации
function loadConfig() {
    return new Promise((resolve) => {
        // Убрана искусственная задержка для ускорения
        if (!API_CONFIG.key) {
            console.warn('⚠️ API ключ не настроен');
        } else {
            console.log('✅ API ключ настроен');
        }
        resolve();
    });
}

// Настройка всех обработчиков событий
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
            if (messageInput.value.trim() && !isSending) {
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
                playSound('click');
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
            !document.getElementById('chatsSidebar').classList.contains('active')) {
            messageInput.focus();
        }
    });

    // Глобальные обработчики клавиш
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeSidebarFunction();
        }
    });

    // Предупреждение при закрытии страницы во время отправки
    window.addEventListener('beforeunload', function(e) {
        if (isSending) {
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
}

// Настройка свайп-жестов для мобильных устройств
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

// Показать модальное окно API ключа
function showApiKeyModal() {
    const modal = document.getElementById('apiKeyModal');
    modal.style.display = 'block';
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
}

// Скрыть модальное окно API ключа
function hideApiKeyModal() {
    const modal = document.getElementById('apiKeyModal');
    modal.classList.remove('active');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

// Показать статус API ключа
function showApiKeyStatus(message, type) {
    const statusEl = document.getElementById('apiKeyStatus');
    statusEl.textContent = message;
    statusEl.className = 'api-key-status';
    
    if (type === 'valid') {
        statusEl.classList.add('valid');
    } else if (type === 'invalid') {
        statusEl.classList.add('invalid');
    }
}

// Тестирование API ключа
async function testApiKey(key) {
    try {
        const response = await fetch('https://huggingface.co/api/whoami-v2', {
            headers: {
                'Authorization': `Bearer ${key}`
            }
        });
        
        return response.ok;
    } catch (error) {
        console.error('Ошибка проверки API ключа:', error);
        return false;
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

// Обновление плотности фруктового дождя
function updateFruitRainDensity(newDensity) {
    const config = window.APP_CONFIG.fruitRain;
    config.density = newDensity;
    
    stopFruitRain();
    startContinuousFruitRain();
}

// Обработчики видимости страницы для оптимизации
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        if (fruitRainInterval) {
            clearInterval(fruitRainInterval);
            fruitRainInterval = setInterval(() => {
                if (activeFruits.size < window.APP_CONFIG.fruitRain.density * 0.5) {
                    createSingleFruit(window.APP_CONFIG.fruitRain);
                }
            }, 500);
        }
    } else {
        stopFruitRain();
        startContinuousFruitRain();
    }
});

// Адаптация к изменению размера окна
window.addEventListener('resize', function() {
    const isMobile = window.innerWidth < 768;
    const newDensity = isMobile ? 12 : 18;
    
    if (newDensity !== window.APP_CONFIG.fruitRain.density) {
        updateFruitRainDensity(newDensity);
    }
});

// Автоматическое изменение размера текстового поля
function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
}

// Обработка ввода сообщения
function handleMessageInput() {
    const message = document.getElementById('messageInput').value.trim();
    const sendButton = document.getElementById('sendButton');
    
    sendButton.disabled = !message || isSending;
}

// Обновление счетчика символов
function updateCharacterCount() {
    const messageInput = document.getElementById('messageInput');
    const charCount = document.getElementById('charCount');
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
        document.getElementById('messageInput').value = trimmedText;
        showStatus('Текст обрезан до допустимой длины', 'info');
        updateCharacterCount();
        autoResizeTextarea(document.getElementById('messageInput'));
    }
}

// Проверка открытой клавиатуры
function isKeyboardOpen() {
    return window.visualViewport && (window.visualViewport.height < window.innerHeight * 0.7);
}

// Открытие боковой панели
function openSidebar() {
    const sidebar = document.getElementById('chatsSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    hideKeyboard();
    
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
}

// Закрытие боковой панели
function closeSidebarFunction() {
    const sidebar = document.getElementById('chatsSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    sidebar.classList.remove('active');
    sidebar.style.transform = 'translateX(-100%)';
    sidebar.style.opacity = '0';
    
    overlay.classList.remove('active');
    overlay.style.opacity = '0';
    setTimeout(() => {
        overlay.style.display = 'none';
    }, 300);
    
    document.body.style.overflow = '';
    
    setTimeout(() => {
        document.getElementById('messageInput').focus();
    }, 350);
}

// Скрытие клавиатуры
function hideKeyboard() {
    document.activeElement.blur();
}

// Загрузка чатов из localStorage
function loadChats() {
    try {
        const savedChats = localStorage.getItem('fruitChats');
        if (savedChats) {
            chats = JSON.parse(savedChats);
            
            if (chats.length > 0) {
                const lastActiveChat = chats.find(chat => chat.id === currentChatId) || chats[chats.length - 1];
                currentChatId = lastActiveChat.id;
                loadChat(currentChatId);
            } else {
                createNewChat();
            }
        } else {
            createNewChat();
        }
    } catch (error) {
        console.error('Ошибка загрузки чатов:', error);
        showStatus('Ошибка загрузки чатов', 'error');
        createNewChat();
    }
    updateChatsCounter();
}

// Сохранение чатов в localStorage
function saveChats() {
    try {
        if (chats.length > MAX_CHATS) {
            const chatsToRemove = chats.length - MAX_CHATS;
            chats = chats.slice(chatsToRemove);
            showStatus(`Удалены старые чаты (сохранено ${MAX_CHATS})`, 'info');
        }
        
        localStorage.setItem('fruitChats', JSON.stringify(chats));
        updateChatsCounter();
    } catch (error) {
        console.error('Ошибка сохранения чатов:', error);
        showStatus('Ошибка сохранения чатов', 'error');
    }
}

// Создание нового чата
function createNewChat() {
    const newChat = {
        id: generateChatId(),
        title: 'Новый чат',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    chats.push(newChat);
    currentChatId = newChat.id;
    saveChats();
    renderChat();
    renderChatsList();
    closeSidebarFunction();
    
    const messageInput = document.getElementById('messageInput');
    messageInput.focus();
    
    showStatus('Новый чат создан!', 'success');
    if (kidsFeaturesInitialized) {
        playSound('success');
    }
}

// Генерация ID чата
function generateChatId() {
    return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Загрузка конкретного чата
function loadChat(chatId) {
    currentChatId = chatId;
    renderChat();
    closeSidebarFunction();
    document.getElementById('messageInput').focus();
    showStatus('Чат загружен', 'success');
    if (kidsFeaturesInitialized) {
        playSound('click');
    }
}

// Удаление чата
function deleteChat(chatId, event) {
    if (event) {
        event.stopPropagation();
    }
    
    if (chats.length <= 1) {
        showStatus('Нельзя удалить единственный чат!', 'error');
        return;
    }
    
    if (confirm('Вы уверены, что хотите удалить этот чат? Все сообщения будут потеряны.')) {
        const chatIndex = chats.findIndex(chat => chat.id === chatId);
        
        chats = chats.filter(chat => chat.id !== chatId);
        
        if (currentChatId === chatId) {
            const newIndex = chatIndex >= chats.length ? chats.length - 1 : chatIndex;
            currentChatId = chats.length > 0 ? chats[newIndex].id : null;
        }
        
        saveChats();
        renderChat();
        renderChatsList();
        showStatus('Чат удален!', 'success');
        if (kidsFeaturesInitialized) {
            playSound('success');
        }
    }
}

// Очистка всех чатов
function clearAllChatsHandler() {
    if (chats.length === 0) {
        showStatus('Нет чатов для очистки', 'info');
        return;
    }
    
    if (confirm('Вы уверены, что хотите удалить ВСЕ чаты? Это действие нельзя отменить.')) {
        chats = [];
        createNewChat();
        showStatus('Все чаты очищены', 'success');
        if (kidsFeaturesInitialized) {
            playSound('success');
        }
    }
}

// Обновление заголовка чата
function updateChatTitle(chatId, newTitle) {
    const chat = chats.find(c => c.id === chatId);
    if (chat && chat.title !== newTitle) {
        chat.title = newTitle.substring(0, 50);
        chat.updatedAt = new Date().toISOString();
        saveChats();
        renderChatsList();
    }
}

// Отрисовка списка чатов
function renderChatsList() {
    const chatsList = document.getElementById('chatsList');
    
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
        <div class="chat-item ${chat.id === currentChatId ? 'active' : ''}">
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
        counter.textContent = chats.length;
    }
}

// Отрисовка текущего чата
function renderChat() {
    const chatMessages = document.getElementById('chatMessages');
    
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
            <h2 class="text-2xl font-bold mb-2">Начни новый разговор!</h2>
            <p class="text-lg mb-4">Напиши что-нибудь Фруктику, чтобы начать общение.</p>
            <div class="text-sm text-gray-600 max-w-md">
                <p class="font-semibold mb-2">✨ Фруктик поможет с:</p>
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
    document.getElementById('typingIndicator').classList.remove('hidden');
    scrollToBottom();
}

// Скрыть индикатор набора
function hideTypingIndicator() {
    document.getElementById('typingIndicator').classList.add('hidden');
}

// Прокрутка к низу
function scrollToBottom() {
    const container = document.getElementById('chatMessages');
    setTimeout(() => {
        container.scrollTop = container.scrollHeight;
    }, 100);
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
    if (isSending) {
        showStatus('Подождите, сообщение отправляется...', 'warning');
        return;
    }
    
    if (!API_CONFIG.key) {
        showStatus('Ошибка: API ключ не настроен', 'error');
        showApiKeyModal();
        return;
    }
    
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    let message = messageInput.value.trim();
    
    if (!message) {
        showStatus('Введите сообщение', 'error');
        messageInput.focus();
        return;
    }
    
    if (message.length > MAX_MESSAGE_LENGTH) {
        showStatus(`Сообщение слишком длинное (максимум ${MAX_MESSAGE_LENGTH} символов)`, 'error');
        return;
    }
    
    if (!navigator.onLine) {
        showStatus('Отсутствует интернет-соединение', 'error');
        return;
    }
    
    isSending = true;
    sendButton.disabled = true;
    sendButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    
    const emptyChat = document.getElementById('emptyChat');
    if (emptyChat) {
        emptyChat.remove();
    }
    
    // Воспроизвести звук отправки
    if (kidsFeaturesInitialized) {
        playSound('messageSent');
    }
    
    addMessageToChat('user', message);
    messageInput.value = '';
    updateCharacterCount();
    autoResizeTextarea(messageInput);
    
    const currentChat = chats.find(chat => chat.id === currentChatId);
    if (currentChat) {
        currentChat.messages.push({ role: 'user', content: message });
        
        // Система поощрений
        messageCount++;
        if (KIDS_CONFIG.rewardsEnabled) {
            // Случайное поощрение каждые 3-5 сообщений
            if (messageCount >= 3 && Math.random() < 0.3) {
                setTimeout(() => {
                    showRandomEncouragement();
                    messageCount = 0;
                }, 1000);
            }
            
            // Награда за каждое 10-е сообщение
            if (messageCount % 10 === 0) {
                setTimeout(() => {
                    createRewardStars();
                    showSpecialEncouragement();
                }, 1500);
            }
        }
        
        if (currentChat.messages.length === 1) {
            const title = message.length > 20 ? message.substring(0, 20) + '...' : message;
            updateChatTitle(currentChatId, title);
        }
        
        currentChat.updatedAt = new Date().toISOString();
        saveChats();
    }
    
    showTypingIndicator();
    showStatus('Фруктик думает...', 'info');
    
    try {
        const response = await callHuggingFaceAPI(currentChat);
        const aiResponse = response.choices[0].message.content;
        
        if (currentChat) {
            currentChat.messages.push({ role: 'assistant', content: aiResponse });
            currentChat.updatedAt = new Date().toISOString();
            saveChats();
        }
        
        hideTypingIndicator();
        addMessageToChat('assistant', aiResponse);
        showStatus('Фруктик ответил!', 'success');
        
        // Воспроизвести звук получения
        if (kidsFeaturesInitialized) {
            setTimeout(() => {
                playSound('messageReceived');
            }, 1000);
        }
        
    } catch (error) {
        handleAPIError(error);
    } finally {
        isSending = false;
        sendButton.disabled = false;
        sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
        messageInput.focus();
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
        ...currentChat.messages.slice(-6) // Уменьшено количество сообщений для ускорения
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
            model: MODEL,
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
    
    let userMessage = 'Произошла ошибка при отправке сообщения';
    
    if (error.message.includes('401') || error.message.includes('authentication')) {
        userMessage = 'Ошибка авторизации API. Проверьте настройки ключа.';
        setTimeout(() => {
            showApiKeyModal();
        }, 1000);
    } else if (error.message.includes('429')) {
        userMessage = 'Слишком много запросов. Попробуйте позже.';
    } else if (error.message.includes('network') || error.message.includes('Failed to fetch')) {
        userMessage = 'Проблемы с сетью. Проверьте подключение к интернету.';
    } else if (error.message.includes('quota') || error.message.includes('limit')) {
        userMessage = 'Превышен лимит API. Попробуйте позже.';
    } else if (error.name === 'AbortError') {
        userMessage = 'Время ожидания ответа истекло. Попробуйте еще раз.';
    }
    
    showStatus(userMessage, 'error');
    addMessageToChat('assistant', `Извини, произошла ошибка: ${userMessage}. Попробуй отправить сообщение еще раз. 🍓`);
    
    if (kidsFeaturesInitialized) {
        playSound('error');
    }
}

// Добавление сообщения в чат
function addMessageToChat(role, content, animate = true) {
    const chatMessages = document.getElementById('chatMessages');
    
    const emptyChat = document.getElementById('emptyChat');
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
    
    updateOnlineStatus();
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
}

// Обновление статуса онлайн
function updateOnlineStatus() {
    if (navigator.onLine) {
        showStatus('Соединение восстановлено!', 'success');
    } else {
        showStatus('Отсутствует интернет-соединение', 'error');
    }
}

// Глобальные функции для HTML
window.loadChat = loadChat;
window.deleteChat = deleteChat;
window.showKidsSettingsModal = showKidsSettingsModal;
window.startCelebration = startCelebration;
window.toggleSound = toggleSound;
window.toggleFontSize = toggleFontSize;
window.toggleHighContrast = toggleHighContrast;
window.toggleBigButtons = toggleBigButtons;

console.log('🧩 Фруктик Чат полностью загружен с детскими улучшениями!');
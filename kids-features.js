// kids-features.js
// Полностью прописанные детские улучшения

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
    if (typeof currentChatId !== 'undefined' && currentChatId) {
        const celebrationMessages = [
            "Ура! Давайте праздновать! 🎉",
            "Вот это веселье! 🥳",
            "Какой замечательный день! 🌟",
            "Я так рад празднику! 🎊",
            "Танцуем! 💃🕺"
        ];
        
        const randomMessage = celebrationMessages[Math.floor(Math.random() * celebrationMessages.length)];
        
        // Используем существующую функцию добавления сообщения
        if (typeof addMessageToChat !== 'undefined') {
            addMessageToChat('assistant', randomMessage);
        }
        
        // Сохраняем в историю чата, если доступно
        if (typeof chats !== 'undefined' && typeof currentChatId !== 'undefined') {
            const currentChat = chats.find(chat => chat.id === currentChatId);
            if (currentChat) {
                currentChat.messages.push({ role: 'assistant', content: randomMessage });
                currentChat.updatedAt = new Date().toISOString();
                if (typeof saveChats !== 'undefined') {
                    saveChats();
                }
            }
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
    
    // Случайное поощрение каждые 3-5 сообщений
    let messageCount = 0;
    
    // Перехватываем функцию добавления сообщений, если она существует
    if (typeof addMessageToChat !== 'undefined') {
        const originalAddMessage = addMessageToChat;
        window.addMessageToChat = function(role, content, animate) {
            originalAddMessage(role, content, animate);
            
            if (role === 'user') {
                messageCount++;
                
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
        };
    }
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

// Показать статус сообщение (совместимость с основным скриптом)
function showStatus(message, type = 'info') {
    // Используем существующую функцию showStatus если доступна
    if (typeof window.showStatus !== 'undefined') {
        window.showStatus(message, type);
        return;
    }
    
    // Или создаем простую реализацию
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

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        initializeKidsFeatures();
    }, 100);
});

// Глобальные функции для доступа из HTML
window.showKidsSettingsModal = showKidsSettingsModal;
window.startCelebration = startCelebration;
window.toggleSound = toggleSound;
window.toggleFontSize = toggleFontSize;
window.toggleHighContrast = toggleHighContrast;
window.toggleBigButtons = toggleBigButtons;

console.log('🧒 Детские улучшения загружены и готовы к использованию!');
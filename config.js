// config.js
// Полностью прописанная конфигурация с ускоренными настройками и детскими улучшениями
(function() {
    'use strict';
    
    window.API_KEYS = window.API_KEYS || {
        huggingface: null
    };

    window.APP_CONFIG = {
        version: '1.4.0',
        maxMessageLength: 1000,
        maxChats: 15,
        theme: 'light',
        responseTimeout: 12000,
        typingSpeed: 30,
        // Детские настройки по умолчанию
        kidsMode: {
            enabled: true,
            bigButtons: true,
            soundEffects: true,
            simpleLanguage: false,
            highContrast: false,
            floatingCharacters: true,
            rewardsEnabled: true,
            themes: ['default', 'ocean', 'forest', 'candy'],
            defaultVolume: 80
        },
        animations: {
            enabled: true,
            duration: 0.2,
            messageSlideIn: 0.15,
            bubbleAppear: 0.2,
            // Новые анимации для детей
            celebration: true,
            floatingCharacters: true,
            confetti: true,
            rewards: true
        },
        fruitRain: {
            enabled: true,
            density: 18,
            spawnInterval: 120,
            speed: { min: 5, max: 10 },
            size: { min: 22, max: 36 },
            opacity: { min: 0.6, max: 0.9 }
        },
        performance: {
            useWebGL: false,
            optimizeAnimations: true,
            reduceMotion: false,
            // Оптимизации для детского режима
            kidsModeOptimized: true,
            lazyLoadKidsFeatures: true
        },
        accessibility: {
            highContrast: false,
            largeText: false,
            screenReaderSupport: true,
            keyboardNavigation: true
        }
    };
    
    console.log('🎯 Ускоренная конфигурация Фруктик Чата с детскими улучшениями загружена');
})();
// config.js
// Расширенная конфигурация с оптимизациями
(function() {
    'use strict';
    
    // Инициализируем глобальные объекты если они не существуют
    window.API_KEYS = window.API_KEYS || {
        huggingface: null
    };

    window.APP_CONFIG = {
        version: '2.0.0',
        maxMessageLength: 1000,
        maxChats: 20,
        theme: 'light',
        language: 'ru',
        responseTimeout: 12000,
        typingSpeed: 30,
        
        // Оптимизации производительности
        performance: {
            useIntersectionObserver: true,
            virtualScroll: false,
            lazyLoadImages: true,
            debounceInput: 150,
            throttleScroll: 50,
            maxCachedMessages: 1000,
            enableCompression: true,
            useWebGL: false,
            optimizeAnimations: true,
            reduceMotion: false
        },
        
        // Анимации
        animations: {
            enabled: true,
            duration: 0.2,
            messageSlideIn: 0.15,
            bubbleAppear: 0.2,
            reducedMotion: false
        },
        
        // Фруктовый дождь
        fruitRain: {
            enabled: true,
            density: 18,
            spawnInterval: 120,
            speed: { min: 5, max: 10 },
            size: { min: 22, max: 36 },
            opacity: { min: 0.6, max: 0.9 }
        },
        
        // Голосовой ввод
        voiceInput: {
            enabled: true,
            language: 'ru-RU',
            continuous: false,
            interimResults: true
        },
        
        // Уведомления
        notifications: {
            enabled: true,
            sound: true,
            vibration: true,
            achievementPopups: true
        },
        
        // Игры
        games: {
            enabled: true,
            difficulty: 'medium',
            showHints: true,
            autoSave: true
        },
        
        // Аналитика
        analytics: {
            enabled: true,
            trackPerformance: true,
            trackErrors: true,
            trackUserActions: true
        }
    };
    
    // Система метрик
    window.METRICS = {
        messageResponseTime: [],
        userEngagement: {
            sessionStart: Date.now(),
            messagesSent: 0,
            chatsCreated: 0,
            gamesPlayed: 0,
            achievementsUnlocked: 0
        },
        errors: {
            apiErrors: 0,
            networkErrors: 0,
            renderErrors: 0
        },
        performance: {
            loadTime: 0,
            renderTime: 0,
            memoryUsage: 0
        }
    };
    
    console.log('🎯 Расширенная конфигурация Фруктик Чата v2.0 загружена');
})();

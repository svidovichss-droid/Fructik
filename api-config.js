// api-config.js
// Конфигурация API ключа
(function() {
    'use strict';
    
    // Зашифрованный API ключ (base64)
    const ENCRYPTED_KEY = 'aGZfWGlvUmR1aEJkcWhFVEZDa1hKWVRjTHN3TW1sSkRzZ0tWcw==';
    
    // Простая декодировка
    function decodeKey(encrypted) {
        try {
            return atob(encrypted);
        } catch (e) {
            console.error('Ошибка декодирования ключа:', e);
            return null;
        }
    }
    
    // Инициализация API ключа
    window.API_KEYS = {
        huggingface: decodeKey(ENCRYPTED_KEY)
    };
    
    // Проверяем и устанавливаем ключ
    if (window.API_KEYS.huggingface) {
        console.log('🔑 API ключ успешно загружен');
        // Устанавливаем ключ в глобальную конфигурацию
        if (typeof window.API_CONFIG !== 'undefined') {
            window.API_CONFIG.key = window.API_KEYS.huggingface;
        }
    } else {
        console.error('❌ Не удалось загрузить API ключ');
    }
    
    console.log('🔑 API конфигурация инициализирована');
})();

[file name]: performance-monitor.js
[file content begin]
// performance-monitor.js
// Система мониторинга производительности и аналитики
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            loadTime: 0,
            renderTime: 0,
            messageResponseTime: [],
            memoryUsage: [],
            networkRequests: [],
            userInteractions: []
        };
        
        this.observers = [];
        this.isMonitoring = false;
        
        this.init();
    }
    
    init() {
        // Отслеживание времени загрузки
        window.addEventListener('load', () => {
            this.metrics.loadTime = performance.now();
            this.logMetric('load_time', this.metrics.loadTime);
        });
        
        // Отслеживание использования памяти
        if ('memory' in performance) {
            setInterval(() => this.trackMemory(), 30000);
        }
        
        // Отслеживание взаимодействий пользователя
        this.trackUserInteractions();
        
        // Отслеживание сетевых запросов
        this.trackNetworkRequests();
        
        this.isMonitoring = true;
    }
    
    // Отслеживание использования памяти
    trackMemory() {
        if ('memory' in performance) {
            const memory = performance.memory;
            this.metrics.memoryUsage.push({
                timestamp: Date.now(),
                used: memory.usedJSHeapSize,
                total: memory.totalJSHeapSize,
                limit: memory.jsHeapSizeLimit
            });
            
            // Ограничение размера массива
            if (this.metrics.memoryUsage.length > 100) {
                this.metrics.memoryUsage.shift();
            }
            
            // Предупреждение о высокой нагрузке памяти
            if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.8) {
                this.triggerWarning('high_memory_usage', {
                    used: this.formatBytes(memory.usedJSHeapSize),
                    limit: this.formatBytes(memory.jsHeapSizeLimit)
                });
            }
        }
    }
    
    // Отслеживание сетевых запросов
    trackNetworkRequests() {
        const originalFetch = window.fetch;
        window.fetch = (...args) => {
            const startTime = performance.now();
            return originalFetch(...args).then(response => {
                const endTime = performance.now();
                const duration = endTime - startTime;
                
                this.metrics.networkRequests.push({
                    url: args[0],
                    method: args[1]?.method || 'GET',
                    status: response.status,
                    duration: duration,
                    timestamp: Date.now()
                });
                
                // Логирование медленных запросов
                if (duration > 5000) {
                    this.logMetric('slow_network_request', duration, { url: args[0] });
                }
                
                return response;
            }).catch(error => {
                this.logError('network_request_failed', { url: args[0], error: error.message });
                throw error;
            });
        };
    }
    
    // Отслеживание взаимодействий пользователя
    trackUserInteractions() {
        const trackInteraction = (type, element) => {
            this.metrics.userInteractions.push({
                type,
                element: element?.tagName || 'unknown',
                timestamp: Date.now(),
                url: window.location.href
            });
        };
        
        document.addEventListener('click', (e) => {
            trackInteraction('click', e.target);
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                trackInteraction('keypress', document.activeElement);
            }
        });
    }
    
    // Отслеживание времени ответа на сообщения
    trackMessageResponse(startTime, success = true) {
        const responseTime = performance.now() - startTime;
        this.metrics.messageResponseTime.push({
            responseTime,
            success,
            timestamp: Date.now()
        });
        
        this.logMetric('message_response_time', responseTime, { success });
        
        return responseTime;
    }
    
    // Логирование метрик
    logMetric(name, value, tags = {}) {
        const metric = {
            name,
            value,
            tags,
            timestamp: Date.now()
        };
        
        console.log(`📊 Metric: ${name} = ${value}`, tags);
        
        // Отправка в аналитику (если настроена)
        if (window.APP_CONFIG?.analytics?.enabled) {
            this.sendToAnalytics(metric);
        }
        
        // Уведомление наблюдателей
        this.notifyObservers('metric', metric);
    }
    
    // Логирование ошибок
    logError(type, error, context = {}) {
        const errorData = {
            type,
            error: error?.message || error,
            stack: error?.stack,
            context,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        console.error(`🚨 Error: ${type}`, errorData);
        
        // Обновление глобальной метрики ошибок
        window.METRICS.errors[type] = (window.METRICS.errors[type] || 0) + 1;
        
        // Отправка в аналитику
        if (window.APP_CONFIG?.analytics?.enabled) {
            this.sendToAnalytics({ ...errorData, name: 'error' });
        }
        
        this.notifyObservers('error', errorData);
    }
    
    // Отправка в аналитику
    sendToAnalytics(data) {
        // В реальном приложении здесь будет отправка на сервер аналитики
        // Например: Google Analytics, Yandex.Metrica, или собственная система
        try {
            // Имитация отправки
            if (navigator.onLine) {
                const analyticsData = {
                    ...data,
                    appVersion: window.APP_CONFIG?.version,
                    sessionId: this.getSessionId()
                };
                
                // Сохранение в localStorage для последующей отправки
                this.queueAnalyticsData(analyticsData);
            }
        } catch (error) {
            console.warn('Analytics send failed:', error);
        }
    }
    
    // Очередь данных аналитики для офлайн-работы
    queueAnalyticsData(data) {
        try {
            const queue = JSON.parse(localStorage.getItem('analytics_queue') || '[]');
            queue.push(data);
            
            // Ограничение размера очереди
            if (queue.length > 100) {
                queue.splice(0, queue.length - 100);
            }
            
            localStorage.setItem('analytics_queue', JSON.stringify(queue));
        } catch (error) {
            console.warn('Failed to queue analytics data:', error);
        }
    }
    
    // Получение ID сессии
    getSessionId() {
        let sessionId = sessionStorage.getItem('session_id');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('session_id', sessionId);
        }
        return sessionId;
    }
    
    // Триггер предупреждения
    triggerWarning(type, data) {
        const warning = {
            type,
            data,
            timestamp: Date.now()
        };
        
        console.warn(`⚠️ Warning: ${type}`, data);
        this.notifyObservers('warning', warning);
    }
    
    // Подписка на события
    subscribe(event, callback) {
        this.observers.push({ event, callback });
        return () => {
            this.observers = this.observers.filter(obs => obs.callback !== callback);
        };
    }
    
    // Уведомление наблюдателей
    notifyObservers(event, data) {
        this.observers.forEach(observer => {
            if (observer.event === event) {
                try {
                    observer.callback(data);
                } catch (error) {
                    console.error('Error in performance observer:', error);
                }
            }
        });
    }
    
    // Получение отчета о производительности
    getPerformanceReport() {
        const now = Date.now();
        const oneHourAgo = now - (60 * 60 * 1000);
        
        const recentMetrics = {
            messageResponseTime: this.metrics.messageResponseTime
                .filter(m => m.timestamp > oneHourAgo)
                .map(m => m.responseTime),
            
            networkRequests: this.metrics.networkRequests
                .filter(r => r.timestamp > oneHourAgo),
            
            userInteractions: this.metrics.userInteractions
                .filter(i => i.timestamp > oneHourAgo)
        };
        
        const avgResponseTime = recentMetrics.messageResponseTime.length > 0 ?
            recentMetrics.messageResponseTime.reduce((a, b) => a + b, 0) / recentMetrics.messageResponseTime.length : 0;
        
        const successRate = this.metrics.messageResponseTime.length > 0 ?
            (this.metrics.messageResponseTime.filter(m => m.success).length / this.metrics.messageResponseTime.length) * 100 : 0;
        
        return {
            summary: {
                loadTime: this.metrics.loadTime,
                avgResponseTime: Math.round(avgResponseTime),
                successRate: Math.round(successRate),
                totalMessages: this.metrics.messageResponseTime.length,
                totalErrors: Object.values(window.METRICS.errors).reduce((a, b) => a + b, 0)
            },
            recent: recentMetrics,
            memory: this.metrics.memoryUsage.slice(-10)
        };
    }
    
    // Форматирование байтов
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // Оптимизация производительности
    optimizePerformance() {
        // Очистка старых данных
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        this.metrics.messageResponseTime = this.metrics.messageResponseTime.filter(m => m.timestamp > oneDayAgo);
        this.metrics.networkRequests = this.metrics.networkRequests.filter(r => r.timestamp > oneDayAgo);
        this.metrics.userInteractions = this.metrics.userInteractions.filter(i => i.timestamp > oneDayAgo);
        
        // Принудительный сбор мусора (если доступен)
        if (window.gc) {
            window.gc();
        }
        
        console.log('🧹 Performance optimization completed');
    }
}

// Создание глобального экземпляра
window.performanceMonitor = new PerformanceMonitor();

console.log('📊 Performance Monitor initialized');
[file content end]
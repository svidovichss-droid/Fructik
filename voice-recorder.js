// voice-recorder.js
// Система голосового ввода
class VoiceRecorder {
    constructor() {
        this.recognition = null;
        this.isRecording = false;
        this.transcript = '';
        this.finalTranscript = '';
        this.audioContext = null;
        this.analyser = null;
        this.mediaRecorder = null;
        this.audioChunks = [];
        
        this.init();
    }
    
    init() {
        this.setupSpeechRecognition();
        this.setupEventListeners();
    }
    
    // Настройка распознавания речи
    setupSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            this.recognition.lang = window.APP_CONFIG?.voiceInput?.language || 'ru-RU';
            this.recognition.maxAlternatives = 1;
            
            this.recognition.onstart = () => {
                this.isRecording = true;
                this.transcript = '';
                this.finalTranscript = '';
                this.updateVoiceStatus('recording');
                this.startVisualization();
            };
            
            this.recognition.onresult = (event) => {
                let interimTranscript = '';
                
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        this.finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
                
                this.transcript = this.finalTranscript + interimTranscript;
                this.updateVoiceResult(this.transcript);
            };
            
            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.handleRecognitionError(event.error);
            };
            
            this.recognition.onend = () => {
                this.isRecording = false;
                this.stopVisualization();
                this.updateVoiceStatus('processing');
                
                // Если есть финальный текст, показываем кнопку использования
                if (this.finalTranscript.trim()) {
                    this.showUseTextButton();
                } else {
                    this.updateVoiceStatus('ready');
                }
            };
        } else {
            console.warn('Speech recognition not supported');
        }
    }
    
    // Настройка обработчиков событий
    setupEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            const voiceButton = document.getElementById('voiceInputButton');
            const startRecordingBtn = document.getElementById('startRecording');
            const useVoiceTextBtn = document.getElementById('useVoiceText');
            const closeVoiceModal = document.getElementById('closeVoiceModal');
            
            voiceButton?.addEventListener('click', () => {
                this.showVoiceModal();
            });
            
            startRecordingBtn?.addEventListener('click', () => {
                this.startRecording();
            });
            
            useVoiceTextBtn?.addEventListener('click', () => {
                this.useVoiceText();
            });
            
            closeVoiceModal?.addEventListener('click', () => {
                this.hideVoiceModal();
            });
            
            // Закрытие модалки по клику на оверлей
            document.getElementById('voiceModal')?.addEventListener('click', (e) => {
                if (e.target.id === 'voiceModal') {
                    this.hideVoiceModal();
                }
            });
        });
    }
    
    // Показ модалки голосового ввода
    showVoiceModal() {
        const modal = document.getElementById('voiceModal');
        if (modal) {
            modal.style.display = 'block';
            setTimeout(() => {
                modal.classList.add('active');
            }, 10);
            
            this.resetVoiceUI();
        }
    }
    
    // Скрытие модалки голосового ввода
    hideVoiceModal() {
        const modal = document.getElementById('voiceModal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.style.display = 'none';
                this.stopRecording();
            }, 300);
        }
    }
    
    // Сброс UI голосового ввода
    resetVoiceUI() {
        this.transcript = '';
        this.finalTranscript = '';
        
        const voiceResult = document.getElementById('voiceResult');
        const useVoiceTextBtn = document.getElementById('useVoiceText');
        const voiceStatus = document.getElementById('voiceStatus');
        
        if (voiceResult) voiceResult.classList.add('hidden');
        if (useVoiceTextBtn) useVoiceTextBtn.classList.add('hidden');
        if (voiceStatus) {
            voiceStatus.textContent = window.i18n?.t('voiceStatusReady') || 'Нажмите "Начать запись" и говорите...';
        }
        
        this.stopVisualization();
    }
    
    // Начало записи
    startRecording() {
        if (!this.recognition) {
            this.showError('Голосовой ввод не поддерживается в вашем браузере');
            return;
        }
        
        if (this.isRecording) {
            this.stopRecording();
            return;
        }
        
        try {
            this.recognition.start();
            this.updateVoiceStatus('recording');
        } catch (error) {
            console.error('Failed to start recording:', error);
            this.showError('Не удалось начать запись. Проверьте разрешения микрофона.');
        }
    }
    
    // Остановка записи
    stopRecording() {
        if (this.recognition && this.isRecording) {
            this.recognition.stop();
        }
        this.isRecording = false;
        this.stopVisualization();
    }
    
    // Использование распознанного текста
    useVoiceText() {
        if (this.finalTranscript.trim()) {
            const messageInput = document.getElementById('messageInput');
            if (messageInput) {
                messageInput.value = this.finalTranscript;
                messageInput.dispatchEvent(new Event('input'));
                this.autoResizeTextarea(messageInput);
            }
            
            this.hideVoiceModal();
            
            // Логирование использования голосового ввода
            window.performanceMonitor?.logMetric('voice_input_used', 1, {
                textLength: this.finalTranscript.length
            });
        }
    }
    
    // Обновление статуса голосового ввода
    updateVoiceStatus(status) {
        const voiceStatus = document.getElementById('voiceStatus');
        const startRecordingBtn = document.getElementById('startRecording');
        
        if (!voiceStatus || !startRecordingBtn) return;
        
        const lang = window.i18n?.getCurrentLanguage() || 'ru';
        const statusTexts = {
            ready: window.i18n?.t('voiceStatusReady') || 'Нажмите "Начать запись" и говорите...',
            recording: window.i18n?.t('voiceStatusRecording') || 'Запись идет... Говорите сейчас',
            processing: window.i18n?.t('voiceStatusProcessing') || 'Обрабатываем речь...'
        };
        
        voiceStatus.textContent = statusTexts[status] || statusTexts.ready;
        
        // Обновление кнопки
        if (status === 'recording') {
            startRecordingBtn.innerHTML = '<i class="fas fa-stop"></i> Остановить запись';
            startRecordingBtn.classList.add('recording');
        } else {
            startRecordingBtn.innerHTML = '<i class="fas fa-microphone"></i> ' + 
                (window.i18n?.t('startRecordText') || 'Начать запись');
            startRecordingBtn.classList.remove('recording');
        }
    }
    
    // Обновление результата распознавания
    updateVoiceResult(text) {
        const voiceResult = document.getElementById('voiceResult');
        if (voiceResult) {
            voiceResult.textContent = text;
            voiceResult.classList.remove('hidden');
        }
    }
    
    // Показ кнопки использования текста
    showUseTextButton() {
        const useVoiceTextBtn = document.getElementById('useVoiceText');
        if (useVoiceTextBtn) {
            useVoiceTextBtn.classList.remove('hidden');
        }
    }
    
    // Обработка ошибок распознавания
    handleRecognitionError(error) {
        console.error('Speech recognition error:', error);
        
        const errorMessages = {
            'no-speech': 'Речь не распознана. Попробуйте еще раз.',
            'audio-capture': 'Не удалось получить доступ к микрофону.',
            'not-allowed': 'Доступ к микрофону запрещен.',
            'network': 'Проблемы с сетью.',
            'service-not-allowed': 'Сервис распознавания недоступен.'
        };
        
        this.showError(errorMessages[error] || 'Произошла ошибка при распознавании речи');
        this.updateVoiceStatus('ready');
    }
    
    // Показ ошибки
    showError(message) {
        const voiceStatus = document.getElementById('voiceStatus');
        if (voiceStatus) {
            voiceStatus.textContent = message;
            voiceStatus.style.color = '#ff6b6b';
        }
    }
    
    // Визуализация звука
    startVisualization() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        // Запрос доступа к микрофону
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                const source = this.audioContext.createMediaStreamSource(stream);
                this.analyser = this.audioContext.createAnalyser();
                this.analyser.fftSize = 256;
                
                source.connect(this.analyser);
                this.animateVisualizer();
            })
            .catch(error => {
                console.error('Error accessing microphone:', error);
            });
    }
    
    // Анимация визуализатора
    animateVisualizer() {
        if (!this.analyser || !this.isRecording) return;
        
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        const visualizer = document.getElementById('voiceVisualizer');
        const bars = visualizer?.querySelectorAll('.voice-bar');
        
        if (!visualizer || !bars) return;
        
        const animate = () => {
            if (!this.isRecording) return;
            
            this.analyser.getByteFrequencyData(dataArray);
            
            bars.forEach((bar, index) => {
                const value = dataArray[index % bufferLength];
                const height = Math.max(5, (value / 255) * 100);
                bar.style.height = `${height}%`;
                bar.style.backgroundColor = `hsl(${200 + (value / 255) * 60}, 70%, 60%)`;
            });
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    // Остановка визуализации
    stopVisualization() {
        const bars = document.querySelectorAll('.voice-bar');
        bars.forEach(bar => {
            bar.style.height = '5%';
            bar.style.backgroundColor = '#e2e8f0';
        });
    }
    
    // Автоматическое изменение размера текстового поля
    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
    
    // Проверка поддержки голосового ввода
    isSupported() {
        return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    }
    
    // Получение статистики использования
    getStats() {
        return {
            supported: this.isSupported(),
            used: this.finalTranscript.length > 0,
            totalCharacters: this.finalTranscript.length
        };
    }
}

// Создание глобального экземпляра
window.voiceRecorder = new VoiceRecorder();

console.log('🎤 Voice Recorder system initialized');

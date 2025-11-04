// export-utils.js
// Система экспорта чатов
class ExportUtils {
    constructor() {
        this.formats = {
            pdf: this.exportToPDF.bind(this),
            txt: this.exportToTXT.bind(this),
            json: this.exportToJSON.bind(this)
        };
        
        this.setupEventListeners();
    }
    
    // Настройка обработчиков событий
    setupEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            const exportButton = document.getElementById('exportButton');
            const exportChatBtn = document.getElementById('exportChat');
            const closeExportModal = document.getElementById('closeExportModal');
            
            exportButton?.addEventListener('click', () => {
                this.showExportModal();
            });
            
            exportChatBtn?.addEventListener('click', () => {
                this.exportChat();
            });
            
            closeExportModal?.addEventListener('click', () => {
                this.hideExportModal();
            });
            
            // Закрытие модалки по клику на оверлей
            document.getElementById('exportModal')?.addEventListener('click', (e) => {
                if (e.target.id === 'exportModal') {
                    this.hideExportModal();
                }
            });
        });
    }
    
    // Показ модалки экспорта
    showExportModal() {
        const modal = document.getElementById('exportModal');
        if (modal) {
            modal.style.display = 'block';
            setTimeout(() => {
                modal.classList.add('active');
            }, 10);
        }
    }
    
    // Скрытие модалки экспорта
    hideExportModal() {
        const modal = document.getElementById('exportModal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    }
    
    // Экспорт чата
    async exportChat() {
        const format = document.querySelector('input[name="exportFormat"]:checked')?.value || 'pdf';
        const exporter = this.formats[format];
        
        if (exporter) {
            try {
                await exporter();
                this.showExportSuccess(format);
                
                // Логирование экспорта
                window.performanceMonitor?.logMetric('chat_exported', 1, { format });
            } catch (error) {
                console.error('Export failed:', error);
                this.showExportError(error.message);
            }
        }
        
        this.hideExportModal();
    }
    
    // Экспорт в PDF
    async exportToPDF() {
        const chat = window.appState.state.chats.find(c => c.id === window.appState.state.currentChat);
        if (!chat) {
            throw new Error('Чат не найден');
        }
        
        // Создание содержимого PDF
        const content = this.generatePDFContent(chat);
        
        // Использование jsPDF для создания PDF
        if (typeof jspdf !== 'undefined') {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Заголовок
            doc.setFontSize(20);
            doc.text(`Чат: ${chat.title}`, 20, 30);
            
            // Дата экспорта
            doc.setFontSize(12);
            doc.text(`Экспортировано: ${new Date().toLocaleString()}`, 20, 45);
            
            // Сообщения
            let yPosition = 70;
            doc.setFontSize(10);
            
            chat.messages.forEach((message, index) => {
                const role = message.role === 'user' ? 'Вы' : 'Фруктик';
                const time = new Date().toLocaleTimeString();
                const text = `${role} (${time}): ${message.content}`;
                
                // Разбивка текста на строки
                const lines = doc.splitTextToSize(text, 170);
                
                // Проверка места на странице
                if (yPosition + (lines.length * 7) > 280) {
                    doc.addPage();
                    yPosition = 20;
                }
                
                doc.text(lines, 20, yPosition);
                yPosition += (lines.length * 7) + 5;
                
                // Разделитель между сообщениями
                if (index < chat.messages.length - 1) {
                    doc.setDrawColor(200, 200, 200);
                    doc.line(20, yPosition, 190, yPosition);
                    yPosition += 10;
                }
            });
            
            // Сохранение PDF
            doc.save(`chat_${chat.title}_${Date.now()}.pdf`);
        } else {
            // Fallback: открытие в новом окне для печати
            this.openPrintView(chat);
        }
    }
    
    // Генерация содержимого для PDF
    generatePDFContent(chat) {
        let content = `Чат: ${chat.title}\n`;
        content += `Создан: ${new Date(chat.createdAt).toLocaleString()}\n`;
        content += `Экспортировано: ${new Date().toLocaleString()}\n\n`;
        content += '='.repeat(50) + '\n\n';
        
        chat.messages.forEach(message => {
            const role = message.role === 'user' ? 'Вы' : 'Фруктик';
            const time = new Date().toLocaleTimeString();
            content += `${role} (${time}):\n`;
            content += `${message.content}\n\n`;
            content += '-'.repeat(30) + '\n\n';
        });
        
        return content;
    }
    
    // Открытие вида для печати
    openPrintView(chat) {
        const printWindow = window.open('', '_blank');
        const content = this.generatePDFContent(chat);
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${chat.title}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .message { margin-bottom: 20px; padding: 10px; border-left: 3px solid #ccc; }
                    .user { border-left-color: #667eea; background: #f8f9fa; }
                    .bot { border-left-color: #ff6b6b; background: #fff5f5; }
                    .role { font-weight: bold; margin-bottom: 5px; }
                    .time { color: #666; font-size: 0.9em; }
                    @media print {
                        body { margin: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>${chat.title}</h1>
                    <p>Создан: ${new Date(chat.createdAt).toLocaleString()}</p>
                    <p>Экспортировано: ${new Date().toLocaleString()}</p>
                </div>
                <div class="messages">
                    ${chat.messages.map(message => `
                        <div class="message ${message.role}">
                            <div class="role">${message.role === 'user' ? 'Вы' : 'Фруктик'}</div>
                            <div class="time">${new Date().toLocaleTimeString()}</div>
                            <div class="content">${message.content.replace(/\n/g, '<br>')}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="no-print" style="margin-top: 30px; text-align: center;">
                    <button onclick="window.print()">Печать</button>
                    <button onclick="window.close()">Закрыть</button>
                </div>
            </body>
            </html>
        `);
        
        printWindow.document.close();
    }
    
    // Экспорт в TXT
    exportToTXT() {
        const chat = window.appState.state.chats.find(c => c.id === window.appState.state.currentChat);
        if (!chat) {
            throw new Error('Чат не найден');
        }
        
        const content = this.generateTXTContent(chat);
        this.downloadFile(content, `chat_${chat.title}_${Date.now()}.txt`, 'text/plain');
    }
    
    // Генерация содержимого для TXT
    generateTXTContent(chat) {
        let content = `Чат: ${chat.title}\n`;
        content += `Создан: ${new Date(chat.createdAt).toLocaleString()}\n`;
        content += `Экспортировано: ${new Date().toLocaleString()}\n`;
        content += '='.repeat(50) + '\n\n';
        
        chat.messages.forEach(message => {
            const role = message.role === 'user' ? 'Вы' : 'Фруктик';
            const time = new Date().toLocaleTimeString();
            content += `[${time}] ${role}:\n`;
            content += `${message.content}\n\n`;
            content += '-'.repeat(40) + '\n\n';
        });
        
        return content;
    }
    
    // Экспорт в JSON
    exportToJSON() {
        const chat = window.appState.state.chats.find(c => c.id === window.appState.state.currentChat);
        if (!chat) {
            throw new Error('Чат не найден');
        }
        
        const exportData = {
            metadata: {
                title: chat.title,
                createdAt: chat.createdAt,
                updatedAt: chat.updatedAt,
                exportedAt: new Date().toISOString(),
                version: '1.0'
            },
            messages: chat.messages
        };
        
        const content = JSON.stringify(exportData, null, 2);
        this.downloadFile(content, `chat_${chat.title}_${Date.now()}.json`, 'application/json');
    }
    
    // Скачивание файла
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
    
    // Показ успешного сообщения об экспорте
    showExportSuccess(format) {
        const formatNames = {
            pdf: 'PDF',
            txt: 'текстовый файл',
            json: 'JSON'
        };
        
        window.showStatus(`Чат успешно экспортирован в формате ${formatNames[format]}`, 'success');
    }
    
    // Показ ошибки экспорта
    showExportError(message) {
        window.showStatus(`Ошибка при экспорте: ${message}`, 'error');
    }
    
    // Получение статистики экспорта
    getExportStats() {
        const exports = JSON.parse(localStorage.getItem('export_stats') || '[]');
        return {
            totalExports: exports.length,
            lastExport: exports[exports.length - 1],
            formats: exports.reduce((acc, exp) => {
                acc[exp.format] = (acc[exp.format] || 0) + 1;
                return acc;
            }, {})
        };
    }
}

// Создание глобального экземпляра
window.exportUtils = new ExportUtils();

console.log('📤 Export Utils system initialized');

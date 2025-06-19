document.addEventListener('DOMContentLoaded', function() {
    const tableBody = document.getElementById('tableBody');
    const calculateBtn = document.getElementById('calculateBtn');
    const clearBtn = document.getElementById('clearBtn');
    const copyBtn = document.getElementById('copyBtn');
    const sumDisplays = [
        document.getElementById('sum1'),
        document.getElementById('sum2'),
        document.getElementById('sum3'),
        document.getElementById('sum4')
    ];
    const summaryItems = [
        document.getElementById('summary1'),
        document.getElementById('summary2'),
        document.getElementById('summary3'),
        document.getElementById('summary4')
    ];

    // Создать 12 строк при загрузке
    createTableRows();

    // Создать 12 строк таблицы
    function createTableRows() {
        for (let row = 0; row < 12; row++) {
            const tr = document.createElement('tr');
            for (let col = 0; col < 4; col++) {
                const td = document.createElement('td');
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'cell-input';
                input.value = '';
                input.inputMode = 'decimal';
                input.autocomplete = 'off';
                input.spellcheck = false;
                input.placeholder = '0';
                input.addEventListener('paste', handlePaste);
                input.addEventListener('input', cleanNumericInput);
                input.addEventListener('blur', cleanNumericInput);
                td.appendChild(input);
                tr.appendChild(td);
            }
            tableBody.appendChild(tr);
        }
    }

    // Функция очистки нечисловых символов
    function cleanNumericInput(e) {
        const input = e.target;
        let value = input.value;
        
        // Удаляем все символы кроме цифр, точек, запятых и минуса
        value = value.replace(/[^\d.,\-]/g, '');
        
        // Заменяем запятые на точки для корректного парсинга
        value = value.replace(/,/g, '.');
        
        // Убираем лишние точки (оставляем только первую)
        const parts = value.split('.');
        if (parts.length > 2) {
            value = parts[0] + '.' + parts.slice(1).join('');
        }
        
        // Убираем лишние минусы (оставляем только в начале)
        if (value.startsWith('-')) {
            value = '-' + value.substring(1).replace(/-/g, '');
        } else {
            value = value.replace(/-/g, '');
        }
        
        // Обновляем значение в поле
        input.value = value;
    }

    // Обработка paste события
    function handlePaste(e) {
        e.preventDefault(); // Предотвращаем стандартную вставку
        
        // Получаем данные из буфера обмена
        const clipboardData = e.clipboardData || window.clipboardData;
        const pastedData = clipboardData.getData('text');
        
        // Найти координаты ячейки
        const startInput = e.target;
        const tr = startInput.closest('tr');
        const rowIndex = Array.from(tableBody.children).indexOf(tr);
        const colIndex = Array.from(tr.children).findIndex(td => td.contains(startInput));
        
        // Обрабатываем вставленные данные
        processPasteData(pastedData, rowIndex, colIndex);
    }

    // Обработка вставленных данных из Excel
    function processPasteData(pastedData, startRow, startCol) {
        // Разбиваем данные на строки
        const rows = pastedData.split(/\r?\n/).filter(row => row.trim() !== '');
        
        // Обрабатываем каждую строку
        rows.forEach((row, rowOffset) => {
            const targetRowIndex = startRow + rowOffset;
            
            // Проверяем, что строка существует в таблице
            if (targetRowIndex < tableBody.children.length) {
                const targetRow = tableBody.children[targetRowIndex];
                
                // Разбиваем строку на ячейки (по табуляции)
                const cells = row.split('\t');
                
                // Вставляем каждую ячейку в соответствующий столбец
                cells.forEach((cellValue, colOffset) => {
                    const targetColIndex = startCol + colOffset;
                    
                    // Проверяем, что столбец существует
                    if (targetColIndex < 4) {
                        const targetCell = targetRow.children[targetColIndex];
                        const input = targetCell.querySelector('.cell-input');
                        
                        if (input) {
                            // Очищаем значение от нечисловых символов
                            let cleanValue = cellValue.replace(/[^\d.,\-]/g, '');
                            cleanValue = cleanValue.replace(/,/g, '.');
                            
                            // Убираем лишние точки
                            const parts = cleanValue.split('.');
                            if (parts.length > 2) {
                                cleanValue = parts[0] + '.' + parts.slice(1).join('');
                            }
                            
                            // Убираем лишние минусы
                            if (cleanValue.startsWith('-')) {
                                cleanValue = '-' + cleanValue.substring(1).replace(/-/g, '');
                            } else {
                                cleanValue = cleanValue.replace(/-/g, '');
                            }
                            
                            input.value = cleanValue;
                        }
                    }
                });
            }
        });
        
        // Пересчитываем суммы после вставки
        calculateAllSums();
    }

    // Очистить всю таблицу
    clearBtn.addEventListener('click', function() {
        const inputs = tableBody.querySelectorAll('.cell-input');
        inputs.forEach(input => {
            input.value = '';
        });
        calculateAllSums();
        showNotification('Все ячейки очищены');
    });

    // Копировать результаты
    copyBtn.addEventListener('click', function() {
        const results = [];
        summaryItems.forEach(item => {
            results.push(item.textContent);
        });
        
        const textToCopy = results.join('\n');
        
        // Копируем в буфер обмена
        navigator.clipboard.writeText(textToCopy).then(() => {
            // Показываем обратную связь
            copyBtn.classList.add('copied');
            showCopyToast();
            setTimeout(() => {
                copyBtn.classList.remove('copied');
            }, 2000);
        }).catch(err => {
            // Fallback для старых браузеров
            const textArea = document.createElement('textarea');
            textArea.value = textToCopy;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            copyBtn.classList.add('copied');
            showCopyToast();
            setTimeout(() => {
                copyBtn.classList.remove('copied');
            }, 2000);
        });
    });

    // Показать всплывающее уведомление "Скопировано"
    function showCopyToast() {
        // Если уже есть уведомление — не дублируем
        if (document.querySelector('.copy-toast')) return;
        const toast = document.createElement('div');
        toast.className = 'copy-toast';
        toast.textContent = 'Скопировано';
        document.body.appendChild(toast);
        setTimeout(() => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 2000);
    }

    // Подсчет сумм
    function calculateAllSums() {
        let sums = [0, 0, 0, 0];
        let numbersByCol = [[], [], [], []];
        
        for (let row of tableBody.children) {
            for (let i = 0; i < 4; i++) {
                const val = row.children[i].firstChild.value.replace(/\s/g, '').replace(/,/g, '.');
                const num = parseFloat(val);
                if (!isNaN(num) && isFinite(num)) {
                    sums[i] += num;
                    numbersByCol[i].push(num);
                }
            }
        }
        
        // Обновляем отображение сумм в таблице
        for (let i = 0; i < 4; i++) {
            sumDisplays[i].textContent = `Сумма: ${formatNumber(sums[i])}`;
            sumDisplays[i].classList.add('highlight');
            setTimeout(() => sumDisplays[i].classList.remove('highlight'), 2000);
        }
        
        // Обновляем текстовые строки с суммами
        const columnNames = ['Сортировка МП', 'Сборка', 'Предсортировка', 'Сортировка СЦ'];
        for (let i = 0; i < 4; i++) {
            summaryItems[i].textContent = `${columnNames[i]} - ${formatNumber(sums[i])}`;
        }

        // Обновляем блок проверки подсчетов
        for (let i = 0; i < 4; i++) {
            const checkCol = document.getElementById(`check${i+1}`);
            if (numbersByCol[i].length === 0) {
                checkCol.innerHTML = `<strong>${columnNames[i]}</strong><div class='check-list'>Нет чисел</div>`;
            } else {
                checkCol.innerHTML = `<strong>${columnNames[i]}</strong><div class='check-list'>${numbersByCol[i].map(n => formatNumber(n)).join(' + ')}</div><span class='check-sum'>= ${formatNumber(sums[i])}</span>`;
            }
        }
    }

    // Форматирование числа
    function formatNumber(num) {
        return num.toLocaleString('ru-RU', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        });
    }

    // Подсчет по кнопке
    calculateBtn.addEventListener('click', function() {
        calculateAllSums();
        showNotification('Подсчет завершен!');
    });

    // Автоматический пересчет при изменении ячеек
    tableBody.addEventListener('input', function(e) {
        if (e.target.classList.contains('cell-input')) {
            calculateAllSums();
        }
    });

    // Уведомления
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4caf50;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 2000);
    }
}); 
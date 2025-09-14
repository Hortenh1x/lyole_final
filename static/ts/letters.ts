// // letters.ts
// declare var bootstrap: any;

// /**
//  * Показывает toast уведомление с заданным сообщением
//  * @param message - текст сообщения для отображения
//  * @param type - тип уведомления (success, error, info, warning)
//  */
// function showToast(message: string, type: string = 'info'): void {
//     const toastElement = document.getElementById('flashToast');
//     const toastBody = document.getElementById('toastMessage');
    
//     if (!toastElement || !toastBody) {
//         console.error('Toast элементы не найдены');
//         return;
//     }
    
//     // Устанавливаем сообщение
//     toastBody.textContent = message;
    
//     // Добавляем соответствующий класс для стилизации
//     toastElement.className = `toast border-0`;
    
//     switch (type) {
//         case 'success':
//             toastElement.classList.add('bg-success', 'text-white');
//             break;
//         case 'error':
//             toastElement.classList.add('bg-danger', 'text-white');
//             break;
//         case 'warning':
//             toastElement.classList.add('bg-warning', 'text-dark');
//             break;
//         default:
//             toastElement.classList.add('bg-info', 'text-white');
//     }
    
//     // Создаем и показываем toast
//     const toast = new bootstrap.Toast(toastElement, {
//         autohide: true,
//         delay: 4000 // 4 секунды
//     });
    
//     toast.show();
// }

// /**
//  * Показывает массив flash сообщений
//  * @param messages - массив сообщений для отображения
//  */
// function showFlashMessages(messages: string[]): void {
//     messages.forEach((message, index) => {
//         // Показываем сообщения с небольшой задержкой, если их несколько
//         setTimeout(() => {
//             // Определяем тип сообщения по содержимому
//             let type = 'info';
//             if (message.includes('Успешно') || message.includes('успешно')) {
//                 type = 'success';
//             } else if (message.includes('Ошибка') || message.includes('ошибка')) {
//                 type = 'error';
//             } else if (message.includes('Введи') || message.includes('введи')) {
//                 type = 'warning';
//             }
            
//             showToast(message, type);
//         }, index * 500); // Задержка в 500мс между сообщениями
//     });
// }

// // Экспортируем функции для использования в HTML
// (window as any).showToast = showToast;
// (window as any).showFlashMessages = showFlashMessages;
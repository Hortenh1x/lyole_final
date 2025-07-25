"use strict";
document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('complimentBtn');
    const card = document.getElementById('card');
    const complimentText = document.getElementById('complimentText');
    if (!button || !card || !complimentText) {
        console.error("Элементы не найдены в DOM");
        return;
    }
    button.addEventListener('click', () => {
        button.disabled = true;
        button.style.transform = 'translateY(0px) scale(1)';
        complimentText.textContent = '';
        complimentText.innerHTML = '<div class="loading-dots"><span>.</span><span>.</span><span>.</span></div>';
        fetch('/get_compliment')
            .then((response) => response.json())
            .then((data) => {
            if (!card.classList.contains('show')) {
                card.classList.add('show');
            }
            setTimeout(() => {
                complimentText.textContent = data.compliment;
                complimentText.classList.add('compliment-text');
            }, 200);
        })
            .catch((error) => {
            console.error('Ошибка:', error);
            if (!card.classList.contains('show')) {
                card.classList.add('show');
            }
            complimentText.textContent = "Не удалось загрузить((";
            complimentText.classList.add('compliment-text');
        })
            .finally(() => {
            setTimeout(() => {
                button.disabled = false;
                button.style.transform = '';
            }, 500);
        });
    });
    // Глобальный обработчик кликов вне карточки
    document.addEventListener('click', (e) => {
        if (!card || !button)
            return;
        const target = e.target;
        if (!card.contains(target) && target !== button) {
            card.classList.remove('show');
        }
    });
});

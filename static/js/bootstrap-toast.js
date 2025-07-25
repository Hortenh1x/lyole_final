// Минимальная реализация Bootstrap Toast на TypeScript
// Извлечено из Bootstrap 5.3.0
// Утилита для работы с событиями
const EventHandler = {
    on(element, event, handler) {
        element.addEventListener(event, handler);
    },
    off(element, event, handler) {
        element.removeEventListener(event, handler);
    },
    trigger(element, event) {
        const evt = new Event(event, { bubbles: true });
        element.dispatchEvent(evt);
    }
};
// Класс Toast
class Toast {
    constructor(element, config = {}) {
        this._timeout = null;
        this._hasMouseInteraction = false;
        this._hasKeyboardInteraction = false;
        this._isShown = false;
        this._element = element;
        this._config = {
            animation: true,
            autohide: true,
            delay: 5000,
            ...config
        };
        this._init();
    }
    _init() {
        // Добавляем обработчики событий
        const closeBtn = this._element.querySelector('.btn-close');
        if (closeBtn) {
            EventHandler.on(closeBtn, 'click', () => this.hide());
        }
        // Останавливаем автоскрытие при наведении
        EventHandler.on(this._element, 'mouseenter', () => {
            this._hasMouseInteraction = true;
            this._clearTimeout();
        });
        EventHandler.on(this._element, 'mouseleave', () => {
            this._hasMouseInteraction = false;
            this._setTimeout();
        });
        // Останавливаем автоскрытие при фокусе
        EventHandler.on(this._element, 'focusin', () => {
            this._hasKeyboardInteraction = true;
            this._clearTimeout();
        });
        EventHandler.on(this._element, 'focusout', () => {
            this._hasKeyboardInteraction = false;
            this._setTimeout();
        });
    }
    show() {
        if (this._isShown) {
            return;
        }
        EventHandler.trigger(this._element, 'show.bs.toast');
        this._element.classList.remove('hide');
        this._element.classList.add('show');
        this._isShown = true;
        if (this._config.animation) {
            this._element.classList.add('fade');
        }
        EventHandler.trigger(this._element, 'shown.bs.toast');
        if (this._config.autohide) {
            this._setTimeout();
        }
    }
    hide() {
        if (!this._isShown) {
            return;
        }
        EventHandler.trigger(this._element, 'hide.bs.toast');
        this._element.classList.remove('show');
        this._isShown = false;
        // Если есть анимация, ждем её завершения
        if (this._config.animation) {
            setTimeout(() => {
                this._element.style.display = 'none';
                EventHandler.trigger(this._element, 'hidden.bs.toast');
            }, 150);
        }
        else {
            this._element.style.display = 'none';
            EventHandler.trigger(this._element, 'hidden.bs.toast');
        }
    }
    _setTimeout() {
        this._clearTimeout();
        if (this._config.autohide && !this._hasMouseInteraction && !this._hasKeyboardInteraction) {
            this._timeout = window.setTimeout(() => {
                this.hide();
            }, this._config.delay);
        }
    }
    _clearTimeout() {
        if (this._timeout) {
            clearTimeout(this._timeout);
            this._timeout = null;
        }
    }
    dispose() {
        this._clearTimeout();
        this._element = null;
        this._config = null;
    }
}
// Экспортируем в глобальную область
window.bootstrap = window.bootstrap || {};
window.bootstrap.Toast = Toast;
// Экспорт для модулей
export { Toast };

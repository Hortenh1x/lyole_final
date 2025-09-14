console.log("bootstrap-toast.js подключился!");

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

// Класс Toast (твой самописный)
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
            delay: 4000,
            ...config
        };
        this._init();
    }

    _init() {
        // кнопка закрытия
        const closeBtn = this._element.querySelector('.btn-close');
        if (closeBtn) {
            EventHandler.on(closeBtn, 'click', () => this.hide());
        }

        // стоп таймера при наведении
        EventHandler.on(this._element, 'mouseenter', () => {
            this._hasMouseInteraction = true;
            this._clearTimeout();
        });
        EventHandler.on(this._element, 'mouseleave', () => {
            this._hasMouseInteraction = false;
            this._setTimeout();
        });

        // стоп таймера при фокусе
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
        if (this._isShown) return;
        EventHandler.trigger(this._element, 'show.bs.toast');
        this._element.classList.remove('hide', 'fade');
        this._element.classList.add('show', 'fade');
        this._isShown = true;
        EventHandler.trigger(this._element, 'shown.bs.toast');
        if (this._config.autohide) {
            this._setTimeout();
        }
    }

    hide() {
        if (!this._isShown) return;
        EventHandler.trigger(this._element, 'hide.bs.toast');
        this._element.classList.remove('show');
        this._isShown = false;
        if (this._config.animation) {
            setTimeout(() => {
                this._element.remove();
                EventHandler.trigger(this._element, 'hidden.bs.toast');
            }, 150);
        } else {
            this._element.remove();
            EventHandler.trigger(this._element, 'hidden.bs.toast');
        }
    }

    _setTimeout() {
        this._clearTimeout();
        if (this._config.autohide && !this._hasMouseInteraction && !this._hasKeyboardInteraction) {
            this._timeout = window.setTimeout(() => this.hide(), this._config.delay);
        }
    }

    _clearTimeout() {
        if (this._timeout) {
            clearTimeout(this._timeout);
            this._timeout = null;
        }
    }
}

// Когда страница загружена — ищем все .toast и показываем их
document.addEventListener("DOMContentLoaded", () => {
    const toastElList = document.querySelectorAll('.toast');

    if (!toastElList.length) {
        return; // нет сообщений
    }

    toastElList.forEach(toastEl => {
        const toast = new Toast(toastEl, {
            autohide: true,
            delay: 4000
        });
        toast.show();
    });
});

// Экспортируем в глобал (чтобы при желании можно было вызвать вручную)
window.bootstrap = window.bootstrap || {};
window.bootstrap.Toast = Toast;

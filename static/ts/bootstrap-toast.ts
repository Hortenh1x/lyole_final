// Минимальная реализация Bootstrap Toast на TypeScript
// Работает с готовыми .toast, которые отрендерены Flask в base.html

// Утилита для работы с событиями
const EventHandler = {
  on(element: Element, event: string, handler: EventListenerOrEventListenerObject) {
    element.addEventListener(event, handler);
  },
  off(element: Element, event: string, handler: EventListenerOrEventListenerObject) {
    element.removeEventListener(event, handler);
  },
  trigger(element: Element, event: string) {
    const evt = new Event(event, { bubbles: true });
    element.dispatchEvent(evt);
  }
};

// Класс Toast
class Toast {
  private _element: HTMLElement;
  private _config: { animation: boolean; autohide: boolean; delay: number };
  private _timeout: number | null = null;
  private _hasMouseInteraction = false;
  private _hasKeyboardInteraction = false;
  private _isShown = false;

  constructor(element: HTMLElement, config: Partial<{ animation: boolean; autohide: boolean; delay: number }> = {}) {
    this._element = element;
    this._config = {
      animation: true,
      autohide: true,
      delay: 4000,
      ...config
    };
    this._init();
  }

  private _init() {
    const closeBtn = this._element.querySelector('.btn-close');
    if (closeBtn) {
      EventHandler.on(closeBtn, 'click', () => this.hide());
    }

    EventHandler.on(this._element, 'mouseenter', () => {
      this._hasMouseInteraction = true;
      this._clearTimeout();
    });
    EventHandler.on(this._element, 'mouseleave', () => {
      this._hasMouseInteraction = false;
      this._setTimeout();
    });

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
    this._element.classList.remove('hide');
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

  private _setTimeout() {
    this._clearTimeout();
    if (this._config.autohide && !this._hasMouseInteraction && !this._hasKeyboardInteraction) {
      this._timeout = window.setTimeout(() => this.hide(), this._config.delay);
    }
  }

  private _clearTimeout() {
    if (this._timeout) {
      clearTimeout(this._timeout);
      this._timeout = null;
    }
  }
}

// Когда страница загружена — находим все .toast и показываем их
document.addEventListener("DOMContentLoaded", () => {
  const toastElList = document.querySelectorAll<HTMLElement>('.toast');
  toastElList.forEach(toastEl => {
    const toast = new Toast(toastEl, {
      autohide: true,
      delay: 4000
    });
    toast.show();
  });
});

// Делаем доступным глобально (на всякий случай)
(window as any).bootstrap = (window as any).bootstrap || {};
(window as any).bootstrap.Toast = Toast;

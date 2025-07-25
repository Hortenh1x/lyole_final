// Минимальная реализация Bootstrap Toast на TypeScript
// Извлечено из Bootstrap 5.3.0

// Интерфейсы
interface ToastConfig {
  animation?: boolean;
  autohide?: boolean;
  delay?: number;
}

interface EventHandler {
  on(element: Element, event: string, handler: EventListener): void;
  off(element: Element, event: string, handler: EventListener): void;
  trigger(element: Element, event: string): void;
}

// Утилита для работы с событиями
const EventHandler: EventHandler = {
  on(element: Element, event: string, handler: EventListener): void {
    element.addEventListener(event, handler);
  },
  
  off(element: Element, event: string, handler: EventListener): void {
    element.removeEventListener(event, handler);
  },
  
  trigger(element: Element, event: string): void {
    const evt = new Event(event, { bubbles: true });
    element.dispatchEvent(evt);
  }
};

// Класс Toast
class Toast {
  private _element: HTMLElement;
  private _config: Required<ToastConfig>;
  private _timeout: number | null = null;
  private _hasMouseInteraction: boolean = false;
  private _hasKeyboardInteraction: boolean = false;
  private _isShown: boolean = false;
  
  constructor(element: HTMLElement, config: ToastConfig = {}) {
    this._element = element;
    this._config = {
      animation: true,
      autohide: true,
      delay: 5000,
      ...config
    };
    
    this._init();
  }
  
  private _init(): void {
    // Добавляем обработчики событий
    const closeBtn = this._element.querySelector('.btn-close') as HTMLElement;
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
  
  public show(): void {
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
  
  public hide(): void {
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
    } else {
      this._element.style.display = 'none';
      EventHandler.trigger(this._element, 'hidden.bs.toast');
    }
  }
  
  private _setTimeout(): void {
    this._clearTimeout();
    if (this._config.autohide && !this._hasMouseInteraction && !this._hasKeyboardInteraction) {
      this._timeout = window.setTimeout(() => {
        this.hide();
      }, this._config.delay);
    }
  }
  
  private _clearTimeout(): void {
    if (this._timeout) {
      clearTimeout(this._timeout);
      this._timeout = null;
    }
  }
  
  public dispose(): void {
    this._clearTimeout();
    this._element = null as any;
    this._config = null as any;
  }
}

// Расширяем глобальный объект Window
declare global {
  interface Window {
    bootstrap: {
      Toast: typeof Toast;
    };
  }
}

// Экспортируем в глобальную область
window.bootstrap = window.bootstrap || {};
window.bootstrap.Toast = Toast;

// Экспорт для модулей
export { Toast, ToastConfig };
"use strict";
// flash.ts
// Объединение двух схем: тосты рендерятся сервером в base.html и могут создаваться динамически.
/**
 * Создать и показать новые flash-сообщения.
 */
function showFlashMessages(messages, category = "info") {
    const container = getOrCreateContainer();
    messages.forEach((msg) => {
        const toast = buildToast(msg, category);
        container.appendChild(toast);
        autoHide(toast);
    });
}
/**
 * Строит DOM-структуру тоста.
 */
function buildToast(message, category) {
    const toast = document.createElement("div");
    toast.className = `toast show bg-${category}`;
    toast.setAttribute("role", "alert");
    toast.setAttribute("aria-live", "assertive");
    toast.setAttribute("aria-atomic", "true");
    // Header
    const header = document.createElement("div");
    header.className = "toast-header";
    const strong = document.createElement("strong");
    strong.className = "me-auto";
    strong.innerText = category.charAt(0).toUpperCase() + category.slice(1);
    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "btn-close";
    closeBtn.setAttribute("aria-label", "Закрыть");
    closeBtn.addEventListener("click", () => hideToast(toast));
    header.appendChild(strong);
    header.appendChild(closeBtn);
    // Body
    const body = document.createElement("div");
    body.className = "toast-body";
    body.innerText = message;
    toast.appendChild(header);
    toast.appendChild(body);
    return toast;
}
/**
 * Скрыть тост с плавной анимацией.
 */
function hideToast(toast) {
    toast.classList.remove("show");
    toast.classList.add("hide");
    setTimeout(() => toast.remove(), 300);
}
/**
 * Автоскрытие через 4 секунды.
 */
function autoHide(toast) {
    setTimeout(() => hideToast(toast), 4000);
}
/**
 * Получить контейнер тостов или создать новый.
 */
function getOrCreateContainer() {
    let container = document.querySelector(".toast-container");
    if (!container) {
        container = document.createElement("div");
        container.className = "toast-container position-fixed top-0 end-0 p-3";
        document.body.appendChild(container);
    }
    return container;
}
// Подхватываем уже отрендеренные тосты (из base.html) и навешиваем автоскрытие
document.addEventListener("DOMContentLoaded", () => {
    const toasts = document.querySelectorAll(".toast.show");
    toasts.forEach((toast) => {
        autoHide(toast);
        const closeBtn = toast.querySelector(".btn-close");
        if (closeBtn)
            closeBtn.addEventListener("click", () => hideToast(toast));
    });
});
// Делаем глобально доступным
window.showFlashMessages = showFlashMessages;


import { createTab01 } from './tab01.js';
import { createTab02 } from './tab02.js';
import { createTab03, preparePrintOverview } from './tab03.js';
import { initLangSwitcher, t } from './i18n.js';

export let activePage = localStorage.getItem('activePage') ? parseInt(localStorage.getItem('activePage')) : 0;
export const $ = selector => document.querySelector(selector);
export const $all = selector => Array.from(document.querySelectorAll(selector));
export const fmtCurrency = new Intl.NumberFormat("nl-BE", { style: "currency", currency: "EUR",maximumFractionDigits: 2 });
export const fmtDecimal = (digits = 2) => new Intl.NumberFormat("nl-BE", { style: "decimal", maximumFractionDigits: digits });
export const fmtDate = d => new Date(d).toLocaleDateString("nl-BE");

// Format date to local ISO string (YYYY-MM-DD) instead of UTC
export function formatLocalDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
//export const fmtPercent = new Intl.NumberFormat("nl-BE", { style: "percent", maximumFractionDigits: 4 });

export const  el = (tag, options = {}, children = []) => {
    const element = document.createElement(tag);

    Object.entries(options).forEach(([key, value]) => {
        if (key === "class") element.className = value;
        else if (key === "id") element.id = value;
        else if (key === "text") element.textContent = value;
        else if (key === "html") element.innerHTML = value;
        else element.setAttribute(key, value);
    });

    children.forEach(child => element.appendChild(child));
    return element;
};

export function createHeader(keyOrText) {
    // If it starts with "header.", it's a i18n key, otherwise it's direct text
    const isI18nKey = keyOrText && keyOrText.startsWith('header.');
    if (isI18nKey) {
        return el("header", { class: "no-print" }, [
            el("h1", { "data-i18n": keyOrText, text: t(keyOrText) })
        ]);
    } else {
        return el("header", { class: "no-print" }, [
            el("h1", { text: keyOrText })
        ]);
    }
};

function createCircles() {
    const container = $(".circles-wrapper");
    for (let i = 0; i < 7; i++) {
        container.appendChild(el('div', { class: 'circle' }));
    }
    return container;
};
function createTopHeader() {
    const header = $('#topHeader');
    const tabLabels = [t('tab.calculator1'), t('tab.calculator2'), t('tab.amortization')];
    header.setAttribute('role', 'tablist');
    tabLabels.forEach((tab, i) => {
        const hyperlink = document.createElement('a');
        hyperlink.href = '#';
        hyperlink.textContent = tab;
        hyperlink.setAttribute('role', 'tab');
        hyperlink.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
        if(i === activePage) hyperlink.classList.add('active');
        hyperlink.addEventListener('click', () => {
            if (hyperlink.classList.contains("active")) return;
            const activeLink = header.querySelector('.active');
            activeLink.classList.remove("active");
            activeLink.setAttribute('aria-selected', 'false');
            hyperlink.classList.add("active");
            hyperlink.setAttribute('aria-selected', 'true');
            activePage = i;
            localStorage.setItem('activePage', activePage);
            renderTab(activePage + 1);
        });
        header.appendChild(hyperlink);
    });
};

export function renderTab(tabNumber) {
    const tabs = [$('div#tab01'), $('div#tab02'), $('div#tab03')];
    tabs.forEach((tab, index) => {
        if (index === tabNumber - 1) {
            tab.style.display = 'block';
            if(tabNumber === 3) preparePrintOverview();
        } else {
            tab.style.display = 'none';
        }
    });
}

/* Initialize */
document.addEventListener("DOMContentLoaded", () => {
    initLangSwitcher();
    createCircles();
    createTopHeader();
    createTab01();
    createTab02();
    createTab03();
    renderTab(activePage + 1);
    
    // Listen for language changes - applyLang() updates all data-i18n elements
    window.addEventListener('languageChanged', (e) => {
        // Update top header tab labels
        const tabs = $('#topHeader').querySelectorAll('a');
        const tabLabels = [t('tab.calculator1'), t('tab.calculator2'), t('tab.amortization')];
        tabs.forEach((tab, i) => {
            tab.textContent = tabLabels[i];
        });
    });
});

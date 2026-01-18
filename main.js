
import { translations } from './i18n.js';
import { createTab01 } from './tab01.js';
import { createTab02 } from './tab02.js';
import { createTab03 } from './tab03.js';
import { createTab04 } from './tab04.js';

// Main tabs
const tabCreators = new Map([
    ['tab01', { label: 'tab.simulator', creator: createTab01 }],
    ['tab02', { label: 'tab.calculator', creator: createTab02 }],
    ['tab03', { label: 'tab.table', creator: createTab03 }],
    ['tab04', { label: 'tab.invoice', creator: createTab04 }]
]);

// Helper functions
const getTabIds = () => Array.from(tabCreators.keys());
const getTabLabel = (tabId) => tabCreators.get(tabId)?.label;
const getTabCreator = (tabId) => tabCreators.get(tabId)?.creator;

// Current language
let currentLang = localStorage.getItem('lang') || 'fr';
export let activePage = localStorage.getItem('activePage') ? parseInt(localStorage.getItem('activePage')) : 0;
if (isNaN(activePage) || activePage < 0 || activePage >= tabCreators.size) {
    activePage = 0;
}

// Utility functions for DOM manipulation and formatting
export const $ = selector => document.querySelector(selector);
export const $all = selector => Array.from(document.querySelectorAll(selector));
export const  el = (tag, options = {}, children = []) => {
    const element = document.createElement(tag);

    Object.entries(options).forEach(([key, value]) => {
        if (key === "class") element.className = value;
        else if (key === "id") element.id = value;
        else if (key === "text") element.textContent = value;
        else if (key === "html") element.innerHTML = value;
        else if (typeof value === 'boolean') element[key] = value;
        else element.setAttribute(key, value);
    });

    children.forEach(child => element.appendChild(child));
    return element;
}

export function getCurrency (){
    return localStorage.getItem('currency') || 'EUR';
}

// Create dynamic currency formatter
export function createFmtCurrency(currency = 'EUR') {
    return currency === 'TND' ? new Intl.NumberFormat("fr-TN", { style: "currency", currency: "TND", maximumFractionDigits: 2 }) : new Intl.NumberFormat("fr-FR", { style: "currency", currency: currency, maximumFractionDigits: 2 });
}

// Currency state object
export const currencyState = {
    current: 'EUR',
    formatter: createFmtCurrency('EUR'),
    setCurrency(currency) {
        this.current = currency;
        this.formatter = createFmtCurrency(currency);
    }
};

// Export fmtCurrency as getter for backward compatibility
export const fmtCurrency = new Proxy({}, {
    get: (target, prop) => {
        return currencyState.formatter[prop];
    }
});

export const fmtDecimal = (digits = 2) => new Intl.NumberFormat("nl-BE", { style: "decimal", maximumFractionDigits: digits });
export const fmtDate = d => new Date(d).toLocaleDateString("nl-BE");

// Format date to local ISO string (YYYY-MM-DD) instead of UTC
export function formatLocalDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Translation function
export function t(key) {
  if (!translations[currentLang] || !translations[currentLang][key]) {
    // Fallback to NL or key itself
    return translations['en']?.[key] || key;
  }
  return translations[currentLang][key];
}

function applyLang(lang) {
  if (!translations[lang]) {
    console.warn(`Language ${lang} not supported`);
    return;
  }

  currentLang = lang;
  localStorage.setItem('lang', lang);

  // Update all elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const text = t(key);
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = text;
    } else {
      el.textContent = text;
    }
  });
}

// Create Elements
export function createHeader(keyOrText) {
    // If it starts with "header.", it's a i18n key, otherwise it's direct text
    const isI18nKey = keyOrText && keyOrText.startsWith('header.');
    if (isI18nKey) {
        return el("header", { class: "no-print" }, [
            el("h1", { "data-i18n": keyOrText , text: t(keyOrText) })
        ]);
    } else {
        return el("header", { class: "no-print" }, [
            el("h1", { text: keyOrText })
        ]);
    }
}

function createCircles() {
    const container = el('div', { class: 'circles-wrapper no-print' });
    for (let i = 0; i < 7; i++) {
        container.appendChild(el('div', { class: 'circle' }));
    }
    return container;
}

function createTopHeader() {
    const header = el('nav', { id: 'topHeader', class: 'top-header no-print' });

    const tabIds = getTabIds();
    header.setAttribute('role', 'tablist');
    tabIds.forEach((tabId, index) => {
        const key = getTabLabel(tabId);
        const label = t(key);
        const tab = el('a', { href: '#', 'data-i18n': key, text: label, role: 'tab', 'aria-selected': index === activePage ? 'true' : 'false' });
        if (index === activePage) {
            tab.classList.add('active');
        }
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            if (tab.classList.contains("active")) return;
            const activeTab = header.querySelector('.active');
            if (activeTab) {
                activeTab.classList.remove('active');
                activeTab.setAttribute('aria-selected', 'false');
            }
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');
            activePage = index;
            localStorage.setItem('activePage', activePage);
            renderTab(activePage + 1);
        });
        header.appendChild(tab);
    });
    return header;
}

function createLangSwitcher () {
    const select = el('select', { class: 'lang-select', id: 'lang-select', 'aria-label': 'Select Language' });
    const languages = [{ code: 'en', label: 'EN' }, { code: 'fr', label: 'FR' }, { code: 'nl', label: 'NL' }];
    
    languages.forEach(lang => {
        const option = el('option', { value: lang.code, text: lang.label });
        if (lang.code === currentLang) {
            option.selected = true;
            option.setAttribute('aria-selected', 'true');
        } else {
            option.setAttribute('aria-selected', 'false');
        }
        select.appendChild(option);
    });
    
    select.addEventListener('change', (e) => {
        const newLang = e.target.value;
        if (currentLang === newLang) return;
        currentLang = newLang;
        
        // Set aria-selected on all options
        Array.from(select.options).forEach(opt => {
            opt.setAttribute('aria-selected', opt.value === newLang ? 'true' : 'false');
        });
        
        localStorage.setItem('lang', newLang);
        applyLang(newLang);
    });
    
    return select;
}

function createThemeMenuButton() {
    const btn = el('button', { 
        class: 'theme-menu-btn no-print',
        'aria-label': 'Open theme menu',
        'aria-expanded': 'false'
    });
    btn.innerHTML = '☰';
    btn.addEventListener('click', () => {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        if (expanded) {
            closeThemePopup();
        } else {
            openThemePopup();
        }
    });
    return btn;
}

function createThemeSelector() {
    const container = el('div', { class: 'theme-popup-overlay', id: 'theme-popup-overlay' });
    const popup = el('div', { class: 'theme-popup' });
    container.appendChild(popup);

    const themes = [
        { id: 'theme-dark-cyan', color: 'rgba(0, 217, 255, 1)' },
        { id: 'theme-dark-purple', color: 'rgba(114, 68, 199, 1)' },
        { id: 'theme-dark-rose', color: 'rgba(146, 32, 0, 1)' },
        { id: 'theme-light-orange', color: 'rgba(245, 127, 49, 1)' },
    ];
    
    const currentTheme = localStorage.getItem('theme') || 'theme-light-orange';
    
    themes.forEach(theme => {
        const btn = el('button', { 
            class: 'theme-btn-popup',
            'aria-label': `Select ${theme.id} theme`,
            'data-theme': theme.id
        });
        
        // Set background color dynamically
        btn.style.backgroundColor = theme.color;
        
        // Mark active theme
        if (currentTheme === theme.id) {
            btn.classList.add('active');
            setTheme(currentTheme);
        }
        
        btn.addEventListener('click', () => {
            setTheme(theme.id);
            // Update active state
            popup.querySelectorAll('.theme-btn-popup').forEach(b => {
                b.classList.remove('active');
            });
            btn.classList.add('active');
            //closeThemePopup();
        });
        
        popup.appendChild(btn);
    });

    // Close popup when clicking overlay
    container.addEventListener('click', (e) => {
        if (e.target === container) {
            closeThemePopup();
        }
    });
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && container.classList.contains('active')) {
            closeThemePopup();
        }
    });
    
    return container;
}

function openThemePopup() {
    const popup = document.getElementById('theme-popup-overlay');
    if (popup) {
        popup.classList.add('active');
        const btn = document.querySelector('.theme-menu-btn');
        if (btn) {
            btn.setAttribute('aria-expanded', 'true');
            btn.innerHTML = '✕';
            btn.classList.add('open');
            toggleTopHeader();
            toggleLangSelect(true);
        }
    }
}

function closeThemePopup() {
    const popup = document.getElementById('theme-popup-overlay');
    if (popup) {
        popup.classList.remove('active');
        const btn = document.querySelector('.theme-menu-btn');
        if (btn) {
            btn.setAttribute('aria-expanded', 'false');
            btn.innerHTML = '☰';
            btn.classList.remove('open');
            closeTopHeader();
            toggleLangSelect(false);
        }
    }
}
function toggleLangSelect(visible) {
    const langSelect = document.getElementById('lang-select');
    if (langSelect) {
        if (visible) {
            langSelect.classList.add("visible");
        } else {
            langSelect.classList.remove("visible");
        }
    }
}
function toggleTopHeader() {
    const topHeader = document.getElementById('topHeader');
    if (topHeader) {
        topHeader.classList.toggle('active');
    }
}

function closeTopHeader() {
    const topHeader = document.getElementById('topHeader');
    if (topHeader) {
        topHeader.classList.remove('active');
    }
}

function setTheme(themeName) {
    document.documentElement.className = themeName;
    localStorage.setItem('theme', themeName);
}

export function createFooter() {
    const footer = el("footer", { class: "no-print" }, [
        el("p", { text: 'POWERED BY CHYPSOW'})
    ]);
    return footer;
} 

function createMainContent() {
    const main = $('main');
    main.appendChild(createCircles());
    main.appendChild(createTopHeader());
    main.appendChild(createLangSwitcher());
    main.appendChild(createThemeMenuButton());
    main.appendChild(createThemeSelector());
}

/* Initialize */
document.addEventListener("DOMContentLoaded", () => {
    createMainContent();
    getTabIds().forEach(tabId => {
        const creator = getTabCreator(tabId);
        if (typeof creator === 'function') creator();
    });
    $('main').appendChild(createFooter());
    renderTab(activePage + 1);
});

export function renderTab(tabNumber) {
    const tabIds = getTabIds();
    tabIds.forEach((tabId, index) => {
        const tab = document.getElementById(tabId);
        if (tab) {
            if (index === tabNumber - 1) {
                tab.style.display = 'block';
            } else {
                tab.style.display = 'none';
            }   
        }
    });
}

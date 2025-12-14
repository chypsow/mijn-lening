
import { renderApp01, renderApp02, renderApp03, renderApp04 } from './lening.js';

export let activePage = localStorage.getItem('activePage') ? parseInt(localStorage.getItem('activePage')) : 0;
export const $ = selector => document.querySelector(selector);
export const $all = selector => Array.from(document.querySelectorAll(selector));

export const DOM = {
    app01 : $('#app01'),
    app02 : $('#app02'),
    app03 : $('#app03'),
    app04 : $('#app04'),
    sidebar : $('#sidebar'),
    menuBtn : $('#menuBtn'),
};

export const renderApp = {
    0: () => renderApp01(),
    1: () => renderApp02(),
    2: () => renderApp03(),
    3: () => renderApp04()
};

function makeSideBar() {
    const tabArray = ['AFLOSSINGSTABEL', 'CALCULATOR 1', 'CALCULATOR 2', 'CALCULATOR 3'];
    DOM.sidebar.setAttribute('role', 'tablist');
    tabArray.forEach((tab, i) => {
        const hyperlink = document.createElement('a');
        hyperlink.href = '#';
        hyperlink.textContent = tab;
        hyperlink.setAttribute('role', 'tab'); // Add tab role
        hyperlink.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
        if(i === activePage) hyperlink.classList.add('active');
        hyperlink.addEventListener('click', () => {
            if (hyperlink.classList.contains("active")) return; // Prevent reloading the same tab
            const activeLink = DOM.sidebar.querySelector('.active');
            activeLink.classList.remove("active");
            activeLink.setAttribute('aria-selected', 'false');
            hyperlink.classList.add("active");
            hyperlink.setAttribute('aria-selected', 'true');
            activePage = i;
            localStorage.setItem('activePage', activePage);
            renderApp[activePage]();
        });
        DOM.sidebar.appendChild(hyperlink);
    });
};

export const  el = (tag, options = {}, children = []) => {
    const element = document.createElement(tag);

    Object.entries(options).forEach(([key, value]) => {
        if (key === "class") element.className = value;
        else if (key === "text") element.textContent = value;
        else if (key === "html") element.innerHTML = value;
        else element.setAttribute(key, value);
    });

    children.forEach(child => element.appendChild(child));
    return element;
}

DOM.menuBtn.addEventListener('click', () => {
    DOM.sidebar.classList.toggle('closed');
    DOM.menuBtn.classList.toggle('open');
});

// Close sidebar when clicking outside (optional)
/*document.addEventListener('click', (e) => {
    if (!DOM.sidebar.contains(e.target) && !DOM.menuBtn.contains(e.target)) {
        DOM.sidebar.classList.add('closed');
        DOM.menuBtn.classList.remove('open');
    }
});*/

/* Initialize */
document.addEventListener("DOMContentLoaded", () => {
    makeSideBar();
    renderApp[activePage]();
});


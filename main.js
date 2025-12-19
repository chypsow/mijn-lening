
import { renderApp01, renderApp02, renderApp03, renderApp04 } from './lening.js';

export let activePage = localStorage.getItem('activePage') ? parseInt(localStorage.getItem('activePage')) : 0;
export const $ = selector => document.querySelector(selector);
export const $all = selector => Array.from(document.querySelectorAll(selector));

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
export const showApp = (index) => {
    for (let i = 1; i <= 4; i++) {
        if (i !== index) {
            $(`#app0${i}`).style.display = "none";
        } else {
            $(`#app0${i}`).style.display = "block";
            $(`#app0${i}`).classList.add("wrapper");
        }   
    }
};

const renderApp = {
    0: () => renderApp01(),
    1: () => renderApp02(),
    2: () => renderApp03(),
    3: () => renderApp04()
};

function makeSideBar() {
    const sidebar = $('#sidebar');
    const tabArray = ['AFLOSSINGSTABEL', 'CALCULATOR 1', 'CALCULATOR 2', 'CALCULATOR 3'];
    sidebar.setAttribute('role', 'tablist');
    tabArray.forEach((tab, i) => {
        const hyperlink = document.createElement('a');
        hyperlink.href = '#';
        hyperlink.textContent = tab;
        hyperlink.setAttribute('role', 'tab'); // Add tab role
        hyperlink.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
        if(i === activePage) hyperlink.classList.add('active');
        hyperlink.addEventListener('click', () => {
            if (hyperlink.classList.contains("active")) return; // Prevent reloading the same tab
            const activeLink = sidebar.querySelector('.active');
            activeLink.classList.remove("active");
            activeLink.setAttribute('aria-selected', 'false');
            hyperlink.classList.add("active");
            hyperlink.setAttribute('aria-selected', 'true');
            activePage = i;
            localStorage.setItem('activePage', activePage);
            renderApp[activePage]();
        });
        sidebar.appendChild(hyperlink);
    });
};

$('#menuBtn').addEventListener('click', () => {
   $('#sidebar').classList.toggle('closed');
    $('#menuBtn').classList.toggle('open');
});

// Close sidebar when clicking outside (optional)
/*document.addEventListener('click', (e) => {
    if (!$('#sidebar').contains(e.target) && !$('#menuBtn').contains(e.target)) {
        $('#sidebar').classList.add('closed');
        $('#menuBtn').classList.remove('open');
    }
});*/

/* Initialize */
document.addEventListener("DOMContentLoaded", () => {
    makeSideBar();
    renderApp[activePage]();
});


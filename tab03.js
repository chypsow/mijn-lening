import { $, el, createHeader, fmtCurrency, fmtDate, t } from './main.js';
import { parseInputs, updateSummary, monthlyRate, computePayment } from './tab01.js';

export function createTab03() {
    const tab03 = el('div', { id: 'tab03' });
    tab03.append(
        createHeader('header.loan-table'),
        createReportContainer(),
    );
    $('main').appendChild(tab03);
    
    setTableVisibility(false);

    $('#generateBtn').addEventListener('click', () => {
        generateTable();
    });

    $('#afdrukken').addEventListener('click', printData);

    $('#selectAllBtn').addEventListener('click', () => {
        document.querySelectorAll('.column-checkbox').forEach(checkbox => checkbox.checked = true);
    });

    $('#deselectAllBtn').addEventListener('click', () => {
        document.querySelectorAll('.column-checkbox').forEach(checkbox => checkbox.checked = false);
    });
}

export function setTableVisibility(visible) {
    if (visible) {
        $("#annualReportOutput").hidden = false;
        $("#afdrukken").style.visibility = "visible";
    } else {
        $("#annualReportOutput").hidden = true;
        $("#afdrukken").style.visibility = "hidden";
    }
}
function preparePrintOverview() {
    $("#leningOverzicht").innerHTML = "";
    const inputs = parseInputs();

    const bedrag = el("li", { html: `<strong data-i18n="print.loan-amount">${t('print.loan-amount')}</strong> <span>${fmtCurrency.format(inputs.bedrag)}</span>` });
    const jkp = el("li", { html: `<strong data-i18n="print.annual-rate">${t('print.annual-rate')}</strong> <span>${inputs.jkp.toString().replace('.', ',') || "-"} %</span>` });
    const rentevoet = el("li", { html: `<strong data-i18n="print.monthly-rate">${t('print.monthly-rate')}</strong> <span>${$('.monthly-rate').textContent || "-"}</span>` });
    const pmt = el("li", { html: `<strong data-i18n="print.monthly-payment">${t('print.monthly-payment')}</strong> <span>${$('.monthly-payment').textContent || "-"}</span>` });
    const rente = el("li", { html: `<strong data-i18n="print.total-interest">${t('print.total-interest')}</strong> <span>${$('.total-interest').textContent || "-"}</span>` });
    const periode = el("li", { html: `<strong data-i18n="print.period">${t('print.period')}</strong> <span>${inputs.periode || "-"}</span> <span data-i18n="label.months">${t('label.months')}</span>` });
    const startDate = el("li", { html: `<strong data-i18n="print.start-date">${t('print.start-date')}</strong> <span>${fmtDate(inputs.startDate)}</span>` });
    const endDate = el("li", { html: `<strong data-i18n="print.end-date">${t('print.end-date')}</strong> <span>${$('.endDateDisplay').textContent || "-"}</span>` });
    $("#leningOverzicht").append(bedrag, jkp, rentevoet, pmt, rente, periode, startDate, endDate);
}

function printData() {
    preparePrintOverview();
    window.print();
}

export function generateTable() {
    const inputs = updateSummary();
    if (!inputs) return;

    const interval = parseInt($('#intervalInput').value);
    if (!interval || interval < 1 || interval > inputs.periode) {
        alert(`Voer een geldig interval in (1 tot ${inputs.periode})`);
        return;
    }

    // Get selected columns
    const selectedColumns = Array.from(document.querySelectorAll('.column-checkbox:checked')).map(checkbox => checkbox.value);
    
    if (selectedColumns.length === 0) {
        alert('Selecteer minsten één kolom');
        return;
    }
    setTableVisibility(true);
    
    createAnnualReportTable(inputs, interval, selectedColumns);
}

function createAnnualReportTable(inputs, interval, selectedColumns) {
    const { bedrag, jkp, periode: totalMonths, renteType: type, startDate } = inputs;

    const outputDiv = $('#annualReportOutput');
    outputDiv.innerHTML = '';
    // Calculate monthly interest rate and payment
    const i = monthlyRate(jkp, type);
    const betaling = computePayment(bedrag, i, totalMonths);

    const table = el('table', { class: 'annual-report-table' });
    
    // Set custom property gebaseerd op interval
    if (interval !== 1) {
        table.style.setProperty('--second-col-width', '10rem');
        
    }

    // Create table header
    const thead = el('thead');
    const headerRow = el('tr');
    headerRow.appendChild(el('th', { text: t('table.no'), 'data-i18n': 'table.no' }));
    headerRow.appendChild(el('th', { text: `${ interval === 1 ? t('table.interval-date') : t('table.interval-month', { interval }) }`, 'data-i18n': interval === 1 ? 'table.interval-date' : 'table.interval-month' }));
    
    // Map labels for selected columns only
    const columnLabelsMap = {
        'begin-capital': 'table.begin-capital',
        'total-payment': 'table.total-payment',
        'principal': 'table.principal',
        'interest': 'table.interest',
        'cumulative-principal': 'table.cumulative-principal',
        'cumulative-interest': 'table.cumulative-interest',
        'outstanding-capital': 'table.outstanding-capital',
        'outstanding-interest': 'table.outstanding-interest',
    };
    
    // Add only selected columns to header
    selectedColumns.forEach(col => {
        const i18nKey = columnLabelsMap[col];
        const label = t(i18nKey);
        headerRow.appendChild(el('th', { 'data-i18n': i18nKey, text: label }));
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create table body
    const tbody = el('tbody');
    
    let balance = bedrag;
    let cumulativePrincipal = 0;
    let cumulativeInterest = 0;

    // Determine number of intervals
    const numIntervals = Math.ceil(totalMonths / interval);
    
    for (let intervalNum = 1; intervalNum <= numIntervals; intervalNum++) {
        const intervalStartMonth = (intervalNum - 1) * interval + 1;
        const intervalEndMonth = Math.min(intervalNum * interval, totalMonths);
        
        // Calculate accurate interval start date by adding months
        let intervalStartDate = new Date(startDate);
        intervalStartDate.setMonth(intervalStartDate.getMonth() + intervalStartMonth - 1);
        
        // Calculate accurate interval end date by adding months and getting last day
        let intervalEndDate = new Date(startDate);
        intervalEndDate.setMonth(intervalEndDate.getMonth() + intervalEndMonth);
        //intervalEndDate.setDate(0); // Set to last day of previous month
        
        // Calculate cumulative principal and interest for this interval
        let intervalPrincipal = 0;
        let intervalInterest = 0;
        let tempBalance = balance;
        
        for (let month = intervalStartMonth; month <= intervalEndMonth; month++) {
            const monthlyInterest = tempBalance * i;
            const monthlyPrincipal = Math.min(betaling - monthlyInterest, tempBalance);
            
            intervalPrincipal += monthlyPrincipal;
            intervalInterest += monthlyInterest;
            tempBalance -= monthlyPrincipal;
            
            if (tempBalance <= 0) break;
        }
        
        cumulativePrincipal += intervalPrincipal;
        cumulativeInterest += intervalInterest;
        balance -= intervalPrincipal;
        
        const row = el('tr');
        // No. column
        row.appendChild(el('td', { text: intervalNum }));
        // Interval column (always shown)
        const intervalCell = el('td', { 
            text: interval === 1 ? fmtDate(intervalEndDate) : `${fmtDate(intervalStartDate)} - ${fmtDate(intervalEndDate)}`
        });
        row.appendChild(intervalCell);
        
        // Add selected columns
        selectedColumns.forEach(col => {
            let cellValue = 0;
            let cellText = '';
            
            switch(col) {
                case 'begin-capital':
                    // Beginning capital for this interval
                    cellValue = balance + intervalPrincipal;
                    cellText = fmtCurrency.format(cellValue);
                    break;
                case 'total-payment':
                    cellValue = betaling * (intervalEndMonth - intervalStartMonth + 1);
                    cellText = fmtCurrency.format(cellValue);
                    break;
                case 'principal':
                    cellValue = intervalPrincipal;
                    cellText = fmtCurrency.format(cellValue);
                    break;
                case 'interest':
                    cellValue = intervalInterest;
                    cellText = fmtCurrency.format(cellValue);
                    break;
                case 'cumulative-principal':
                    cellValue = cumulativePrincipal;
                    cellText = fmtCurrency.format(cellValue);
                    break;
                case 'cumulative-interest':
                    cellValue = cumulativeInterest;
                    cellText = fmtCurrency.format(cellValue);
                    break;
                case 'outstanding-capital':
                    cellValue = Math.max(0, balance);
                    cellText = fmtCurrency.format(cellValue);
                    break;
                case 'outstanding-interest':
                    const totalInterest = (betaling * totalMonths) - bedrag;
                    cellValue = totalInterest - cumulativeInterest;
                    cellText = fmtCurrency.format(cellValue);
                    break;
            }
            
            const cell = el('td', { 
                text: cellText,
                class: 'currency-cell'
            });
            row.appendChild(cell);
        });
        
        tbody.appendChild(row);
        
        if (balance <= 0) break;
    }
    
    table.appendChild(tbody);
    outputDiv.appendChild(table);
}


// DOM Creation Functions
function createReportContainer() {
    return el('div', { class: 'generator' }, [
        createOverzicht(),
        createConfigContainer(),
        CreateReportOutput()
    ]);
}

function CreateReportOutput() {
    return el('div', { id: 'annualReportOutput', class: 'report-output' });
}

function createOverzicht() {
    return el("div", { class: "overzicht no-print" }, [
        el('div', { class: 'overzicht-header', html: `<h2 data-i18n="section.loan-overview">${t('section.loan-overview')}</h2><span><span data-i18n="label.today">${t('label.today')}</span> <span>${fmtDate(new Date())}</span></span>` }),
        el('div', { class: 'overzicht-inhoud' }, [
            el("div", { html: `
                <p> <span data-i18n="output.loan-amount">${t('output.loan-amount')}</span>
                    <span class="output-overview loan-amount"></span>
                </p>
                <p> <span data-i18n="output.monthly-payment">${t('output.monthly-payment')}</span>
                    <span class="output-overview monthly-payment"></span>
                </p>
                <p> <span data-i18n="output.monthly-rate">${t('output.monthly-rate')}</span>
                    <span class="output-overview monthly-rate"></span>
                </p>
                <p> <span data-i18n="output.total-interest">${t('output.total-interest')}</span>
                    <span class="output-overview total-interest"></span>
                </p>
            `}),
            el("div", { html: `
                <p> <span data-i18n="label.start-date">${t('label.start-date')}</span>
                    <span  class="output-overview startDateDisplay"></span>
                </p>
                <p> <span data-i18n="label.end-date">${t('label.end-date')}</span>
                    <span class="output-overview endDateDisplay"></span>
                </p>
                <p> <span data-i18n="output.loan-period">${t('output.loan-period')}</span>
                    <span class="output-overview loan-period"></span>
                </p>
                <p> <span data-i18n="output.remaining-duration">${t('output.remaining-duration')}</span>
                    <span class="output-overview remaining-duration"></span>
                </p>
            `})
        ])
    ]);
}

function createConfigContainer() {
    return el('div', { class: 'config-container' }, [
        el('h2', { class: 'no-print', html: `<span data-i18n="section.table-instructions-header">${t('section.table-instructions-header')}</span>` }),
        el('p', { class: 'instruction-text no-print', 'data-i18n': 'section.table-instructions', text: t('section.table-instructions') }),
        createCheckboxes(),
        createButtons(),
        createPrintOverview()
    ]);
}

function createCheckboxes() {
    return el('div', { class: 'cb-container no-print' }, [
        el('div', { class: 'interval-input-container' }, [
            el('label', { 'data-i18n': 'label.interval', text: t('label.interval') }),
            el('input', { 
                id: 'intervalInput',
                type: 'number',
                min: '1',
                class: 'interval-input',
            })
        ]),
        el('div', { class: 'columns-container' }, [
            el('div', { class: 'select-columns-header' }, [
                el('p', { 'data-i18n': 'label.select-columns', text: t('label.select-columns') }),
                el('div', { class: 'select-buttons' }, [
                    el('button', { 
                        id: 'selectAllBtn', 
                        class: 'select-btn',
                        'data-i18n': 'button.select-all',
                        text: t('button.select-all')
                    }),
                    el('button', { 
                        id: 'deselectAllBtn', 
                        class: 'select-btn',
                        'data-i18n': 'button.deselect-all',
                        text: t('button.deselect-all')
                    })
                ])
            ]),
            el('div', { class: 'checkbox-group' }, [
                el('label', { html: `<input type="checkbox" class="column-checkbox" value="begin-capital"> <span data-i18n="table.begin-capital">${t('table.begin-capital')}</span>` }),
                el('label', { html: `<input type="checkbox" class="column-checkbox" value="total-payment" checked> <span data-i18n="table.total-payment">${t('table.total-payment')}</span>` }),
                el('label', { html: `<input type="checkbox" class="column-checkbox" value="principal" checked> <span data-i18n="table.principal">${t('table.principal')}</span>` }),
                el('label', { html: `<input type="checkbox" class="column-checkbox" value="interest" checked> <span data-i18n="table.interest">${t('table.interest')}</span>` }),
                el('label', { html: `<input type="checkbox" class="column-checkbox" value="cumulative-principal" checked> <span data-i18n="table.cumulative-principal">${t('table.cumulative-principal')}</span>` }),
                el('label', { html: `<input type="checkbox" class="column-checkbox" value="cumulative-interest" checked> <span data-i18n="table.cumulative-interest">${t('table.cumulative-interest')}</span>` }),
                el('label', { html: `<input type="checkbox" class="column-checkbox" value="outstanding-capital" checked> <span data-i18n="table.outstanding-capital">${t('table.outstanding-capital')}</span>` }),
                el('label', { html: `<input type="checkbox" class="column-checkbox" value="outstanding-interest"> <span data-i18n="table.outstanding-interest">${t('table.outstanding-interest')}</span>` }),
                
            ])
        ])
    ]);
}

function createButtons() {
    return el("div", { class: "button-group no-print" }, [
        el("button", {id: "generateBtn", class: "accented-btn no-print", "data-i18n": "button.generate", text: t('button.generate')}),
        el("button", {id: "afdrukken", class: "accented-btn no-print", "data-i18n": "button.print", text: t('button.print')})
    ]);
}

function createPrintOverview() {
    return el("ul", {
        id: "leningOverzicht",
        class: "lening-overzicht on-print",
        hidden: true
    });
}
import { $, el, createHeader, createFmtCurrency, t } from './main.js';

export function createTab04() {
    const tab04 = el('div', { id: 'tab04' });
    //const header = createHeader('header.invoice-calculator');
    //tab04.appendChild(header);
    
    const content = el('div', { class: 'invoice-content' });
    
    // Billing period input + results section
    const resultsSection = el('div', { class: 'results-section' });
    //content.appendChild(resultsSection);
    const billingPeriodGroup = el('div', { class: 'input-group' });
    billingPeriodGroup.appendChild(el('label', {
        'data-i18n': 'invoice.billing-period',
        text: t('invoice.billing-period')
    }));
    const billingPeriodInput = el('input', {
        type: 'number',
        id: 'billingPeriod',
        value: '4',
        min: '1',
        step: '1'
    });
    billingPeriodGroup.appendChild(billingPeriodInput);
    resultsSection.appendChild(billingPeriodGroup);
    
    const grandTotalDiv = el('div', { class: 'result-item grand-total' });
    grandTotalDiv.appendChild(el('span', {
        'data-i18n': 'invoice.grand-total',
        text: t('invoice.grand-total')
    }));
    const grandTotalValue = el('span', {
        id: 'grandTotalValue',
        text: createFmtCurrency('TND').format(0)
    });
    grandTotalDiv.appendChild(grandTotalValue);
    resultsSection.appendChild(grandTotalDiv);
    content.appendChild(resultsSection);

    // 2 sections: Electricity and Gas
    const meterSectionsDiv = el('div', { class: 'meter-sections' });
    content.appendChild(meterSectionsDiv);

    // Electricity section
    const elecSection = createMeterSection('electricity', 'kWh', 0.176, 0.07, 4.9);
    meterSectionsDiv.appendChild(elecSection);
    
    // Gas section
    const gasSection = createMeterSection('gas', 'm³', 0.231, 0.19, 0.75);
    meterSectionsDiv.appendChild(gasSection);
    
    // Tax section
    const taxSection = el('div', { class: 'invoice-section tax-section' });
    taxSection.appendChild(el('h3', {
        'data-i18n': 'invoice.taxes',
        text: t('invoice.taxes')
    }));
    taxSection.appendChild(el('div', { class: 'info-text  result-row'}, [
        el('span', {
            'data-i18n': 'invoice.tax-info',
            text: t('invoice.tax-info')}),
        el('span', { 
            class: 'tax-item-tva' }),
    ]));
    taxSection.appendChild(el('div', { class: 'info-text  result-row'}, [
        el('span', {
            'data-i18n': 'invoice.cl-rtt-fte',
            text: 'CL + RTT + FTE:'}),
        el('span', { 
            class: 'tax-item-rtt' }),
    ]));
    taxSection.appendChild(el('br'));
    taxSection.appendChild(el('div', { class: 'info-text  result-row'}, [
        el('span', {
            'data-i18n': 'invoice.tax-totals',
            text: t('invoice.tax-totals')}),
        el('span', { 
            class: 'tax-item-total' }),
        ]));
    content.appendChild(taxSection);

    // Calculate button
    const calcButton = el('button', { 
        class: 'accented-btn',
        text: 'Calculate / Calculer / Berekenen'
    });
    calcButton.addEventListener('click', () => calculateInvoice(tab04));
    //content.appendChild(calcButton);

    // Results section
    
    //content.appendChild(resultsSection);
    
    // Export button
    const exportButton = el('button', {
        class: 'btn-export',
        text: 'Export CSV'
    });
    exportButton.addEventListener('click', () => exportInvoiceData(tab04));
    //content.appendChild(exportButton);
    
    tab04.appendChild(content);
    $('main').appendChild(tab04);
    
    // Auto-calculate on input change
    billingPeriodInput.addEventListener('change', () => calculateInvoice(tab04));
    tab04.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('change', () => calculateInvoice(tab04));
    });
}

function createMeterSection(meterType, unit, defaultPrice, defaultTVA, defaultFixed) {
    const section = el('div', { class: `invoice-section meter-${meterType}` });
    
    const title = el('h3', {
        'data-i18n': `invoice.${meterType}`,
        text: t(`invoice.${meterType}`)
    });
    section.appendChild(title);
    
    // Old & New readings
    const readingsDiv = el('div', { class: 'readings' });
    
    const oldReadingGroup = el('div', { class: 'input-group teller' });
    oldReadingGroup.appendChild(el('label', { 'data-i18n': 'invoice.old-reading', text: t('invoice.old-reading') }));
    const oldInput = el('input', { type: 'number', class: 'meter-old', step: '1' });
    oldReadingGroup.appendChild(oldInput);
    readingsDiv.appendChild(oldReadingGroup);
    
    const newReadingGroup = el('div', { class: 'input-group teller' });
    newReadingGroup.appendChild(el('label', { 'data-i18n': 'invoice.new-reading', text: t('invoice.new-reading') }));
    const newInput = el('input', { type: 'number', class: 'meter-new', step: '1' });
    newReadingGroup.appendChild(newInput);
    readingsDiv.appendChild(newReadingGroup);
    
    section.appendChild(readingsDiv);
    
    // Consumption display
    const consumptionDiv = el('div', { class: 'result-row' });
    consumptionDiv.appendChild(el('span', { 'data-i18n': 'invoice.consumption', text: t('invoice.consumption') }));
    const consumptionValue = el('span', { class: `consumption-${meterType}`, text: '0 ' + unit });
    consumptionDiv.appendChild(consumptionValue);
    section.appendChild(consumptionDiv);
    
    // Unit price input
    const priceGroup = el('div', { class: 'input-group inline' });
    priceGroup.appendChild(el('label', { 'data-i18n': 'invoice.unit-price', text: t('invoice.unit-price') }));
    const priceInput = el('input', { type: 'number', class: `price-${meterType}`, value: defaultPrice, step: '0.001' });
    priceGroup.appendChild(priceInput);
    section.appendChild(priceGroup);
    
    // Total HT display
    const totalHTDiv = el('div', { class: 'result-row' });
    totalHTDiv.appendChild(el('span', { 'data-i18n': 'invoice.total-hf', text: t('invoice.total-hf') }));
    const totalHTValue = el('span', { class: `total-hf-${meterType}`, text: '0,00 DT' });
    totalHTDiv.appendChild(totalHTValue);
    section.appendChild(totalHTDiv);
    
    // Fixed costs display
    const fixedDiv = el('div', { class: 'result-row' });
    fixedDiv.appendChild(el('span', { 'data-i18n': 'invoice.fixed-costs', text: t('invoice.fixed-costs') }));
    const fixedValue = el('span', { class: `fixed-${meterType}`, text: '0,00 DT' });
    fixedDiv.appendChild(fixedValue);
    section.appendChild(fixedDiv);

    // Total HT display
    const totalHTDiv2 = el('div', { class: 'result-row' });
    totalHTDiv2.appendChild(el('span', { 'data-i18n': 'invoice.total-ht', text: t('invoice.total-ht') }));
    const totalHTValue2 = el('span', { class: `total-ht-${meterType}`, text: '0,00 DT' });
    totalHTDiv2.appendChild(totalHTValue2);
    section.appendChild(totalHTDiv2);
    
    // TVA percent input
    const tvaGroup = el('div', { class: 'input-group inline' });
    tvaGroup.appendChild(el('label', { 'data-i18n': 'invoice.tva-percent', text: t('invoice.tva-percent') }));
    const tvaInput = el('input', { type: 'number', class: `tva-${meterType}`, value: (defaultTVA * 100).toFixed(2) , step: '1' });
    tvaGroup.appendChild(tvaInput);
    section.appendChild(tvaGroup);
    
    // TVA amount display
    const tvaAmountDiv = el('div', { class: 'result-row' });
    tvaAmountDiv.appendChild(el('span', { 'data-i18n': 'invoice.tva-amount', text: t('invoice.tva-amount') }));
    const tvaAmountValue = el('span', { class: `tva-amount-${meterType}`, text: '0,00 DT' });
    tvaAmountDiv.appendChild(tvaAmountValue);
    section.appendChild(tvaAmountDiv);
    
    // Store fixed costs value on section
    section.setAttribute('data-fixed', defaultFixed);
    
    return section;
}

export function calculateInvoice(tab04Container) {
    const billingPeriod = parseFloat(tab04Container.querySelector('#billingPeriod').value) || 1;
    
    // Electricity calculations
    const elecSection = tab04Container.querySelector('.meter-electricity');
    const gasSection = tab04Container.querySelector('.meter-gas');
    const taxSection = tab04Container.querySelector('.tax-section');
    
    const elecOld = parseFloat(elecSection.querySelector('.meter-old').value) || 0;
    const elecNew = parseFloat(elecSection.querySelector('.meter-new').value) || 0;
    const elecConsumption = elecNew - elecOld;
    const elecPrice = parseFloat(elecSection.querySelector('.price-electricity').value) || 0;
    const elecTVAPercent = parseFloat(elecSection.querySelector('.tva-electricity').value) || 0;
    const elecFixedCosts = parseFloat(elecSection.getAttribute('data-fixed')) || 4.9;
    
    // Gas calculations
    const gasOld = parseFloat(gasSection.querySelector('.meter-old').value) || 0;
    const gasNew = parseFloat(gasSection.querySelector('.meter-new').value) || 0;
    const gasConsumption = gasNew - gasOld;
    const gasPrice = parseFloat(gasSection.querySelector('.price-gas').value) || 0;
    const gasTVAPercent = parseFloat(gasSection.querySelector('.tva-gas').value) || 0;
    const gasFixedCosts = parseFloat(gasSection.getAttribute('data-fixed')) || 0.75;
    
    // Electricity calculations
    const elecTotalHT = (elecConsumption * elecPrice); //+ (elecFixedCosts * billingPeriod);
    const elecFixed = elecFixedCosts * billingPeriod;
    const elecTVAAmount = elecTotalHT * (elecTVAPercent / 100) + (elecFixed * (gasTVAPercent / 100));
    const elecCLRTTFTE = elecConsumption * 4 * 0.005;
    
    // Gas calculations
    const gasTotalHT = (gasConsumption * gasPrice); //+ (gasFixedCosts * billingPeriod);
    const gasFixed = gasFixedCosts * billingPeriod;
    const gasTVAAmount = (gasTotalHT + gasFixed) * (gasTVAPercent / 100);
    
    // Totals
    const totalHT = elecTotalHT + gasTotalHT;
    const totalTVA = elecTVAAmount + gasTVAAmount;
    const grandTotal = totalHT + totalTVA + elecCLRTTFTE + elecFixed + gasFixed;

    // Update electricity display
    elecSection.querySelector('.consumption-electricity').textContent = elecConsumption.toFixed(2) + ' kWh';
    elecSection.querySelector('.total-hf-electricity').textContent = createFmtCurrency('TND').format(elecTotalHT);
    elecSection.querySelector('.fixed-electricity').textContent = createFmtCurrency('TND').format(elecFixed);
    elecSection.querySelector('.total-ht-electricity').textContent = createFmtCurrency('TND').format(elecTotalHT + elecFixed);
    elecSection.querySelector('.tva-amount-electricity').textContent = createFmtCurrency('TND').format(elecTVAAmount);
    
    // Update gas display
    gasSection.querySelector('.consumption-gas').textContent = gasConsumption.toFixed(2) + ' m³';
    gasSection.querySelector('.total-hf-gas').textContent = createFmtCurrency('TND').format(gasTotalHT);
    gasSection.querySelector('.fixed-gas').textContent = createFmtCurrency('TND').format(gasFixed);
    gasSection.querySelector('.total-ht-gas').textContent = createFmtCurrency('TND').format(gasTotalHT + gasFixed);
    gasSection.querySelector('.tva-amount-gas').textContent = createFmtCurrency('TND').format(gasTVAAmount);
    

    // Update tax display
    taxSection.querySelector('.tax-item-tva').textContent = createFmtCurrency('TND').format(totalTVA);
    taxSection.querySelector('.tax-item-rtt').textContent = createFmtCurrency('TND').format(elecCLRTTFTE);
    taxSection.querySelector('.tax-item-total').textContent = createFmtCurrency('TND').format(totalTVA + elecCLRTTFTE);

    // Update grand total
    tab04Container.querySelector('#grandTotalValue').textContent = createFmtCurrency('TND').format(grandTotal);
}

function exportInvoiceData(tab04Container) {
    const billingPeriod = tab04Container.querySelector('#billingPeriod').value;
    const elecOld = tab04Container.querySelector('.meter-old').value;
    const elecNew = tab04Container.querySelectorAll('.meter-new')[0].value;
    const gasOld = tab04Container.querySelectorAll('.meter-old')[1].value;
    const gasNew = tab04Container.querySelectorAll('.meter-new')[1].value;
    const grandTotal = tab04Container.querySelector('#grandTotalValue').textContent;
    
    const csv = `Invoice STEG Export\n\nBilling Period (months),${billingPeriod}\n\nElectricity\nOld Reading,${elecOld}\nNew Reading,${elecNew}\nConsumption,${(elecNew - elecOld).toFixed(2)}\n\nGas\nOld Reading,${gasOld}\nNew Reading,${gasNew}\nConsumption,${(gasNew - gasOld).toFixed(2)}\n\nGrand Total,${grandTotal}`;
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = el('a', { href: url, download: 'invoice.csv' });
    a.click();
    window.URL.revokeObjectURL(url);
}



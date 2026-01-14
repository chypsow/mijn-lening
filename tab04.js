import { $, el, createHeader, createFmtCurrency, t } from './main.js';

export function createTab04() {
    const tab04 = el('div', { id: 'tab04' });
    const header = createHeader('header.invoice-calculator');
    tab04.appendChild(header);
    
    const content = el('div', { class: 'invoice-content' });

    // Billing period input + Grand total display
    const resultsSection = el('div', { class: 'results-section' });
    const billingPeriodContainer = el('div', { class: 'billing-period-container' });
    resultsSection.appendChild(billingPeriodContainer);
    const billingPeriodHeader = el('div', { class: 'billing-period-header' });
    billingPeriodContainer.appendChild(billingPeriodHeader);
    billingPeriodHeader.appendChild(el('h3', {
        'data-i18n': 'invoice.billing-period',
        text: t('invoice.billing-period')
    }));
    billingPeriodHeader.appendChild(el('span', {
        class: 'billing-period-info number-of-months hidden',
    }));
    billingPeriodHeader.appendChild(el('span', {
        'data-i18n': 'invoice.billing-period-months',
        text: t('invoice.billing-period-months'),
        class: 'billing-period-info hidden'
    }));
    const billingPeriodSelect = el('select', { class: 'billing-period-select', id: 'billingPeriodSelect' }, [
        el('option', { value: 'months', text: t('invoice.number-of-months'), 'data-i18n': 'invoice.number-of-months' }),
        el('option', { value: 'dates', text: t('invoice.start-end-dates'), 'data-i18n': 'invoice.start-end-dates' })
    ]);
    billingPeriodContainer.appendChild(billingPeriodSelect);
    const billingPeriodGroup = el('div', { class: 'billing-period-group' });
    billingPeriodContainer.appendChild(billingPeriodGroup);
   
    
    // Grand total display
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
    elecSection.addEventListener('click', replaceSpanWithInput);
    
    // Gas section
    const gasSection = createMeterSection('gas', 'm³', 0.231, 0.19, 0.75);
    meterSectionsDiv.appendChild(gasSection);
    gasSection.addEventListener('click', replaceSpanWithInput);
    
    // Totals section
    const totalsSection = el('div', { class: 'invoice-section' });
    meterSectionsDiv.appendChild(totalsSection);
    totalsSection.appendChild(el('h3', {
        'data-i18n': 'invoice.totals',
        text: t('invoice.totals')
    }));
    const totalsDiv = el('div', { class: 'totals-section' });
    totalsSection.appendChild(totalsDiv);
    totalsDiv.appendChild(el('div', { class: 'result-row'}, [
        el('span', {
            'data-i18n': 'invoice.elect-ht',
            text: t('invoice.elect-ht')}),
        el('span', {
            text: '0,00 DT',
            class: 'total-ht-electricity' }),
    ]));
    totalsDiv.appendChild(el('div', { class: 'result-row'}, [
        el('span', {
            'data-i18n': 'invoice.gas-ht',
            text: t('invoice.gas-ht')}),
        el('span', {
            text: '0,00 DT',
            class: 'total-ht-gas' }),
    ]));
    totalsDiv.appendChild(el('div', { class: 'result-row'}, [
        el('span', {
            'data-i18n': 'invoice.totals-ht',
            text: t('invoice.totals-ht')}),
        el('span', {
            text: '0,00 DT', 
            class: 'total-ht-all' }),
    ]));

    // Taxes section
    const taxItemsDiv = el('div', { class: 'tax-section' });
    totalsSection.appendChild(taxItemsDiv);
    taxItemsDiv.appendChild(el('div', { class: 'result-row'}, [
        el('span', {
            'data-i18n': 'invoice.tax-info',
            text: t('invoice.tax-info')}),
        el('span', {
            text: '0,00 DT',
            class: 'tax-item-tva' }),
    ]));
    taxItemsDiv.appendChild(el('div', { class: 'result-row'}, [
        el('span', {
            'data-i18n': 'invoice.cl-rtt-fte',
            text: 'CL + RTT + FTE:'}),
        el('span', {
            text: '0,00 DT',
            class: 'tax-item-fte' }),
    ]));
    taxItemsDiv.appendChild(el('div', { class: 'result-row'}, [
        el('span', {
            'data-i18n': 'invoice.tax-totals',
            text: t('invoice.tax-totals')}),
        el('span', {
            text: '0,00 DT', 
            class: 'tax-item-total' }),
        ]));
    
    // Append to main    
    tab04.appendChild(content);
    $('main').appendChild(tab04);
    
    // Input change listeners
    tab04.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('change', () => calculateInvoice(tab04));
    });

    // Editable spans for price and TVA
    function replaceSpanWithInput(e) {
        const elt = e.target;
        if (!elt.classList.contains('editable')) return;
        
        const meterSection = e.currentTarget;
        const meterType = meterSection.getAttribute('data-meter-type');
        const priceOrTVA = elt.classList.contains('price-electricity') || elt.classList.contains('price-gas') ? 'price' : 'tva';

        const currentValue = meterSection.getAttribute(`data-${priceOrTVA}`);
        const input = el('input', {
            type: 'number',
            step: `${priceOrTVA === 'price' ? '0.001' : '0.01'}`,
            class: `${priceOrTVA}-${meterType}` // no editable class here otherwise infinite loop
        });
        elt.replaceWith(input);
        input.value = currentValue;
        input.focus();
        
        input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                input.blur();
            }
        });

        input.addEventListener('change', () => {
            meterSection.setAttribute(`data-${priceOrTVA}`, parseFloat(input.value));
            calculateInvoice(tab04);
        });
        
        input.addEventListener('blur', () => {
            let newValue = parseFloat(input.value);
            if (isNaN(newValue)) {
                newValue = parseFloat(currentValue);
            }
            const newSpan = el('span', { class: `${priceOrTVA}-${meterType} editable`, text: `${priceOrTVA === 'price' ? newValue + ' DT' : (newValue * 100).toFixed(2) + ' %'}` });
            input.replaceWith(newSpan);
            meterSection.setAttribute(`data-${priceOrTVA}`, newValue);
        });
    }

    // Billing period input
    const createBillingPeriodInput = () => {
        const billingPeriod = localStorage.getItem('invoiceBillingPeriod') || '2';
        const input =  el('input', {
        type: 'number',
        id: 'billingPeriod',
        value: billingPeriod,
        step: '1',
        min: '1',
        class: 'billing-period-input'
        });
        input.addEventListener('change', () => {
            localStorage.setItem('invoiceBillingPeriod', input.value);
            calculateInvoice(tab04);
        });
        return input;
    };
    const createBillingPeriodDatesGroup = () => {
        const savedStartDate = localStorage.getItem('invoiceBillingStartDate') || '';
        const savedEndDate = localStorage.getItem('invoiceBillingEndDate') || '';
        const datums = el('div', { class: 'billing-period-dates-group' }, [
        el('label', { html: `<span data-i18n="print.start-date">${t('print.start-date')}</span> <input type="date" id="billingStartDate" class="billing-date-input">` }),
        el('label', { html: `<span data-i18n="print.end-date">${t('print.end-date')}</span> <input type="date" id="billingEndDate" class="billing-date-input">` })
        ]);
        const billingStartDateInput = datums.querySelector('#billingStartDate');
        const billingEndDateInput = datums.querySelector('#billingEndDate');
        billingStartDateInput.value = savedStartDate;
        billingEndDateInput.value = savedEndDate;
        datums.querySelectorAll('input').forEach(input => {
            input.addEventListener('change', () => updateBillingPeriodFromDates(billingStartDateInput, billingEndDateInput));
        });
        return datums;
    };

    // handle dates change
    function updateBillingPeriodFromDates(billingStartDateInput, billingEndDateInput) {
        const startDate = new Date(billingStartDateInput.value);
        const endDate = new Date(billingEndDateInput.value);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || endDate <= startDate) {
            console.log('Invalid dates for billing period - 1');
            localStorage.setItem('invoiceBillingStartDate', billingStartDateInput.value);
            localStorage.setItem('invoiceBillingEndDate', billingEndDateInput.value);
            resetResultsInvoice(tab04);
            return;
        }
        localStorage.setItem('invoiceBillingStartDate', billingStartDateInput.value);
        localStorage.setItem('invoiceBillingEndDate', billingEndDateInput.value);
        calculateInvoice(tab04);
    }

    const savedBillingPeriodType = localStorage.getItem('invoiceBillingPeriodType') || 'months';
    billingPeriodSelect.value = savedBillingPeriodType;
    if (savedBillingPeriodType === 'months') {
        billingPeriodGroup.appendChild(createBillingPeriodInput());
    } else {
        billingPeriodGroup.appendChild(createBillingPeriodDatesGroup());
    }
    calculateInvoice(tab04);
    // select change for billing period type
    billingPeriodSelect.addEventListener('change', () => {
        const billingPeriodGroup = tab04.querySelector('.billing-period-group');
        billingPeriodGroup.innerHTML = '';
        if (billingPeriodSelect.value === 'months') {
            billingPeriodGroup.appendChild(createBillingPeriodInput());
            localStorage.setItem('invoiceBillingPeriodType', 'months');
        } else {
            billingPeriodGroup.appendChild(createBillingPeriodDatesGroup());
            localStorage.setItem('invoiceBillingPeriodType', 'dates');
        }
        calculateInvoice(tab04);
    });
}

function resetResultsInvoice(tab04Container) {
    // Reset all result fields to 0
    tab04Container.querySelectorAll('.consumption-electricity, .consumption-gas').forEach(span => {
        span.textContent = '0 kWh';
    });
    tab04Container.querySelectorAll('.total-hf-electricity, .total-hf-gas, .fixed-electricity, .fixed-gas, .total-ht-electricity, .total-ht-gas, .tva-amount-electricity, .tva-amount-gas').forEach(span => {
        span.textContent = '0,00 DT';
    });
    tab04Container.querySelectorAll('.tax-item-tva, .tax-item-fte, .tax-item-total').forEach(span => {
        span.textContent = '0,00 DT';
    });
    tab04Container.querySelectorAll('.total-ht-electricity, .total-ht-gas, .total-ht-all').forEach(span => {
        span.textContent = '0,00 DT';
    });
    tab04Container.querySelector('#grandTotalValue').textContent = createFmtCurrency('TND').format(0);
}

function createMeterSection(meterType, unit, defaultPrice, defaultTVA, defaultFixed) {
    const section = el('div', { 
        class: `invoice-section meter-${meterType}`,
        'data-meter-type': meterType, 
        'data-price': defaultPrice, 
        'data-tva': defaultTVA, 
        'data-fixed': defaultFixed 
    });
    
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
    const priceInput = el('span', {class: `price-${meterType} editable`, text: `${defaultPrice} DT` });
    priceGroup.appendChild(priceInput);
    const editableLabel = el('span', { text: 'Editable', class: 'editable-label no-print' });
    priceGroup.appendChild(editableLabel);
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
    const tvaInput = el('span', { class: `tva-${meterType} editable`, text: `${(defaultTVA * 100).toFixed(2)} %` });
    tvaGroup.appendChild(tvaInput);
    const tvaEditableLabel = el('span', { text: 'Editable', class: 'editable-label no-print' });
    tvaGroup.appendChild(tvaEditableLabel);
    section.appendChild(tvaGroup);
    
    // TVA amount display
    const tvaAmountDiv = el('div', { class: 'result-row' });
    tvaAmountDiv.appendChild(el('span', { 'data-i18n': 'invoice.tva-amount', text: t('invoice.tva-amount') }));
    const tvaAmountValue = el('span', { class: `tva-amount-${meterType}`, text: '0,00 DT' });
    tvaAmountDiv.appendChild(tvaAmountValue);
    section.appendChild(tvaAmountDiv);
    
    // Store fixed costs value on section
    section.setAttribute('data-fixed', defaultFixed);
    
    // add event listeners to section 

    return section;
}

export function calculateInvoice(tab04Container) {
    // Get billing period
    let billingPeriodValue = 0;
    const billingPeriod = tab04Container.querySelector('#billingPeriod');
    if (!billingPeriod) {
        // get from dates
        const startDateInput = tab04Container.querySelector('#billingStartDate');
        const endDateInput = tab04Container.querySelector('#billingEndDate');
        const startDate = new Date(startDateInput.value);
        const endDate = new Date(endDateInput.value);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || endDate <= startDate) {
            //
            tab04Container.querySelectorAll('.billing-period-info').forEach(span => {
                span.classList.add('hidden');
            });
            resetResultsInvoice(tab04Container);
            console.log('Invalid dates for billing period - 2');
            return;
        }
        const diffTime = Math.abs(endDate - startDate);
        const diffMonths = Math.round(diffTime / (1000 * 60 * 60 * 24 * 30.44));
        billingPeriodValue = diffMonths;
        tab04Container.querySelector('.number-of-months').textContent = billingPeriodValue;
        tab04Container.querySelectorAll('.billing-period-info').forEach(span => {
            span.classList.remove('hidden');
        });
    } else {
        billingPeriodValue = parseFloat(billingPeriod.value) || 1;
        tab04Container.querySelector('.number-of-months').textContent = billingPeriodValue;
        tab04Container.querySelectorAll('.billing-period-info').forEach(span => {
            span.classList.remove('hidden');
        });
    }
    //console.log({billingPeriodValue});
    
    // Electricity calculations
    const elecSection = tab04Container.querySelector('.meter-electricity');
    const gasSection = tab04Container.querySelector('.meter-gas');
    const totalSection = tab04Container.querySelector('.totals-section');
    const taxSection = tab04Container.querySelector('.tax-section');
    
    const elecOld = parseFloat(elecSection.querySelector('.meter-old').value) || 0;
    const elecNew = parseFloat(elecSection.querySelector('.meter-new').value) || 0;
    const elecConsumption = elecNew - elecOld;
    const elecPrice = parseFloat(elecSection.getAttribute('data-price')) || 0.176;
    const elecTVAPercent = parseFloat(elecSection.getAttribute('data-tva')) || 0.07;
    const elecFixedCosts = parseFloat(elecSection.getAttribute('data-fixed')) || 4.9;
    
    // Gas calculations
    const gasOld = parseFloat(gasSection.querySelector('.meter-old').value) || 0;
    const gasNew = parseFloat(gasSection.querySelector('.meter-new').value) || 0;
    const gasConsumption = gasNew - gasOld;
    const gasPrice = parseFloat(gasSection.getAttribute('data-price')) || 0.231;
    const gasTVAPercent = parseFloat(gasSection.getAttribute('data-tva')) || 0.19;
    const gasFixedCosts = parseFloat(gasSection.getAttribute('data-fixed')) || 0.75;
    
    // Electricity calculations
    const elecTotalHT = (elecConsumption * elecPrice);
    const elecFixed = elecFixedCosts * billingPeriodValue;
    const elecTVAAmount = elecTotalHT * elecTVAPercent + (elecFixed * gasTVAPercent);
    
    // Gas calculations
    const gasTotalHT = (gasConsumption * gasPrice);
    const gasFixed = gasFixedCosts * billingPeriodValue;
    const gasTVAAmount = (gasTotalHT + gasFixed) * gasTVAPercent;
    
    // Totals
    const totalHT = elecTotalHT + gasTotalHT;
    const totalTVA = elecTVAAmount + gasTVAAmount;
    const FTE = elecConsumption * 4 * 0.005;
    const grandTotal = totalHT + elecFixed + gasFixed + totalTVA + FTE ;

    // Update electricity display
    elecSection.querySelector('.consumption-electricity').textContent = elecConsumption.toFixed(0) + ' kWh';
    elecSection.querySelector('.total-hf-electricity').textContent = createFmtCurrency('TND').format(elecTotalHT);
    elecSection.querySelector('.fixed-electricity').textContent = createFmtCurrency('TND').format(elecFixed);
    elecSection.querySelector('.total-ht-electricity').textContent = createFmtCurrency('TND').format(elecTotalHT + elecFixed);
    elecSection.querySelector('.tva-amount-electricity').textContent = createFmtCurrency('TND').format(elecTVAAmount);
    
    // Update gas display
    gasSection.querySelector('.consumption-gas').textContent = gasConsumption.toFixed(0) + ' m³';
    gasSection.querySelector('.total-hf-gas').textContent = createFmtCurrency('TND').format(gasTotalHT);
    gasSection.querySelector('.fixed-gas').textContent = createFmtCurrency('TND').format(gasFixed);
    gasSection.querySelector('.total-ht-gas').textContent = createFmtCurrency('TND').format(gasTotalHT + gasFixed);
    gasSection.querySelector('.tva-amount-gas').textContent = createFmtCurrency('TND').format(gasTVAAmount);
    

    // Update totals +  taxes display
    totalSection.querySelector('.total-ht-electricity').textContent = createFmtCurrency('TND').format(elecTotalHT + elecFixed);
    totalSection.querySelector('.total-ht-gas').textContent = createFmtCurrency('TND').format(gasTotalHT + gasFixed);
    totalSection.querySelector('.total-ht-all').textContent = createFmtCurrency('TND').format(totalHT + elecFixed + gasFixed);
    taxSection.querySelector('.tax-item-tva').textContent = createFmtCurrency('TND').format(totalTVA);
    taxSection.querySelector('.tax-item-fte').textContent = createFmtCurrency('TND').format(FTE);
    taxSection.querySelector('.tax-item-total').textContent = createFmtCurrency('TND').format(totalTVA + FTE);

    // Update grand total
    tab04Container.querySelector('#grandTotalValue').textContent = createFmtCurrency('TND').format(grandTotal);
}

/*function exportInvoiceData(tab04Container) {
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
}*/



import { $, el, createHeader, createFmtCurrency, t } from './main.js';

export function createTab04() {
    const tab04 = el('div', { id: 'tab04', class: 'tab-content' });
    const header = createHeader('header.invoice-calculator');
    tab04.appendChild(header);
    
    const content = el('div', { class: 'invoice-content' });

    // Billing period input + Grand total display
    const resultsSection = el('div', { class: 'results-section' });
    content.appendChild(resultsSection);

    const billingPeriodContainer = el('div', { class: 'billing-period-container no-print' });
    resultsSection.appendChild(billingPeriodContainer);

    const billingPeriodSelect = el('select', { class: 'billing-period-select', id: 'billingPeriodSelect' }, [
        el('option', { value: 'months', text: t('invoice.duration-months'), 'data-i18n': 'invoice.duration-months' }),
        el('option', { value: 'dates', text: t('invoice.period'), 'data-i18n': 'invoice.period' })
    ]);
    billingPeriodContainer.appendChild(billingPeriodSelect);
    const billingPeriodMonthOrDateInput = el('div', { class: 'billing-period-group' });
    billingPeriodContainer.appendChild(billingPeriodMonthOrDateInput);

    // Billing period + grand total display
    const billingPeriodAndResult = el('div', { class: 'billing-period-result' });
    resultsSection.appendChild(billingPeriodAndResult);
    
    // Grand total display
    const grandTotalDiv = el('div', { class: 'result-item grand-total' });
    grandTotalDiv.appendChild(el('span', {
        'data-i18n': 'invoice.grand-total',
        text: t('invoice.grand-total')
    }));
    grandTotalDiv.appendChild(el('span', {
        id: 'grandTotalValue',
        text: createFmtCurrency('TND').format(0)
    }));
    billingPeriodAndResult.appendChild(grandTotalDiv);
    
    const billingPeriodMonths = el('div', { class: 'billing-period-months' });
    billingPeriodAndResult.appendChild(billingPeriodMonths);
    const billingPeriodMonthsLabel = el('div', { class: 'billing-period-months-label' });
    billingPeriodMonths.appendChild(billingPeriodMonthsLabel);
    billingPeriodMonthsLabel.appendChild(el('h3', {
        'data-i18n': 'invoice.billing-period',
        text: t('invoice.billing-period')
    }));
    billingPeriodMonthsLabel.appendChild(el('span', {
        class: 'billing-period-info number-of-months hidden',

    }));
    billingPeriodMonthsLabel.appendChild(el('span', {
        'data-i18n': 'invoice.billing-period-months',
        text: t('invoice.billing-period-months'),
        class: 'billing-period-info hidden'
    }));
    
    // 2 sections: Electricity and Gas
    const meterSectionsDiv = el('div', { class: 'meter-sections' });
    content.appendChild(meterSectionsDiv);

    // Electricity section
    const elecSection = createMeterSection('electricity', 'power');
    meterSectionsDiv.appendChild(elecSection);
    elecSection.addEventListener('click', replaceSpanWithInput);
    
    // Gas section
    const gasSection = createMeterSection('gas', 'flow');
    meterSectionsDiv.appendChild(gasSection);
    gasSection.addEventListener('click', replaceSpanWithInput);
    
    // kVA Information Modal
    const kvaModal = createKvaInfoModal();
    tab04.appendChild(kvaModal);

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
            'data-i18n': 'invoice.cl',
            text: t('invoice.cl')}),
        el('span', {
            text: '0,00 DT',
            class: 'tax-item-cl' }),
    ]));
    taxItemsDiv.appendChild(el('div', { class: 'result-row'}, [
        el('span', {
            'data-i18n': 'invoice.fte',
            text: t('invoice.fte')}),
        el('span', {
            text: '0,00 DT',
            class: 'tax-item-fte' }),
    ]));
    taxItemsDiv.appendChild(el('div', { class: 'result-row'}, [
        el('span', {
            'data-i18n': 'invoice.rtt',
            text: t('invoice.rtt')}),
        el('span', {
            text: '0,00 DT',
            class: 'tax-item-rtt' }),
    ]));
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
        // on change recalculate invoice
        input.addEventListener('change', () => calculateInvoice(tab04));

        // on enter key recalculate invoice
        input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                calculateInvoice(tab04);
            }
        });
    });

    // Editable spans for price and TVA
    function replaceSpanWithInput(e) {
        const elt = e.target;
        if (!elt.classList.contains('editable')) return;
        
        const meterSection = e.currentTarget;
        const meterType = meterSection.getAttribute('data-meter-type');
        const quantityType = meterType === 'electricity' ? 'power' : 'flow';

        const currentValue = localStorage.getItem(`invoice${quantityType === 'power' ? 'ElectricityPower' : 'GasFlow'}`) || (quantityType === 'power' ? '7' : '5');
        const input = el('input', {
            type: 'number',
            step: '1',
            class: `${quantityType}-${meterType}` // no editable class here otherwise infinite loop
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
            localStorage.setItem(`invoice${quantityType === 'power' ? 'ElectricityPower' : 'GasFlow'}`, input.value);
            calculateInvoice(tab04);
        });
        
        input.addEventListener('blur', () => {
            let newValue = parseFloat(input.value);
            if (isNaN(newValue)) {
                newValue = parseFloat(currentValue);
            }
            const newSpan = el('span', { class: `${quantityType}-${meterType} editable`, text: `${newValue} ${quantityType === 'power' ? 'kVA' : 'm³'}` });
            input.replaceWith(newSpan);
            localStorage.setItem(`invoice${quantityType === 'power' ? 'ElectricityPower' : 'GasFlow'}`, newValue);
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
        class: 'billing-period-input no-print'
        });
        input.addEventListener('change', () => {
            // check for valid value
            if (parseFloat(input.value) < 1 || isNaN(parseFloat(input.value))) {
                localStorage.removeItem('invoiceBillingPeriod');
                resetResultsInvoice(tab04);
                console.log('Invalid value for billing period - months input');
                return;
            }
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
            console.log('Invalid dates for billing period - dates input');
            localStorage.setItem('invoiceBillingStartDate', billingStartDateInput.value);
            localStorage.setItem('invoiceBillingEndDate', billingEndDateInput.value);
            resetResultsInvoice(tab04);
            return;
        }
        localStorage.setItem('invoiceBillingStartDate', billingStartDateInput.value);
        localStorage.setItem('invoiceBillingEndDate', billingEndDateInput.value);
        calculateInvoice(tab04);
    }

    // select change for billing period type
    billingPeriodSelect.addEventListener('change', () => {
        const billingPeriodMonthOrDateInput = tab04.querySelector('.billing-period-group');
        billingPeriodMonthOrDateInput.innerHTML = '';
        if (billingPeriodSelect.value === 'months') {
            billingPeriodMonthOrDateInput.appendChild(createBillingPeriodInput());
            localStorage.setItem('invoiceBillingPeriodType', 'months');
        } else {
            billingPeriodMonthOrDateInput.appendChild(createBillingPeriodDatesGroup());
            localStorage.setItem('invoiceBillingPeriodType', 'dates');
        }
        calculateInvoice(tab04);
    });

    // Initialize billing period input based on saved type
    const savedBillingPeriodType = localStorage.getItem('invoiceBillingPeriodType') || 'months';
    billingPeriodSelect.value = savedBillingPeriodType;
    if (savedBillingPeriodType === 'months') {
        billingPeriodMonthOrDateInput.appendChild(createBillingPeriodInput());
    } else {
        billingPeriodMonthOrDateInput.appendChild(createBillingPeriodDatesGroup());
    }
    calculateInvoice(tab04);
    
    // Update kVA button titles when language changes
    const updateKvaButtonTitles = () => {
        const kvaButtons = tab04.querySelectorAll('[data-i18n-title="kva.info-button-title"]');
        kvaButtons.forEach(btn => {
            btn.title = t('kva.info-button-title');
        });
    };
    
    // Listen for language changes (custom event from main.js)
    window.addEventListener('languageChanged', updateKvaButtonTitles);

    // Listen for exportInvoiceData event (custom event from main.js)
    window.addEventListener('exportInvoiceData', exportInvoiceData);
}

function resetResultsInvoice(tab04Container) {
    // Reset all result fields to 0
    tab04Container.querySelectorAll('.consumption-electricity, .consumption-gas').forEach(span => {
        span.textContent = '0 kWh';
    });
    tab04Container.querySelectorAll('.total-hf-electricity, .total-hf-gas, .fixed-electricity, .fixed-gas, .total-ht-electricity, .total-ht-gas, .tva-amount-electricity, .tva-amount-gas').forEach(span => {
        span.textContent = '0,00 DT';
    });
    tab04Container.querySelectorAll('.tax-item-tva, .tax-item-cl, .tax-item-rtt, .tax-item-fte, .tax-item-total').forEach(span => {
        span.textContent = '0,00 DT';
    });
    tab04Container.querySelectorAll('.total-ht-electricity, .total-ht-gas, .total-ht-all').forEach(span => {
        span.textContent = '0,00 DT';
    });
    tab04Container.querySelector('#grandTotalValue').textContent = createFmtCurrency('TND').format(0);
    tab04Container.querySelectorAll('.billing-period-info').forEach(span => {
        span.classList.add('hidden');
    });
}

function createMeterSection(meterType, quantityType) {
    const section = el('div', { 
        class: `invoice-section meter-${meterType}`,
        'data-meter-type': meterType
    });

    let defaultQuantityValue = 0;
    switch (meterType) {
        case 'electricity':
            defaultQuantityValue = parseFloat(localStorage.getItem('invoiceElectricityPower')) || 7;
            break;
        case 'gas':
            defaultQuantityValue = parseFloat(localStorage.getItem('invoiceGasFlow')) || 5;
            break;
    }
    
    const title = el('h3', {
        'data-i18n': `invoice.${meterType}`,
        text: t(`invoice.${meterType}`)
    });
    section.appendChild(title);
    
    const unit = quantityType === 'power' ? 'kVA' : 'm³';
    
    // Power - flow input
    const powerGroup = el('div', { class: 'input-group inline' });
    powerGroup.appendChild(el('label', { 'data-i18n': `invoice.${quantityType}`, text: t(`invoice.${quantityType}`) }));
    const powerInput = el('span', { class: `${quantityType}-${meterType} editable`, text: `${defaultQuantityValue} ${unit}` });
    powerGroup.appendChild(powerInput);
    const powerEditableLabel = el('span', { text: 'Editable', class: 'editable-label no-print' });
    powerGroup.appendChild(powerEditableLabel);
    // Add info button for electricity kVA
    if (meterType === 'electricity') {
        const infoBtn = el('button', {
            class: 'kva-info-btn no-print',
            title: t('kva.info-button-title'),
            type: 'button',
            'data-i18n-title': 'kva.info-button-title'
        }, [
            el('i', { class: 'fa-solid fa-info-circle' })
        ]);
        infoBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const modal = document.querySelector('.kva-info-modal');
            modal.classList.toggle('hidden');
        });
        powerGroup.appendChild(infoBtn);
    }
    section.appendChild(powerGroup);

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
    const priceInput = el('span', { class: `price-${meterType}` });
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
    const tvaInput = el('span', { class: `tva-${meterType}`, text: '19 %' });
    tvaGroup.appendChild(tvaInput);
    section.appendChild(tvaGroup);
    
    // TVA amount display
    const tvaAmountDiv = el('div', { class: 'result-row' });
    tvaAmountDiv.appendChild(el('span', { 'data-i18n': 'invoice.tva-amount', text: t('invoice.tva-amount') }));
    const tvaAmountValue = el('span', { class: `tva-amount-${meterType}`, text: '0,00 DT' });
    tvaAmountDiv.appendChild(tvaAmountValue);
    section.appendChild(tvaAmountDiv);
    
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
            tab04Container.querySelectorAll('.billing-period-info').forEach(span => {
                span.classList.add('hidden');
            });
            resetResultsInvoice(tab04Container);
            console.log('Invalid dates for billing period - calculation');
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
        billingPeriodValue = parseFloat(billingPeriod.value);
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
    const power = parseFloat(localStorage.getItem('invoiceElectricityPower')) || 7;
    const averageConsumption = elecConsumption / billingPeriodValue;

    const elecPriceCalc = () => {
        if (power <= 2) {
            if (averageConsumption <= 50) return 0.062;
            if (averageConsumption <= 100) return 0.096;
        }
        if (averageConsumption <= 200) return 0.176;
        if (averageConsumption <= 300) return 0.218;
        if (averageConsumption <= 500) return 0.341;
        return 0.414;
    }
    const elecTVAPercentCalc = () => {
        if (averageConsumption <= 300) return 0.07;
        return 0.13;
    }
    
    const elecPrice = elecPriceCalc();
    const elecFixedCosts = 0.7;
    const elecTVAPercent = elecTVAPercentCalc();
    
    // Gas calculations
    const gasOld = parseFloat(gasSection.querySelector('.meter-old').value) || 0;
    const gasNew = parseFloat(gasSection.querySelector('.meter-new').value) || 0;
    const gasConsumption = gasNew - gasOld;
    const flow = parseFloat(localStorage.getItem('invoiceGasFlow')) || 5;
    const averageConsumptionGas = gasConsumption / billingPeriodValue;

    const gasPriceCalc = () => {
        if (averageConsumptionGas <= 30) return 0.231;
        if (averageConsumptionGas <= 60) return 0.341;
        if (averageConsumptionGas <= 150) return 0.447;
        return 0.557;
    }

    const gasPrice = gasPriceCalc();
    const gasFixedCosts = 0.15;
    const gasTVAPercent = 0.19;
    
    // Electricity calculations
    const elecTotalHT = (elecConsumption * elecPrice);
    const elecFixed = power * elecFixedCosts * billingPeriodValue;
    const elecTVAAmount = elecTotalHT * elecTVAPercent + (elecFixed * gasTVAPercent);
    
    // Gas calculations
    const gasTotalHT = (gasConsumption * gasPrice);
    const gasFixed = flow * gasFixedCosts * billingPeriodValue;
    const gasTVAAmount = (gasTotalHT + gasFixed) * gasTVAPercent;
    
    // Totals
    const totalHT = elecTotalHT + gasTotalHT;
    const totalTVA = elecTVAAmount + gasTVAAmount;

    // Contributions
    const unitPrice = 0.005;
    const contributionCL = elecConsumption * unitPrice;
    const contributionFTEcalc = () => {
        //if (averageConsumption <= 100) return 0;
        return elecConsumption * unitPrice;
    }
    const contributionFTE = contributionFTEcalc();
    const contributionRTTcalc = () => {
        const floor = 3.5;
        const firstPrice = 0.010;
        const secondPrice = 0.004;
        if (averageConsumption <= 25) return 0;
        if (averageConsumption <= 150) return averageConsumption * firstPrice > floor ? floor * billingPeriodValue : elecConsumption * firstPrice;
        return 150 * firstPrice + (averageConsumption - 150) * secondPrice > floor ? floor * billingPeriodValue : (150 * firstPrice + (averageConsumption - 150) * secondPrice - 25 * secondPrice) * billingPeriodValue;
    }
    const contibutionRTT = contributionRTTcalc();
    const totalContributions = contributionCL + contibutionRTT + contributionFTE;

    // Grand total
    const grandTotal = totalHT + elecFixed + gasFixed + totalTVA + totalContributions;

    // Update electricity display
    elecSection.querySelector('.consumption-electricity').textContent = elecConsumption.toFixed(0) + ' kWh';
    elecSection.querySelector('.price-electricity').textContent = createFmtCurrency('TND').format(elecPrice);
    elecSection.querySelector('.total-hf-electricity').textContent = createFmtCurrency('TND').format(elecTotalHT);
    elecSection.querySelector('.fixed-electricity').textContent = createFmtCurrency('TND').format(elecFixed);
    elecSection.querySelector('.total-ht-electricity').textContent = createFmtCurrency('TND').format(elecTotalHT + elecFixed);
    elecSection.querySelector('.tva-electricity').textContent = (elecTVAPercent * 100).toFixed(0) + ' %';
    elecSection.querySelector('.tva-amount-electricity').textContent = createFmtCurrency('TND').format(elecTVAAmount);
    
    // Update gas display
    gasSection.querySelector('.consumption-gas').textContent = gasConsumption.toFixed(0) + ' m³';
    gasSection.querySelector('.price-gas').textContent = createFmtCurrency('TND').format(gasPrice);
    gasSection.querySelector('.total-hf-gas').textContent = createFmtCurrency('TND').format(gasTotalHT);
    gasSection.querySelector('.fixed-gas').textContent = createFmtCurrency('TND').format(gasFixed);
    gasSection.querySelector('.total-ht-gas').textContent = createFmtCurrency('TND').format(gasTotalHT + gasFixed);
    gasSection.querySelector('.tva-amount-gas').textContent = createFmtCurrency('TND').format(gasTVAAmount);
    

    // Update totals +  taxes display
    totalSection.querySelector('.total-ht-electricity').textContent = createFmtCurrency('TND').format(elecTotalHT + elecFixed);
    totalSection.querySelector('.total-ht-gas').textContent = createFmtCurrency('TND').format(gasTotalHT + gasFixed);
    totalSection.querySelector('.total-ht-all').textContent = createFmtCurrency('TND').format(totalHT + elecFixed + gasFixed);
    taxSection.querySelector('.tax-item-tva').textContent = createFmtCurrency('TND').format(totalTVA);
    taxSection.querySelector('.tax-item-cl').textContent = createFmtCurrency('TND').format(contributionCL);
    taxSection.querySelector('.tax-item-rtt').textContent = createFmtCurrency('TND').format(contibutionRTT);
    taxSection.querySelector('.tax-item-fte').textContent = createFmtCurrency('TND').format(contributionFTE);
    taxSection.querySelector('.tax-item-total').textContent = createFmtCurrency('TND').format(totalTVA + totalContributions);

    // Update grand total
    tab04Container.querySelector('#grandTotalValue').textContent = createFmtCurrency('TND').format(grandTotal);
}

// Helper function to create kVA table sections
function createKvaTableSection(title, formula, voltage, factor, data) {
    const section = el('div', { class: 'kva-section' });
    
    const heading = el('h3', { text: t(title), 'data-i18n': title });
    section.appendChild(heading);
    
    const formulaDiv = el('div', { class: 'kva-formula' });
    formulaDiv.innerHTML = `
        <p data-i18n=${formula}>${t(formula)}</p>
        <p>Voltage (U) ≈ ${voltage}</p>
        <p><span data-i18n="kva.factor">${t('kva.factor')}</span> ${factor}</p>
    `;
    section.appendChild(formulaDiv);
    
    const table = el('table', { class: 'kva-table' });
    
    // Table header
    const thead = el('thead');
    const headerRow = el('tr');
    ['kva.table.intensity', 'kva.table.apparent', 'kva.table.kva'].forEach(headerText => {
        headerRow.appendChild(el('th', { text: t(headerText), 'data-i18n': headerText }));
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Table body
    const tbody = el('tbody');
    data.forEach(row => {
        const tr = el('tr');
        row.forEach(cellText => {
            tr.appendChild(el('td', { text: cellText }));
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    section.appendChild(table);
    
    return section;
}

function createKvaInfoModal() {
    const modal = el('div', { class: 'kva-info-modal hidden' });
    const overlay = el('div', { class: 'kva-modal-overlay' });
    const modalContent = el('div', { class: 'kva-modal-content' });
    
    // Close button
    const closeBtn = el('button', { 
        class: 'kva-modal-close',
        html: '&times;'
    });
    closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });
    modalContent.appendChild(closeBtn);
    
    // Header
    modalContent.appendChild(el('h2', { class: 'kva-modal-header', text: t('kva.title'), 'data-i18n': 'kva.title' }));
    
    // Description
    const description = el('div', { class: 'kva-description' });
    description.innerHTML = `
        <p><span data-i18n="kva.description.line1">${t('kva.description.line1')}</span></p>
        <p><span data-i18n="kva.description.line2">${t('kva.description.line2')}</span><br> <strong style="color:var(--accent-plus);"> <span data-i18n="kva.description.note">${t('kva.description.note')}</span></s></strong></p>
        <p data-i18n="kva.description.formula">${t('kva.description.formula')}</p>
    `;
    modalContent.appendChild(description);
    
    // 1-Phase data
    const onePhaseData = [
        ['5A', '220 x 5 = 1 100 VA', '1,1 kVA ≈ 1kVA'],
        ['10A', '220 x 10 = 2 200 VA', '2,2 kVA ≈ 2kVA'],
        ['15A', '220 x 15 = 3 300 VA', '3,3 kVA ≈ 3kVA'],
        ['20A', '220 x 20 = 4 400 VA', '4,4 kVA ≈ 4kVA'],
        ['30A', '220 x 30 = 6 600 VA', '6,6 kVA ≈ 7kVA'],
        ['45A', '220 x 45 = 9 900 VA', '9,9 kVA ≈ 10kVA'],
        ['63A', '220 x 63 = 13 860 VA', '13,9 kVA ≈ 14kVA']
    ];
    
    // 3-Phase data
    const threePhaseData = [
        ['5A', '660 x 5 = 3 300 VA', '3,3 kVA ≈ 3kVA'],
        ['10A', '660 x 10 = 6 600 VA', '6,6 kVA ≈ 7kVA'],
        ['15A', '660 x 15 = 9 900 VA', '9,9 kVA ≈ 10kVA'],
        ['20A', '660 x 20 = 13 200 VA', '13,2 kVA ≈ 13kVA'],
        ['30A', '660 x 30 = 19 800 VA', '19,8 kVA ≈ 20kVA'],
        ['50A', '660 x 50 = 33 000 VA', '33.0 kVA = 33 kVA'],
        ['63A', '660 x 63 = 41 580 VA', '41,6 kVA ≈ 42kVA']
    ];
    
    // Add sections
    modalContent.appendChild(createKvaTableSection(
        'kva.single-phase.title',
        'kva.single-phase.formula',
        '220V',
        '220',
        onePhaseData
    ));
    
    modalContent.appendChild(createKvaTableSection(
        'kva.three-phase.title',
        'kva.three-phase.formula',
        '380V',
        '√3 x U ≈ 660',
        threePhaseData
    ));
    
    modal.appendChild(overlay);
    modal.appendChild(modalContent);
    
    // Close modal when clicking overlay
    overlay.addEventListener('click', () => {
        modal.classList.add('hidden');
    });
    
    return modal;
}

// Export invoice data as CSV
function exportInvoiceData() {
    const tab04Container = $('#tab04');

    // Billing period
    const billingPeriod = tab04Container.querySelector('.number-of-months').textContent;
    const billingPeriodType = localStorage.getItem('invoiceBillingPeriodType') || 'months';
    let billingPeriodInfo = 'Non specifié';
    if (billingPeriodType !== 'months') {
        const startDate = localStorage.getItem('invoiceBillingStartDate') || '';
        const endDate = localStorage.getItem('invoiceBillingEndDate') || '';
        billingPeriodInfo = `${startDate};${endDate}`;
    }

    // Electricity
    const power = localStorage.getItem('invoiceElectricityPower') || '7';
    // Gas
    const flow = localStorage.getItem('invoiceGasFlow') || '5';

    // Electricity
    const elecOld = tab04Container.querySelector('.meter-old').value;
    const elecNew = tab04Container.querySelectorAll('.meter-new')[0].value;
    const elecConsumption = tab04Container.querySelector('.consumption-electricity').textContent;
    const elecPrice = tab04Container.querySelector('.price-electricity').textContent;
    const elecFixed = tab04Container.querySelector('.fixed-electricity').textContent;
    const elecTotalHT = tab04Container.querySelector('.total-hf-electricity').textContent;
    const elecTVAPer = tab04Container.querySelector('.tva-electricity').textContent;

    // Gas
    const gasOld = tab04Container.querySelectorAll('.meter-old')[1].value;
    const gasNew = tab04Container.querySelectorAll('.meter-new')[1].value;
    const gasConsumption = tab04Container.querySelector('.consumption-gas').textContent;
    const gasPrice = tab04Container.querySelector('.price-gas').textContent;
    const gasFixed = tab04Container.querySelector('.fixed-gas').textContent;
    const gasTotalHT = tab04Container.querySelector('.total-hf-gas').textContent;
    const gasTVAPer = tab04Container.querySelector('.tva-gas').textContent;

    // Taxes and contributions
    const taxCL = tab04Container.querySelector('.tax-item-cl').textContent;
    const taxFTE = tab04Container.querySelector('.tax-item-fte').textContent;
    const taxRTT = tab04Container.querySelector('.tax-item-rtt').textContent;
    const taxTVA = tab04Container.querySelector('.tax-item-tva').textContent;
    const taxTotal = tab04Container.querySelector('.tax-item-total').textContent;

    // Grand total
    const grandTotalValue = tab04Container.querySelector('#grandTotalValue').textContent;
    
    const csvPayload = `
        **Facture-STEG**\n\nDurée de facturation (mois);${billingPeriod}\nPeriode de facturation;${billingPeriodInfo}\n\n**Electricité**\nPuissance du compteur;${power} kVA\nAncien indexe;${elecOld}\nNouveau indexe;${elecNew}\nConsommation;${(elecConsumption)}\nPrix unitaire;${elecPrice}\nRedevances fixes;${elecFixed}\nTotal excl. TVA;${elecTotalHT}\nTVA %;${elecTVAPer}\n\n**Gaz**\nDébit du compteur;${flow} m³\nAncien indexe;${gasOld}\nNouveau indexe;${gasNew}\nConsommation;${(gasConsumption)}\nPrix unitaire;${gasPrice}\nRedevances fixes;${gasFixed}\nTotal excl. TVA;${gasTotalHT}\nTVA %;${gasTVAPer}\n\n**Taxes et contributions**\nContribution CL;${taxCL}\nContribution FTE;${taxFTE}\nContribution RTT;${taxRTT}\nTVA;${taxTVA}\nTotal des taxes et contributions;${taxTotal}\n\n**Montant total de la facture**;${grandTotalValue}
    `;
    
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvPayload], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = el('a', { href: url, download: `${billingPeriodType === 'months' ? `invoice_${billingPeriod}_months` : `invoice_${localStorage.getItem('invoiceBillingEndDate')}`}.csv` });
    //document.body.appendChild(a);
    a.click();
    //document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}



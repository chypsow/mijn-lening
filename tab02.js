import { $, el, formatLocalDate, createHeader, fmtCurrency, $all, fmtDate } from './main.js';
import { parseInputs, computeRemaining, updateSummary, hasMonthYearChanged } from './tab01.js';
import { t } from './i18n.js';

export function createTab02() {
    $('#tab02').innerHTML = '';
    $('#tab02').append(
        createHeader('header.loan-status'),
        createCalculator()
    );

    $('#startdatum-status').addEventListener('change', function() {
        if (hasMonthYearChanged(this)) $all('.output-tab02').forEach(el => el.textContent = '');
    });

    $('#einddatum-status').addEventListener('change', function() {
        if (hasMonthYearChanged(this)) $all('.output-tab02').forEach(el => el.textContent = '');
    });

    $('#berekenBtn2').addEventListener('click', calculteTotals);
}

function calculteTotals() {
    const inputs = parseInputs();
    if (!inputs) {
        alert(t('message.invalid-input'));
        return;
    }
    const { bedrag, jkp, periode, renteType: type, startDate } = inputs;
    const datum1Input = $('#startdatum-status').value;
    const datum2Input = $('#einddatum-status').value;
    const datum1 = new Date(datum1Input);
    const datum2 = new Date(datum2Input);
    if (isNaN(datum1.getTime()) || isNaN(datum2.getTime())) {
        alert(t('message.valid-dates'));
        return;
    }
    // ensure datum1 en datum2 are between startDate and endDate of the loan
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + periode, startDate.getDate());
    const firstDate = datum1 < datum2 ? new Date(datum1) : new Date(datum2);
    const lastDate = datum1 < datum2 ? new Date(datum2) : new Date(datum1);
    if (firstDate < startDate) {
        firstDate.setTime(startDate.getTime());
        //adjust input field to reflect change
        $('#startdatum-status').value = formatLocalDate(firstDate);
        //attribute to avoid triggering change event
        $('#startdatum-status').setAttribute("data-prev-date", formatLocalDate(firstDate));
    }
    if (lastDate > endDate) {
        lastDate.setTime(endDate.getTime());
        //adjust input field to reflect change
        $('#einddatum-status').value = formatLocalDate(lastDate);
        //attribute to avoid triggering change event
        $('#einddatum-status').setAttribute("data-prev-date", formatLocalDate(lastDate));
    }
   
    updateSummary();
    // deduct one month from first date to include correct month in calculation
    if(firstDate.getMonth() > startDate.getMonth() || firstDate.getFullYear() > startDate.getFullYear()) {
        firstDate.setMonth(firstDate.getMonth() - 1);
    }
    const remainingAtFirstDate = computeRemaining(bedrag, jkp, periode, type, startDate, firstDate);
    const remainingAtLastDate = computeRemaining(bedrag, jkp, periode, type, startDate, lastDate);
    const capitalPaid = remainingAtFirstDate.capital - remainingAtLastDate.capital;
    const interestPaid = remainingAtFirstDate.interest - remainingAtLastDate.interest;
    $('#totaal-kapitaal').textContent = fmtCurrency.format(capitalPaid);
    $('#totaal-rente').textContent = fmtCurrency.format(interestPaid);
    $('#totaal-afbetaald').textContent = fmtCurrency.format(capitalPaid + interestPaid);
}

function createCalculator() {
    const createBerekenButton = () => {
        return el('button', { id: 'berekenBtn2', class: 'bereken-btn', "data-i18n": "button.calculate", text: t('button.calculate') });
    }
    return el('div', { class: 'calculator' }, [
        createOverzicht(),
        createInputSectie(),
        createBerekenButton(),
        createOutputSectie()
    ]);
}

function createOverzicht() {
    return el("div", { class: "overzicht" }, [
        el('div', { class: 'overzicht-header', html: `<h2 data-i18n="section.loan-overview">${t('section.loan-overview')}</h2><span><span data-i18n="label.today">${t('label.today')}</span> <span id="todayDate">${fmtDate(new Date())}</span></span>` }),
        el('div', { class: 'overzicht-inhoud' }, [
            el("div", { html: `
                <p> ${t('output.loan-amount')}
                    <span id="bedrag-2" class="output-tab01"></span>
                </p>
                <p> ${t('output.monthly-payment')}
                    <span id="pmt-2" class="output-tab01"></span>
                </p>
                <p> ${t('output.monthly-rate')}
                    <span id="rente-2" class="output-tab01"></span>
                </p>
                <p> ${t('output.total-interest')}
                    <span id="interesten-2" class="output-tab01"></span>
                </p>
            `}),
            el("div", { html: `
                <p> ${t('label.start-date')}
                    <span id="startDatumDisplay" class="output-tab01"></span>
                </p>
                <p> ${t('label.end-date')}
                    <span id="eindDatumDisplay" class="output-tab01"></span>
                </p>
                <p> ${t('output.loan-period')}
                    <span id="periodeJaar-2" class="output-tab01"></span>
                </p>
                <p> ${t('output.remaining-duration')}
                    <span id="resterendeLooptijd-2" class="output-tab01"></span>
                </p>
            `})
        ])
    ]);
}

function createInputSectie() {
    return el('div', { class: 'input-sectie' }, [
        el('div', { class: 'uitleg-sectie' }, [
            el('p', { class: 'uitleg-tekst', "data-i18n": "section.explanation", text: t('section.explanation') }),
            el('p', { class: 'uitleg-tekst', html: `<span data-i18n="section.explanation-ref">${t('section.explanation-ref')}</span>` })
        ]),
        el('div', { class: 'datum-sectie' }, [
            el('div', { class: 'start-datum-sectie' }, [
                el('h2', { "data-i18n": "label.date1", text: t('label.date1'), class: 'kies-datum' }),
                el('input', { type: 'date', id:'startdatum-status', class: 'datum-status' })]),
            el('div', { class: 'eind-datum-sectie' }, [
                el('h2', { "data-i18n": "label.date2", text: t('label.date2'), class: 'kies-datum' }),
                el('input', { type: 'date', id:'einddatum-status', class: 'datum-status' }),
            ]),
        ]),
    ]);
}

function createOutputSectie() {
    return el('div', { class: 'output-sectie' }, [
        el('div', { class: 'kapitaal-groep' , html:`
            <div class="sectie-header">
                <p> <span data-i18n="output.paid-capital">${t('output.paid-capital')}</span> 
                    <span id="totaal-kapitaal" class="output-tab02"></span>
                </p>
            </div>
            `
        }),
        el('div', { class: 'rente-groep' , html:`
            <div class="sectie-header">
                <p> <span data-i18n="output.paid-interest">${t('output.paid-interest')}</span> 
                    <span id="totaal-rente" class="output-tab02"></span>
                </p>
            </div>
            `
        }),
        el('hr' , { class: 'output-sectie-separator' }),
        el('div', { class: 'totaal-groep' , html:`
            <div class="sectie-header">
                <p> <span data-i18n="output.total-paid">${t('output.total-paid')}</span>
                    <span id="totaal-afbetaald" class="output-tab02"></span>
                </p>
            </div>
            `
        }),

    ]);
}

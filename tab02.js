import { $, el, formatLocalDate, createHeader, fmtCurrency, $all, fmtDate, t } from './main.js';
import { computeRemaining, updateSummary, hasMonthYearChanged } from './tab01.js';

export function createTab02() {
    const tab02 = el('div', { id: 'tab02' });
    tab02.append(
        createHeader('header.loan-status'),
        createCalculatorDOM()
    );
    $('main').appendChild(tab02);
    
    $('#startdatum-status').addEventListener('change', function() {
        if (hasMonthYearChanged(this)) $all('.output-tab02').forEach(el => el.textContent = '');
    });

    $('#einddatum-status').addEventListener('change', function() {
        if (hasMonthYearChanged(this)) $all('.output-tab02').forEach(el => el.textContent = '');
    });

    $('#berekenBtn-2').addEventListener('click', calculteTotals);
}

function calculteTotals() {
    const datum1Input = $('#startdatum-status').value;
    const datum2Input = $('#einddatum-status').value;
    const datum1 = new Date(datum1Input);
    const datum2 = new Date(datum2Input);
    if (isNaN(datum1.getTime()) || isNaN(datum2.getTime())) {
        alert(t('message.valid-dates'));
        return;
    }

    const inputs = updateSummary();
    if (!inputs) return;
    const { bedrag, jkp, periode, renteType: type, startDate } = inputs;

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

function createCalculatorDOM() {
    return el('div', { class: 'calculator' }, [
        createOverzicht(),
        createInputSectie(),
        createBerekenButton(),
        createOutputSectie()
    ]);
}

function createBerekenButton() {
    return el('button', { id: 'berekenBtn-2', class: 'accented-btn no-print', "data-i18n": "button.calculate", text: t('button.calculate') });
}

function createOverzicht() {
    return el("div", { class: "overzicht" }, [
        el('div', { class: 'overzicht-header', html: `<h2 data-i18n="section.loan-overview">${t('section.loan-overview')}</h2><span><span data-i18n="label.today">${t('label.today')}</span> <span id="todayDate">${fmtDate(new Date())}</span></span>` }),
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
                    <span class="output-overview startDateDisplay"></span>
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
        el('div', { class: 'output-groep' , html:`
            <p> <span data-i18n="output.paid-capital">${t('output.paid-capital')}</span> 
                <span id="totaal-kapitaal" class="output-tab02"></span>
            </p>
            `
        }),
        el('div', { class: 'output-groep' , html:`
            <p> <span data-i18n="output.paid-interest">${t('output.paid-interest')}</span> 
                <span id="totaal-rente" class="output-tab02"></span>
            </p>
            `
        }),
        el('hr' , { class: 'output-sectie-separator' }),
        el('div', { class: 'output-groep' , html:`
            <p> <span data-i18n="output.total-paid">${t('output.total-paid')}</span>
                <span id="totaal-afbetaald" class="output-tab02"></span>
            </p>
            `
        }),

    ]);
}

import { $, el, createHeader, fmtCurrency, $all, fmtDate } from './main.js';
import { parseInputs, monthlyRate, computePayment, computeRemaining, updateSummary } from './app01.js';

export function buildApp02() {
    $('#app02').append(
        createHeader('LENING - STATUS TUSSEN 2 DATUMS'),
        createCalculator()
    );

    //overzichtInvullen();

    /*const setDatumInput = () => {
        const input = $('.datum-status');
        const today = new Date().toISOString().split('T')[0];
        if (input.value !== today) {
            input.value = today;
            const event = new Event('change');
            input.dispatchEvent(event);
        }
    };*/
    //$('#vandaag').addEventListener('click', setDatumInput);

    const handleChangeDatum = () => {
        const gekozenDatumSpan = $all('#gekozen-datum');
        const datumInput = $('.datum-status').value;
        const gekozenDatum = new Date(datumInput);
        if (!isNaN(gekozenDatum.getTime())) {
            const formattedDate = fmtDate(gekozenDatum);
            gekozenDatumSpan.forEach(span => {
                span.textContent = formattedDate;
            });
        } else {
            gekozenDatumSpan.forEach(span => {
                span.textContent = '';
            });
        }
        $all('.uitkomst').forEach(el => el.textContent = '');
    };
    $('.datum-status').addEventListener('change', handleChangeDatum);
    $('#berekenBtn2').addEventListener('click', calculteTotals);
}

/*export function overzichtInvullen() {
    $('#bedrag').textContent = bedragElement.value ? fmtCurrency.format(bedragElement.value) : '';
    $('#pmt2').textContent = pmtElement.textContent;
    $('#rente2').textContent = renteElement.value;
    $('#interesten2').textContent = interestenElement.textContent;
    
    //const startDate = new Date(startdatumElement.value);
    if (!isNaN(startDate.getTime())) {
        $('#startDatumDisplay').textContent = fmtDate(startDate);
        const periodeMaanden = periodeElement ? parseInt(periodeElement.value) : 0;
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + periodeMaanden);
        $('#endDatumDisplay').textContent = fmtDate(endDate);
    }
    
    $('#periodeJaar2').textContent = periodeElement.value ? `${periodeElement.value} maanden` : '';
    //const startDate = new Date(startdatumElement.value);
    const today = new Date();
    const totalePeriodeMaanden = parseInt(periodeElement.value);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + totalePeriodeMaanden);
    let resterendeMaanden = 0;
    if (today < endDate) {
        resterendeMaanden = (endDate.getFullYear() - today.getFullYear()) * 12 + (endDate.getMonth() - today.getMonth());
    }   
    $('#resterendeLooptijd').textContent = resterendeMaanden ? `${resterendeMaanden} maanden` : '';
    
}*/

function calculteTotals() {
    const inputs = parseInputs();
    if (!inputs) {
        alert('Ongeldige invoer. Controleer de leninggegevens.');
        return;
    }
    const { bedrag, jkp, periode, renteType: type, startDate } = inputs;
    //const startDate = new Date($('#startDatum').value);
    /*if (isNaN(startDate.getTime())) {
        alert('Er is geen geldige startdatum voor de lening gevonden.');
        return;
    }*/
    const datum1Input = $('#startdatum-status').value;
    const datum2Input = $('#einddatum-status').value;
    const datum1 = new Date(datum1Input);
    const datum2 = new Date(datum2Input);
    if (isNaN(datum1.getTime()) || isNaN(datum2.getTime())) {
        alert('Gelieve geldige datums in te vullen.');
        return;
    }
    const lastDate = datum1 < datum2 ? new Date(datum2) : new Date(datum1);
    if (lastDate > new Date(startDate.getFullYear(), startDate.getMonth() + periode, startDate.getDate())) {
        alert('De gekozen datum ligt na de einddatum van de lening.');
        $all('.uitkomst').forEach(el => el.textContent = '');
        return;
    }
    const firstDate = datum1 < datum2 ? datum1 : datum2;
    //updateSummary();
    // Calculate remaining capital and interest up to datum1
    console.log(firstDate, lastDate);
    const remainingAtFirstDate = computeRemaining(bedrag, jkp, type, periode, startDate, firstDate);
    const remainingAtLastDate = computeRemaining(bedrag, jkp, type, periode, startDate, lastDate);
    console.log(remainingAtFirstDate.capital, remainingAtLastDate.capital);

    const capitalPaid = remainingAtFirstDate.capital - remainingAtLastDate.capital;
    const interestPaid = remainingAtFirstDate.interest - remainingAtLastDate.interest;
    $('#totaal-kapitaal').textContent = fmtCurrency.format(capitalPaid);
    $('#totaal-rente').textContent = fmtCurrency.format(interestPaid);
}

function createCalculator() {
    const createBerekenButton = () => {
        return el('button', { id: 'berekenBtn2', class: 'bereken-btn', text: 'Bereken' });
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
        el("h2", { text: "Leningsgegevens :", class: "overzicht-titel" }),
        el('div', { class: 'overzicht-inhoud' }, [
            el("div", { html: `
                <p> Lening bedrag:
                    <span id="bedrag-2" class="resultaat"></span>
                </p>
                <p> Maandelijkse betaling:
                    <span id="pmt-2" class="resultaat"></span>
                </p>
                <p> Maandelijkse rentevoet:
                    <span id="rente-2" class="resultaat"></span>
                </p>
                <p> Totaal te betalen interesten:
                    <span id="interesten-2" class="resultaat"></span>
                </p>
            `}),
            el("div", { html: `
                <p> Startdatum lening:
                    <span id="startDatumDisplay" class="resultaat"></span>
                </p>
                <p> Einddatum lening:
                    <span id="endDatumDisplay" class="resultaat"></span>
                </p>
                <p> Lening periode:
                    <span id="periodeJaar-2" class="resultaat"></span>
                </p>
                <p> Resterende looptijd:
                    <span id="resterendeLooptijd-2" class="resultaat"></span>
                </p>
            `})
        ])
    ]);
}

function createInputSectie() {
    return el('div', { class: 'top-sectie' }, [
        el('div', { class: 'datum-sectie' }, [
            el('div', { class: 'start-datum-sectie' }, [
                el('h2', { text: 'Datum 1 :', class: 'kies-datum' }),
                el('input', { type: 'date', id:'startdatum-status', class: 'datum-status' })]),
            el('div', { class: 'eind-datum-sectie' }, [
                el('h2', { text: 'Datum 2 :', class: 'kies-datum' }),
                el('input', { type: 'date', id:'einddatum-status', class: 'datum-status' }),
                //el('button', { id: 'vandaag', class: 'vandaag-btn', text: 'vandaag' })
            ]),
        ]),
        el('div', { class: 'uitleg-sectie' }, [
            el('p', { class: 'uitleg-tekst', text: 'Bereken het afbetaalde kapitaal en de betaalde rente tussen twee datums op basis van de ingevoerde leninggegevens.' }),
            el('p', { class: 'uitleg-tekst', html: `De berekening is gebaseerd op de ingevoerde leninggegevens in de <strong>Lening Calculator 1</strong> sectie.` })
        ])
    ]);
}

function createOutputSectie() {
    return el('div', { class: 'sectie-wrapper' }, [
        el('div', { class: 'kapitaal-groep' , html:`
            <div class="sectie-header">
                <p> Afbetaald kapitaal: 
                    <span id="totaal-kapitaal" class="uitkomst"></span>
                </p>
            </div>
            `
        }),
        el('div', { class: 'rente-groep' , html:`
            <div class="sectie-header">
                <p> Afbetaalde Rente: 
                    <span id="totaal-rente" class="uitkomst"></span>
                </p>
            </div>
            `
        }),
    ]);
}

import { $, el, showApp, fmtCurrency, $all, fmtDate } from './main.js';
import { createHeader, parseInputs, monthlyRate, computePayment } from './lening.js';

export function renderApp02() {
    showApp(2);
    const root = $('#app02');
    if (root.innerHTML.trim() !== "") {
        overzichtInvullen();
        return; // Prevent re-initialization
    }
    root.append(
        createHeader('LENING STATUS'),
        createCalculator()
    );

    overzichtInvullen();

    const setDatumInput = () => {
        const input = $('.datum-status');
        const today = new Date().toISOString().split('T')[0];
        if (input.value !== today) {
            input.value = today;
            const event = new Event('change');
            input.dispatchEvent(event);
        }
    };
    $('#vandaag').addEventListener('click', setDatumInput);

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
    $('#berekenBtn').addEventListener('click', calculteTotals);
}

function overzichtInvullen() {
    const bedragElement = $('#teLenenBedrag');
    const pmtElement = $('#pmt');
    const renteElement = $('#rente');
    const periodeElement = $('#periode');
    const interestenElement = $('#interesten');
    const startdatumElement = $('#startDatum');
    if (bedragElement) $('#bedrag').textContent = fmtCurrency.format(bedragElement.value);
    if (pmtElement) $('#pmt2').textContent = pmtElement.value;
    if (renteElement) $('#rente2').textContent = renteElement.value;
    if (interestenElement) $('#interesten2').textContent = interestenElement.value;
    if (startdatumElement) {
        const startDate = new Date(startdatumElement.value);
        if (!isNaN(startDate.getTime())) {
            const formattedDate = startDate.toLocaleDateString('nl-NL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            $('#startDatumDisplay').textContent = formattedDate;
            //calcultae end date
            const periodeJaarElement = $('#periodeJaar');
            const periodeMaanden = periodeJaarElement ? parseInt(periodeJaarElement.value) * 12 : 0;
            const endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + periodeMaanden);
            const formattedEndDate = endDate.toLocaleDateString('nl-NL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            $('#endDatumDisplay').textContent = formattedEndDate;
        }
    }
    if (periodeElement) {
        $('#periodeJaar2').textContent = `${periodeElement.value} maanden`;
        //calculate remaining duration
        const resterendeLooptijdElement = $('#resterendeLooptijd');
        const startDate = new Date(startdatumElement.value);
        const today = new Date();
        const totalePeriodeMaanden = parseInt(periodeElement.value);
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + totalePeriodeMaanden);
        let resterendeMaanden = 0;
        if (today < endDate) {
            resterendeMaanden = (endDate.getFullYear() - today.getFullYear()) * 12 + (endDate.getMonth() - today.getMonth());
        }   
        resterendeLooptijdElement.textContent = `${resterendeMaanden} maanden`;
    }
}

function calculteTotals() {
    const inputs = parseInputs();
    if (!inputs) {
        alert('Ongeldige invoer. Controleer de leninggegevens.');
        return;
    }
    const { bedrag, jkp, periode, renteType: type } = inputs;

    const startDate = new Date($('#startDatum').value);
    if (isNaN(startDate.getTime())) {
        alert('Er is geen geldige startdatum voor de lening gevonden.');
        return;
    }
    const currentDate = new Date($('.datum-status').value);
    if (isNaN(currentDate.getTime())) {
        alert('Kies een datum.');
        return;
    } else if (currentDate < startDate) {
        alert('De gekozen datum ligt voor de startdatum van de lening.');
        $all('.uitkomst').forEach(el => el.textContent = '');
        return;
    }
    
    const paymentDate = new Date(startDate);
    const maandRentePercentage = monthlyRate(jkp, type);
    const betaling = computePayment(bedrag, maandRentePercentage, periode);
    let totaalKapitaal = 0;
    let totaalRente = 0;
    const totalInterestAll = betaling * periode - bedrag;
    let restantRente = totalInterestAll;
    let maandRente = 0;

    for (let i = 1; i <= periode; i++) {
        paymentDate.setMonth(paymentDate.getMonth() + 1);
        if (paymentDate > currentDate) break;
        maandRente = (bedrag - totaalKapitaal) * maandRentePercentage;
        totaalRente += maandRente;
        restantRente -= maandRente;
        totaalKapitaal += (betaling - maandRente);
    }
    
    const restantKapitaal = bedrag - totaalKapitaal;

    $('#totaal-kapitaal').textContent = fmtCurrency.format(totaalKapitaal);
    $('#restant-kapitaal').textContent = fmtCurrency.format(restantKapitaal);
    $('#totaal-rente').textContent = fmtCurrency.format(totaalRente);
    $('#restant-rente').textContent = fmtCurrency.format(Math.max(restantRente, 0));
}

function createCalculator() {
    return el('div', { class: 'calculator' }, [
        createOverzicht(),
        createSectie1(),
        createSectie2(),
        createSectie3()
        //createSectie4()
    ]);
}
function createOverzicht() {
    return el("div", { class: "overzicht" }, [
        el("h2", { text: "Leningsgegevens :", class: "overzicht-titel" }),
        el('div', { class: 'overzicht-inhoud' }, [
            el("div", { html: `
                <p> Lening bedrag:
                    <span id="bedrag"></span>
                </p>
                <p> Maandelijkse betaling:
                    <span id="pmt2"></span>
                </p>
                <p> Maandelijkse rentevoet:
                    <span id="rente2"></span>
                </p>
                <p> Totaal te betalen interesten:
                    <span id="interesten2"></span>
                </p>
            `}),
            el("div", { html: `
                <p> Startdatum lening:
                    <span id="startDatumDisplay"></span>
                </p>
                <p> Einddatum lening:
                    <span id="endDatumDisplay"></span>
                </p>
                <p> Lening periode:
                    <span id="periodeJaar2"></span>
                </p>
                <p> Resterende looptijd:
                    <span id="resterendeLooptijd"></span>
                </p>
            `})
        ])
    ]);
}

function createSectie1() {
    return el('div', { class: 'top-sectie' }, [
        el('div', { class: 'datum-sectie' }, [
            el('h2', { text: 'Kies een datum :', class: 'kies-datum' }),
            el('input', { type: 'date', class: 'datum-status' }),
            el('button', { id: 'vandaag', class: 'vandaag-btn', text: 'vandaag' })
        ]),
        el('div', { class: 'uitleg-sectie' }, [
        el('p', { class: 'uitleg-tekst', text: 'Bereken de status van je lening op een bepaalde datum door een datum te kiezen bovenaan en op bereken te klikken.' }),
        el('p', { class: 'uitleg-tekst', html: `De berekening is gebaseerd op de ingevoerde leninggegevens in de <strong>Aflossingstabel</strong> sectie.` }),
        ])
    ]);
}
function createSectie2() {
    return el('button', { id: 'berekenBtn', class: 'bereken-btn', text: 'Bereken' });   
}
function createSectie3() {
    return el('div', { class: 'sectie-wrapper' }, [
        el('div', { class: 'kapitaal-groep' , html:`
            <div class="sectie-header">Kapitaal status op : <span id="gekozen-datum"></span></div>
            <p> Totaal afbetaald kapitaal: 
                <span id="totaal-kapitaal" class="uitkomst"></span>
            </p>
            <p> Restant kapitaal: 
                <span id="restant-kapitaal" class="uitkomst"></span>
            </p>
            `
        }),
        el('div', { class: 'rente-groep' , html:`
            <div class="sectie-header">Interesten status op : <span id="gekozen-datum"></span></div>
            <p> Totaal afbetaalde interesten: 
                <span id="totaal-rente" class="uitkomst"></span>
            </p>
            <p> Restant interesten: 
                <span id="restant-rente" class="uitkomst"></span>
            </p>
            `
        }),
    ]);
}

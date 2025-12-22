import { $, el, showApp, fmtCurrency } from './main.js';
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

    $('#vandaag').addEventListener('click', () => {
        const today = new Date().toISOString().split('T')[0];
        $('.datum-status').value = today;
    });

    $('#berekenBtn').addEventListener('click', () => {
        calculteTotals();
    });
}

function overzichtInvullen() {
    const bedragElement = $('#teLenenBedrag');
    const pmtElement = $('#pmt');
    const renteElement = $('#rente');
    const periodeElement = $('#periodeJaar');
    const interestenElement = $('#interesten');
    const startdatumElement = $('#startDatum');
    if (bedragElement) $('#bedrag').textContent = fmtCurrency.format(bedragElement.value);
    if (pmtElement) $('#pmt2').textContent = pmtElement.value;
    if (renteElement) $('#rente2').textContent = renteElement.value;
    if (periodeElement) $('#periodeJaar2').textContent = periodeElement.value;
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
        }
    }
}

function calculteTotals() {
    const inputs = parseInputs();
    if (!inputs) return;
    const { bedrag, jkp, periode, renteType: type } = inputs;
    const currentDate = new Date($('.datum-status').value);
    if (isNaN(currentDate.getTime())) return;
    const startDate = new Date($('#startDatum').value);
    if (isNaN(startDate.getTime())) return;

    console.log('Calculating totals for date: ' + currentDate.toDateString());
    const paymentDate = new Date(startDate);
    const maandRentePercentage = monthlyRate(jkp, type);
    const betaling = computePayment(bedrag, maandRentePercentage, periode);
    let totaalKapitaal = 0;
    let totaalRente = 0;
    const totalInterestAll = betaling * periode - bedrag;
    let restantRente = totalInterestAll;
    //console.log('restantRente init: ' + restantRente);
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
    //const restantPeriode = periode - Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24 * 30.44));
    console.log('Totaal Kapitaal: ' + totaalKapitaal);
    console.log('Restant Kapitaal: ' + restantKapitaal);
    console.log('Totaal Rente: ' + totaalRente);
    console.log('Restant Rente: ' + restantRente);
    // The UI uses <span> elements in createSectie3, so update textContent
    $('#totaal-kapitaal').textContent = fmtCurrency.format(totaalKapitaal);
    $('#restant-kapitaal').textContent = fmtCurrency.format(restantKapitaal);
    $('#totaal-rente').textContent = fmtCurrency.format(totaalRente);
    $('#restant-rente').textContent = fmtCurrency.format(Math.max(restantRente, 0));
}

function createCalculator() {
    // Implementation for calculator 1 goes here
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
        el("h2", { text: "Overzicht lening :", class: "overzicht-titel" }),
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
            <p> Lening periode:
                <span id="periodeJaar2"></span>
            </p>
            <p> Totaal te betalen interesten:
                <span id="interesten2"></span>
            </p>
            <p> Startdatum lening:
                <span id="startDatumDisplay"></span>
            </p>
        `})
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
    return el('div', { class: 'sectie2' }, [
        el('button', { id: 'berekenBtn', class: 'bereken-btn', text: 'Bereken' })
           
    ]);
}

function createSectie3() {
    return el('div', { class: 'sectie-wrapper' }, [
        el('div', { class: 'kapitaal-groep' , html:`
            <div class="sectie-header">Kapitaal</div>
            <p> Totaal afbetaald kapitaal: 
                <span id="totaal-kapitaal"></span>
            </p>
            <p> Restant kapitaal: 
                <span id="restant-kapitaal"></span>
            </p>
            `
        }),
        el('div', { class: 'rente-groep' , html:`
            <div class="sectie-header">Interesten</div>
            <p> Totaal afbetaalde interesten: 
                <span id="totaal-rente"></span>
            </p>
            <p> Restant interesten: 
                <span id="restant-rente"></span>
            </p>
            `
        }),
    ]);
}

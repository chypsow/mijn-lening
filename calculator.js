import { $, el, showApp } from './main.js';
import { createHeader, parseInputs } from './lening.js';

export function renderApp02() {
    showApp(2);
    const root = $('#app02');
    if (root.innerHTML.trim() !== "") return; // Prevent re-initialization
    root.append(
        createHeader('LENING STATUS'),
        createCalculator()
    );

    $('#vandaag').addEventListener('click', () => {
        const today = new Date().toISOString().split('T')[0];
        $('#input1').value = today;
    });

    $('#berekenBtn').addEventListener('click', () => {
        calculteTotals();
    });
}

function calculteTotals() {
    const inputs = parseInputs();
    if (!inputs) return;
     const { bedrag, jkp, periode, renteType: type } = inputs;
    let totaalKapitaal = 0;
    let totaalRente = 0;
    const currentDate = new Date($('#input1').value);
    if (isNaN(currentDate)) return;
    const startDate = new Date($('#startDatum').value);
    if (isNaN(startDate)) return;

    
    for (let i = 0; i < periode; i++) {
        const paymentDate = new Date(startDate);
        paymentDate.setMonth(paymentDate.getMonth() + i);
        if (paymentDate > currentDate) break;
        const maandKapitaal = bedrag / periode;
        totaalKapitaal += maandKapitaal;
        let maandRente = 0;
        const resterendBedrag = bedrag - (maandKapitaal * i);
        if (type === 'vast') {
            maandRente = (resterendBedrag * (jkp / 100)) / 12;
        } else if (type === 'variabel') {
            maandRente = (resterendBedrag * (jkp / 100 + 1)) / 12;
        }
        totaalRente += maandRente;
    }
    //console.log('kapitaal: ' + totaalKapitaal, 'rente: ' + totaalRente);
    $('#totaal-kapitaal').value = totaalKapitaal.toFixed(2);
    $('#totaal-rente').value = totaalRente.toFixed(2);
}

function createCalculator() {
    // Implementation for calculator 1 goes here
    return el('div', { class: 'calculator1' }, [
        createSectie1(),
        createSectie2(),
        createSectie3()
    ]);
}
function createSectie1() {
    return el('section', { class: 'sectie1' }, [
        el('div', { class: 'top-sectie' }, [
            el('label', { text: 'Datum:', class: 'label-status', for: 'input1' }, [
                el('input', { type: 'date', id: 'input1', class: 'input-status' })
            ]),
            el('button', { id: 'vandaag', class: 'vandaag-btn', text: 'vandaag' }),
            el('button', { id: 'berekenBtn', class: 'bereken-btn', text: 'Bereken' })
        ]),
        // Add more elements as needed
    ]);
}
function createSectie2() {
    return el('section', { class: 'sectie2' }, [
        el('div', { class: 'middle-sectie' , html: 
            `<label> Totaal afbetaalde kapitaal:
                <input type="text" id="totaal-kapitaal" disabled>
            </label>`
        }),
    ]);
}
function createSectie3() {
    return el('section', { class: 'sectie3' }, [
        el('div', { class: 'bottom-sectie' , html: 
            `<label> Totaal afbetaalde rente:
                <input type="text" id="totaal-rente" disabled>
            </label>`
        }),
    ]);
}
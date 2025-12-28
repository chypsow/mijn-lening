import { $, el, createHeader, fmtCurrency, fmtDate } from './main.js';
import { parseInputs, monthlyRate, computePayment, updateSummary } from './tab01.js';
import { t } from './i18n.js';

export function createTab03() {
    $('#tab03').innerHTML = '';
    $('#tab03').append(
        createHeader('header.amortization'),
        createTable()
    );
    
    $('#aflossingBtn').addEventListener('click', () => {
        if ($("#aflossingstabel").hidden) {
            generateSchedule();
        } else {
            $("#aflossingstabel").hidden = true;
            $("#afdrukken").style.visibility = "hidden";
        }
    });
    $('#afdrukken').addEventListener('click', printData);
}

function generateSchedule() {
    const inputs = parseInputs();
    if (!inputs) return;
    const { bedrag, jkp, periode, renteType: type, startDate } = inputs;
    const i = monthlyRate(jkp, type);
    const betaling = computePayment(bedrag, i, periode);

    $("#tableInhoud").innerHTML = "";
    $("#aflossingstabel").hidden = false;
    $("#afdrukken").style.visibility = "visible";

    let currentDate = new Date(startDate);
    let balance = bedrag;
    let cumInterest = 0;
    let cumPrincipal = 0;

    for (let n = 1; n <= periode; n++) {
        const tr = document.createElement("tr");

        // Date: increment month for each payment (payment at end of period)
        currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());

        const interest = balance * i;
        const principal = Math.min(betaling - interest, balance); // last payment protection
        const payment = principal + interest;
        const newBalance = Math.max(balance - principal, 0);

        cumInterest += interest;
        cumPrincipal += principal;

        const cells = [
            n,
            fmtDate(currentDate),
            fmtCurrency.format(balance),
            fmtCurrency.format(payment),
            fmtCurrency.format(principal),
            fmtCurrency.format(interest),
            fmtCurrency.format(newBalance),
            fmtCurrency.format(cumInterest),
            fmtCurrency.format(cumPrincipal),
            fmtCurrency.format(payment * n)
        ];

        for (const c of cells) {
            const td = document.createElement("td");
            td.textContent = c;
            tr.appendChild(td);
        }

        $("#tableInhoud").appendChild(tr);
        balance = newBalance;
        if (balance <= 0) break;
    }
}

function createTable() {
    
    return el("div", { id: "managerTable", class: "print-container" }, [
        el("ul", {
            id: "leningOverzicht",
            class: "lening-overzicht on-print",
        }),
        el("div", { class: "button-group no-print" }, [
            el("button", {id: "aflossingBtn", class: "bereken-btn no-print", "data-i18n": "button.amortization-table", text: t('button.amortization-table')}),
            el("button", {id: "afdrukken", class: "bereken-btn no-print", "data-i18n": "button.print", text: t('button.print')})
        ]),
        el("table", { id: "aflossingstabel" }, [
            el("thead", { id: "tableHeader", class: "table-header", html: `
                <tr>
                    <th data-i18n="table.no">${t('table.no')}</th>
                    <th data-i18n="table.date">${t('table.date')}</th>
                    <th data-i18n="table.begin-capital">${t('table.begin-capital')}</th>
                    <th data-i18n="table.total-payment">${t('table.total-payment')}</th>
                    <th data-i18n="table.principal">${t('table.principal')}</th>
                    <th data-i18n="table.interest">${t('table.interest')}</th>
                    <th data-i18n="table.outstanding">${t('table.outstanding')}</th>
                    <th data-i18n="table.cumulative-interest">${t('table.cumulative-interest')}</th>
                    <th data-i18n="table.cumulative-principal">${t('table.cumulative-principal')}</th>
                    <th data-i18n="table.cumulative-payment">${t('table.cumulative-payment')}</th>
                </tr>
            `}),
            el("tbody", {
                id: "tableInhoud",
                class: "table-inhoud"
            })
        ])
    ]);
}
export function preparePrintOverview() {
    const inputs = parseInputs();
    if (!inputs) {
        $("#aflossingstabel").hidden = true;
        $("#afdrukken").style.visibility = "hidden";
        $("#aflossingBtn").style.visibility = "hidden";
        $("#leningOverzicht").hidden = true;
        return;
    }

    $("#leningOverzicht").innerHTML = "";
    
    updateSummary();
    const li = (text) => {
        const el = document.createElement("li");
        el.textContent = text;
        $("#leningOverzicht").appendChild(el);
    };
    li(t('print.loan-amount') + " " + fmtCurrency.format(inputs.bedrag));
    li(t('print.annual-rate') + " " + (inputs.jkp.toString().replace('.', ',') || "-") + " %");
    li(t('print.monthly-rate') + " " + ($("#rente-1").textContent || "-"));
    li(t('print.monthly-payment') + " " + ($("#pmt-1").textContent || "-"));
    li(t('print.total-interest') + " " + ($("#interesten-1").textContent || "-"));
    li(t('print.period') + " " + (inputs.periode || "-") + " " + t('label.months'));
    li(t('print.start-date') + " " + fmtDate(inputs.startDate));
    li(t('print.end-date') + " " + ($('#eindDatumDisplay').textContent || "-"));

    $("#leningOverzicht").hidden = false;
    $("#aflossingBtn").style.visibility = "visible";
}
function printData() {
    window.print();
}
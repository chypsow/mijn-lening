"use strict";

const $ = selector => document.querySelector(selector);
const $all = selector => Array.from(document.querySelectorAll(selector));

const pmtEl = $("#pmt");
const renteEl = $("#rente");
const periodeJaarEl = $("#periodeJaar");
const interestenEl = $("#interesten");
const inputsNumber = $all("input[type=number]");
const outputsText = $all("input[type=text]");
const tableHeader = $("#tableHeader");
const tableInhoud = $("#tableInhoud");
const aflossingBtn = $("#aflossingBtn");
const datumEl = $("#startDatum");
const afdrukkenBtn = $("#afdrukken");
const leningOverzicht = $("#leningOverzicht");
const renteType = $("#renteType");
const aflossingTable = $("#aflossingstabel");

const fmtCurrency = new Intl.NumberFormat("nl-BE", { style: "currency", currency: "EUR", maximumFractionDigits: 2 });
const fmtNumber = (n, digits = 2) => Number.isFinite(n) ? n.toFixed(digits) : "0.00";

function parseInputs() {
    const bedrag = parseFloat($("#teLenenBedrag").value);
    const jkp = parseFloat($("#jkp").value);
    const periode = parseInt($("#periode").value, 10);
    if (!isFinite(bedrag) || !isFinite(jkp) || !isFinite(periode) || periode <= 0) return null;
    return { bedrag, jkp, periode, renteType: renteType.value };
}

function resetOutputs() {
    outputsText.forEach(o => o.value = "");
    afdrukkenBtn.style.visibility = "hidden";
    aflossingTable.hidden = true;
    aflossingBtn.disabled = true;
}

function monthlyRate(jkp, type) {
    if (type === "1") { // effectief
        return Math.pow(1 + jkp / 100, 1 / 12) - 1;
    } else { // nominaal
        return jkp / 100 / 12;
    }
}

function computePayment(principal, monthlyI, periods) {
    if (monthlyI <= 0) return principal / periods;
    const denom = 1 - Math.pow(1 + monthlyI, -periods);
    return principal * (monthlyI / denom);
}

function updateSummary() {
    const inputs = parseInputs();
    if (!inputs) {
        resetOutputs();
        return;
    }
    const { bedrag, jkp, periode, renteType: type } = inputs;
    const i = monthlyRate(jkp, type);
    const betaling = computePayment(bedrag, i, periode);
    pmtEl.value = fmtCurrency.format(+betaling.toFixed(2));
    renteEl.value = (i * 100).toFixed(4) + " %";
    periodeJaarEl.value = (periode / 12).toFixed(2) + " jaar";
    interestenEl.value = fmtCurrency.format((betaling * periode - bedrag));
    aflossingBtn.disabled = false;
}

function generateSchedule() {
    const inputs = parseInputs();
    if (!inputs) return;
    const { bedrag, jkp, periode, renteType: type } = inputs;
    const i = monthlyRate(jkp, type);
    const betaling = computePayment(bedrag, i, periode);
    tableInhoud.innerHTML = "";
    aflossingTable.hidden = false;
    afdrukkenBtn.style.visibility = "visible";

    // Start date
    let currentDate = datumEl.valueAsDate ? new Date(datumEl.valueAsDate) : new Date();
    // Ensure we show the starting month as provided (don't move before first row)
    const fmtDate = d => new Date(d).toLocaleDateString("nl-BE");

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

        tableInhoud.appendChild(tr);
        balance = newBalance;
        if (balance <= 0) break;
    }
}

function preparePrintOverview() {
    leningOverzicht.innerHTML = "";
    const inputs = parseInputs();
    const li = (text) => {
        const el = document.createElement("li");
        el.textContent = text;
        leningOverzicht.appendChild(el);
    };
    li("Te lenen bedrag: " + fmtCurrency.format(inputs.bedrag));
    li("Maandelijkse aflossing: " + (pmtEl.value || "-"));
    li("JKP: " + (inputs.jkp || "-") + " %");
    li("Periode: " + (inputs.periode || "-") + " maanden");
    li("Totaal interesten: " + (interestenEl.value || "-"));
}

function printData() {
    preparePrintOverview();
    window.print();
}

/* Events */
inputsNumber.forEach(inp => inp.addEventListener("input", () => {
    updateSummary();
    // regenerate table only if visible
    if (!aflossingTable.hidden) generateSchedule();
}));

renteType.addEventListener("change", () => {
    updateSummary();
    if (!aflossingTable.hidden) generateSchedule();
});

datumEl.addEventListener("change", () => {
    if (!aflossingTable.hidden) generateSchedule();
});

aflossingBtn.addEventListener("click", generateSchedule);
afdrukkenBtn.addEventListener("click", printData);

/* Initialize */
document.addEventListener("DOMContentLoaded", () => {
    updateSummary();
});

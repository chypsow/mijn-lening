import { DOM, $, $all, el } from './main.js';

const fmtCurrency = new Intl.NumberFormat("nl-BE", { style: "currency", currency: "EUR", maximumFractionDigits: 2 });
const fmtNumber = (n, digits = 2) => Number.isFinite(n) ? n.toFixed(digits) : "0.00";

// UI Elements
const leningDOM = {};
export function renderApp02() {
    const root = DOM.app02;
    root.style.display = "block";
    DOM.app01.style.display = "none";
    DOM.app03.style.display = "none";
    DOM.app04.style.display = "none";
    if (root.innerHTML.trim() !== "") return; // Prevent re-initialization

    root.classList.add("wrapper");
    root.append(createHeader('CALCULATOR 1'));
    // Placeholder for future calculator implementation
}
export function renderApp03() {
    const root = DOM.app03;
    root.style.display = "block";
    DOM.app01.style.display = "none";
    DOM.app02.style.display = "none";
    DOM.app04.style.display = "none";
    if (root.innerHTML.trim() !== "") return; // Prevent re-initialization

    root.classList.add("wrapper");
    root.append(createHeader('CALCULATOR 2'));
    // Placeholder for future voorbeeld 1 implementation
}
export function renderApp04() {
    const root = DOM.app04;
    root.style.display = "block";
    DOM.app01.style.display = "none";
    DOM.app02.style.display = "none";
    DOM.app03.style.display = "none";
    if (root.innerHTML.trim() !== "") return; // Prevent re-initialization

    root.classList.add("wrapper");
    root.append(createHeader('CALCULATOR 3'));
    // Placeholder for future voorbeeld 2 implementation
}

const assignElts = () => {
    leningDOM.pmtEl = $("#pmt");
    leningDOM.renteEl = $("#rente");
    leningDOM.periodeJaarEl = $("#periodeJaar");
    leningDOM.interestenEl = $("#interesten");
    leningDOM.renteType = $("#renteType");
    leningDOM.datumEl = $("#startDatum");
    leningDOM.aflossingBtn = $("#aflossingBtn");
    leningDOM.afdrukkenBtn = $("#afdrukken");
    leningDOM.aflossingTable = $("#aflossingstabel");
    leningDOM.tableInhoud = $("#tableInhoud");
    leningDOM.leningOverzicht = $("#leningOverzicht");
    leningDOM.inputsNumber = $all(".invoer");
    leningDOM.outputsText = [leningDOM.pmtEl, leningDOM.renteEl, leningDOM.periodeJaarEl, leningDOM.interestenEl];
}

// Main function to create the app01 and initialize the calculator
export function renderApp01() {
    const root = DOM.app01;
    root.style.display = "block";
    DOM.app02.style.display = "none";
    DOM.app03.style.display = "none";
    DOM.app04.style.display = "none";
    if (root.innerHTML.trim() !== "") return; // Prevent re-initialization

    // Build UI
    root.classList.add("wrapper");
    root.append(
        createHeader(),
        createImportExportButtons(),
        createMainSection(),
        createButtons(),
        createTable()
    );
    assignElts();
    updateSummary();

    // Event listeners/* Events */
    leningDOM.inputsNumber.forEach(inp => inp.addEventListener("input", () => {
        updateSummary();
        // regenerate table only if visible
        if (!leningDOM.aflossingTable.hidden) generateSchedule();
    }));

    leningDOM.renteType.addEventListener("change", () => {
        updateSummary();
        if (!leningDOM.aflossingTable.hidden) generateSchedule();
    });

    leningDOM.datumEl.addEventListener("change", () => {
        if (!leningDOM.aflossingTable.hidden) generateSchedule();
    });

    leningDOM.aflossingBtn.addEventListener("click", () => {
        if (leningDOM.aflossingTable.hidden) {
            generateSchedule();
        } else {
            leningDOM.aflossingTable.hidden = true;
            leningDOM.afdrukkenBtn.style.visibility = "hidden";
        }
    });
    leningDOM.afdrukkenBtn.addEventListener("click", printData);
}



// Create Elements
function createHeader(tekst = "LENING AFLOSSINGSSCHEMA") {
    return el("header", { class: "no-print" }, [
        el("h1", { text: tekst })
    ]);
}
function createImportExportButtons() {
    return el("div", { class: "import-export-buttons no-print" }, [
        el("button", { id: "importBtn", text: "Importeren" }),
        el("button", { id: "exportBtn", text: "Exporteren" })
    ]);
}
function createMainSection() {
    return el("section", { class: "no-print" }, [
        createLinksFieldset(),
        createRechtsFieldset()
    ]);
}
function createLinksFieldset() {
    return el("fieldset", { class: "links" }, [
        el("h2", { text: "In te vullen :" }),
        el("div", { class: "info-box" }, [
            createBedragInput(),
            createRenteInput(),
            createPeriodeInput(),
            createStartDatumInput()
        ])
    ]);
}
function createBedragInput() {
    return el("label", {
        html: `Te lenen bedrag (EUR):&nbsp;&nbsp;&nbsp;
        <input type="number" id="teLenenBedrag" class="invoer">`
    });
}

function createRenteInput() {
    return el("div", { class: "label-select", html: `
        <label>
            Jaarlijkse rentevoet (%):&nbsp;&nbsp;&nbsp;
            <input type="number" id="jkp" class="invoer">
        </label>
        <select id="renteType" class="rente-type">
            <option value="1">Effectief</option>
            <option value="2">Nominaal</option>
        </select>
    `});
}

function createPeriodeInput() {
    return el("label", {
        html: `Lening periode (maand):&nbsp;&nbsp;&nbsp;
        <input type="number" id="periode" class="invoer">`
    });
}

function createStartDatumInput() {
    return el("label", {
        html: `Start datum:&nbsp;&nbsp;&nbsp;
        <input type="date" id="startDatum">`
    });
}
function createRechtsFieldset() {
    return el("fieldset", { class: "rechts" }, [
        el("h2", { text: "Overzicht lening :" }),
        el("div", { class: "info-box", html: `
            <label> Periodieke betaling:
                <input type="text" id="pmt" disabled>
            </label>
            <label> Periodieke rentevoet:
                <input type="text" id="rente" disabled>
            </label>
            <label> Lening periode:
                <input type="text" id="periodeJaar" disabled>
            </label>
            <label> Totaal interesten:
                <input type="text" id="interesten" disabled>
            </label>
        `})
    ]);
}
function createButtons() {
    return el("div", { class: "button-group no-print" }, [
        el("button", {id: "aflossingBtn", class: "no-print", disabled: true, text: "Aflossingstabel"}),
        el("button", {id: "afdrukken", class: "afdrukken no-print", text: "Afdrukken"})
    ]);
}
function createTable() {
    return el("div", { id: "managerTable", class: "print-container" }, [
        el("ul", {
            id: "leningOverzicht",
            class: "lening-overzicht on-print",
            hidden: true
        }),
        el("table", { id: "aflossingstabel", hidden: true }, [
            el("thead", { id: "tableHeader", class: "table-header", html: `
                <tr>
                    <th>No</th>
                    <th>Datum</th>
                    <th>Begin kapitaal</th>
                    <th>Aflossing totaal</th>
                    <th>Aflossing kapitaal</th>
                    <th>Aflossing rente</th>
                    <th>Uitstaand kapitaal</th>
                    <th>Cumulatieve interesten</th>
                    <th>Cumulatief afbetaald KPT</th>
                    <th>Cumulatif aflossing</th>
                </tr>
            `}),
            el("tbody", {
                id: "tableInhoud",
                class: "table-inhoud"
            })
        ])
    ]);
}

// Lening calculator logic
function parseInputs() {
    const bedrag = parseFloat($("#teLenenBedrag").value);
    const jkp = parseFloat($("#jkp").value);
    const periode = parseInt($("#periode").value, 10);
    if (!isFinite(bedrag) || !isFinite(jkp) || !isFinite(periode) || periode <= 0) return null;
    return { bedrag, jkp, periode, renteType: renteType.value };
}

function resetOutputs() {
    leningDOM.outputsText.forEach(o => o.value = "");
    leningDOM.afdrukkenBtn.style.visibility = "hidden";
    leningDOM.aflossingTable.hidden = true;
    leningDOM.aflossingBtn.disabled = true;
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
    leningDOM.pmtEl.value = fmtCurrency.format(+betaling.toFixed(2));
    leningDOM.renteEl.value = (i * 100).toFixed(4) + " %";
    leningDOM.periodeJaarEl.value = (periode / 12).toFixed(2) + " jaar";
    leningDOM.interestenEl.value = fmtCurrency.format((betaling * periode - bedrag));
    leningDOM.aflossingBtn.disabled = false;
}

function generateSchedule() {
    const inputs = parseInputs();
    if (!inputs) return;
    const { bedrag, jkp, periode, renteType: type } = inputs;
    const i = monthlyRate(jkp, type);
    const betaling = computePayment(bedrag, i, periode);
    leningDOM.tableInhoud.innerHTML = "";
    leningDOM.aflossingTable.hidden = false;
    leningDOM.afdrukkenBtn.style.visibility = "visible";

    // Start date
    let currentDate = leningDOM.datumEl.valueAsDate ? new Date(leningDOM.datumEl.valueAsDate) : new Date();
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

        leningDOM.tableInhoud.appendChild(tr);
        balance = newBalance;
        if (balance <= 0) break;
    }
}

function preparePrintOverview() {
    leningDOM.leningOverzicht.innerHTML = "";
    const inputs = parseInputs();
    const li = (text) => {
        const el = document.createElement("li");
        el.textContent = text;
        leningDOM.leningOverzicht.appendChild(el);
    };
    li("Te lenen bedrag: " + fmtCurrency.format(inputs.bedrag));
    li("Maandelijkse aflossing: " + (leningDOM.pmtEl.value || "-"));
    li("JKP: " + (inputs.jkp || "-") + " %");
    li("Periode: " + (inputs.periode || "-") + " maanden");
    li("Totaal interesten: " + (leningDOM.interestenEl.value || "-"));
}

function printData() {
    preparePrintOverview();
    window.print();
}







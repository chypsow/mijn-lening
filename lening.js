import { DOM, $, $all, el, showApp } from './main.js';

const fmtCurrency = new Intl.NumberFormat("nl-BE", { style: "currency", currency: "EUR",maximumFractionDigits: 2 });
const fmtDecimal = (digits = 2) => new Intl.NumberFormat("nl-BE", { style: "decimal", maximumFractionDigits: digits });
const fmtDate = d => new Date(d).toLocaleDateString("nl-BE");
//const fmtPercent = new Intl.NumberFormat("nl-BE", { style: "percent", maximumFractionDigits: 4 });


// UI Elements

export function renderApp02() {
    showApp(2);
    const root = DOM.app02;
    if (root.innerHTML.trim() !== "") return; // Prevent re-initialization
    root.append(createHeader('CALCULATOR 1'));
    // Placeholder for future calculator 1 implementation
}
export function renderApp03() {
    showApp(3);
    const root = DOM.app03;
    if (root.innerHTML.trim() !== "") return; // Prevent re-initialization
    root.append(createHeader('CALCULATOR 2'));
    // Placeholder for future calculator 2 implementation
}
export function renderApp04() {
    showApp(4);
    const root = DOM.app04;
    if (root.innerHTML.trim() !== "") return; // Prevent re-initialization
    root.append(createHeader('CALCULATOR 3'));
    // Placeholder for future calculator 3 implementation
}

// Main function to create the app01 and initialize the calculator
export function renderApp01() {
    showApp(1);
    const root = DOM.app01;
    if (root.innerHTML.trim() !== "") return; // Prevent re-initialization  

    root.append(
        createHeader(),
        createHeading(),
        createMainSection(),
        createButtons(),
        createTable()
    );
    
    updateSummary();

    // Event listeners/* Events */
    $all(".invoer").forEach(inp => inp.addEventListener("input", () => {
        inp.value = inp.value.replace(/\./g, ',');
        updateSummary();
        // regenerate table only if visible
        if (!$("#aflossingstabel").hidden) generateSchedule();
    }));

    $("#renteType").addEventListener("change", () => {
        updateSummary();
        if (!$("#aflossingstabel").hidden) generateSchedule();
    });

    $("#startDatum").addEventListener("change", () => {
        if (!$("#aflossingstabel").hidden) generateSchedule();
    });

    $("#aflossingBtn").addEventListener("click", () => {
        if ($("#aflossingstabel").hidden) {
            generateSchedule();
        } else {
            $("#aflossingstabel").hidden = true;
            $("#afdrukken").style.visibility = "hidden";
        }
    });
    $("#afdrukken").addEventListener("click", printData);
    $("#importBtn").addEventListener("click", importData);
    $("#exportBtn").addEventListener("click", exportData);
}

// Create Elements
function createHeader(tekst = "LENING AFLOSSINGSSCHEMA") {
    return el("header", { class: "no-print" }, [
        el("h1", { text: tekst })
    ]);
}
function createHeading() {
    return el("div", { class: "top-row no-print" }, [
        createBankName(),
        createImportExportButtons()
    ]);
}
function createBankName() {
    return el("label", { class: "bank-name" }, [
        el("span", { text: "Naam bank: " }),
        el("input", { type: "text", id: "bankName", placeholder: "Naam bank..." })
    ]);
}
function createImportExportButtons() {
    return el("div", { class: "import-export-buttons" }, [
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
        <input type="text" id="teLenenBedrag" class="invoer">`
    });
}

function createRenteInput() {
    return el("div", { class: "label-select", html: `
        <label>
            Jaarlijkse rentevoet (%):&nbsp;&nbsp;&nbsp;
            <input type="text" id="jkp" class="invoer">
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
        <input type="text" id="periode" class="invoer">`
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
function updateSummary() {
    const inputs = parseInputs();
    if (!inputs) {
        resetOutputs();
        return;
    }
    const { bedrag, jkp, periode, renteType: type } = inputs;
    const i = monthlyRate(jkp, type);
    const betaling = computePayment(bedrag, i, periode);
    $("#pmt").value = fmtCurrency.format(betaling);
    $("#rente").value = fmtDecimal(4).format(i * 100) + " %";
    $("#periodeJaar").value = fmtDecimal(1).format(periode / 12) + " jaar";
    $("#interesten").value = fmtCurrency.format((betaling * periode - bedrag));
    $("#aflossingBtn").disabled = false;
}

function parseInputs() {
    const bedrag = parseFloat($("#teLenenBedrag").value.replace(',', '.'));
    const jkp = parseFloat($("#jkp").value.replace(',', '.'));
    const periode = parseInt($("#periode").value.replace(',', '.'), 10);
    if (!isFinite(bedrag) || !isFinite(jkp) || !isFinite(periode) || periode <= 0) return null;
    return { bedrag, jkp, periode, renteType: renteType.value };
}

function resetOutputs() {
    const outputsText = [$("#pmt"), $("#rente"), $("#periodeJaar"), $("#interesten")];
    outputsText.forEach(o => o.value = "");
    $("#afdrukken").style.visibility = "hidden";
    $("#aflossingstabel").hidden = true;
    $("#aflossingBtn").disabled = true;
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

function generateSchedule() {
    const inputs = parseInputs();
    if (!inputs) return;
    const { bedrag, jkp, periode, renteType: type } = inputs;
    const i = monthlyRate(jkp, type);
    const betaling = computePayment(bedrag, i, periode);

    $("#tableInhoud").innerHTML = "";
    $("#aflossingstabel").hidden = false;
    $("#afdrukken").style.visibility = "visible";

    // Start date
    // startDateValue = $("#startDatum").valueAsDate;
    let currentDate = $("#startDatum").valueAsDate ? new Date($("#startDatum").valueAsDate) : new Date();
    // Ensure we show the starting month as provided (don't move before first row)
    
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

function preparePrintOverview() {
    $("#leningOverzicht").innerHTML = "";
    const inputs = parseInputs();
    const li = (text) => {
        const el = document.createElement("li");
        el.textContent = text;
        $("#leningOverzicht").appendChild(el);
    };
    li("Te lenen bedrag: " + fmtCurrency.format(inputs.bedrag));
    li("Maandelijkse aflossing: " + ($("#pmt").value || "-"));
    li("JKP: " + (inputs.jkp.toString().replace('.', ',') || "-") + " %");
    li("Periode: " + (inputs.periode || "-") + " maanden");
    li("Totaal interesten: " + ($("#interesten").value || "-"));
}

function printData() {
    preparePrintOverview();
    window.print();
}

function importData() {
    let fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.txt,.json';
    fileInput.onchange = e => {
        let file = e.target.files[0];
        let reader = new FileReader();
        reader.onload = event => {
            let data = JSON.parse(event.target.result);
            // Populate fields
            $("#bankName").value = data.bank || "";
            $("#teLenenBedrag").value = data.bedrag || "";
            $("#jkp").value = data.jkp ? fmtDecimal(4).format(data.jkp) : "";
            $("#periode").value = data.periode || "";
            $("#renteType").value = data.renteType || "1";
            $("#startDatum").value = data.startDatum || "";
            
            updateSummary();
            if (!$("#aflossingstabel").hidden) {
                generateSchedule();
            }
        };
        reader.readAsText(file);
    };
    fileInput.click();
}

function exportData() {
    const inputs = parseInputs();
    if (!inputs) {
        alert("Geen geldige gegevens om te exporteren.");
        return;
    }
    const data = {
        bank: $("#bankName").value || "",
        bedrag: inputs.bedrag,
        jkp: inputs.jkp,
        periode: inputs.periode,
        renteType: inputs.renteType,
        startDatum: $("#startDatum").value
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    //filename format: bank_bedragk_periodem_startDatum.txt
    const safeBankName = data.bank.replace(/[^a-z0-9]/gi, '_').toLowerCase() || "bank";
    //als datum niet ingevuld is, gebruik dan 'nodate'
    if (!data.startDatum) data.startDatum = "nodate";
    const filename = `${safeBankName}_${data.bedrag/1000}k_${data.periode}m_${data.startDatum}.txt`;
    downloadAnchorNode.setAttribute("download", filename);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}








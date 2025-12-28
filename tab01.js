import { $, $all, el,formatLocalDate, createHeader,  fmtCurrency, fmtDate, fmtDecimal } from './main.js';

export function createTab01() {
    $('#tab01').append(
        createHeader('LENING - OVERZICHT EN STATUS'),
        createTopRow(),
        createMainSection(),
    );
    
    // Event listeners/* Events */
    $all(".invoer").forEach(inp => inp.addEventListener("input", () => {
        inp.value = inp.value.replace(/\./g, ',');
        if (inp.id === "periode") {
            // Update end date preview
            const startDate = $("#startDatum").valueAsDate;
            if (startDate) {
                const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + parseInt(inp.value || "0", 10), startDate.getDate());
                $("#eindDatum").textContent = fmtDate(endDate);
                $("#eindDatum").setAttribute("data-prev-date", fmtDate(endDate));
                $("#eindDatum-container").classList.remove("eind-datum-hidden");
            }
        }
        // Skip resetOutputs if startDatum changed but month/year didn't
        if (inp.id === "startDatum" || inp.id === "currentDate") {
            // handle eindDatum update in separate listener
            return;
        }
        resetOutputs();
    }));

    $("#renteType").addEventListener("change", () => {
        resetOutputs();
    });

    $("#startDatum").addEventListener("change", () => {
        const startDate = $("#startDatum").valueAsDate;
        if (startDate) {
            $("#eindDatum-container").classList.remove("eind-datum-hidden");
            const periode = parseInt($("#periode").value || "0", 10);
            const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + periode, startDate.getDate());
            const newEndDateStr = formatLocalDate(endDate);
            $("#eindDatum").textContent = fmtDate(endDate);
            if (!hasMonthYearChanged($("#eindDatum"))) {
                $("#eindDatum").setAttribute("data-prev-date", newEndDateStr);
                $("#startDatumDisplay").textContent = fmtDate(startDate);
                $("#eindDatumDisplay").textContent = fmtDate(endDate);
                return;
            }
            $("#eindDatum").setAttribute("data-prev-date", newEndDateStr);
            $("#startDatumDisplay").textContent = fmtDate(startDate);
            $("#eindDatumDisplay").textContent = fmtDate(endDate);
        } else {
            $("#eindDatum-container").classList.add("eind-datum-hidden");
           
        }
        resetOutputs();
    });

    $("#currentDate").addEventListener("change", function() {
        if (hasMonthYearChanged(this)) resetStatusOutputs();
    });

    $("#berekenBtn1").addEventListener("click", updateSummary);
    $("#importBtn").addEventListener("click", importData);
    $("#exportBtn").addEventListener("click", exportData);
}
//make function to check if date changed month/year only
export function hasMonthYearChanged(element) {
    let currentDate;
    let prevDateStr;
    let newDateStr;

    if (element instanceof HTMLInputElement) {
        currentDate = element.valueAsDate;
        if (currentDate) {
            prevDateStr = element.getAttribute("data-prev-date");
            newDateStr = formatLocalDate(currentDate);
            element.setAttribute("data-prev-date", newDateStr);
        }
    } else if (element instanceof HTMLSpanElement) {
        const rawDateStr = element.textContent;
        //console.log('rawDateStr:', rawDateStr);
        const [dag, maand, jaar] = rawDateStr.split('/');
        //console.log('dag:', dag, 'maand:', maand, 'jaar:', jaar);
        newDateStr = `${jaar}-${maand.padStart(2,'0')}-${dag.padStart(2,'0')}`;
        prevDateStr = element.getAttribute("data-prev-date");
    }

    if (prevDateStr && newDateStr && prevDateStr.slice(0, 7) === newDateStr.slice(0, 7)) {
        return false;
    }
    return true;
}

// Create Elements
function createTopRow() {
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
    return el("div", { class: "top-row no-print" }, [
        createBankName(),
        createImportExportButtons()
    ]);
}

function createMainSection() {
    const createBerekenButton = () => {
        return el('button', { id: 'berekenBtn1', class: 'bereken-btn', text: 'Bereken' });
    }
    return el("section", { class: "no-print" }, [
        createInputFieldset(),
        createBerekenButton(),
        createSummaryFieldset()
    ]);
}

function createInputFieldset() {
    const bedragInput = () => {
        return el("label", {
            html: `Te lenen bedrag (EUR): <input type="text" id="teLenenBedrag" class="invoer">`
        });
    };
    const renteInput = () => {
        return el("div", { class: "label-select", html: `
            <label>
                Jaarlijkse rentevoet (%): <input type="text" id="jkp" class="invoer">
            </label>
            <select id="renteType" class="rente-type">
                <option value="1">Effectief</option>
                <option value="2">Nominaal</option>
            </select>
        `});
    };
    const periodeInput = () => {
        return el("label", {
            html: `Lening periode (maand): <input type="text" id="periode" class="invoer">`
        });
    };
    const datums = () => {
        return el("div", { class: "datums" }, [
            el("label", {
                html: `Startdatum:&nbsp;<input type="date" id="startDatum" class="invoer">`
            }),
            el("p", { id: "eindDatum-container", html: `Einddatum:&nbsp;&nbsp;` , class: "eind-datum-hidden" }, [el("span", { id: "eindDatum" })])
        ])
    };
    return el("div", { class: "input-fields card-light" }, [
        el("div", { class: "header-row-inputs", html: `<h2>In te vullen :</h2><span> Vandaag: ${ fmtDate(new Date()) }</span>` }),
        el("div", { class: "form-inhoud" }, [
            bedragInput(),
            renteInput(),
            periodeInput(),
            datums(),
        ])
    ]);
}
function createSummaryFieldset() {
    return el("div", { class: "summary-output" }, [
        createLeftSummaryFieldset(),
        createRightSummaryFieldset()
    ]);
}

function createLeftSummaryFieldset() {
    return el("div", { class: "output-fields card-dark" }, [
        el("h2", { text: "Overzicht lening :" }),
        el("div", { class: "info-box", html: `
            <p> Lening bedrag:
                <span id="bedrag-1" class="output-tab01"></span>
            </p>
            <p> Maandelijkse aflossing:
                <span id="pmt-1" class="output-tab01"></span>
            </p>
            <p> Maandelijkse rentevoet:
                <span id="rente-1" class="output-tab01"></span>
            </p>
            <p> Totaal te betalen interesten:
                <span id="interesten-1" class="output-tab01"></span>
            </p>
            <p> Lening periode:
                <span id="periodeJaar-1" class="output-tab01"></span>
            </p>
            <p> Resterende looptijd:
                <span id="resterendeLooptijd-1" class="output-tab01"></span>
            </p>
        `})
    ]);
}
function createRightSummaryFieldset() {
    return el("div", { class: "output-fields card-dark" }, [
        el("div", { class: "header-row", html: `<h2>Lening status op :</h2><input type="date" id="currentDate" class="invoer" }">` }),
        el("div", { class: "info-box", html: `
            
            <p> Uitstaand kapitaal:
                <span id="uitstaandKapitaal" class="output-status-tab01"></span>
            </p>
            <p> Resterende rente:
                <span id="resterendeInteresten" class="output-status-tab01"></span>
            </p>
            <br>
            <p> Afbetaald kapitaal:
                <span id="afbetaaldKapitaal-1" class="output-status-tab01"></span>
            </p>
            <p> Afbetaalde rente:
                <span id="afbetaaldeRente-1" class="output-status-tab01"></span>
            </p>
            <hr class="output-sectie-separator">
            <p> Totaal afbetaald:
                <span id="totaalBetaald-1" class="output-status-tab01"></span>
            </p>
         `
        })
    ]);
}

// Lening calculator logic
export function updateSummary() {
    const inputs = parseInputs();
    if (!inputs) {
        resetOutputs();
        return;
    }
    const { bedrag, jkp, periode, renteType: type, startDate } = inputs;
    const i = monthlyRate(jkp, type);
    const betaling = computePayment(bedrag, i, periode);
    $('#bedrag-1').textContent = fmtCurrency.format(bedrag);
    $("#pmt-1").textContent = fmtCurrency.format(betaling);
    $("#rente-1").textContent = fmtDecimal(4).format(i * 100) + " %";
    $("#interesten-1").textContent = fmtCurrency.format((betaling * periode - bedrag));

    const formatDuration = (remainingMonths) => {
        const jaren = Math.floor(remainingMonths / 12);
        const maanden = remainingMonths % 12;
        return jaren > 0 ? `${jaren} jaar${maanden > 0 ? ` ${maanden} maanden` : ''}` : `${maanden} maanden`;
    }

    $("#periodeJaar-1").textContent = formatDuration(periode);
    
    // Calculate remaining duration from today to end date
    const today = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + periode);
    let resterendeMaanden = 0;
    if (today < endDate) {
        resterendeMaanden = (endDate.getFullYear() - today.getFullYear()) * 12 + (endDate.getMonth() - today.getMonth());
    }
    const display = formatDuration(resterendeMaanden);
    $('#resterendeLooptijd-1').textContent = resterendeMaanden ? display : '0 maanden';

    // Calculate remaining capital and interest up to currentDate
    const currentDateInput = $("#currentDate").value;
    const currentDate = currentDateInput ? new Date(currentDateInput) : new Date();
    // ensure currentDate is not before startDate
    /*if (currentDate < startDate) {
        currentDate.setTime(startDate.getTime());
    }*/
    if (!currentDateInput) {
        const currentDateStr = formatLocalDate(currentDate);
        $("#currentDate").value = currentDateStr;
        $("#currentDate").setAttribute("data-prev-date", currentDateStr);
    }
    const remaining = computeRemaining(bedrag, jkp, periode, type, startDate, currentDate);
    $("#uitstaandKapitaal").textContent = fmtCurrency.format(remaining.capital);
    $("#resterendeInteresten").textContent = fmtCurrency.format(remaining.interest);
    $("#afbetaaldKapitaal-1").textContent = fmtCurrency.format(bedrag - remaining.capital);
    $("#afbetaaldeRente-1").textContent = fmtCurrency.format((betaling * periode - bedrag) - remaining.interest);
    $("#totaalBetaald-1").textContent = fmtCurrency.format(betaling * (periode - remaining.period));
   
    // Fill overview section
    $('#bedrag-2').textContent = fmtCurrency.format(bedrag);
    $('#pmt-2').textContent = fmtCurrency.format(betaling);
    $('#rente-2').textContent = fmtDecimal(4).format(i * 100) + " %";
    $('#interesten-2').textContent = fmtCurrency.format((betaling * periode - bedrag));
    $('#startDatumDisplay').textContent = fmtDate(startDate);
    $('#eindDatumDisplay').textContent = fmtDate(endDate);
    $('#periodeJaar-2').textContent = $("#periodeJaar-1").textContent;
    $('#resterendeLooptijd-2').textContent = $('#resterendeLooptijd-1').textContent;
}

export function computeRemaining(bedrag, jkp, periode, type, startDate, currentDate = new Date()) {
    const i = monthlyRate(jkp, type);
    const betaling = computePayment(bedrag, i, periode);
    //const today = new Date();
    let monthsElapsed = 0;
    if (currentDate > startDate) {
        monthsElapsed = (currentDate.getFullYear() - startDate.getFullYear()) * 12 + (currentDate.getMonth() - startDate.getMonth());
        if (monthsElapsed > periode) monthsElapsed = periode;
    }
    let balance = bedrag;
    let totalInterest = 0;
    for (let n = 1; n <= monthsElapsed; n++) {
        const interest = balance * i;
        const principal = Math.min(betaling - interest, balance);
        totalInterest += interest;
        balance = Math.max(balance - principal, 0);
        if (balance <= 0) break;
    }
    const remainingInterest = (betaling * (periode - monthsElapsed)) - balance;
    const period = periode - monthsElapsed;
    return {
        capital: balance,
        interest: Math.max(remainingInterest, 0),
        period: period
    };
}

export function parseInputs() {
    const bedrag = parseFloat($("#teLenenBedrag").value.replace(',', '.'));
    const jkp = parseFloat($("#jkp").value.replace(',', '.'));
    const periode = parseInt($("#periode").value.replace(',', '.'), 10);
    const startdatumValue = $("#startDatum").value;
    const startDate = new Date(startdatumValue);
    const renteType = $("#renteType");
    if (!isFinite(bedrag) || !isFinite(jkp) || !isFinite(periode) || periode <= 0 || isNaN(startDate.getTime())) {
        return null;
    }
    return { bedrag, jkp, periode, renteType: renteType.value, startDate };
}

function resetOutputs() {
    $all(".output-tab01").forEach(o => o.textContent = "");
    resetStatusOutputs();
    $all('.output-tab02').forEach(el => el.textContent = '');
    
    // Hide table and print button
    $("#afdrukken").style.visibility = "hidden";
    $("#aflossingstabel").hidden = true;
    $("#aflossingBtn").style.visibility = "hidden";
}

function resetStatusOutputs() {
    $all(".output-status-tab01").forEach(o => o.textContent = "");
}

export function monthlyRate(jkp, type) {
    if (type === "1") { // effectief
        return Math.pow(1 + jkp / 100, 1 / 12) - 1;
    } else { // nominaal
        return jkp / 100 / 12;
    }
}

export function computePayment(principal, monthlyI, periods) {
    if (monthlyI <= 0) return principal / periods;
    const denom = 1 - Math.pow(1 + monthlyI, -periods);
    return principal * (monthlyI / denom);
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
            if (data.startDatum) {
                const dateStr = data.startDatum.includes('-') ? data.startDatum : data.startDatum.split('/').reverse().join('-');
                $("#startDatum").value = dateStr;
                const startDate = new Date(dateStr);
                const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + parseInt(data.periode || "0", 10), startDate.getDate());
                $("#eindDatum").textContent = fmtDate(endDate);
                $("#eindDatum").setAttribute("data-prev-date", formatLocalDate(endDate));
                $("#eindDatum-container").classList.remove("eind-datum-hidden");
            } else {
                $("#startDatum").value = "";
                $("#eindDatum-container").classList.add("eind-datum-hidden");
            }
            resetOutputs();
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
        bank: $("#bankName").value.toUpperCase() || "Bank",
        bedrag: inputs.bedrag,
        jkp: inputs.jkp,
        periode: inputs.periode,
        renteType: inputs.renteType,
        startDatum: formatLocalDate(inputs.startDate)
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    const filename = `${data.bank}_${data.bedrag/1000}k_${data.periode}m_${data.startDatum}.txt`;
    downloadAnchorNode.setAttribute("download", filename);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}








import { $, $all, el, createHeader,  fmtCurrency, fmtDate, fmtDecimal } from './main.js';

export function buildApp01() {
    $('#app01').append(
        createHeader('LENING - OVERZICHT EN STATUS'),
        createTopRow(),
        createMainSection(),
        //createButtons(),
        //createTable()
    );
    
    // Event listeners/* Events */
    $all(".invoer").forEach(inp => inp.addEventListener("input", () => {
        inp.value = inp.value.replace(/\./g, ',');
        if (inp.id === "periode") {
            // Update end date preview
            const startDate = $("#startDatum").valueAsDate;
            if (startDate) {
                const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + parseInt(inp.value || "0", 10), startDate.getDate());
                $("#eindDatum").textContent = `Einddatum: ${fmtDate(endDate)}`;
                $("#eindDatum").classList.remove("eind-datum-hidden");
            }
        }
        // Skip resetOutputs if startDatum changed but month/year didn't
        if (inp.id === "startDatum" || inp.id === "currentDate") {
            // handle eindDatum update in separate listener
            return;
        }
        resetOutputs();
        //updateSummary();
        // regenerate table only if visible
        //if (!$("#aflossingstabel").hidden) generateSchedule();
        //$all(".uitkomst").forEach(el => el.textContent = "");
    }));

    $("#renteType").addEventListener("change", () => {
        updateSummary();
        //if (!$("#aflossingstabel").hidden) generateSchedule();
        //$all(".uitkomst").forEach(el => el.textContent = "");
    });

    $("#startDatum").addEventListener("change", () => {
        const startDate = $("#startDatum").valueAsDate;
        if (startDate) {
            const periode = parseInt($("#periode").value || "0", 10);
            const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + periode, startDate.getDate());
            const newEndDateStr = fmtDate(endDate);
            const day = startDate.getDate();
            let currentEndDateStr = $("#eindDatum").textContent.replace("Einddatum: ", "");
            //console.log('currentEndDateStr : ', currentEndDateStr);
            // convert currentEndDateStr to Date object to adjust day
            if (currentEndDateStr) {
                const parts = currentEndDateStr.split('/');
                if (parts.length === 3) {
                    const currentEndDate = new Date(parts[2], parts[1] - 1, day);
                    //console.log('currentEndDate before : ', currentEndDate);
                    currentEndDateStr = fmtDate(currentEndDate);
                }
            }
            //console.log('newEndDateStr : ', newEndDateStr);
            //console.log('currentEndDateStr after : ', currentEndDateStr);
            // Return if month and year haven't changed
            if (newEndDateStr === currentEndDateStr) {
                //console.log('no change in month or year');
                // handle eindDatum update
                $("#eindDatum").textContent = `Einddatum: ${newEndDateStr}`;
                return;
            }
            
            $("#eindDatum").textContent = `Einddatum: ${newEndDateStr}`;
            $("#eindDatum").classList.remove("eind-datum-hidden");
            //updateSummary();
            resetOutputs();
        } else {
            $("#eindDatum").classList.add("eind-datum-hidden");
            resetOutputs();
        }
        
        //if (!$("#aflossingstabel").hidden) generateSchedule();
        //$all(".uitkomst").forEach(el => el.textContent = "");
    });

    $("#currentDate").addEventListener("change", () => {
        // make the same as startDatum change
        const currentDate = $("#currentDate").valueAsDate;
        if (currentDate) {
            // check if month/year changed
            const prevDateStr = $("#currentDate").getAttribute("data-prev-date");
            const newDateStr = currentDate.toISOString().split('T')[0];
            //console.log('prevDateStr day: ', prevDateStr.slice(0,7));
            //console.log('newDateStr day: ', newDateStr.slice(0,7));
            if (prevDateStr.slice(0,7) === newDateStr.slice(0,7)) return;
            $("#currentDate").setAttribute("data-prev-date", newDateStr);
        }
        resetStatusOutputs();
        


        //updateSummary();
        //resetOutputs();
        //if (!$("#aflossingstabel").hidden) generateSchedule();
        //$all(".uitkomst").forEach(el => el.textContent = "");
    });
    /*$("#aflossingBtn").addEventListener("click", () => {
        if ($("#aflossingstabel").hidden) {
            generateSchedule();
        } else {
            $("#aflossingstabel").hidden = true;
            $("#afdrukken").style.visibility = "hidden";
        }
    });*/
    //$("#afdrukken").addEventListener("click", printData);
    $("#berekenBtn1").addEventListener("click", updateSummary);
    $("#importBtn").addEventListener("click", importData);
    $("#exportBtn").addEventListener("click", exportData);
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
    function createBedragInput() {
        return el("label", {
            html: `Te lenen bedrag (EUR): <input type="text" id="teLenenBedrag" class="invoer">`
        });
    };
    function createRenteInput() {
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
    function createPeriodeInput() {
        return el("label", {
            html: `Lening periode (maand): <input type="text" id="periode" class="invoer">`
        });
    };
    function createtDatums() {
        return el("div", { class: "datums" }, [
            el("label", {
                html: `Startdatum:&nbsp;<input type="date" id="startDatum" class="invoer">`
            }),
            el("span", {
                id: "eindDatum",
                class: "eind-datum-hidden",
            })
        ]);
    };
    return el("div", { class: "input-fields card-light" }, [
        el("h2", { text: "In te vullen :" }),
        el("div", { class: "form-inhoud" }, [
            createBedragInput(),
            createRenteInput(),
            createPeriodeInput(),
            createtDatums()
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
            <p> Geleend bedrag:
                <span id="bedrag-1" class="resultaat"></span>
            </p>
            <p> Maandelijkse aflossing:
                <span id="pmt-1" class="resultaat"></span>
            </p>
            <p> Maandelijkse rentevoet:
                <span id="rente-1" class="resultaat"></span>
            </p>
            <p> Totaal te betalen interesten:
                <span id="interesten-1" class="resultaat"></span>
            </p>
            <p> Lening periode:
                <span id="periodeJaar-1" class="resultaat"></span>
            </p>
        `})
    ]);
}
function createRightSummaryFieldset() {
    return el("div", { class: "output-fields card-dark" }, [
        el("div", { class: "header-row", html: `<h2>Lening status op :</h2><input type="date" id="currentDate" class="invoer" }">` }),
        el("div", { class: "info-box", html: `
            <p> Resterende looptijd:
                <span id="resterendeLooptijd-1" class="resultaat-status"></span>
            </p>
            <p> Uitstaand kapitaal:
                <span id="uitstaandKapitaal" class="resultaat-status"></span>
            </p>
            <p> Afbetaald kapitaal:
                <span id="afbetaaldKapitaal-1" class="resultaat-status"></span>
            </p>
            <p> Afbetaalde rente:
                <span id="afbetaaldeRente-1" class="resultaat-status"></span>
            </p>
            <p><span id="spacer">&nbsp;------------------------------------------&nbsp;</span></p>
            <p> Totaal betaald:
                <span id="totaalBetaald-1" class="resultaat-status"></span>
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
    $("#periodeJaar-1").textContent = fmtDecimal(1).format(periode / 12) + " jaar";
    const currentDateInput = $("#currentDate").value;
    const currentDate = currentDateInput ? new Date(currentDateInput) : new Date();
    if (!currentDateInput) {
        const currentDateStr = currentDate.toISOString().split('T')[0];
        $("#currentDate").value = currentDateStr;
        $("#currentDate").setAttribute("data-prev-date", currentDateStr);
    }
    const remaining = computeRemaining(bedrag, jkp, periode, type, startDate, currentDate);
    const resterendeMaanden = remaining.period;
    const jaren = Math.floor(resterendeMaanden / 12);
    const maanden = resterendeMaanden % 12;
    const display = jaren > 0 ? `${jaren} jaar${maanden > 0 ? ` ${maanden} maanden` : ''}` : `${maanden} maanden`;
    $('#resterendeLooptijd-1').textContent = resterendeMaanden ? display : '0 maanden';
    $("#uitstaandKapitaal").textContent = fmtCurrency.format(remaining.capital);
    $("#afbetaaldKapitaal-1").textContent = fmtCurrency.format(bedrag - remaining.capital);
    $("#afbetaaldeRente-1").textContent = fmtCurrency.format((betaling * periode - bedrag) - remaining.interest);
    $("#totaalBetaald-1").textContent = fmtCurrency.format(betaling * (periode - remaining.period));
    //$("#aflossingBtn").disabled = false;
   
    // Fill overview section
    $('#bedrag-2').textContent = fmtCurrency.format(bedrag);
    $('#pmt-2').textContent = fmtCurrency.format(betaling);
    $('#rente-2').textContent = fmtDecimal(4).format(i * 100) + " %";
    $('#interesten-2').textContent = fmtCurrency.format((betaling * periode - bedrag));

    //const startDate = new Date($("#startDatum").value);
    //if (!isNaN(startDate.getTime())) {
    $('#startDatumDisplay').textContent = fmtDate(startDate);
    //const periodeMaanden = periode ? parseInt(periode) : 0;
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + periode);
    $('#endDatumDisplay').textContent = fmtDate(endDate);
    //}
    $('#periodeJaar-2').textContent = $("#periodeJaar-1").textContent;
    // Calculate remaining duration
    //const today = new Date();
    //const endDate = new Date(startDate);
    //endDate.setMonth(endDate.getMonth() + periode);
    //let resterendeMaanden = 0;
    //if (today < endDate) {
        //resterendeMaanden = (endDate.getFullYear() - today.getFullYear()) * 12 + (endDate.getMonth() - today.getMonth());
    //}
    //const jaren = Math.floor(resterendeMaanden / 12);
    
    $('#resterendeLooptijd-2').textContent = $('#resterendeLooptijd-1').textContent;

    //$(".summary-output").style.visibility = "visible";
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
    //const bedragElement = $("#teLenenBedrag"); // first check of app01 is loaded
    //if (!bedragElement) return null;

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
    $all(".resultaat").forEach(o => o.textContent = "");
    resetStatusOutputs();
    //
    $all(".uitkomst").forEach(o => o.textContent = "");
    $("#afdrukken").style.visibility = "hidden";
    $("#aflossingstabel").hidden = true;
    $("#aflossingBtn").style.visibility = "hidden";
}
function resetStatusOutputs() {
    $all(".resultaat-status").forEach(o => o.textContent = "");
    //$all(".uitkomst").forEach(o => o.textContent = "");
    //$("#afdrukken").style.visibility = "hidden";
    //$("#aflossingstabel").hidden = true;
    //$("#aflossingBtn").style.visibility = "hidden";
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
            $("#startDatum").value = data.startDatum || "";
            if (data.startDatum) {
                const startDate = new Date(data.startDatum);
                const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + parseInt(data.periode || "0", 10), startDate.getDate());
                $("#eindDatum").textContent = `Einddatum: ${fmtDate(endDate)}`;
                $("#eindDatum").classList.remove("eind-datum-hidden");
            }
            //updateSummary();
            resetOutputs();
            /*if (!$("#aflossingstabel").hidden) {
                generateSchedule();
            }
            $all(".uitkomst").forEach(el => el.textContent = "");*/
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
        startDatum: fmtDate(inputs.startDate)
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    //filename format: bank_bedragk_periodem_startDatum.txt
    //const safeBankName = data.bank.replace(/[^a-z0-9]/gi, '_').toUpperCase() || "bank";
    //als datum niet ingevuld is, gebruik dan 'nodate'
    //if (!data.startDatum) data.startDatum = "nodate";
    const filename = `${data.bank}_${data.bedrag/1000}k_${data.periode}m_${data.startDatum}.txt`;
    downloadAnchorNode.setAttribute("download", filename);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}








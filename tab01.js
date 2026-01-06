import { $, $all, formatLocalDate, createHeader, fmtCurrency, fmtDate, fmtDecimal, t, el, getCurrency, currencyState } from './main.js';
import { createSimulatorDOM } from './tab01DOM.js';
import { setTableVisibility } from './tab03.js';

export function createTab01() {
    const tab01 = el('div', { id: 'tab01' });
    tab01.append(
        createHeader('header.loan-overview'),
        createSimulatorDOM()
    );
    $('main').appendChild(tab01);
    
    // Event listeners/* Events */

    function handlePeriodAndUnitChange() {
        // Update end date preview
            const startDate = $("#startDatum").valueAsDate;
            if (startDate) {
                const periode = parseInt($("#periode").value || "0", 10);
                const periodeEenheid = $("#periodeEenheid").value;
                let adjustedPeriode = periode;
                if (periodeEenheid === "years") {
                    adjustedPeriode = periode * 12;
                }
                const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + adjustedPeriode, startDate.getDate());
                $("#eindDatum").textContent = fmtDate(endDate);
                $("#eindDatum").setAttribute("data-prev-date", fmtDate(endDate));
                $("#eindDatum-container").classList.remove("eind-datum-hidden");
            }
    }

    $all(".invoer").forEach(inp => inp.addEventListener("input", () => {
        inp.value = inp.value.replace(/\./g, ',');
        if (inp.id === "periode") {
            handlePeriodAndUnitChange();
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

    $("#periodeEenheid").addEventListener("change", () => {
        handlePeriodAndUnitChange();
        resetOutputs();
    });

    $("#startDatum").addEventListener("change", () => {
        const startDate = $("#startDatum").valueAsDate;
        if (startDate) {
            $("#eindDatum-container").classList.remove("eind-datum-hidden");
            let periode = parseInt($("#periode").value || "0", 10);
            const periodeEenheid = $("#periodeEenheid").value;
            if (periodeEenheid === "years") {
                periode = periode * 12;
            }
            const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + periode, startDate.getDate());
            const newEndDateStr = formatLocalDate(endDate);
            $("#eindDatum").textContent = fmtDate(endDate);
            if (!hasMonthYearChanged($("#eindDatum"))) {
                $("#eindDatum").setAttribute("data-prev-date", newEndDateStr);
                $all(".startDateDisplay").forEach(elm => elm.textContent = fmtDate(startDate));
                $all(".endDateDisplay").forEach(elm => elm.textContent = fmtDate(endDate));
                return;
            }
            $("#eindDatum").setAttribute("data-prev-date", newEndDateStr);
            $all(".startDateDisplay").forEach(elm => elm.textContent = fmtDate(startDate));
            $all(".endDateDisplay").forEach(elm => elm.textContent = fmtDate(endDate));
        } else {
            $("#eindDatum-container").classList.add("eind-datum-hidden");
           
        }
        resetOutputs();
    });

    $("#currentDate").addEventListener("change", function() {
        if (hasMonthYearChanged(this)) resetOutputsTab01();
    });

    $("#berekenBtn-1").addEventListener("click", updateSummary);
    $("#importBtn").addEventListener("click", importData);
    $("#exportBtn").addEventListener("click", exportData);

    

    // Currency select listener - update currency when changed
    $("#currencySelect").addEventListener("change", () => {
        const currency = $("#currencySelect").value;
        currencyState.setCurrency(currency);
        localStorage.setItem('currency', currency);
        $all(".currency-symbol").forEach(elm => elm.textContent = `(${currency}):`);
        resetOutputs();
    });

    // Initialize currency on page load
    const savedCurrency = getCurrency();
    currencyState.setCurrency(savedCurrency);
    $("#currencySelect").value = savedCurrency;
    $all(".currency-symbol").forEach(elm => elm.textContent = `(${savedCurrency}):`);
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
        const [dag, maand, jaar] = rawDateStr.split('/');
        newDateStr = `${jaar}-${maand.padStart(2,'0')}-${dag.padStart(2,'0')}`;
        prevDateStr = element.getAttribute("data-prev-date");
    }

    if (prevDateStr && newDateStr && prevDateStr.slice(0, 7) === newDateStr.slice(0, 7)) {
        return false;
    }
    return true;
}

// Lening calculator logic
function formatDuration(remainingMonths) {   
    const jaren = Math.floor(remainingMonths / 12);
    const maanden = remainingMonths % 12;
    let html = '';
    if (jaren > 0) {
        html += `${jaren} <span class="duration-label" data-i18n="label.years" >${t('label.years')}</span>`;
        if (maanden > 0) {
            html += ` ${maanden} <span class="duration-label" data-i18n="label.months">${t('label.months')}</span>`;
        }
    } else {
        html += `${maanden} <span class="duration-label" data-i18n="label.months">${t('label.months')}</span>`;
    }
    return html;
}

export function updateSummary() {
    const inputs = parseInputs();
    if (!inputs) {
        resetOutputs();
        alert(t('message.invalid-input'));
        return;
    }

    const { bedrag, jkp, periode, renteType: type, startDate } = inputs;
    const i = monthlyRate(jkp, type);
    const betaling = computePayment(bedrag, i, periode);
    $all('.loan-amount').forEach(elm => elm.textContent = fmtCurrency.format(bedrag));
    $all('.monthly-payment').forEach(elm => elm.textContent = fmtCurrency.format(betaling));
    $all('.monthly-rate').forEach(elm => elm.textContent = fmtDecimal(4).format(i * 100) + " %");
    $all('.total-interest').forEach(elm => elm.textContent = fmtCurrency.format((betaling * periode - bedrag)));
    $all('.loan-period').forEach(elm => elm.innerHTML = formatDuration(periode));
    
    // Calculate remaining duration from today to end date
    const today = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + periode);
    let resterendeMaanden = 0;
    if (today < endDate) {
        resterendeMaanden = (endDate.getFullYear() - today.getFullYear()) * 12 + (endDate.getMonth() - today.getMonth());
    }
    const display = formatDuration(resterendeMaanden);
    $all('.remaining-duration').forEach(elm => elm.innerHTML = display);
    $all('.startDateDisplay').forEach(elm => elm.textContent = fmtDate(startDate));
    $all('.endDateDisplay').forEach(elm => elm.textContent = fmtDate(endDate));

    // Calculate remaining capital and interest up to currentDate
    const currentDateInput = $("#currentDate").value;
    const currentDate = currentDateInput ? new Date(currentDateInput) : new Date();
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

    return inputs;
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
    const renteType = $("#renteType").value;
    let periode = parseInt($("#periode").value, 10);
    const periodeEenheid = $("#periodeEenheid").value;
    if (periodeEenheid === "years") {
        periode = periode * 12;
    }
    const startdatumValue = $("#startDatum").value;
    const startDate = new Date(startdatumValue);
    
    if (!isFinite(bedrag) || !isFinite(jkp) || !isFinite(periode) || periode <= 0 || isNaN(startDate.getTime())) {
        return null;
    }
    return { bedrag, jkp, periode, renteType, startDate };
}

function resetOutputs() {
    resetOutputsOverview();
    resetOutputsTab01();
    resetOutputsTab02();
    setTableVisibility(false);
    //$("#aflossingBtn").disabled = true;
}
function resetOutputsOverview() {
    $all(".output-overview").forEach(o => o.textContent = "");
}
function resetOutputsTab01() {
    $all(".output-tab01").forEach(o => o.textContent = "");
}
function resetOutputsTab02() {
    $all(".output-tab02").forEach(o => o.textContent = "");
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
            // Populate fields - support both old and new naming conventions
            const importedCurrency = data["currency-code"] || "EUR";
            $("#currencySelect").value = importedCurrency;
            currencyState.setCurrency(importedCurrency);
            localStorage.setItem('currency', importedCurrency);
            $all(".currency-symbol").forEach(elm => elm.textContent = `(${importedCurrency}):`);
            $("#teLenenBedrag").value = data["loan-amount"] || "";
            $("#jkp").value = data["annual-rate"] ? fmtDecimal(4).format(data["annual-rate"]) : "";
            $("#renteType").value = data["rate-type"] || "1";
            $("#periode").value = data["period-months"] || "";
            $("#periodeEenheid").value = "months";
            if (data["start-date"]) {
                const dateStr = data["start-date"].includes('-') ? data["start-date"] : data["start-date"].split('/').reverse().join('-');
                $("#startDatum").value = dateStr;
                const startDate = new Date(dateStr);
                const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + (parseInt(data["period-months"] || "0", 10)), startDate.getDate());
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
        alert(t('message.no-data-export'));
        return;
    }
    const data = {
        "currency-code": currencyState.current,
        "loan-amount": inputs.bedrag,
        "annual-rate": inputs.jkp,
        "rate-type": inputs.renteType,
        "period-months": inputs.periode,
        "start-date": formatLocalDate(inputs.startDate)
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 4));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    const filename = `${data["bank-name"]}_${data["loan-amount"]/1000}k_${data["period-months"]}m_${data["start-date"]}.txt`;
    downloadAnchorNode.setAttribute("download", filename);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();  
}








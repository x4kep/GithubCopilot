// Web Component: Year Selector
class YearSelector extends HTMLElement {
    constructor() {
        super();
        this.currentYear = new Date().getFullYear(); // 2026
        this.minYear = this.currentYear - 5; // 2021
        this.maxYear = this.currentYear + 1; // 2027
    }

    connectedCallback() {
        this.render();
        this.attachEventListeners();
        this.loadSelectedYear();
    }

    render() {
        this.className = 'year-selector-container';
        const years = this.generateYearOptions();
        
        this.innerHTML = `
            <div class="input-group" style="width: 200px;">
                <span class="input-group-text">Year</span>
                <select id="yearSelect" class="form-select" aria-label="Select year">
                    ${years}
                </select>
            </div>
        `;
    }

    generateYearOptions() {
        const options = [];
        for (let year = this.maxYear; year >= this.minYear; year--) {
            const isCurrentYear = year === this.currentYear;
            options.push(`<option value="${year}" ${isCurrentYear ? 'selected' : ''}>${year}</option>`);
        }
        return options.join('');
    }

    attachEventListeners() {
        const select = this.querySelector('#yearSelect');
        if (select) {
            select.addEventListener('change', (e) => this.handleYearChange(e));
        }
    }

    handleYearChange(event) {
        const selectedYear = parseInt(event.target.value);
        const previousYear = YearSelector.getSelectedYear();
        
        // Save current year's data before switching
        if (previousYear !== selectedYear) {
            DataService.saveDataForYear(previousYear);
        }
        
        this.saveSelectedYear(selectedYear);
        this.notifyYearChange(selectedYear);
    }

    saveSelectedYear(year) {
        localStorage.setItem('selectedYear', year.toString());
    }

    loadSelectedYear() {
        const savedYear = localStorage.getItem('selectedYear');
        if (savedYear) {
            const select = this.querySelector('#yearSelect');
            if (select) {
                select.value = savedYear;
            }
        }
    }

    notifyYearChange(year) {
        // Dispatch custom event for other components to listen
        const event = new CustomEvent('year-changed', {
            detail: { year },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(event);

        // Also update month input list and chart
        const monthInputList = document.querySelector('month-input-list');
        if (monthInputList) {
            monthInputList.loadDataForYear(year);
        }

        const chart = document.querySelector('income-expense-chart');
        if (chart && document.getElementById('chartTab').classList.contains('show')) {
            chart.updateChart();
        }
    }

    static getSelectedYear() {
        const savedYear = localStorage.getItem('selectedYear');
        return savedYear ? parseInt(savedYear) : new Date().getFullYear();
    }
}

customElements.define('year-selector', YearSelector);

// Web Component: Month Input List
class MonthInputList extends HTMLElement {
    constructor() {
        super();
        this.currentYear = null;
    }

    connectedCallback() {
        this.render();
        this.loadInitialData();
        this.attachAutoSaveListeners();
    }

    render() {
        this.innerHTML = MONTHS.map((_, index) => 
            `<month-input-row month-index="${index}"></month-input-row>`
        ).join('');
    }

    loadInitialData() {
        const selectedYear = YearSelector.getSelectedYear();
        this.currentYear = selectedYear;
        this.loadDataForYear(selectedYear);
    }

    loadDataForYear(year) {
        this.currentYear = year;
        const yearData = DataService.loadDataForYear(year);
        
        // Populate input fields with loaded data
        for (let i = 0; i < 12; i++) {
            const incomeInput = this.querySelector(`.income-input[data-month="${i}"]`);
            const expenseInput = this.querySelector(`.expense-input[data-month="${i}"]`);
            
            if (incomeInput) {
                const incomeValue = yearData.income[i] !== undefined ? yearData.income[i] : 0;
                incomeInput.value = Number(incomeValue).toFixed(2);
            }
            if (expenseInput) {
                const expenseValue = yearData.expense[i] !== undefined ? yearData.expense[i] : 0;
                expenseInput.value = Number(expenseValue).toFixed(2);
            }
        }
    }

    attachAutoSaveListeners() {
        const inputs = this.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                const currentYear = YearSelector.getSelectedYear();
                DataService.autoSave(currentYear);
            });
            input.addEventListener('blur', () => {
                const currentYear = YearSelector.getSelectedYear();
                DataService.saveDataForYear(currentYear);
            });
        });
    }
}

customElements.define('month-input-list', MonthInputList);

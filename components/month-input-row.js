// Web Component: Month Input Row
class MonthInputRow extends HTMLElement {
    constructor() {
        super();
        this.monthIndex = parseInt(this.getAttribute('month-index')) || 0;
        this.monthName = MONTHS[this.monthIndex];
    }

    connectedCallback() {
        this.render();
        this.attachEventListeners();
    }

    render() {
        this.className = 'month-row row align-items-center';
        this.innerHTML = `
            <div class="col-md-2 month-label">${this.monthName}</div>
            <div class="col-md-5">
                <div class="input-group">
                    <span class="input-group-text"> Income</span>
                    <input type="number" 
                           class="form-control income-input" 
                           data-month="${this.monthIndex}" 
                           step="0.01" 
                           min="0" 
                           value="0" 
                           placeholder="0.00"
                           aria-label="Income for ${this.monthName}">
                </div>
            </div>
            <div class="col-md-5">
                <div class="input-group">
                    <span class="input-group-text"> Expense</span>
                    <input type="number" 
                           class="form-control expense-input" 
                           data-month="${this.monthIndex}" 
                           step="0.01" 
                           min="0" 
                           value="0" 
                           placeholder="0.00"
                           aria-label="Expense for ${this.monthName}">
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        const inputs = this.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('blur', (e) => this.handleInputValidation(e));
            input.addEventListener('input', (e) => this.handleInputValidation(e));
        });
    }

    handleInputValidation(event) {
        const input = event.target;
        input.value = validateNumericInput(input.value);
    }
}

customElements.define('month-input-row', MonthInputRow);

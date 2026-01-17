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
            <div class="col-md-3">
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
            <div class="col-md-3">
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
            <div class="col-md-4">
                <div class="input-group">
                    <span class="input-group-text"> Saved</span>
                    <input type="text" 
                           class="form-control saved-display" 
                           data-month="${this.monthIndex}" 
                           value="0.00" 
                           readonly
                           aria-label="Saved for ${this.monthName}">
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        const inputs = this.querySelectorAll('input:not(.saved-display)');
        inputs.forEach(input => {
            input.addEventListener('blur', (e) => this.handleInputValidation(e));
            input.addEventListener('input', (e) => {
                this.handleInputValidation(e);
                this.updateSavedAmount();
            });
        });
        
        // Initial calculation
        this.updateSavedAmount();
    }

    handleInputValidation(event) {
        const input = event.target;
        input.value = validateNumericInput(input.value);
    }

    updateSavedAmount() {
        const incomeInput = this.querySelector('.income-input');
        const expenseInput = this.querySelector('.expense-input');
        const savedDisplay = this.querySelector('.saved-display');
        
        if (incomeInput && expenseInput && savedDisplay) {
            const income = parseFloat(incomeInput.value) || 0;
            const expense = parseFloat(expenseInput.value) || 0;
            const saved = income - expense;
            
            savedDisplay.value = saved.toFixed(2);
            
            // Add color coding
            if (saved > 0) {
                savedDisplay.classList.add('text-success');
                savedDisplay.classList.remove('text-danger');
            } else if (saved < 0) {
                savedDisplay.classList.add('text-danger');
                savedDisplay.classList.remove('text-success');
            } else {
                savedDisplay.classList.remove('text-success', 'text-danger');
            }
        }
    }
}

customElements.define('month-input-row', MonthInputRow);

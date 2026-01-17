// Constants
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const COLORS = {
    income: '#4CAF50',
    expense: '#81C784'
};

// Utility Functions
const formatCurrency = (value) => {
    const num = parseFloat(value) || 0;
    return Math.round(num * 100) / 100;
};

const validateNumericInput = (value) => {
    const num = parseFloat(value);
    return isNaN(num) || num < 0 ? 0 : formatCurrency(num);
};

// Data Service
class DataService {
    static getData() {
        const incomeData = [];
        const expenseData = [];

        for (let i = 0; i < 12; i++) {
            const incomeInput = document.querySelector(`.income-input[data-month="${i}"]`);
            const expenseInput = document.querySelector(`.expense-input[data-month="${i}"]`);
            
            incomeData.push(incomeInput ? validateNumericInput(incomeInput.value) : 0);
            expenseData.push(expenseInput ? validateNumericInput(expenseInput.value) : 0);
        }

        return { incomeData, expenseData };
    }
}

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

// Web Component: Month Input List
class MonthInputList extends HTMLElement {
    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = MONTHS.map((_, index) => 
            `<month-input-row month-index="${index}"></month-input-row>`
        ).join('');
    }
}
// Web Component: Income Expense Chart
class IncomeExpenseChart extends HTMLElement {
    constructor() {
        super();
        this.chart = null;
    }

    connectedCallback() {
        this.render();
        this.initializeChartListener();
    }

    render() {
        this.className = 'chart-container';
        this.innerHTML = '<canvas id="incomeExpenseChart"></canvas>';
    }

    initializeChartListener() {
        const chartTab = document.getElementById('chart-tab');
        if (chartTab) {
            chartTab.addEventListener('shown.bs.tab', () => this.updateChart());
        }
        
        // Add download button listener
        const downloadBtn = document.getElementById('downloadChartBtn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadChart());
        }
    }

    updateChart() {
        const { incomeData, expenseData } = DataService.getData();
        const canvas = this.querySelector('#incomeExpenseChart');
        
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Destroy existing chart
        if (this.chart) {
            this.chart.destroy();
        }

        // Create new chart
        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: MONTHS,
                datasets: [
                    {
                        label: 'Income ()',
                        data: incomeData,
                        backgroundColor: COLORS.income,
                        borderColor: COLORS.income,
                        borderWidth: 1,
                        borderRadius: 4
                    },
                    {
                        label: 'Expenses ()',
                        data: expenseData,
                        backgroundColor: COLORS.expense,
                        borderColor: COLORS.expense,
                        borderWidth: 1,
                        borderRadius: 4
                    }
                ]
            },
            options: this.getChartOptions()
        });
    }

    getChartOptions() {
        return {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Monthly Income vs Expenses',
                    font: {
                        size: 20,
                        weight: 'bold'
                    },
                    color: COLORS.income
                },
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: { size: 14 },
                        padding: 20
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y.toFixed(2);
                            return `${label}: ${value}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: (value) => `${value.toFixed(0)}`,
                        font: { size: 12 }
                    },
                    grid: {
                        color: 'rgba(76, 175, 80, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        font: { size: 12 }
                    },
                    grid: {
                        display: false
                    }
                }
            }
        };
    }

    downloadChart() {
        const canvas = this.querySelector('#incomeExpenseChart');
        if (!canvas) {
            console.error('Chart canvas not found');
            return;
        }

        // Convert canvas to data URL
        const url = canvas.toDataURL('image/png');
        
        // Create temporary link and trigger download
        const link = document.createElement('a');
        const date = new Date().toISOString().split('T')[0];
        link.download = `bucks2bar-chart-${date}.png`;
        link.href = url;
        link.click();
    }

    disconnectedCallback() {
        if (this.chart) {
            this.chart.destroy();
        }
    }
}

// Register Web Components
customElements.define('month-input-row', MonthInputRow);
customElements.define('month-input-list', MonthInputList);
customElements.define('income-expense-chart', IncomeExpenseChart);

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    console.log('Bucks2Bar initialized');
});

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

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    console.log('Bucks2Bar initialized');
});

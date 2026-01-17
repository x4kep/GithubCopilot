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

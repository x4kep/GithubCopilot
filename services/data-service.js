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

    static saveDataForYear(year) {
        const { incomeData, expenseData } = this.getData();
        const yearData = {
            income: incomeData.map(val => Number(val) || 0),
            expense: expenseData.map(val => Number(val) || 0)
        };
        
        localStorage.setItem(`data_${year}`, JSON.stringify(yearData));
        console.log(`Data saved for year ${year}:`, yearData);
    }

    static loadDataForYear(year) {
        const storedData = localStorage.getItem(`data_${year}`);
        
        if (storedData) {
            const parsedData = JSON.parse(storedData);
            console.log(`Data loaded for year ${year}:`, parsedData);
            return parsedData;
        }
        
        // Return empty data if no data exists for the year
        console.log(`No data found for year ${year}, returning empty data`);
        return {
            income: Array(12).fill(0),
            expense: Array(12).fill(0)
        };
    }

    static autoSave(year) {
        // Debounced auto-save
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }
        
        this.saveTimeout = setTimeout(() => {
            this.saveDataForYear(year);
        }, 500);
    }
}

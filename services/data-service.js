// Data Service - Manages income and expense data storage
class DataService {
    /**
     * Get current income and expense data from DOM inputs
     * @returns {Object} Object containing incomeData and expenseData arrays
     */
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

    /**
     * Save income and expense data for a specific year
     * @param {number} year - The year to save data for
     */
    static saveDataForYear(year) {
        const { incomeData, expenseData } = this.getData();
        const yearData = {
            income: incomeData.map(val => Number(val) || 0),
            expense: expenseData.map(val => Number(val) || 0)
        };
        
        localStorage.setItem(`data_${year}`, JSON.stringify(yearData));
        console.log(`Data saved for year ${year}:`, yearData);
    }

    /**
     * Load income and expense data for a specific year
     * @param {number} year - The year to load data for
     * @returns {Object} Object containing income and expense arrays (12 months each)
     */
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

    /**
     * Auto-save data with debouncing (500ms delay)
     * @param {number} year - The year to save data for
     */
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

// Export for Node.js (testing)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataService;
}

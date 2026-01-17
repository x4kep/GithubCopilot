// Loan Service - Manages loan data and calculations
class LoanService {
    /**
     * Get all loans for a specific year
     * @param {number} year - The year to get loans for
     * @returns {Array} Array of loan objects
     */
    static getLoansForYear(year) {
        const storedLoans = localStorage.getItem(`loans_${year}`);
        
        if (storedLoans) {
            const parsedLoans = JSON.parse(storedLoans);
            console.log(`Loans loaded for year ${year}:`, parsedLoans);
            return parsedLoans;
        }
        
        console.log(`No loans found for year ${year}, returning empty array`);
        return [];
    }

    /**
     * Save all loans for a specific year
     * @param {number} year - The year to save loans for
     * @param {Array} loans - Array of loan objects to save
     */
    static saveLoansForYear(year, loans) {
        localStorage.setItem(`loans_${year}`, JSON.stringify(loans));
        console.log(`Loans saved for year ${year}:`, loans);
    }

    /**
     * Add or update a loan for a specific year
     * @param {number} year - The year to add the loan to
     * @param {Object} loan - Loan object to add/update
     * @returns {Object} The saved loan with calculated fields
     */
    static saveLoan(year, loan) {
        const loans = this.getLoansForYear(year);
        
        // Generate ID if new loan
        if (!loan.id) {
            loan.id = `loan_${Date.now()}`;
        }

        // Calculate monthly payment if not provided
        if (!loan.monthlyPayment && loan.principal && loan.interestRate && loan.termMonths) {
            loan.monthlyPayment = this.calculateMonthlyPayment(
                loan.principal,
                loan.interestRate,
                loan.termMonths
            );
        }

        // Initialize overpayments array if not present
        if (!loan.overpayments) {
            loan.overpayments = [];
        }

        // Calculate current balance
        loan.currentBalance = this.calculateRemainingBalance(loan);

        // Find existing loan and update, or add new
        const existingIndex = loans.findIndex(l => l.id === loan.id);
        if (existingIndex >= 0) {
            loans[existingIndex] = loan;
        } else {
            loans.push(loan);
        }

        this.saveLoansForYear(year, loans);
        return loan;
    }

    /**
     * Delete a loan from a specific year
     * @param {number} year - The year to delete the loan from
     * @param {string} loanId - ID of the loan to delete
     */
    static deleteLoan(year, loanId) {
        const loans = this.getLoansForYear(year);
        const filteredLoans = loans.filter(loan => loan.id !== loanId);
        this.saveLoansForYear(year, filteredLoans);
        console.log(`Loan ${loanId} deleted from year ${year}`);
    }

    /**
     * Get a single loan by ID
     * @param {number} year - The year to search in
     * @param {string} loanId - ID of the loan to find
     * @returns {Object|null} The loan object or null if not found
     */
    static getLoan(year, loanId) {
        const loans = this.getLoansForYear(year);
        return loans.find(loan => loan.id === loanId) || null;
    }

    /**
     * Calculate monthly payment using amortization formula
     * @param {number} principal - Loan principal amount
     * @param {number} annualRate - Annual interest rate (percentage)
     * @param {number} termMonths - Loan term in months
     * @returns {number} Monthly payment amount
     */
    static calculateMonthlyPayment(principal, annualRate, termMonths) {
        if (!principal || !termMonths) return 0;
        
        // Handle 0% interest rate
        if (annualRate === 0) {
            return roundToTwo(principal / termMonths);
        }

        const monthlyRate = annualRate / 100 / 12;
        const payment = principal * 
            (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
            (Math.pow(1 + monthlyRate, termMonths) - 1);
        
        return roundToTwo(payment);
    }

    /**
     * Calculate remaining balance for a loan
     * @param {Object} loan - Loan object with principal, interestRate, termMonths, startDate, monthlyPayment, overpayments
     * @returns {number} Remaining balance
     */
    static calculateRemainingBalance(loan) {
        if (!loan.principal || !loan.termMonths || !loan.startDate) {
            return loan.principal || 0;
        }

        let balance = loan.principal;
        const monthlyRate = (loan.interestRate || 0) / 100 / 12;
        const payment = loan.monthlyPayment || this.calculateMonthlyPayment(
            loan.principal,
            loan.interestRate,
            loan.termMonths
        );

        // Calculate months elapsed since start date
        const startDate = new Date(loan.startDate);
        const currentDate = new Date();
        const monthsElapsed = Math.max(0, 
            (currentDate.getFullYear() - startDate.getFullYear()) * 12 + 
            (currentDate.getMonth() - startDate.getMonth())
        );

        // Calculate balance for each month
        for (let month = 1; month <= monthsElapsed && balance > 0; month++) {
            // Calculate interest for this month
            const interest = balance * monthlyRate;
            
            // Calculate principal payment
            const principalPayment = Math.min(payment - interest, balance);
            
            // Reduce balance by principal payment
            balance -= principalPayment;

            // Apply overpayment if exists for this month
            if (loan.overpayments && loan.overpayments.length > 0) {
                const overpayment = loan.overpayments.find(op => op.month === month);
                if (overpayment) {
                    balance -= overpayment.amount;
                }
            }
        }

        return Math.max(0, roundToTwo(balance));
    }

    /**
     * Calculate loan payoff progress as a percentage
     * @param {Object} loan - Loan object
     * @returns {number} Progress percentage (0-100)
     */
    static calculatePayoffProgress(loan) {
        if (!loan.principal) return 0;
        
        const remaining = loan.currentBalance !== undefined 
            ? loan.currentBalance 
            : this.calculateRemainingBalance(loan);
        
        const paidAmount = loan.principal - remaining;
        const progress = (paidAmount / loan.principal) * 100;
        
        return Math.min(100, Math.max(0, roundToTwo(progress)));
    }

    /**
     * Apply an overpayment to a loan
     * @param {number} year - Year the loan belongs to
     * @param {string} loanId - ID of the loan
     * @param {number} amount - Overpayment amount
     * @param {number} month - Month number (1-based, counting from loan start)
     * @returns {Object} Updated loan object
     */
    static applyOverpayment(year, loanId, amount, month) {
        const loan = this.getLoan(year, loanId);
        
        if (!loan) {
            console.error(`Loan ${loanId} not found for year ${year}`);
            return null;
        }

        // Initialize overpayments array if needed
        if (!loan.overpayments) {
            loan.overpayments = [];
        }

        // Add overpayment
        loan.overpayments.push({
            month: month,
            amount: parseFloat(amount),
            date: new Date().toISOString()
        });

        // Recalculate balance
        loan.currentBalance = this.calculateRemainingBalance(loan);

        // Calculate remaining term
        const startDate = new Date(loan.startDate);
        const currentDate = new Date();
        const monthsElapsed = Math.max(0,
            (currentDate.getFullYear() - startDate.getFullYear()) * 12 +
            (currentDate.getMonth() - startDate.getMonth())
        );
        const remainingMonths = Math.max(0, loan.termMonths - monthsElapsed);

        // Recalculate monthly payment for remaining term
        if (remainingMonths > 0 && loan.currentBalance > 0) {
            loan.monthlyPayment = this.calculateMonthlyPayment(
                loan.currentBalance,
                loan.interestRate,
                remainingMonths
            );
        }

        // Save updated loan
        return this.saveLoan(year, loan);
    }

    /**
     * Recalculate monthly payment for remaining balance and term
     * @param {number} remainingBalance - Current loan balance
     * @param {number} annualRate - Annual interest rate
     * @param {number} remainingMonths - Months remaining in loan term
     * @returns {number} New monthly payment
     */
    static recalculateMonthlyPayment(remainingBalance, annualRate, remainingMonths) {
        return this.calculateMonthlyPayment(remainingBalance, annualRate, remainingMonths);
    }

    /**
     * Get total overpayments for a loan
     * @param {Object} loan - Loan object
     * @returns {number} Total overpayment amount
     */
    static getTotalOverpayments(loan) {
        if (!loan.overpayments || loan.overpayments.length === 0) {
            return 0;
        }

        return roundToTwo(
            loan.overpayments.reduce((sum, op) => sum + op.amount, 0)
        );
    }

    /**
     * Clear all loans for all years
     */
    static clearAllLoans() {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('loans_')) {
                localStorage.removeItem(key);
            }
        });
        console.log('All loan data cleared');
    }
}

// Loan Service - Manages loan data and calculations
class LoanService {
    /**
     * Get all loans (global, not year-specific)
     * @returns {Array} Array of loan objects
     */
    static getAllLoans() {
        const storedLoans = localStorage.getItem('loans');
        
        if (storedLoans) {
            const parsedLoans = JSON.parse(storedLoans);
            console.log('Loans loaded:', parsedLoans);
            return parsedLoans;
        }
        
        console.log('No loans found, returning empty array');
        return [];
    }

    /**
     * Save all loans (global)
     * @param {Array} loans - Array of loan objects to save
     */
    static saveAllLoans(loans) {
        localStorage.setItem('loans', JSON.stringify(loans));
        console.log('Loans saved:', loans);
    }

    /**
     * Add or update a loan
     * @param {Object} loan - Loan object to add/update
     * @returns {Object} The saved loan with calculated fields
     */
    static saveLoan(loan) {
        const loans = this.getAllLoans();
        
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

        this.saveAllLoans(loans);
        return loan;
    }

    /**
     * Delete a loan
     * @param {string} loanId - ID of the loan to delete
     */
    static deleteLoan(loanId) {
        const loans = this.getAllLoans();
        const filteredLoans = loans.filter(loan => loan.id !== loanId);
        this.saveAllLoans(filteredLoans);
        console.log(`Loan ${loanId} deleted`);
    }

    /**
     * Get a single loan by ID
     * @param {string} loanId - ID of the loan to find
     * @returns {Object|null} The loan object or null if not found
     */
    static getLoan(loanId) {
        const loans = this.getAllLoans();
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

        // Apply any remaining overpayments that haven't been processed yet
        // (overpayments made after the current month or for future months)
        if (loan.overpayments && loan.overpayments.length > 0) {
            const totalOverpayments = loan.overpayments.reduce((sum, op) => sum + op.amount, 0);
            const processedOverpayments = loan.overpayments
                .filter(op => op.month <= monthsElapsed)
                .reduce((sum, op) => sum + op.amount, 0);
            const unprocessedOverpayments = totalOverpayments - processedOverpayments;
            balance -= unprocessedOverpayments;
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
     * @param {string} loanId - ID of the loan
     * @param {number} amount - Overpayment amount
     * @param {number} month - Month number (1-based, counting from loan start)
     * @returns {Object} Updated loan object
     */
    static applyOverpayment(loanId, amount, month) {
        const loan = this.getLoan(loanId);
        
        if (!loan) {
            console.error(`Loan ${loanId} not found`);
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
        return this.saveLoan(loan);
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
     * Clear all loans
     */
    static clearAllLoans() {
        localStorage.removeItem('loans');
        console.log('All loan data cleared');
    }
}

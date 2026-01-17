// Web Component: Loan List
class LoanList extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.render();

        // Listen for loan updates
        document.addEventListener('loan-saved', () => this.refresh());
        document.addEventListener('loan-deleted', () => this.refresh());
        document.addEventListener('loan-updated', () => this.refresh());
    }

    refresh() {
        this.render();
    }

    render() {
        this.className = 'loan-list-container';
        
        const loans = LoanService.getAllLoans();

        if (loans.length === 0) {
            this.innerHTML = `
                <div class="empty-state">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" class="empty-icon" viewBox="0 0 16 16">
                        <path d="M4 10.781c.148 1.667 1.513 2.85 3.591 3.003V15h1.043v-1.216c2.27-.179 3.678-1.438 3.678-3.3 0-1.59-.947-2.51-2.956-3.028l-.722-.187V3.467c1.122.11 1.879.714 2.07 1.616h1.47c-.166-1.6-1.54-2.748-3.54-2.875V1H7.591v1.233c-1.939.23-3.27 1.472-3.27 3.156 0 1.454.966 2.483 2.661 2.917l.61.162v4.031c-1.149-.17-1.94-.8-2.131-1.718H4zm3.391-3.836c-1.043-.263-1.6-.825-1.6-1.616 0-.944.704-1.641 1.8-1.828v3.495l-.2-.05zm1.591 1.872c1.287.323 1.852.859 1.852 1.769 0 1.097-.826 1.828-2.2 1.939V8.73l.348.086z"/>
                    </svg>
                    <h5>No Loans Yet</h5>
                    <p class="text-muted">Start tracking your loans by adding your first loan.</p>
                    <button class="btn btn-primary add-loan-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" style="margin-right: 4px;" viewBox="0 0 16 16">
                            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                        </svg>
                        Add New Loan
                    </button>
                </div>
            `;
        } else {
            const totalBalance = loans.reduce((sum, loan) => sum + (loan.currentBalance || 0), 0);
            const totalPrincipal = loans.reduce((sum, loan) => sum + loan.principal, 0);
            const totalPaid = totalPrincipal - totalBalance;
            const overallProgress = totalPrincipal > 0 ? (totalPaid / totalPrincipal) * 100 : 0;

            this.innerHTML = `
                <div class="loan-list-header">
                    <div class="header-content">
                        <div class="header-left">
                            <h4>Your Loans</h4>
                            <div class="loan-count">${loans.length} ${loans.length === 1 ? 'Loan' : 'Loans'}</div>
                        </div>
                        <button class="btn btn-primary add-loan-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" style="margin-right: 4px;" viewBox="0 0 16 16">
                                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                            </svg>
                            Add New Loan
                        </button>
                    </div>

                    <div class="loan-summary">
                        <div class="summary-item">
                            <div class="summary-label">Total Principal</div>
                            <div class="summary-value">${formatCurrencyDisplay(totalPrincipal)}</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-label">Total Remaining</div>
                            <div class="summary-value remaining">${formatCurrencyDisplay(totalBalance)}</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-label">Total Paid</div>
                            <div class="summary-value paid">${formatCurrencyDisplay(totalPaid)}</div>
                        </div>
                        <div class="summary-item summary-item-progress">
                            <div class="summary-label">Overall Progress</div>
                            <div class="summary-progress-container">
                                <div class="summary-progress-header">
                                    <span class="summary-progress-percentage">${formatPercentage(overallProgress)}</span>
                                </div>
                                <div class="summary-progress-bar">
                                    <div class="summary-progress-fill" style="width: ${overallProgress}%"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="loan-cards">
                    ${loans.map(loan => `<loan-card loan-id="${loan.id}"></loan-card>`).join('')}
                </div>
            `;
        }

        // Attach event listeners to "Add Loan" buttons
        const addBtns = this.querySelectorAll('.add-loan-btn');
        addBtns.forEach(btn => {
            btn.addEventListener('click', () => this.openAddLoanForm());
        });
    }

    openAddLoanForm() {
        const event = new CustomEvent('open-loan-form', {
            detail: {
                loan: null,
                mode: 'add'
            },
            bubbles: true
        });
        document.dispatchEvent(event);
    }
}

customElements.define('loan-list', LoanList);

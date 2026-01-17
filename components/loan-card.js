// Web Component: Loan Card
class LoanCard extends HTMLElement {
    constructor() {
        super();
        this.loanId = this.getAttribute('loan-id');
    }

    connectedCallback() {
        this.loadLoanData();
        this.render();
        this.attachEventListeners();
        
        // Listen for loan updates
        window.addEventListener('loan-updated', (e) => {
            if (e.detail.loanId === this.loanId) {
                this.loadLoanData();
                this.render();
            }
        });
    }

    loadLoanData() {
        this.loan = LoanService.getLoan(this.loanId);
        
        if (!this.loan) {
            console.error(`Loan ${this.loanId} not found`);
            this.loan = null;
        }
    }

    render() {
        if (!this.loan) {
            this.innerHTML = '<div class="alert alert-warning">Loan not found</div>';
            return;
        }

        const progress = LoanService.calculatePayoffProgress(this.loan);
        const totalOverpayments = LoanService.getTotalOverpayments(this.loan);
        const remainingBalance = this.loan.currentBalance || 0;
        const paidAmount = this.loan.principal - remainingBalance;

        this.className = 'loan-card';
        this.innerHTML = `
            <div class="loan-card-header">
                <div class="loan-name-section">
                    <h5 class="loan-name">${this.escapeHtml(this.loan.name || 'Unnamed Loan')}</h5>
                    <div class="loan-principal">Principal: ${formatCurrencyDisplay(this.loan.principal)}</div>
                </div>
                <div class="loan-actions">
                    <button class="btn btn-sm btn-success overpayment-btn" title="Add Overpayment">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                        </svg>
                        Overpay
                    </button>
                    <button class="btn btn-sm btn-outline-primary edit-btn" title="Edit Loan">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                        </svg>
                        Edit
                    </button>
                    <button class="btn btn-sm btn-outline-danger delete-btn" title="Delete Loan">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                            <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                        </svg>
                        Delete
                    </button>
                </div>
            </div>

            <div class="loan-details">
                <div class="detail-row">
                    <div class="detail-item">
                        <span class="detail-label">Interest Rate:</span>
                        <span class="detail-value">${this.loan.interestRate}% APR</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Term:</span>
                        <span class="detail-value">${this.loan.termMonths} months</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Monthly Payment:</span>
                        <span class="detail-value">${formatCurrencyDisplay(this.loan.monthlyPayment)}</span>
                    </div>
                </div>
            </div>

            <div class="loan-balance-section">
                <div class="balance-info">
                    <div class="balance-item">
                        <div class="balance-label">Remaining Balance</div>
                        <div class="balance-amount remaining">${formatCurrencyDisplay(remainingBalance)}</div>
                    </div>
                    <div class="balance-item">
                        <div class="balance-label">Paid Amount</div>
                        <div class="balance-amount paid">${formatCurrencyDisplay(paidAmount)}</div>
                    </div>
                    <div class="balance-item">
                        <div class="balance-label">Total Overpayments</div>
                        <div class="balance-amount overpayment">${formatCurrencyDisplay(totalOverpayments)}</div>
                    </div>
                </div>
            </div>

            <div class="loan-progress-section">
                <div class="progress-header">
                    <span class="progress-label">Payoff Progress</span>
                    <span class="progress-percentage">${formatPercentage(progress)}</span>
                </div>
                <div class="loan-progress-bar">
                    <div class="loan-progress-fill" style="width: ${progress}%"></div>
                </div>
            </div>

            ${this.loan.overpayments && this.loan.overpayments.length > 0 ? `
                <div class="overpayment-history">
                    <button class="btn btn-sm btn-link overpayment-toggle" type="button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="chevron" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
                        </svg>
                        View Overpayment History (${this.loan.overpayments.length})
                    </button>
                    <div class="overpayment-list" style="display: none;">
                        ${this.loan.overpayments.map(op => `
                            <div class="overpayment-item">
                                <span class="overpayment-date">${new Date(op.date).toLocaleDateString()}</span>
                                <span class="overpayment-amount">${formatCurrencyDisplay(op.amount)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        `;
    }

    attachEventListeners() {
        // Overpayment button
        const overpaymentBtn = this.querySelector('.overpayment-btn');
        if (overpaymentBtn) {
            overpaymentBtn.addEventListener('click', () => this.handleOverpayment());
        }

        // Edit button
        const editBtn = this.querySelector('.edit-btn');
        if (editBtn) {
            editBtn.addEventListener('click', () => this.handleEdit());
        }

        // Delete button
        const deleteBtn = this.querySelector('.delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => this.handleDelete());
        }

        // Overpayment history toggle
        const toggleBtn = this.querySelector('.overpayment-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleOverpaymentHistory());
        }
    }

    handleOverpayment() {
        const event = new CustomEvent('open-overpayment-form', {
            detail: {
                loanId: this.loanId,
                loan: this.loan
            },
            bubbles: true
        });
        this.dispatchEvent(event);
    }

    handleEdit() {
        const event = new CustomEvent('open-loan-form', {
            detail: {
                loanId: this.loanId,
                loan: this.loan,
                mode: 'edit'
            },
            bubbles: true
        });
        this.dispatchEvent(event);
    }

    handleDelete() {
        const confirmed = confirm(`Are you sure you want to delete the loan "${this.loan.name}"? This action cannot be undone.`);
        
        if (confirmed) {
            LoanService.deleteLoan(this.loanId);
            
            // Dispatch event to refresh loan list
            const event = new CustomEvent('loan-deleted', {
                detail: { loanId: this.loanId },
                bubbles: true
            });
            this.dispatchEvent(event);
            
            // Remove this element
            this.remove();
        }
    }

    toggleOverpaymentHistory() {
        const list = this.querySelector('.overpayment-list');
        const chevron = this.querySelector('.chevron');
        
        if (list && chevron) {
            const isHidden = list.style.display === 'none';
            list.style.display = isHidden ? 'block' : 'none';
            chevron.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

customElements.define('loan-card', LoanCard);

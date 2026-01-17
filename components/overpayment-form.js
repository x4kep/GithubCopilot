// Web Component: Overpayment Form Modal
class OverpaymentForm extends HTMLElement {
    constructor() {
        super();
        this.loan = null;
        this.year = null;
        this.modalElement = null;
        this.bsModal = null;
    }

    connectedCallback() {
        this.render();
        this.setupModal();
        this.attachEventListeners();

        // Listen for open-overpayment-form events
        document.addEventListener('open-overpayment-form', (e) => {
            this.openForLoan(e.detail.loan);
        });
    }

    setupModal() {
        this.modalElement = this.querySelector('.modal');
        if (this.modalElement && typeof bootstrap !== 'undefined') {
            this.bsModal = new bootstrap.Modal(this.modalElement);
        }
    }

    openForLoan(loan) {
        this.loan = loan;
        this.year = YearSelector.getSelectedYear();
        this.updateModalContent();
        if (this.bsModal) {
            this.bsModal.show();
        }
    }

    render() {
        this.innerHTML = `
            <div class="modal fade" id="overpaymentModal" tabindex="-1" aria-labelledby="overpaymentModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="overpaymentModalLabel">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" style="margin-right: 8px;" viewBox="0 0 16 16">
                                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                                </svg>
                                Add Overpayment
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="loan-info-summary">
                                <h6 class="loan-name-display">Loan Name</h6>
                                <div class="current-balance-display">
                                    <small class="text-muted">Current Balance</small>
                                    <div class="balance-value">$0.00</div>
                                </div>
                            </div>

                            <form id="overpaymentForm" class="overpayment-form">
                                <div class="mb-3">
                                    <label for="overpaymentAmount" class="form-label">Overpayment Amount *</label>
                                    <div class="input-group">
                                        <span class="input-group-text">$</span>
                                        <input type="number" 
                                               class="form-control" 
                                               id="overpaymentAmount" 
                                               placeholder="0.00" 
                                               step="0.01" 
                                               min="0.01" 
                                               required
                                               aria-label="Overpayment amount">
                                    </div>
                                    <div class="form-text">Enter the additional amount you want to pay toward the principal.</div>
                                    <div class="invalid-feedback">Please enter a valid amount greater than $0.01</div>
                                </div>

                                <div class="mb-3">
                                    <label for="overpaymentNote" class="form-label">Note (Optional)</label>
                                    <textarea class="form-control" 
                                              id="overpaymentNote" 
                                              rows="2" 
                                              placeholder="Add a note about this overpayment..."
                                              maxlength="200"></textarea>
                                </div>

                                <div class="overpayment-preview" style="display: none;">
                                    <div class="alert alert-info">
                                        <h6 class="alert-heading">Preview</h6>
                                        <div class="preview-row">
                                            <span>New Balance:</span>
                                            <strong class="new-balance-value">$0.00</strong>
                                        </div>
                                        <div class="preview-row">
                                            <span>New Monthly Payment:</span>
                                            <strong class="new-payment-value">$0.00</strong>
                                        </div>
                                        <div class="preview-row">
                                            <span>Interest Saved:</span>
                                            <strong class="interest-saved-value text-success">$0.00</strong>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-success confirm-overpayment-btn">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" style="margin-right: 4px;" viewBox="0 0 16 16">
                                    <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/>
                                </svg>
                                Confirm Overpayment
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    updateModalContent() {
        if (!this.loan) return;

        // Update loan name
        const loanNameDisplay = this.querySelector('.loan-name-display');
        if (loanNameDisplay) {
            loanNameDisplay.textContent = this.loan.name || 'Unnamed Loan';
        }

        // Update current balance
        const currentBalance = this.loan.currentBalance || this.loan.principal;
        const balanceValue = this.querySelector('.balance-value');
        if (balanceValue) {
            balanceValue.textContent = formatCurrencyDisplay(currentBalance);
        }

        // Reset form
        const form = this.querySelector('#overpaymentForm');
        if (form) {
            form.reset();
            form.classList.remove('was-validated');
        }

        // Calculate and show initial preview with suggested overpayment
        // Suggest 10% of current balance or one monthly payment, whichever is larger
        const suggestedAmount = Math.max(
            currentBalance * 0.1,
            this.loan.monthlyPayment || 0
        );
        
        const amountInput = this.querySelector('#overpaymentAmount');
        if (amountInput && suggestedAmount > 0) {
            amountInput.value = formatCurrency(suggestedAmount);
            // Delay to ensure DOM is ready
            setTimeout(() => {
                this.updatePreview();
            }, 100);
        } else {
            // Hide preview if no suggested amount
            const preview = this.querySelector('.overpayment-preview');
            if (preview) {
                preview.style.display = 'none';
            }
        }
    }

    attachEventListeners() {
        // Amount input - show preview on input
        const amountInput = this.querySelector('#overpaymentAmount');
        if (amountInput) {
            amountInput.addEventListener('input', () => this.updatePreview());
            amountInput.addEventListener('blur', () => this.validateAmount());
        }

        // Confirm button
        const confirmBtn = this.querySelector('.confirm-overpayment-btn');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => this.handleConfirm());
        }

        // Form submission
        const form = this.querySelector('#overpaymentForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleConfirm();
            });
        }
    }

    validateAmount() {
        const amountInput = this.querySelector('#overpaymentAmount');
        if (!amountInput) return false;

        const amount = parseFloat(amountInput.value);
        
        if (isNaN(amount) || amount <= 0) {
            amountInput.classList.add('is-invalid');
            return false;
        }

        if (this.loan && amount > this.loan.currentBalance) {
            amountInput.classList.add('is-invalid');
            const feedback = this.querySelector('.invalid-feedback');
            if (feedback) {
                feedback.textContent = 'Overpayment cannot exceed current balance';
            }
            return false;
        }

        amountInput.classList.remove('is-invalid');
        amountInput.classList.add('is-valid');
        return true;
    }

    updatePreview() {
        const amountInput = this.querySelector('#overpaymentAmount');
        const preview = this.querySelector('.overpayment-preview');
        
        if (!amountInput || !preview || !this.loan) return;

        const amount = parseFloat(amountInput.value);
        
        if (isNaN(amount) || amount <= 0) {
            preview.style.display = 'none';
            return;
        }

        // Calculate new balance
        const currentBalance = this.loan.currentBalance || this.loan.principal;
        const newBalance = Math.max(0, currentBalance - amount);

        // Calculate remaining months
        const startDate = new Date(this.loan.startDate);
        const currentDate = new Date();
        const monthsElapsed = Math.max(0,
            (currentDate.getFullYear() - startDate.getFullYear()) * 12 +
            (currentDate.getMonth() - startDate.getMonth())
        );
        const remainingMonths = Math.max(1, this.loan.termMonths - monthsElapsed);

        // Calculate new monthly payment
        const newPayment = newBalance > 0 
            ? LoanService.recalculateMonthlyPayment(newBalance, this.loan.interestRate, remainingMonths)
            : 0;

        // Estimate interest saved (simplified calculation)
        const oldTotalPayment = this.loan.monthlyPayment * remainingMonths;
        const newTotalPayment = newPayment * remainingMonths;
        const interestSaved = Math.max(0, oldTotalPayment - newTotalPayment - amount);

        // Update preview values
        const newBalanceEl = this.querySelector('.new-balance-value');
        const newPaymentEl = this.querySelector('.new-payment-value');
        const interestSavedEl = this.querySelector('.interest-saved-value');

        if (newBalanceEl) newBalanceEl.textContent = formatCurrencyDisplay(newBalance);
        if (newPaymentEl) newPaymentEl.textContent = formatCurrencyDisplay(newPayment);
        if (interestSavedEl) interestSavedEl.textContent = formatCurrencyDisplay(interestSaved);

        preview.style.display = 'block';
    }

    handleConfirm() {
        if (!this.validateAmount() || !this.loan) return;

        const amountInput = this.querySelector('#overpaymentAmount');
        const noteInput = this.querySelector('#overpaymentNote');
        
        const amount = parseFloat(amountInput.value);
        const note = noteInput ? noteInput.value.trim() : '';

        // Calculate current month since loan start
        const startDate = new Date(this.loan.startDate);
        const currentDate = new Date();
        const monthsSinceStart = Math.max(1,
            (currentDate.getFullYear() - startDate.getFullYear()) * 12 +
            (currentDate.getMonth() - startDate.getMonth()) + 1
        );

        // Apply overpayment through service
        const updatedLoan = LoanService.applyOverpayment(
            this.year,
            this.loan.id,
            amount,
            monthsSinceStart
        );

        if (updatedLoan) {
            // Store note if provided
            if (note && updatedLoan.overpayments.length > 0) {
                const lastOverpayment = updatedLoan.overpayments[updatedLoan.overpayments.length - 1];
                lastOverpayment.note = note;
                LoanService.saveLoan(this.year, updatedLoan);
            }

            // Show success message
            this.showSuccessMessage(amount);

            // Dispatch event to update loan card
            const event = new CustomEvent('loan-updated', {
                detail: {
                    loanId: this.loan.id,
                    loan: updatedLoan
                },
                bubbles: true
            });
            document.dispatchEvent(event);

            // Close modal
            if (this.bsModal) {
                this.bsModal.hide();
            }
        } else {
            alert('Error applying overpayment. Please try again.');
        }
    }

    showSuccessMessage(amount) {
        // Create a temporary toast/alert
        const alert = document.createElement('div');
        alert.className = 'alert alert-success alert-dismissible fade show position-fixed';
        alert.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alert.innerHTML = `
            <strong>Success!</strong> Overpayment of ${formatCurrencyDisplay(amount)} applied successfully.
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        document.body.appendChild(alert);

        // Auto-remove after 4 seconds
        setTimeout(() => {
            alert.remove();
        }, 4000);
    }
}

customElements.define('overpayment-form', OverpaymentForm);

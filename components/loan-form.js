// Web Component: Loan Form Modal
class LoanForm extends HTMLElement {
    constructor() {
        super();
        this.loan = null;
        this.year = null;
        this.mode = 'add'; // 'add' or 'edit'
        this.modalElement = null;
        this.bsModal = null;
    }

    connectedCallback() {
        this.render();
        this.setupModal();
        this.attachEventListeners();

        // Listen for open-loan-form events
        document.addEventListener('open-loan-form', (e) => {
            this.openForm(e.detail.loan, e.detail.mode || 'add');
        });
    }

    setupModal() {
        this.modalElement = this.querySelector('.modal');
        if (this.modalElement && typeof bootstrap !== 'undefined') {
            this.bsModal = new bootstrap.Modal(this.modalElement);
        }
    }

    openForm(loan = null, mode = 'add') {
        this.loan = loan;
        this.mode = mode;
        
        if (mode === 'edit' && loan) {
            this.populateForm(loan);
        } else {
            this.resetForm();
        }
        
        this.updateModalTitle();
        
        if (this.bsModal) {
            this.bsModal.show();
        }
    }

    updateModalTitle() {
        const title = this.querySelector('.modal-title');
        if (title) {
            title.innerHTML = this.mode === 'edit' 
                ? '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" style="margin-right: 8px;" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/></svg>Edit Loan'
                : '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" style="margin-right: 8px;" viewBox="0 0 16 16"><path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/></svg>Add New Loan';
        }

        const submitBtn = this.querySelector('.submit-loan-btn');
        if (submitBtn) {
            submitBtn.innerHTML = this.mode === 'edit'
                ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" style="margin-right: 4px;" viewBox="0 0 16 16"><path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/></svg>Update Loan'
                : '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" style="margin-right: 4px;" viewBox="0 0 16 16"><path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/></svg>Add Loan';
        }
    }

    render() {
        this.innerHTML = `
            <div class="modal fade" id="loanFormModal" tabindex="-1" aria-labelledby="loanFormModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="loanFormModalLabel">Add New Loan</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form id="loanForm" class="loan-form-content">
                                <div class="row">
                                    <div class="col-md-12 mb-3">
                                        <label for="loanName" class="form-label">Loan Name *</label>
                                        <input type="text" 
                                               class="form-control" 
                                               id="loanName" 
                                               placeholder="e.g., Flat Loan, Car Loan, Personal Loan" 
                                               required
                                               maxlength="50">
                                        <div class="invalid-feedback">Please provide a loan name.</div>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label for="loanPrincipal" class="form-label">Principal Amount (€) *</label>
                                        <input type="number" 
                                               class="form-control" 
                                               id="loanPrincipal" 
                                               placeholder="200000" 
                                               step="0.01" 
                                               min="1" 
                                               required>
                                        <div class="invalid-feedback">Please enter a valid amount.</div>
                                    </div>

                                    <div class="col-md-6 mb-3">
                                        <label for="loanInterestRate" class="form-label">Annual Interest Rate (%) *</label>
                                        <input type="number" 
                                               class="form-control" 
                                               id="loanInterestRate" 
                                               placeholder="3.5" 
                                               step="0.01" 
                                               min="0" 
                                               max="100" 
                                               required>
                                        <div class="invalid-feedback">Please enter a valid interest rate (0-100%).</div>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label for="loanTerm" class="form-label">Loan Term (months) *</label>
                                        <input type="number" 
                                               class="form-control" 
                                               id="loanTerm" 
                                               placeholder="360" 
                                               step="1" 
                                               min="1" 
                                               required>
                                        <div class="form-text">Common terms: 12, 60, 180, 360 months</div>
                                        <div class="invalid-feedback">Please enter a valid term.</div>
                                    </div>

                                    <div class="col-md-6 mb-3">
                                        <label for="loanStartDate" class="form-label">Start Date *</label>
                                        <input type="date" 
                                               class="form-control" 
                                               id="loanStartDate" 
                                               required>
                                        <div class="invalid-feedback">Please select a start date.</div>
                                    </div>
                                </div>

                                <div class="monthly-payment-preview">
                                    <div class="alert alert-success">
                                        <div class="d-flex justify-content-between align-items-center">
                                            <span>Estimated Monthly Payment:</span>
                                            <strong class="monthly-payment-value">$0.00</strong>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary submit-loan-btn">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" style="margin-right: 4px;" viewBox="0 0 16 16">
                                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                                </svg>
                                Add Loan
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    populateForm(loan) {
        const nameInput = this.querySelector('#loanName');
        const principalInput = this.querySelector('#loanPrincipal');
        const rateInput = this.querySelector('#loanInterestRate');
        const termInput = this.querySelector('#loanTerm');
        const startDateInput = this.querySelector('#loanStartDate');

        if (nameInput) nameInput.value = loan.name || '';
        if (principalInput) principalInput.value = loan.principal || '';
        if (rateInput) rateInput.value = loan.interestRate || '';
        if (termInput) termInput.value = loan.termMonths || '';
        if (startDateInput && loan.startDate) {
            startDateInput.value = loan.startDate.split('T')[0];
        }

        this.updateMonthlyPaymentPreview();
    }

    resetForm() {
        const form = this.querySelector('#loanForm');
        if (form) {
            form.reset();
            form.classList.remove('was-validated');
        }

        // Set default start date to today
        const startDateInput = this.querySelector('#loanStartDate');
        if (startDateInput) {
            const today = new Date().toISOString().split('T')[0];
            startDateInput.value = today;
        }

        this.updateMonthlyPaymentPreview();
    }

    attachEventListeners() {
        // Real-time monthly payment preview
        const principalInput = this.querySelector('#loanPrincipal');
        const rateInput = this.querySelector('#loanInterestRate');
        const termInput = this.querySelector('#loanTerm');

        [principalInput, rateInput, termInput].forEach(input => {
            if (input) {
                input.addEventListener('input', () => this.updateMonthlyPaymentPreview());
            }
        });

        // Submit button
        const submitBtn = this.querySelector('.submit-loan-btn');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.handleSubmit());
        }

        // Form submission
        const form = this.querySelector('#loanForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmit();
            });
        }
    }

    updateMonthlyPaymentPreview() {
        const principalInput = this.querySelector('#loanPrincipal');
        const rateInput = this.querySelector('#loanInterestRate');
        const termInput = this.querySelector('#loanTerm');
        const previewValue = this.querySelector('.monthly-payment-value');

        if (!principalInput || !rateInput || !termInput || !previewValue) return;

        const principal = parseFloat(principalInput.value) || 0;
        const rate = parseFloat(rateInput.value) || 0;
        const term = parseInt(termInput.value) || 0;

        if (principal > 0 && term > 0) {
            const monthlyPayment = LoanService.calculateMonthlyPayment(principal, rate, term);
            previewValue.textContent = formatCurrencyDisplay(monthlyPayment);
        } else {
            previewValue.textContent = '$0.00';
        }
    }

    validateForm() {
        const form = this.querySelector('#loanForm');
        if (!form) return false;

        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return false;
        }

        return true;
    }

    handleSubmit() {
        if (!this.validateForm()) return;

        const nameInput = this.querySelector('#loanName');
        const principalInput = this.querySelector('#loanPrincipal');
        const rateInput = this.querySelector('#loanInterestRate');
        const termInput = this.querySelector('#loanTerm');
        const startDateInput = this.querySelector('#loanStartDate');

        const loanData = {
            name: nameInput.value.trim(),
            principal: parseFloat(principalInput.value),
            interestRate: parseFloat(rateInput.value),
            termMonths: parseInt(termInput.value),
            startDate: startDateInput.value
        };

        // If editing, preserve the ID and overpayments
        if (this.mode === 'edit' && this.loan) {
            loanData.id = this.loan.id;
            loanData.overpayments = this.loan.overpayments || [];
        }

        // Save loan
        const savedLoan = LoanService.saveLoan(loanData);

        if (savedLoan) {
            this.showSuccessMessage(this.mode === 'edit' ? 'updated' : 'added');

            // Dispatch event to refresh loan list
            const event = new CustomEvent('loan-saved', {
                detail: {
                    loan: savedLoan,
                    mode: this.mode
                },
                bubbles: true
            });
            document.dispatchEvent(event);

            // Close modal
            if (this.bsModal) {
                this.bsModal.hide();
            }
        } else {
            alert('Error saving loan. Please try again.');
        }
    }

    showSuccessMessage(action) {
        const alert = document.createElement('div');
        alert.className = 'alert alert-success alert-dismissible fade show position-fixed';
        alert.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alert.innerHTML = `
            <strong>Success!</strong> Loan ${action} successfully.
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        document.body.appendChild(alert);

        setTimeout(() => {
            alert.remove();
        }, 4000);
    }
}

customElements.define('loan-form', LoanForm);

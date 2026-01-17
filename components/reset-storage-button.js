// Web Component: Reset Storage Button
class ResetStorageButton extends HTMLElement {
    connectedCallback() {
        this.render();
        this.attachEventListeners();
    }

    render() {
        this.className = 'reset-storage-container';
        this.innerHTML = `
            <button class="btn btn-danger btn-sm reset-button">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                    <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                </svg>
                Reset All Data
            </button>
        `;
    }

    attachEventListeners() {
        const button = this.querySelector('.reset-button');
        if (button) {
            button.addEventListener('click', () => this.handleReset());
        }
    }

    handleReset() {
        const confirmed = confirm('Are you sure you want to delete all data for all years? This action cannot be undone.');
        
        if (confirmed) {
            this.clearAllData();
            this.reloadPage();
        }
    }

    clearAllData() {
        localStorage.clear();
    }

    reloadPage() {
        window.location.reload();
    }
}

customElements.define('reset-storage-button', ResetStorageButton);

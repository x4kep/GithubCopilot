// Web Component: Month Input List
class MonthInputList extends HTMLElement {
    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = MONTHS.map((_, index) => 
            `<month-input-row month-index="${index}"></month-input-row>`
        ).join('');
    }
}

customElements.define('month-input-list', MonthInputList);

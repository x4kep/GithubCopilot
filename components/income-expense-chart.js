// Web Component: Income Expense Chart
class IncomeExpenseChart extends HTMLElement {
    constructor() {
        super();
        this.chart = null;
    }

    connectedCallback() {
        this.render();
        this.initializeChartListener();
    }

    render() {
        this.className = 'chart-container';
        this.innerHTML = '<canvas id="incomeExpenseChart"></canvas>';
    }

    initializeChartListener() {
        const chartTab = document.getElementById('chart-tab');
        if (chartTab) {
            chartTab.addEventListener('shown.bs.tab', () => this.updateChart());
        }
        
        // Add download button listener
        const downloadBtn = document.getElementById('downloadChartBtn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadChart());
        }
    }

    updateChart() {
        const { incomeData, expenseData } = DataService.getData();
        const canvas = this.querySelector('#incomeExpenseChart');
        
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Destroy existing chart
        if (this.chart) {
            this.chart.destroy();
        }

        // Create new chart
        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: MONTHS,
                datasets: [
                    {
                        label: 'Income ()',
                        data: incomeData,
                        backgroundColor: COLORS.income,
                        borderColor: COLORS.income,
                        borderWidth: 1,
                        borderRadius: 4
                    },
                    {
                        label: 'Expenses ()',
                        data: expenseData,
                        backgroundColor: COLORS.expense,
                        borderColor: COLORS.expense,
                        borderWidth: 1,
                        borderRadius: 4
                    }
                ]
            },
            options: this.getChartOptions()
        });
    }

    getChartOptions() {
        return {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Monthly Income vs Expenses',
                    font: {
                        size: 20,
                        weight: 'bold'
                    },
                    color: COLORS.income
                },
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: { size: 14 },
                        padding: 20
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y.toFixed(2);
                            return `${label}: ${value}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: (value) => `${value.toFixed(0)}`,
                        font: { size: 12 }
                    },
                    grid: {
                        color: 'rgba(76, 175, 80, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        font: { size: 12 }
                    },
                    grid: {
                        display: false
                    }
                }
            }
        };
    }

    downloadChart() {
        const canvas = this.querySelector('#incomeExpenseChart');
        if (!canvas) {
            console.error('Chart canvas not found');
            return;
        }

        // Convert canvas to data URL
        const url = canvas.toDataURL('image/png');
        
        // Create temporary link and trigger download
        const link = document.createElement('a');
        const date = new Date().toISOString().split('T')[0];
        link.download = `bucks2bar-chart-${date}.png`;
        link.href = url;
        link.click();
    }

    disconnectedCallback() {
        if (this.chart) {
            this.chart.destroy();
        }
    }
}

customElements.define('income-expense-chart', IncomeExpenseChart);

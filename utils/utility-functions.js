// Utility Functions
const roundToTwo = (value) => {
    return Math.round((parseFloat(value) || 0) * 100) / 100;
};

const formatCurrency = (value) => {
    const num = parseFloat(value) || 0;
    return Math.round(num * 100) / 100;
};

const validateNumericInput = (value) => {
    const num = parseFloat(value);
    return isNaN(num) || num < 0 ? 0 : formatCurrency(num);
};

const formatCurrencyDisplay = (value) => {
    const num = parseFloat(value) || 0;
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(num);
};

const formatPercentage = (value) => {
    const num = parseFloat(value) || 0;
    return `${roundToTwo(num)}%`;
};

// Utility Functions
const formatCurrency = (value) => {
    const num = parseFloat(value) || 0;
    return Math.round(num * 100) / 100;
};

const validateNumericInput = (value) => {
    const num = parseFloat(value);
    return isNaN(num) || num < 0 ? 0 : formatCurrency(num);
};

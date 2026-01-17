// Load utility functions
const {
  roundToTwo,
  formatCurrency,
  validateNumericInput,
  formatCurrencyDisplay,
  formatPercentage
} = require('../../utils/utility-functions');

describe('Utility Functions', () => {
  describe('roundToTwo', () => {
    test('should round to 2 decimal places', () => {
      expect(roundToTwo(10.123456)).toBe(10.12);
      expect(roundToTwo(10.126)).toBe(10.13);
      expect(roundToTwo(10)).toBe(10);
    });

    test('should handle zero and negative numbers', () => {
      expect(roundToTwo(0)).toBe(0);
      expect(roundToTwo(-10.456)).toBe(-10.46);
    });

    test('should handle invalid input', () => {
      expect(roundToTwo('invalid')).toBe(0);
      expect(roundToTwo(null)).toBe(0);
      expect(roundToTwo(undefined)).toBe(0);
    });
  });

  describe('formatCurrency', () => {
    test('should format valid numbers', () => {
      expect(formatCurrency(100.123)).toBe(100.12);
      expect(formatCurrency(0.999)).toBe(1);
      expect(formatCurrency(1234.56)).toBe(1234.56);
    });

    test('should handle zero', () => {
      expect(formatCurrency(0)).toBe(0);
    });

    test('should return 0 for invalid input', () => {
      expect(formatCurrency('invalid')).toBe(0);
      expect(formatCurrency(null)).toBe(0);
    });
  });

  describe('validateNumericInput', () => {
    test('should validate positive numbers', () => {
      expect(validateNumericInput('100')).toBe(100);
      expect(validateNumericInput('100.50')).toBe(100.5);
      expect(validateNumericInput(50)).toBe(50);
    });

    test('should return 0 for negative numbers', () => {
      expect(validateNumericInput('-50')).toBe(0);
      expect(validateNumericInput(-100)).toBe(0);
    });

    test('should return 0 for invalid input', () => {
      expect(validateNumericInput('invalid')).toBe(0);
      expect(validateNumericInput('')).toBe(0);
      expect(validateNumericInput(null)).toBe(0);
    });
  });

  describe('formatCurrencyDisplay', () => {
    test('should format currency with EUR symbol', () => {
      expect(formatCurrencyDisplay(1000)).toBe('€1,000.00');
      expect(formatCurrencyDisplay(1234.56)).toBe('€1,234.56');
      expect(formatCurrencyDisplay(0)).toBe('€0.00');
    });

    test('should handle invalid input', () => {
      expect(formatCurrencyDisplay('invalid')).toBe('€0.00');
      expect(formatCurrencyDisplay(null)).toBe('€0.00');
    });
  });

  describe('formatPercentage', () => {
    test('should format percentage correctly', () => {
      expect(formatPercentage(50)).toBe('50%');
      expect(formatPercentage(75.5)).toBe('75.5%');
      expect(formatPercentage(100)).toBe('100%');
    });

    test('should handle zero and decimals', () => {
      expect(formatPercentage(0)).toBe('0%');
      expect(formatPercentage(0.123)).toBe('0.12%');
    });
  });
});

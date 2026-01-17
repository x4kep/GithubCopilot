// Load dependencies
const { roundToTwo } = require('../../utils/utility-functions');

// Make roundToTwo available globally for the loan service
global.roundToTwo = roundToTwo;

// Load loan service
const LoanService = require('../../services/loan-service');

describe('LoanService', () => {
  beforeEach(() => {
    // Reset localStorage mock and clear the store
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('calculateMonthlyPayment', () => {
    test('should calculate monthly payment with interest', () => {
      const payment = LoanService.calculateMonthlyPayment(200000, 3.5, 360);
      expect(payment).toBeGreaterThan(0);
      expect(payment).toBeCloseTo(898.09, 1);
    });

    test('should calculate monthly payment with 0% interest', () => {
      const payment = LoanService.calculateMonthlyPayment(12000, 0, 12);
      expect(payment).toBe(1000);
    });

    test('should return 0 for invalid input', () => {
      expect(LoanService.calculateMonthlyPayment(0, 5, 12)).toBe(0);
      expect(LoanService.calculateMonthlyPayment(1000, 5, 0)).toBe(0);
    });

    test('should handle high interest rates', () => {
      const payment = LoanService.calculateMonthlyPayment(10000, 10, 12);
      expect(payment).toBeGreaterThan(0);
      expect(payment).toBeLessThan(10000);
    });
  });

  describe('calculatePayoffProgress', () => {
    test('should calculate progress correctly', () => {
      const loan = {
        principal: 10000,
        currentBalance: 5000
      };
      const progress = LoanService.calculatePayoffProgress(loan);
      expect(progress).toBe(50);
    });

    test('should return 0 for new loan', () => {
      const loan = {
        principal: 10000,
        currentBalance: 10000
      };
      const progress = LoanService.calculatePayoffProgress(loan);
      expect(progress).toBe(0);
    });

    test('should return 100 for paid off loan', () => {
      const loan = {
        principal: 10000,
        currentBalance: 0
      };
      const progress = LoanService.calculatePayoffProgress(loan);
      expect(progress).toBe(100);
    });

    test('should never exceed 100%', () => {
      const loan = {
        principal: 10000,
        currentBalance: -1000 // Edge case
      };
      const progress = LoanService.calculatePayoffProgress(loan);
      expect(progress).toBe(100);
    });
  });

  describe('getTotalOverpayments', () => {
    test('should calculate total overpayments', () => {
      const loan = {
        overpayments: [
          { amount: 100, month: 1 },
          { amount: 200, month: 2 },
          { amount: 150, month: 3 }
        ]
      };
      const total = LoanService.getTotalOverpayments(loan);
      expect(total).toBe(450);
    });

    test('should return 0 for no overpayments', () => {
      const loan = { overpayments: [] };
      expect(LoanService.getTotalOverpayments(loan)).toBe(0);
      
      const loan2 = {};
      expect(LoanService.getTotalOverpayments(loan2)).toBe(0);
    });
  });

  describe('getAllLoans', () => {
    test('should return empty array when no loans stored', () => {
      localStorage.getItem.mockReturnValue(null);
      const loans = LoanService.getAllLoans();
      expect(loans).toEqual([]);
      expect(localStorage.getItem).toHaveBeenCalledWith('loans');
    });

    test('should return parsed loans from localStorage', () => {
      const mockLoans = [
        { id: 'loan_1', name: 'Test Loan', principal: 10000 }
      ];
      localStorage.getItem.mockReturnValue(JSON.stringify(mockLoans));
      
      const loans = LoanService.getAllLoans();
      expect(loans).toEqual(mockLoans);
    });
  });

  describe('saveLoan', () => {
    test('should generate ID for new loan', () => {
      localStorage.getItem.mockReturnValue(null);
      
      const loan = {
        name: 'Test Loan',
        principal: 10000,
        interestRate: 5,
        termMonths: 12,
        startDate: '2026-01-01'
      };
      
      const savedLoan = LoanService.saveLoan(loan);
      
      expect(savedLoan.id).toBeDefined();
      expect(savedLoan.id).toMatch(/^loan_/);
      expect(savedLoan.monthlyPayment).toBeGreaterThan(0);
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    test('should calculate monthly payment and balance', () => {
      localStorage.getItem.mockReturnValue(null);
      
      const loan = {
        name: 'Car Loan',
        principal: 20000,
        interestRate: 4.5,
        termMonths: 60,
        startDate: '2026-01-01'
      };
      
      const savedLoan = LoanService.saveLoan(loan);
      
      expect(savedLoan.monthlyPayment).toBeGreaterThan(0);
      expect(savedLoan.currentBalance).toBeDefined();
      expect(savedLoan.overpayments).toEqual([]);
    });
  });

  describe('clearAllLoans', () => {
    test('should remove loans from localStorage', () => {
      LoanService.clearAllLoans();
      expect(localStorage.removeItem).toHaveBeenCalledWith('loans');
    });
  });
});

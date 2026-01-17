// Load dependencies
const { validateNumericInput } = require('../../utils/utility-functions');

// Make functions available globally for the data service
global.validateNumericInput = validateNumericInput;

// Mock querySelector on the existing document object
const querySelectorMock = jest.fn();
document.querySelector = querySelectorMock;

// Load data service
const DataService = require('../../services/data-service');

describe('DataService', () => {
  beforeEach(() => {
    // Reset mocks and clear localStorage
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('loadDataForYear', () => {
    test('should return stored data for a year', () => {
      const mockData = {
        income: [1000, 1200, 1100, 1000, 1050, 1100, 1200, 1150, 1100, 1000, 1050, 1200],
        expense: [800, 850, 900, 750, 800, 850, 900, 850, 800, 750, 800, 850]
      };
      
      localStorage.getItem.mockReturnValue(JSON.stringify(mockData));
      
      const data = DataService.loadDataForYear(2026);
      
      expect(data).toEqual(mockData);
      expect(localStorage.getItem).toHaveBeenCalledWith('data_2026');
    });

    test('should return empty arrays for year with no data', () => {
      localStorage.getItem.mockReturnValue(null);
      
      const data = DataService.loadDataForYear(2026);
      
      expect(data.income).toEqual(Array(12).fill(0));
      expect(data.expense).toEqual(Array(12).fill(0));
    });
  });

  describe('saveDataForYear', () => {
    test('should save income and expense data', () => {
      // Mock DOM elements
      const createMockInput = (value) => ({ value: value.toString() });
      
      document.querySelector.mockImplementation((selector) => {
        if (selector.includes('income-input')) {
          return createMockInput(1000);
        }
        if (selector.includes('expense-input')) {
          return createMockInput(800);
        }
        return null;
      });
      
      DataService.saveDataForYear(2026);
      
      expect(localStorage.setItem).toHaveBeenCalled();
      const savedData = JSON.parse(localStorage.setItem.mock.calls[0][1]);
      expect(savedData.income).toHaveLength(12);
      expect(savedData.expense).toHaveLength(12);
    });
  });

  describe('autoSave', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('should debounce save calls', () => {
      document.querySelector.mockReturnValue({ value: '1000' });
      
      DataService.autoSave(2026);
      DataService.autoSave(2026);
      DataService.autoSave(2026);
      
      expect(localStorage.setItem).not.toHaveBeenCalled();
      
      jest.advanceTimersByTime(500);
      
      expect(localStorage.setItem).toHaveBeenCalledTimes(1);
    });
  });
});

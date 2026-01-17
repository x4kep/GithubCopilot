// Jest setup file
// Mock localStorage with internal store
// Delete jsdom's default localStorage and replace with our mock
delete global.localStorage;

let store = {};

// Create resetStore function
const resetStore = () => {
  store = {};
};

const getItemMock = jest.fn().mockImplementation((key) => store[key] || null);
const setItemMock = jest.fn().mockImplementation((key, value) => {
  store[key] = value.toString();
});
const removeItemMock = jest.fn().mockImplementation((key) => {
  delete store[key];
});
const clearMock = jest.fn().mockImplementation(() => {
  resetStore();
});
const keyMock = jest.fn().mockImplementation((index) => {
  const keys = Object.keys(store);
  return keys[index] || null;
});

Object.defineProperty(global, 'localStorage', {
  value: {
    getItem: getItemMock,
    setItem: setItemMock,
    removeItem: removeItemMock,
    clear: clearMock,
    key: keyMock,
    get length() {
      return Object.keys(store).length;
    },
    __resetStore: resetStore  // Expose for manual reset in tests
  },
  writable: true,
  configurable: true
});

// Mock console methods to reduce test noise
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};

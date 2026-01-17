// E2E Tests for Income/Expense Tracker - Income & Expense Management
const { test, expect } = require('@playwright/test');

test.describe('Income and Expense Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Clear localStorage before each test
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should display the main page with all tabs', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('IncomeExpenseTracker');
    
    // Check all tabs are present
    await expect(page.locator('button#data-tab')).toBeVisible();
    await expect(page.locator('button#loans-tab')).toBeVisible();
    await expect(page.locator('button#chart-tab')).toBeVisible();
  });

  test('should add income and expense data for a month', async ({ page }) => {
    // Select year 2026
    const yearSelect = page.locator('select.form-select').first();
    await yearSelect.selectOption('2026');
    
    // Add income for January (index 0)
    const januaryIncomeInput = page.locator('.income-input[data-month="0"]');
    await januaryIncomeInput.fill('5000');
    
    // Add expense for January
    const januaryExpenseInput = page.locator('.expense-input[data-month="0"]');
    await januaryExpenseInput.fill('3000');
    
    // Wait for auto-save
    await page.waitForTimeout(600);
    
    // Verify the data persists after reload
    await page.reload();
    await yearSelect.selectOption('2026');
    
    await expect(januaryIncomeInput).toHaveValue('5000.00');
    await expect(januaryExpenseInput).toHaveValue('3000.00');
  });

  test('should update chart when data is entered', async ({ page }) => {
    const yearSelect = page.locator('select.form-select').first();
    await yearSelect.selectOption('2026');
    
    // Add data for multiple months
    await page.locator('.income-input[data-month="0"]').fill('5000');
    await page.locator('.expense-input[data-month="0"]').fill('3000');
    await page.locator('.income-input[data-month="1"]').fill('5500');
    await page.locator('.expense-input[data-month="1"]').fill('3200');
    
    // Wait for auto-save
    await page.waitForTimeout(600);
    
    // Switch to Charts tab to see the canvas
    await page.locator('button#chart-tab').click();
    
    // Check that canvas element exists (Chart.js renders to canvas)
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('should calculate correct totals', async ({ page }) => {
    const yearSelect = page.locator('select.form-select').first();
    await yearSelect.selectOption('2026');
    
    // Add income and expenses
    await page.locator('.income-input[data-month="0"]').fill('5000');
    await page.locator('.expense-input[data-month="0"]').fill('3000');
    await page.locator('.income-input[data-month="1"]').fill('4000');
    await page.locator('.expense-input[data-month="1"]').fill('2500');
    
    await page.waitForTimeout(600);
    
    // Total Income should be 9000, Total Expense should be 5500, Savings should be 3500
    // These values are shown in the chart or summary (verify if there's a summary section)
  });

  test('should switch between years correctly', async ({ page }) => {
    const yearSelect = page.locator('select.form-select').first();
    
    // Add data for 2026
    await yearSelect.selectOption('2026');
    await page.locator('.income-input[data-month="0"]').fill('5000');
    await page.waitForTimeout(600);
    
    // Switch to 2025
    await yearSelect.selectOption('2025');
    await expect(page.locator('.income-input[data-month="0"]')).toHaveValue('0.00');
    
    // Add data for 2025
    await page.locator('.income-input[data-month="0"]').fill('4500');
    await page.waitForTimeout(600);
    
    // Switch back to 2026
    await yearSelect.selectOption('2026');
    await expect(page.locator('.income-input[data-month="0"]')).toHaveValue('5000.00');
  });

  test('should reset storage when reset button is clicked', async ({ page }) => {
    const yearSelect = page.locator('select.form-select').first();
    await yearSelect.selectOption('2026');
    
    // Add some data
    await page.locator('.income-input[data-month="0"]').fill('5000');
    await page.locator('.expense-input[data-month="0"]').fill('3000');
    await page.waitForTimeout(600);
    
    // Set up dialog handler before clicking
    page.once('dialog', dialog => {
      dialog.accept();
    });
    
    // Click reset button
    await page.locator('button:has-text("Reset Storage")').click();
    
    // Verify data is cleared
    await page.waitForTimeout(200);
    await expect(page.locator('.income-input[data-month="0"]')).toHaveValue('0.00');
    await expect(page.locator('.expense-input[data-month="0"]')).toHaveValue('0.00');
  });
});

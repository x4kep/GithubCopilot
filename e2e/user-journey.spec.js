// E2E Tests for Income/Expense Tracker - Full User Journey
const { test, expect } = require('@playwright/test');

test.describe('Complete User Journey', () => {
  test('should handle complete financial tracking workflow', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Step 1: Add income and expenses for the year
    const yearSelect = page.locator('select.form-select').first();
    await yearSelect.selectOption('2026');

    // Add monthly income
    const months = ['0', '1', '2'];
    const incomes = ['5000', '5200', '4800'];
    const expenses = ['3000', '3200', '2800'];

    for (let i = 0; i < months.length; i++) {
      await page.locator(`.income-input[data-month="${months[i]}"]`).fill(incomes[i]);
      await page.locator(`.expense-input[data-month="${months[i]}"]`).fill(expenses[i]);
    }

    await page.waitForTimeout(600);

    // Step 2: Navigate to Loans tab
    await page.locator('button#loans-tab').click();
    await page.waitForTimeout(300);
    await expect(page.locator('h5:has-text("Loan Management")')).toBeVisible();

    // Step 3: Add a home mortgage
    await page.locator('button:has-text("Add New Loan")').click();
    await page.locator('input#loanName').fill('Home Mortgage');
    await page.locator('input#loanPrincipal').fill('250000');
    await page.locator('input#loanInterestRate').fill('3.75');
    await page.locator('input#loanTermMonths').fill('360');
    await page.locator('input#loanStartDate').fill('2020-01-01');
    await page.locator('button:has-text("Save Loan")').click();

    // Step 4: Add a car loan
    await page.locator('button:has-text("Add New Loan")').click();
    await page.locator('input#loanName').fill('Car Loan');
    await page.locator('input#loanPrincipal').fill('30000');
    await page.locator('input#loanInterestRate').fill('4.5');
    await page.locator('input#loanTermMonths').fill('60');
    await page.locator('input#loanStartDate').fill('2023-06-01');
    await page.locator('button:has-text("Save Loan")').click();

    // Step 5: Make an overpayment on car loan
    await page.locator('.loan-card:has-text("Car Loan")').first().locator('.overpayment-btn').click();
    await expect(page.locator('.modal-title:has-text("Add Overpayment")')).toBeVisible();
    await page.locator('input#overpaymentAmount').fill('2000');
    await page.locator('.confirm-overpayment-btn').click();

    // Step 6: Verify overpayment was applied
    await expect(page.locator('.loan-card:has-text("Car Loan") .balance-amount.overpayment')).toHaveText(/€2,000/);

    // Step 7: Go back to income/expense tab
    await page.locator('button#data-tab').click();
    await page.waitForTimeout(300);
    const incomeInput0 = page.locator('.income-input[data-month="0"]');
    await expect((await incomeInput0.inputValue())).toMatch(/5000(\.00)?/);

    // Step 8: Verify data persists after reload
    await page.reload();
    
    // Check income data
    await yearSelect.selectOption('2026');
    const incomeInput0After = page.locator('.income-input[data-month="0"]');
    await expect((await incomeInput0After.inputValue())).toMatch(/5000(\.00)?/);
    
    // Check loans
    await page.locator('button#loans-tab').click();
    await expect(page.locator('text=Home Mortgage')).toBeVisible();
    await expect(page.locator('text=Car Loan')).toBeVisible();
    await expect(page.locator('.loan-card:has-text("Car Loan") .balance-amount.overpayment')).toHaveText(/€2,000/);
  });

  test('should handle edge cases gracefully', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Test 1: Try to add loan with invalid data (should show validation)
    await page.locator('button#loans-tab').click();
    await page.locator('button:has-text("Add New Loan")').click();
    
    // Try to save without filling required fields
    await page.locator('button:has-text("Save Loan")').click();
    
    // Form should still be visible (validation prevents submission)
    await expect(page.locator('.modal-title:has-text("Add Loan")')).toBeVisible();
    
    // Close modal
    await page.locator('.modal:visible').first().locator('button.btn-close').click();

    // Test 2: Enter very large numbers
    await page.locator('button#data-tab').click();
    await page.waitForTimeout(300);
    await page.locator('.income-input[data-month="0"]').fill('999999999');
    await page.waitForTimeout(600);
    
    // Should accept large numbers
    await expect(page.locator('.income-input[data-month="0"]')).toHaveValue('999999999');

    // Test 3: Test with 0% interest loan
    await page.locator('button#loans-tab').click();
    await page.locator('button:has-text("Add New Loan")').click();
    await page.locator('input#loanName').fill('Interest-Free Loan');
    await page.locator('input#loanPrincipal').fill('10000');
    await page.locator('input#loanInterestRate').fill('0');
    await page.locator('input#loanTermMonths').fill('12');
    await page.locator('input#loanStartDate').fill('2026-01-01');
    await page.locator('button:has-text("Save Loan")').click();
    
    // Should successfully create the loan
    await expect(page.locator('text=Interest-Free Loan')).toBeVisible();
  });

  test('should handle rapid tab switching', async ({ page }) => {
    await page.goto('/');
    
    // Rapidly switch between tabs
    for (let i = 0; i < 5; i++) {
      await page.locator('button#loans-tab').click();
      await page.waitForTimeout(100);
      await page.locator('button#data-tab').click();
      await page.waitForTimeout(100);
    }
    
    // Should still be functional
    await expect(page.locator('select.form-select').first()).toBeVisible();
  });
});

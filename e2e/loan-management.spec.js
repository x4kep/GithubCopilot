// E2E Tests for Income/Expense Tracker - Loan Management
const { test, expect } = require('@playwright/test');

test.describe('Loan Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    
    // Navigate to Loans tab
    await page.locator('button#loans-tab').click();
    await page.waitForTimeout(300);
  });

  test('should display loans tab with empty state', async ({ page }) => {
    await expect(page.locator('h5:has-text("Loan Management")')).toBeVisible();
    await expect(page.locator('button:has-text("Add New Loan")')).toBeVisible();
  });

  test('should add a new loan successfully', async ({ page }) => {
    // Click Add New Loan button
    await page.locator('button:has-text("Add New Loan")').click();
    
    // Wait for modal to appear
    await expect(page.locator('.modal-title:has-text("Add Loan")')).toBeVisible();
    
    // Fill in loan details
    await page.locator('input#loanName').fill('Home Mortgage');
    await page.locator('input#loanPrincipal').fill('200000');
    await page.locator('input#loanInterestRate').fill('3.5');
    await page.locator('input#loanTermMonths').fill('360');
    await page.locator('input#loanStartDate').fill('2026-01-01');
    
    // Check that monthly payment preview is shown
    await expect(page.locator('.modal:has-text("Add Loan") .monthly-payment-value')).toBeVisible();
    
    // Save the loan
    await page.locator('button:has-text("Save Loan")').click();
    
    // Verify loan appears in the list
    await expect(page.locator('text=Home Mortgage')).toBeVisible();
    await expect(page.locator('.loan-card:has-text("Home Mortgage") .loan-principal')).toHaveText(/€200,000/);
  });

  test('should display loan progress and details', async ({ page }) => {
    // Add a loan first
    await page.locator('button:has-text("Add New Loan")').click();
    await page.locator('input#loanName').fill('Car Loan');
    await page.locator('input#loanPrincipal').fill('25000');
    await page.locator('input#loanInterestRate').fill('5');
    await page.locator('input#loanTermMonths').fill('60');
    await page.locator('input#loanStartDate').fill('2025-01-01');
    await page.locator('button:has-text("Save Loan")').click();
    
    // Verify loan card shows progress
    await expect(page.locator('.loan-card:has-text("Car Loan")')).toBeVisible();
    await expect(page.locator('.loan-card:has-text("Car Loan") .balance-amount.remaining')).toBeVisible();
    await expect(page.locator('.loan-card:has-text("Car Loan") .loan-progress-fill')).toBeVisible();
  });

  test('should apply overpayment to a loan', async ({ page }) => {
    // Add a loan first
    await page.locator('button:has-text("Add New Loan")').click();
    await page.locator('input#loanName').fill('Personal Loan');
    await page.locator('input#loanPrincipal').fill('10000');
    await page.locator('input#loanInterestRate').fill('4');
    await page.locator('input#loanTermMonths').fill('36');
    await page.locator('input#loanStartDate').fill('2025-06-01');
    await page.locator('button:has-text("Save Loan")').click();
    
    // Get initial remaining balance
    const remainingText = await page.locator('.loan-card:has-text("Personal Loan") .balance-amount.remaining').textContent();
    
    // Click Overpay button
    await page.locator('.loan-card:has-text("Personal Loan")').locator('.overpayment-btn').click();
    
    // Wait for overpayment modal (component title is 'Add Overpayment')
    await expect(page.locator('.modal-title:has-text("Add Overpayment")')).toBeVisible();
    
    // Enter overpayment amount
    await page.locator('input#overpaymentAmount').fill('1000');
    
    // Check preview shows new balance
    await expect(page.locator('.modal:has-text("Add Overpayment") .overpayment-preview')).toBeVisible();
    
    // Apply overpayment (use confirm button class)
    await page.locator('.confirm-overpayment-btn').click();

    // Wait for modal to close
    await expect(page.locator('.modal-title:has-text("Add Overpayment")')).not.toBeVisible();
    
    // Verify overpayment history appears
    await expect(page.locator('.loan-card:has-text("Personal Loan") .balance-amount.overpayment')).toHaveText(/€1,000/);
  });

  test('should edit an existing loan', async ({ page }) => {
    // Add a loan first
    await page.locator('button:has-text("Add New Loan")').click();
    await page.locator('input#loanName').fill('Student Loan');
    await page.locator('input#loanPrincipal').fill('30000');
    await page.locator('input#loanInterestRate').fill('3');
    await page.locator('input#loanTermMonths').fill('120');
    await page.locator('input#loanStartDate').fill('2024-09-01');
    await page.locator('button:has-text("Save Loan")').click();
    
    // Click Edit button
    await page.locator('.loan-card:has-text("Student Loan")').locator('.edit-btn').click();
    
    // Wait for modal
    await expect(page.locator('.modal-title:has-text("Edit Loan")')).toBeVisible();
    
    // Change the name
    await page.locator('input#loanName').fill('Education Loan');
    
    // Save changes
    await page.locator('.submit-loan-btn').click();
    
    // Verify updated name
    await expect(page.locator('text=Education Loan')).toBeVisible();
    await expect(page.locator('text=Student Loan')).not.toBeVisible();
  });

  test('should delete a loan', async ({ page }) => {
    // Add a loan first
    await page.locator('button:has-text("Add New Loan")').click();
    await page.locator('input#loanName').fill('Credit Card Debt');
    await page.locator('input#loanPrincipal').fill('5000');
    await page.locator('input#loanInterestRate').fill('18');
    await page.locator('input#loanTermMonths').fill('24');
    await page.locator('input#loanStartDate').fill('2025-12-01');
    await page.locator('button:has-text("Save Loan")').click();
    
    // Verify loan exists
    await expect(page.locator('text=Credit Card Debt')).toBeVisible();
    
    // Click Delete button and confirm
    page.on('dialog', dialog => dialog.accept());
    await page.locator('.loan-card:has-text("Credit Card Debt")').locator('.delete-btn').click();
    
    // Verify loan is removed
    await expect(page.locator('text=Credit Card Debt')).not.toBeVisible();
  });

  test('should display overall progress for multiple loans', async ({ page }) => {
    // Add first loan
    await page.locator('button:has-text("Add New Loan")').click();
    await page.locator('input#loanName').fill('Loan 1');
    await page.locator('input#loanPrincipal').fill('50000');
    await page.locator('input#loanInterestRate').fill('4');
    await page.locator('input#loanTermMonths').fill('120');
    await page.locator('input#loanStartDate').fill('2020-01-01');
    await page.locator('button:has-text("Save Loan")').click();
    
    // Add second loan
    await page.locator('button:has-text("Add New Loan")').click();
    await page.locator('input#loanName').fill('Loan 2');
    await page.locator('input#loanPrincipal').fill('30000');
    await page.locator('input#loanInterestRate').fill('5');
    await page.locator('input#loanTermMonths').fill('60');
    await page.locator('input#loanStartDate').fill('2023-01-01');
    await page.locator('button:has-text("Save Loan")').click();
    
    // Check overall progress section
    await expect(page.locator('.summary-label:has-text("Overall Progress")')).toBeVisible();
    await expect(page.locator('.summary-item:has-text("Total Principal") .summary-value')).toHaveText(/€80,000/);
  });

  test('should persist loan data across page reloads', async ({ page }) => {
    // Add a loan
    await page.locator('button:has-text("Add New Loan")').click();
    await page.locator('input#loanName').fill('Test Loan');
    await page.locator('input#loanPrincipal').fill('15000');
    await page.locator('input#loanInterestRate').fill('6');
    await page.locator('input#loanTermMonths').fill('48');
    await page.locator('input#loanStartDate').fill('2025-03-01');
    await page.locator('button:has-text("Save Loan")').click();
    
    // Reload page
    await page.reload();
    
    // Navigate back to loans tab
    await page.locator('button#loans-tab').click();
    
    // Verify loan still exists
    await expect(page.locator('text=Test Loan')).toBeVisible();
    await expect(page.locator('.loan-card:has-text("Test Loan") .loan-principal')).toHaveText(/€15,000/);
  });
});

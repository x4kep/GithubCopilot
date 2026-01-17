test('should display loans tab with empty state', async ({ page }) => {
    await page.goto('your-url-here'); // Replace with your actual URL
    await expect(page.locator('h5:has-text("Loan Management")')).toBeVisible();
    await expect(page.locator('button:has-text("Add New Loan")')).toBeVisible();
});

test('should reset storage when reset button is clicked', async ({ page }) => {
    await page.goto('your-url-here'); // Replace with your actual URL
    await expect(page.locator('button:has-text("Reset Storage")')).toBeVisible();
    await page.locator('button:has-text("Reset Storage")').click();
});
import { test, expect } from '@playwright/test';

test.describe('Critical Path: Checkout Journey', () => {
  test('User can browse, add to cart, and complete COD checkout', async ({ page }) => {
    // 1. Navigate to the homepage
    await page.goto('/');
    await expect(page).toHaveTitle(/Ummati Perfumes/i);

    // 2. Navigate to Shop
    await page.click('text="Explore Collection"');
    await expect(page.url()).toContain('/shop');

    // Wait for network/hydration
    await page.waitForLoadState('networkidle');

    // 3. Click the first product
    // Assuming product cards link to /product/...
    const firstProduct = page.locator('a[href^="/product/"]').first();
    await firstProduct.click();

    // Verify PDP loaded
    await expect(page.locator('h1')).toBeVisible();

    // 4. Add to cart
    await page.click('button:has-text("Add to Cart")');

    // 5. Verify Cart Drawer
    const cartDrawer = page.locator('text="Your Cart"').first();
    await expect(cartDrawer).toBeVisible();

    // 6. Proceed to Checkout
    await page.click('a:has-text("Checkout")');
    await expect(page.url()).toContain('/checkout');

    // 7. Fill Shipping Form
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@ummatiperfumes.com');
    await page.fill('input[name="phone"]', '9876543210');
    await page.fill('input[name="line1"]', '123 Fake Street');
    await page.fill('input[name="city"]', 'Mumbai');
    await page.fill('input[name="state"]', 'Maharashtra');
    await page.fill('input[name="pincode"]', '400001');

    // 8. Select COD
    await page.click('label[for="cod"]');

    // 9. Submit Order
    await page.click('button:has-text("Complete Order")');

    // 10. Verify Success Redirect
    // Should navigate to /order/success first, then /order/[orderNumber]
    await page.waitForURL(/\/order\/[A-Z0-9-]/, { timeout: 10000 });
    
    // Verify Order Status Page text
    await expect(page.locator('h1')).toContainText('Order Status');
  });
});

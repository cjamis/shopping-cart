import { Page, Locator, expect } from '@playwright/test';

export class ShoppingCartPage {
  readonly page: Page;

  readonly checkoutButton: Locator;
  readonly cartTotal: Locator;
  private readonly confirmRemoveModal: Locator;
  private readonly confirmRemoveButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.checkoutButton = page.locator("#checkoutBtn");
    this.cartTotal = page.locator("#cartTotal");
    this.confirmRemoveModal = page.locator("#remove-confirm-modal");
    this.confirmRemoveButton = this.confirmRemoveModal.locator(
      'button.confirm-remove:has-text("Yes")'
    );
  }

  private getItemLocator(itemName: string): Locator {
    return this.page.locator(`.cart-item:has-text("${itemName}")`);
  }


  async navigateTo() {
    await this.page.goto("https://gb-saa-test.vercel.app/#");
  }

  async removeItem(itemName: string) {
    const itemLocator = this.getItemLocator(itemName);
    await itemLocator.locator(".remove-item").click();
    await this.confirmRemoveButton.click();
  }

  async updateItemQuantity(itemName: string, quantity: number) {
    const itemLocator = this.getItemLocator(itemName);
    const quantityInput = itemLocator.locator("input.quantity");
    await quantityInput.clear();
    await quantityInput.fill(String(quantity));
  }

  async getCartTotal() {
    const totalText = await this.cartTotal.textContent();
    const match = totalText?.match(/\$(\d+\.\d{2})/);
    return match ? parseFloat(match[1]) : 0;
  }

   async expectItemIsHidden(itemName: string) {
    await expect(this.getItemLocator(itemName)).toBeHidden();
  }

  async expectCheckoutButtonIsEnabled() {
    await expect(this.checkoutButton).toBeEnabled();
  }

  async expectCheckoutButtonIsDisabled() {
    await expect(this.checkoutButton).toBeDisabled();
  }
}

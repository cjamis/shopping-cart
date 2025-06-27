import { test, expect } from "@playwright/test";
import { ShoppingCartPage } from "../pages/ShoppingCartPage";


type CartItem = {
  name: string;
  price: number;
  quantity: number;
};

function calculateExpectedTotal(items: CartItem[]): string {
  const total = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  return total.toFixed(2);
}

test.describe("Shopping Cart Functionality", () => {
  let shoppingCartPage: ShoppingCartPage;

  test.beforeEach(async ({ page }) => {
    shoppingCartPage = new ShoppingCartPage(page);
    await shoppingCartPage.navigateTo();
  });

  test("should display the correct initial total, excluding out-of-stock items", async () => {
    const itemsInCart: CartItem[] = [
      { name: "Kid’s T-shirt – Size M", price: 19.99, quantity: 1 },
      { name: "Bluetooth Headphones", price: 85.0, quantity: 1 },
    ];
    const expectedTotal = calculateExpectedTotal(itemsInCart);
    const actualTotal = await shoppingCartPage.getCartTotal();
    expect(actualTotal.toFixed(2)).toEqual(expectedTotal);
  });

  test("should remove an out-of-stock item and enable checkout", async () => {
    await shoppingCartPage.expectCheckoutButtonIsDisabled();
    await shoppingCartPage.removeItem("Travel Mug");
    await shoppingCartPage.expectItemIsHidden("Travel Mug");
    await shoppingCartPage.expectCheckoutButtonIsEnabled();

    const itemsInCart: CartItem[] = [
      { name: "Kid’s T-shirt – Size M", price: 19.99, quantity: 1 },
      { name: "Bluetooth Headphones", price: 85.0, quantity: 1 },
    ];
    const expectedTotal = calculateExpectedTotal(itemsInCart);
    const actualTotal = await shoppingCartPage.getCartTotal();
    expect(actualTotal.toFixed(2)).toEqual(expectedTotal);
  });

  test("should update item quantities  by 1 and reflect the correct total", async () => {
    await shoppingCartPage.expectCheckoutButtonIsDisabled();
    await shoppingCartPage.removeItem("Travel Mug");
    await shoppingCartPage.expectItemIsHidden("Travel Mug");
    await shoppingCartPage.expectCheckoutButtonIsEnabled();
    // Increase quantities
    await shoppingCartPage.updateItemQuantity("Kid’s T-shirt – Size M", 2);
    await shoppingCartPage.updateItemQuantity("Bluetooth Headphones", 2);

    const itemsAfterIncrease: CartItem[] = [
      { name: "Kid’s T-shirt – Size M", price: 19.99, quantity: 2 },
      { name: "Bluetooth Headphones", price: 85.0, quantity: 2 },
    ];
    let expectedTotal = calculateExpectedTotal(itemsAfterIncrease);
    let actualTotal = await shoppingCartPage.getCartTotal();
    expect(actualTotal.toFixed(2)).toEqual(expectedTotal);
    await shoppingCartPage.expectCheckoutButtonIsEnabled();
  });

  test("should set quantities to zero and disable checkout", async () => {
    await shoppingCartPage.expectCheckoutButtonIsDisabled();
    await shoppingCartPage.removeItem("Travel Mug");
    await shoppingCartPage.expectItemIsHidden("Travel Mug");
    await shoppingCartPage.expectCheckoutButtonIsEnabled();

    await shoppingCartPage.updateItemQuantity("Kid’s T-shirt – Size M", 0);
    await shoppingCartPage.updateItemQuantity("Bluetooth Headphones", 0);

    const itemsAfterZeroing: CartItem[] = [
      { name: "Kid’s T-shirt – Size M", price: 19.99, quantity: 0 },
      { name: "Bluetooth Headphones", price: 85.0, quantity: 0 },
    ];
    const expectedTotal = calculateExpectedTotal(itemsAfterZeroing);
    const actualTotal = await shoppingCartPage.getCartTotal();
    expect(actualTotal.toFixed(2)).toEqual(expectedTotal);
    await shoppingCartPage.expectCheckoutButtonIsDisabled();
  });

  test("should remove all items, resulting in a zero total and disabled checkout", async () => {
    await shoppingCartPage.expectCheckoutButtonIsDisabled();
    await shoppingCartPage.removeItem("Travel Mug");
    await shoppingCartPage.expectItemIsHidden("Travel Mug");
    await shoppingCartPage.expectCheckoutButtonIsEnabled();
    
    await shoppingCartPage.removeItem("Bluetooth Headphones");
    await shoppingCartPage.removeItem("Kid’s T-shirt – Size M");

    await shoppingCartPage.expectItemIsHidden("Travel Mug");
    await shoppingCartPage.expectItemIsHidden("Bluetooth Headphones");
    await shoppingCartPage.expectItemIsHidden("Kid’s T-shirt – Size M");

    const actualTotal = await shoppingCartPage.getCartTotal();
    expect(actualTotal.toFixed(2)).toBe("0.00");
    await shoppingCartPage.expectCheckoutButtonIsDisabled();
  });
});

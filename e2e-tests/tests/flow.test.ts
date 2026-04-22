import { test, expect } from '@playwright/test';

const FRONTEND_URL = 'http://localhost:5173';
const KITCHEN_URL = 'http://localhost:5174';
const COMMAND_URL = 'http://localhost:4001/graphql';
const QUERY_URL = 'http://localhost:4002/graphql';

test.describe('Customer Flow - E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FRONTEND_URL);
  });

  test('should load menu page', async ({ page }) => {
    await expect(page.locator('text=Cardápio')).toBeVisible();
    await expect(page.locator('text=Mesa')).toBeVisible();
  });

  test('should display menu items', async ({ page }) => {
    await page.waitForSelector('.ant-card', { timeout: 10000 });
    const menuItems = page.locator('.ant-card');
    await expect(menuItems.first()).toBeVisible();
  });

  test('should add item to cart', async ({ page }) => {
    await page.waitForSelector('.ant-btn:has-text("Adicionar")', { timeout: 10000 });
    
    const addButton = page.locator('.ant-btn:has-text("Adicionar")').first();
    await addButton.click();
    
    await expect(page.locator('.ant-badge')).toBeVisible();
  });

  test('should show cart with items', async ({ page }) => {
    await page.waitForSelector('.ant-btn:has-text("Adicionar")', { timeout: 10000 });
    
    const addButton = page.locator('.ant-btn:has-text("Adicionar")').first();
    await addButton.click();
    
    await expect(page.locator('text=Seu Pedido')).toBeVisible();
    await expect(page.locator('text=Total:')).toBeVisible();
  });
});

test.describe('Order Status Page - E2E', () => {
  test('should navigate to order status page', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/status`);
    await expect(page.locator('text=Acompanhe seu Pedido')).toBeVisible();
  });

  test('should show no orders message when empty', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/status`);
    await expect(page.locator('text=Nenhum pedido ativo')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Kitchen Display - E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(KITCHEN_URL);
  });

  test('should load kitchen display', async ({ page }) => {
    await expect(page.locator('text=Kitchen Display')).toBeVisible();
    await expect(page.locator('text=Painel de pedidos da cozinha')).toBeVisible();
  });

  test('should display status columns', async ({ page }) => {
    await expect(page.locator('text=Novos')).toBeVisible();
    await expect(page.locator('text=Confirmados')).toBeVisible();
    await expect(page.locator('text=Preparando')).toBeVisible();
    await expect(page.locator('text=Prontos')).toBeVisible();
  });

  test('should display statistics cards', async ({ page }) => {
    await expect(page.locator('text=Pendentes')).toBeVisible();
    await expect(page.locator('text=Confirmados')).toBeVisible();
    await expect(page.locator('text=Preparando')).toBeVisible();
    await expect(page.locator('text=Prontos')).toBeVisible();
  });
});

test.describe('GraphQL API - E2E', () => {
  test('Command Service should be accessible', async ({ request }) => {
    const response = await request.post(COMMAND_URL, {
      data: {
        query: `{ __typename }`
      }
    });
    expect(response.ok()).toBeTruthy();
  });

  test('Query Service should be accessible', async ({ request }) => {
    const response = await request.post(QUERY_URL, {
      data: {
        query: `{ __typename }`
      }
    });
    expect(response.ok()).toBeTruthy();
  });

  test('should create order via GraphQL', async ({ request }) => {
    const response = await request.post(COMMAND_URL, {
      data: {
        query: `
          mutation {
            createOrder(
              tableId: "e2e-table"
              items: [{ productId: "prod-1", productName: "Test", quantity: 1, unitPrice: 10 }]
            ) {
              id
              tableId
              status
            }
          }
        `
      }
    });

    const json = await response.json();
    expect(json.data?.createOrder).toBeDefined();
    expect(json.data?.createOrder.status).toBe('PENDING');
  });

  test('should query menu via GraphQL', async ({ request }) => {
    const response = await request.post(QUERY_URL, {
      data: {
        query: `
          query {
            menu {
              id
              name
              category
            }
          }
        `
      }
    });

    const json = await response.json();
    expect(json.data?.menu).toBeDefined();
    expect(json.data?.menu.length).toBeGreaterThan(0);
  });
});
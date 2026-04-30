import { test, expect } from '@playwright/test';

const FRONTEND_URL = 'http://localhost:6173';
const KITCHEN_URL = 'http://localhost:6174';
const COMMAND_URL = 'http://localhost:4001/graphql';
const QUERY_URL = 'http://localhost:4002/graphql';

async function startTabletSession(page: any) {
  await page.addInitScript(() => {
    window.localStorage.setItem('lastTableNumber', '1');
  });
  await page.goto(FRONTEND_URL);
  await page.getByPlaceholder(/nome/i).fill('E2E Cliente');
  await page.getByRole('button', { name: /entrar|iniciar|continuar/i }).click();
}

test.describe('Tablet Flow - E2E', () => {
  test('deve iniciar sessão e abrir cardápio', async ({ page }) => {
    await startTabletSession(page);
    await expect(page.getByRole('heading', { name: 'Cardápio' })).toBeVisible();
    await expect(page.getByText(/Mesa .*E2E Cliente/)).toBeVisible();
  });

  test('deve abrir modal de observação ao pedir item', async ({ page }) => {
    await startTabletSession(page);
    const orderButtons = page.locator('button[aria-label="CheckCircleOutlined"], .ant-btn-primary');
    await orderButtons.first().click();
    await expect(page.getByText(/Adicione uma observação/i)).toBeVisible();
  });

  test('deve navegar para pedidos e conta pelo menu inferior', async ({ page }) => {
    await startTabletSession(page);
    await page.getByText('Pedidos').click();
    await expect(page.getByText('Meus Pedidos')).toBeVisible();
    await page.getByText('Conta').click();
    await expect(page.getByRole('heading', { name: 'Conta' })).toBeVisible();
  });
});

test.describe('Kitchen Flow - E2E', () => {
  test('deve carregar board da cozinha com colunas atuais', async ({ page }) => {
    await page.goto(KITCHEN_URL);
    await expect(page.getByText('Cozinha')).toBeVisible();
    await expect(page.getByText(/Pendente/)).toBeVisible();
    await expect(page.getByText(/Preparando/)).toBeVisible();
    await expect(page.getByText(/A caminho da mesa/)).toBeVisible();
    await expect(page.getByText(/Entregue/)).toBeVisible();
    await expect(page.getByText(/Cancelado/)).toBeVisible();
  });
});

test.describe('GraphQL API - E2E', () => {
  test('Command Service deve responder', async ({ request }) => {
    const response = await request.post(COMMAND_URL, { data: { query: '{ __typename }' } });
    expect(response.ok()).toBeTruthy();
  });

  test('Query Service deve responder', async ({ request }) => {
    const response = await request.post(QUERY_URL, { data: { query: '{ __typename }' } });
    expect(response.ok()).toBeTruthy();
  });

  test('deve criar pedido e consultar no Query Service', async ({ request }) => {
    const created = await request.post(COMMAND_URL, {
      data: {
        query: `
          mutation {
            createOrder(
              tableId: "table-e2e"
              items: [{ productId: "prod-1", productName: "Item E2E", quantity: 1, unitPrice: 10 }]
            ) { id status tableId }
          }
        `
      }
    });
    const createdJson = await created.json();
    expect(createdJson.data?.createOrder?.status).toBe('PENDING');

    const queried = await request.post(QUERY_URL, {
      data: {
        query: `
          query {
            ordersByTable(tableId: "table-e2e") { id status tableId }
          }
        `
      }
    });
    const queriedJson = await queried.json();
    expect(Array.isArray(queriedJson.data?.ordersByTable)).toBeTruthy();
  });
});

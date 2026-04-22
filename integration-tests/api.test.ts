import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { ApolloClient, InMemoryCache, gql, HttpLink } from '@apollo/client';

const COMMAND_URL = 'http://localhost:4001/graphql';
const QUERY_URL = 'http://localhost:4002/graphql';

describe('Command Service - Integration Tests', () => {
  let client: ApolloClient<any>;

  beforeAll(() => {
    client = new ApolloClient({
      link: new HttpLink({ uri: COMMAND_URL }),
      cache: new InMemoryCache()
    });
  });

  describe('CreateOrder Mutation', () => {
    it('should create a new order', async () => {
      const CREATE_ORDER = gql`
        mutation CreateOrder($tableId: ID!, $items: [OrderItemInput!]!) {
          createOrder(tableId: $tableId, items: $items) {
            id
            tableId
            status
            total
            items {
              productId
              productName
              quantity
              unitPrice
            }
          }
        }
      `;

      const result = await client.mutate({
        mutation: CREATE_ORDER,
        variables: {
          tableId: 'test-table-1',
          items: [
            { productId: 'prod-1', productName: 'Hambúrguer', quantity: 2, unitPrice: 42.90 }
          ]
        }
      });

      expect(result.data.createOrder).toBeDefined();
      expect(result.data.createOrder.tableId).toBe('test-table-1');
      expect(result.data.createOrder.status).toBe('PENDING');
      expect(result.data.createOrder.total).toBe(85.80);
      expect(result.data.createOrder.items).toHaveLength(1);
    });

    it('should create order with multiple items', async () => {
      const CREATE_ORDER = gql`
        mutation CreateOrder($tableId: ID!, $items: [OrderItemInput!]!) {
          createOrder(tableId: $tableId, items: $items) {
            id
            total
            items {
              productName
              quantity
            }
          }
        }
      `;

      const result = await client.mutate({
        mutation: CREATE_ORDER,
        variables: {
          tableId: 'test-table-2',
          items: [
            { productId: 'prod-1', productName: 'Pizza', quantity: 1, unitPrice: 58.90 },
            { productId: 'prod-2', productName: 'Refrigerante', quantity: 2, unitPrice: 8.90 }
          ]
        }
      });

      expect(result.data.createOrder.total).toBe(76.70);
      expect(result.data.createOrder.items).toHaveLength(2);
    });
  });

  describe('UpdateOrderStatus Mutation', () => {
    it('should update order status', async () => {
      const CREATE_ORDER = gql`
        mutation CreateOrder($tableId: ID!, $items: [OrderItemInput!]!) {
          createOrder(tableId: $tableId, items: $items) {
            id
          }
        }
      `;

      const createResult = await client.mutate({
        mutation: CREATE_ORDER,
        variables: {
          tableId: 'test-table-status',
          items: [{ productId: 'prod-1', productName: 'Test', quantity: 1, unitPrice: 10 }]
        }
      });

      const orderId = createResult.data.createOrder.id;

      const UPDATE_STATUS = gql`
        mutation UpdateOrderStatus($orderId: ID!, $status: String!) {
          updateOrderStatus(orderId: $orderId, status: $status) {
            id
            status
          }
        }
      `;

      const result = await client.mutate({
        mutation: UPDATE_STATUS,
        variables: { orderId, status: 'CONFIRMED' }
      });

      expect(result.data.updateOrderStatus.status).toBe('CONFIRMED');
    });
  });

  describe('AddOrderItem Mutation', () => {
    it('should add item to existing order', async () => {
      const CREATE_ORDER = gql`
        mutation CreateOrder($tableId: ID!, $items: [OrderItemInput!]!) {
          createOrder(tableId: $tableId, items: $items) {
            id
            total
          }
        }
      `;

      const createResult = await client.mutate({
        mutation: CREATE_ORDER,
        variables: {
          tableId: 'test-table-add',
          items: [{ productId: 'prod-1', productName: 'Pizza', quantity: 1, unitPrice: 58.90 }]
        }
      });

      const orderId = createResult.data.createOrder.id;

      const ADD_ITEM = gql`
        mutation AddOrderItem($orderId: ID!, $item: OrderItemInput!) {
          addOrderItem(orderId: $orderId, item: $item) {
            id
            total
            items {
              productName
              quantity
            }
          }
        }
      `;

      const result = await client.mutate({
        mutation: ADD_ITEM,
        variables: {
          orderId,
          item: { productId: 'prod-2', productName: 'Refrigerante', quantity: 2, unitPrice: 8.90 }
        }
      });

      expect(result.data.addOrderItem.items).toHaveLength(2);
      expect(result.data.addOrderItem.total).toBe(76.70);
    });
  });

  describe('RemoveOrderItem Mutation', () => {
    it('should remove item from order', async () => {
      const CREATE_ORDER = gql`
        mutation CreateOrder($tableId: ID!, $items: [OrderItemInput!]!) {
          createOrder(tableId: $tableId, items: $items) {
            id
          }
        }
      `;

      const createResult = await client.mutate({
        mutation: CREATE_ORDER,
        variables: {
          tableId: 'test-table-remove',
          items: [
            { productId: 'prod-1', productName: 'Pizza', quantity: 1, unitPrice: 58.90 },
            { productId: 'prod-2', productName: 'Refrigerante', quantity: 1, unitPrice: 8.90 }
          ]
        }
      });

      const orderId = createResult.data.createOrder.id;

      const REMOVE_ITEM = gql`
        mutation RemoveOrderItem($orderId: ID!, $productId: String!) {
          removeOrderItem(orderId: $orderId, productId: $productId) {
            id
          }
        }
      `;

      const result = await client.mutate({
        mutation: REMOVE_ITEM,
        variables: { orderId, productId: 'prod-1' }
      });

      expect(result.data.removeOrderItem).toBeDefined();
    });
  });
});

describe('Query Service - Integration Tests', () => {
  let client: ApolloClient<any>;

  beforeAll(() => {
    client = new ApolloClient({
      link: new HttpLink({ uri: QUERY_URL }),
      cache: new InMemoryCache()
    });
  });

  describe('Orders Queries', () => {
    it('should query orders by table', async () => {
      const GET_ORDERS = gql`
        query GetOrdersByTable($tableId: String!) {
          ordersByTable(tableId: $tableId) {
            id
            tableId
            status
            total
          }
        }
      `;

      const result = await client.query({
        query: GET_ORDERS,
        variables: { tableId: 'test-table-1' },
        fetchPolicy: 'network-only'
      });

      expect(result.data.ordersByTable).toBeDefined();
      expect(Array.isArray(result.data.ordersByTable)).toBe(true);
    });

    it('should query active orders by table', async () => {
      const GET_ACTIVE_ORDERS = gql`
        query GetActiveOrdersByTable($tableId: String!) {
          activeOrdersByTable(tableId: $tableId) {
            id
            status
          }
        }
      `;

      const result = await client.query({
        query: GET_ACTIVE_ORDERS,
        variables: { tableId: 'test-table-1' },
        fetchPolicy: 'network-only'
      });

      expect(result.data.activeOrdersByTable).toBeDefined();
    });

    it('should query all active orders (kitchen view)', async () => {
      const GET_ALL_ORDERS = gql`
        query GetAllOrders {
          ordersByTable(tableId: "all") {
            id
            tableId
            status
          }
        }
      `;

      const result = await client.query({
        query: GET_ALL_ORDERS,
        fetchPolicy: 'network-only'
      });

      expect(result.data.ordersByTable).toBeDefined();
      expect(Array.isArray(result.data.ordersByTable)).toBe(true);
    });
  });

  describe('Menu Query', () => {
    it('should query all menu items', async () => {
      const GET_MENU = gql`
        query GetMenu {
          menu {
            id
            name
            price
            category
          }
        }
      `;

      const result = await client.query({
        query: GET_MENU,
        fetchPolicy: 'network-only'
      });

      expect(result.data.menu).toBeDefined();
      expect(result.data.menu.length).toBeGreaterThan(0);
    });

    it('should filter menu by category', async () => {
      const GET_MENU_BY_CATEGORY = gql`
        query GetMenuByCategory($category: String) {
          menu(category: $category) {
            name
            category
          }
        }
      `;

      const result = await client.query({
        query: GET_MENU_BY_CATEGORY,
        variables: { category: 'Bebidas Não Alcoólicas' },
        fetchPolicy: 'network-only'
      });

      expect(result.data.menu).toBeDefined();
      result.data.menu.forEach((item: any) => {
        expect(item.category).toBe('Bebidas Não Alcoólicas');
      });
    });
  });
});
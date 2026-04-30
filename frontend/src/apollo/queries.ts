import { gql } from '@apollo/client';

export const GET_MENU = gql`
  query GetMenu($category: String) {
    menu(category: $category) {
      id
      name
      description
      category
      price
      available
    }
  }
`;

export const GET_ORDERS_BY_TABLE = gql`
  query GetOrdersByTable($tableId: String!) {
    ordersByTable(tableId: $tableId) {
      id
      tableId
      status
      total
      items {
        productId
        productName
        quantity
        unitPrice
        notes
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_ORDER = gql`
  query GetOrder($id: String!) {
    order(id: $id) {
      id
      tableId
      status
      total
      items {
        productId
        productName
        quantity
        unitPrice
        notes
      }
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_ORDER = gql`
  mutation CreateOrder($tableId: String!, $items: [OrderItemInput!]!) {
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
        notes
      }
    }
  }
`;

export const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($orderId: ID!, $status: String!) {
    updateOrderStatus(orderId: $orderId, status: $status) {
      id
      status
    }
  }
`;

export const ADD_ORDER_ITEM = gql`
  mutation AddOrderItem($orderId: ID!, $item: OrderItemInput!) {
    addOrderItem(orderId: $orderId, item: $item) {
      id
      total
      items {
        productName
        quantity
        unitPrice
      }
    }
  }
`;

export const REMOVE_ORDER_ITEM = gql`
  mutation RemoveOrderItem($orderId: ID!, $productId: String!) {
    removeOrderItem(orderId: $orderId, productId: $productId) {
      id
    }
  }
`;

export const SEED_MENU = gql`
  mutation SeedMenu {
    seedMenu
  }
`;
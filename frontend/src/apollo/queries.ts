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
      items
      updatedAt
    }
  }
`;

export const GET_ACTIVE_ORDERS = gql`
  query GetActiveOrdersByTable($tableId: String!) {
    activeOrdersByTable(tableId: $tableId) {
      id
      tableId
      status
      total
      items
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
      items
      updatedAt
    }
  }
`;

export const CREATE_ORDER = gql`
  mutation CreateOrder($tableId: ID!, $items: [OrderItemInput!]!) {
    createOrder(tableId: $tableId, items: $items) {
      id
      tableId
      status
      total
      items {
        id
        productId
        productName
        quantity
        unitPrice
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

export const ORDER_UPDATED_SUBSCRIPTION = gql`
  subscription OnOrderUpdated($tableId: String!) {
    orderUpdated(tableId: $tableId) {
      id
      tableId
      status
      total
      items
      updatedAt
    }
  }
`;
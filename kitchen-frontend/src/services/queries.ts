import { gql } from '@apollo/client';

export const GET_ALL_ORDERS = gql`
  query GetAllOrders {
    ordersByTable(tableId: "all") {
      id
      tableId
      status
      total
      items
      updatedAt
      createdAt
    }
  }
`;

export const GET_PENDING_ORDERS = gql`
  query GetPendingOrders {
    ordersByTable(tableId: "all") {
      id
      tableId
      status
      total
      items
      updatedAt
      createdAt
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

export const ORDER_UPDATED_SUBSCRIPTION = gql`
  subscription OnOrderUpdated {
    orderUpdated {
      id
      tableId
      status
      total
      items
      updatedAt
    }
  }
`;
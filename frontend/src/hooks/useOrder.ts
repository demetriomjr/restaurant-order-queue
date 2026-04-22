import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_MENU, GET_ACTIVE_ORDERS, CREATE_ORDER, ORDER_UPDATED_SUBSCRIPTION } from '../apollo/queries';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  available: boolean;
}

interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export function useMenu() {
  const { data, loading, error, refetch } = useQuery(GET_MENU);
  
  return {
    menu: data?.menu as MenuItem[] || [],
    loading,
    error,
    refetch
  };
}

export function useActiveOrders(tableId: string) {
  const { data, loading, error, subscribeToMore } = useQuery(GET_ACTIVE_ORDERS, {
    variables: { tableId },
    fetchPolicy: 'cache-and-network'
  });

  useEffect(() => {
    if (!subscribeToMore) return;

    const unsubscribe = subscribeToMore({
      document: ORDER_UPDATED_SUBSCRIPTION,
      variables: { tableId },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        
        const updatedOrder = subscriptionData.data.orderUpdated;
        
        const existingOrders = prev.activeOrdersByTable || [];
        const existingIndex = existingOrders.findIndex(
          (o: any) => o.id === updatedOrder.id
        );

        if (existingIndex >= 0) {
          const newOrders = [...existingOrders];
          newOrders[existingIndex] = updatedOrder;
          return { activeOrdersByTable: newOrders };
        } else {
          return { activeOrdersByTable: [updatedOrder, ...existingOrders] };
        }
      }
    });

    return () => unsubscribe?.();
  }, [subscribeToMore, tableId]);

  return {
    orders: data?.activeOrdersByTable || [],
    loading,
    error
  };
}

export function useCreateOrder() {
  const [mutation, { loading }] = useMutation(CREATE_ORDER);
  
  const createOrder = useCallback(async (tableId: string, items: CartItem[]) => {
    const result = await mutation({
      variables: {
        tableId,
        items: items.map(item => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        }))
      }
    });
    return result.data?.createOrder;
  }, [mutation]);

  return { createOrder, loading };
}

export function useSSEConnection(tableId: string) {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource(`http://localhost:4002/sse/table/${tableId}`);
    
    eventSource.onopen = () => {
      console.log('SSE Connected');
      setConnected(true);
    };

    eventSource.onerror = () => {
      console.log('SSE Error');
      setConnected(false);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [tableId]);

  return { connected };
}
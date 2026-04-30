import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PENDING_ORDERS, UPDATE_ORDER_STATUS, ORDER_UPDATED_SUBSCRIPTION } from '../services/queries';
import { commandClient } from '../services/clients';

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
}

interface Order {
  id: string;
  tableId: string;
  status: string;
  total: number;
  items: OrderItem[];
  updatedAt: string;
  createdAt: string;
  pendingStartedAt?: string | null;
  preparingStartedAt?: string | null;
  onTheWayStartedAt?: string | null;
}

export function useKitchenOrders() {
  const { data, loading, error, refetch, subscribeToMore } = useQuery(GET_PENDING_ORDERS, {
    pollInterval: 5000,
    fetchPolicy: 'cache-and-network'
  });
  
  const { connected } = useSSE();
  
  // Quando conecta no SSE OU quando inicia, busca pedidos do banco
  useEffect(() => {
    console.log('[Kitchen] Fetching orders from database...');
    refetch();
  }, [refetch]); // Executa ao iniciar e quando refetch mudar

  useEffect(() => {
    // Quando SSE conecta, refetch para garantir dados frescos
    if (connected) {
      console.log('[Kitchen] SSE connected, refetching...');
      refetch();
    }
  }, [connected, refetch]);

  useEffect(() => {
    if (!subscribeToMore) return;

    const unsubscribe = subscribeToMore({
      document: ORDER_UPDATED_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        
        const updatedOrder = subscriptionData.data.orderUpdated;
        const existingOrders = prev.ordersByTable || [];
        
        if (updatedOrder.status === 'COMPLETED') {
          return {
            ordersByTable: existingOrders.filter((o: Order) => o.id !== updatedOrder.id)
          };
        }
        
        const existingIndex = existingOrders.findIndex((o: Order) => o.id === updatedOrder.id);
        
        if (existingIndex >= 0) {
          const newOrders = [...existingOrders];
          newOrders[existingIndex] = updatedOrder;
          return { ordersByTable: newOrders };
        } else {
          return { ordersByTable: [updatedOrder, ...existingOrders] };
        }
      }
    });

    return () => unsubscribe?.();
  }, [subscribeToMore]);

  return {
    orders: (data?.ordersByTable || []) as Order[],
    loading,
    error,
    refetch,
    connected
  };
}

export function useUpdateOrderStatus() {
  const [mutation, { loading }] = useMutation(UPDATE_ORDER_STATUS, { client: commandClient });
  
  const updateStatus = useCallback(async (orderId: string, status: string) => {
    await mutation({
      variables: { orderId, status }
    });
  }, [mutation]);

  return { updateStatus, loading };
}

export function useSSE() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4002';
    const url = `${apiUrl}/sse/table/all`;
    console.log('Kitchen: Connecting to SSE at', url);
    
    const eventSource = new EventSource(url);
    
    eventSource.onopen = () => {
      console.log('Kitchen SSE Connected to', url);
      setConnected(true);
    };

    eventSource.onmessage = (event) => {
      console.log('Kitchen SSE message:', event.data);
    };

    eventSource.onerror = (error) => {
      console.log('Kitchen SSE Error:', error);
      setConnected(false);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return { connected };
}

export function formatElapsedTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m`;
}

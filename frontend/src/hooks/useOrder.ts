import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_MENU, GET_ORDERS_BY_TABLE, CREATE_ORDER } from '../apollo/queries';
import { commandClient } from '../apollo/client';

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
  notes?: string;
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
  const { data, loading, refetch } = useQuery(GET_ORDERS_BY_TABLE, {
    variables: { tableId },
    fetchPolicy: 'cache-and-network'
  });

  return {
    orders: data?.ordersByTable || [],
    loading,
    refetch
  };
}

export function useCreateOrder() {
  const [mutation, { loading }] = useMutation(CREATE_ORDER, { client: commandClient });
  
  const createOrder = useCallback(async (tableId: string, items: CartItem[]) => {
    const result = await mutation({
      variables: {
        tableId,
        items: items.map(item => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          notes: item.notes
        }))
      }
    });
    return result.data?.createOrder;
  }, [mutation]);

  return { createOrder, loading };
}

export function useSSEConnection(tableId: string, onEvent?: (event: { type?: string; payload?: Record<string, unknown> }) => void) {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4002';
    const eventSource = new EventSource(`${apiUrl}/sse/table/${tableId}`);
    
    eventSource.onopen = () => {
      console.log(`[SSE] TABLET connected for table "${tableId}"`);
      setConnected(true);
    };

    eventSource.onmessage = (event) => {
      console.log('[SSE] TABLET received:', event.data);
      try {
        const parsed = JSON.parse(event.data);
        onEvent?.(parsed);
      } catch {
        onEvent?.({});
      }
    };

    eventSource.onerror = () => {
      console.log('[SSE] TABLET error');
      setConnected(false);
    };

    return () => {
      eventSource.close();
    };
  }, [tableId, onEvent]);

  return { connected };
}

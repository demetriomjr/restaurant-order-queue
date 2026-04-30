import { useState, useEffect } from 'react';
import { Card, Space, Typography, Row, Tooltip, message } from 'antd';
import { ClockCircleOutlined, SyncOutlined, CoffeeOutlined, DeleteOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useKitchenOrders, useUpdateOrderStatus, formatElapsedTime } from './hooks/useKitchen';

const { Title, Text } = Typography;

type OrderStatus = 'PENDING' | 'PREPARING' | 'ON_THE_WAY' | 'DELIVERED' | 'CANCELLED';

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

interface DragState {
  id: string;
  status: OrderStatus;
}

const statusConfig: Record<OrderStatus, { color: string; label: string; bg: string; cardBg: string; chipBg: string }> = {
  PENDING: { color: '#C47A1E', label: 'Pendente', bg: '#F1DEBF', cardBg: '#C47A1E', chipBg: '#F7E3C4' },
  PREPARING: { color: '#8A62B8', label: 'Preparando', bg: '#E4D7F1', cardBg: '#8A62B8', chipBg: '#E9DCF6' },
  ON_THE_WAY: { color: '#3A9A8B', label: 'A caminho da mesa', bg: '#CDE7DF', cardBg: '#3A9A8B', chipBg: '#D8F0EA' },
  DELIVERED: { color: '#5FA46F', label: 'Entregue', bg: '#D3E8CF', cardBg: '#5FA46F', chipBg: '#DFF0DB' },
  CANCELLED: { color: '#C75C66', label: 'Cancelado', bg: '#F3D2D6', cardBg: '#C75C66', chipBg: '#F6DEE2' }
};

function OrderCard({
  order,
  onCancel,
  onDragStart
}: {
  order: Order;
  onCancel: (id: string) => void;
  onDragStart: (order: Order) => void;
}) {
  const getTotalTimerBase = (currentOrder: Order): string => {
    return currentOrder.pendingStartedAt || currentOrder.createdAt;
  };

  const [elapsed, setElapsed] = useState(formatElapsedTime(getTotalTimerBase(order)));
  const config = statusConfig[order.status as OrderStatus];
  const isCanceled = order.status === 'CANCELLED';
  const isDelivered = order.status === 'DELIVERED';
  const isDraggable = !isCanceled;

  useEffect(() => {
    const timerBase = getTotalTimerBase(order);
    setElapsed(formatElapsedTime(timerBase));
    const interval = setInterval(() => {
      setElapsed(formatElapsedTime(timerBase));
    }, 1000);
    return () => clearInterval(interval);
  }, [order]);

  const timerTooltip = (
    <div style={{ display: 'grid', gap: 4 }}>
      <Text style={{ color: '#fff' }}>Pedido: {formatElapsedTime(order.pendingStartedAt || order.createdAt)}</Text>
      {order.preparingStartedAt && (
        <Text style={{ color: '#fff' }}>Preparando: {formatElapsedTime(order.preparingStartedAt)}</Text>
      )}
      {order.onTheWayStartedAt && (
        <Text style={{ color: '#fff' }}>A caminho: {formatElapsedTime(order.onTheWayStartedAt)}</Text>
      )}
    </div>
  );

  return (
    <Card 
      style={{ 
        marginBottom: 12, 
        border: 'none',
        background: config.cardBg,
        borderRadius: 12, 
        userSelect: 'none',
        WebkitUserSelect: 'none',
        cursor: isDraggable ? 'grab' : 'default'
      }}
      bodyStyle={{ padding: 12 }}
      draggable={isDraggable}
      onDragStart={() => {
        if (isDraggable) onDragStart(order);
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <Space size={8} align="center">
          <div
            style={{
              border: `1px solid ${config.color}`,
              borderRadius: 8,
              padding: '4px 12px',
              background: config.chipBg,
              boxShadow: '0 1px 0 rgba(0,0,0,0.08)'
            }}
          >
            <Text strong style={{ fontSize: 16, color: config.color, letterSpacing: 0.3, textTransform: 'uppercase' }}>
              Mesa {order.tableId.replace('table-', '')}
            </Text>
          </div>
        </Space>
        <Space size={10}>
          {!isCanceled && !isDelivered && (
            <Tooltip title={timerTooltip}>
              <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.92)', cursor: 'help' }}>
                <ClockCircleOutlined /> {elapsed}
              </Text>
            </Tooltip>
          )}
          {!isCanceled && (
            <button
              aria-label="Cancelar pedido"
              onClick={() => onCancel(order.id)}
              style={{
                border: 'none',
                background: '#FFE9EC',
                color: '#B42334',
                border: '1px solid #D94B5D',
                width: 32,
                height: 32,
                borderRadius: 8,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <DeleteOutlined />
            </button>
          )}
        </Space>
      </div>

      <div style={{ marginTop: 8 }}>
        {order.items.map((item, idx) => (
          <div key={idx} style={{ padding: '6px 0', borderBottom: idx < order.items.length - 1 ? '1px solid rgba(255,255,255,0.25)' : 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
              <Text strong style={{ fontSize: 18, color: '#fff' }}>{item.productName}</Text>
              <Text strong style={{ fontSize: 16, color: 'rgba(255,255,255,0.9)' }}>QTD: {item.quantity}</Text>
            </div>
            {item.notes && (
              <Text style={{ fontSize: 14, display: 'block', color: 'rgba(255,255,255,0.88)' }}>Obs: {item.notes}</Text>
            )}
          </div>
        ))}
      </div>

    </Card>
  );
}

export default function KitchenApp() {
  const { orders, loading } = useKitchenOrders();
  const { updateStatus } = useUpdateOrderStatus();
  const [dragged, setDragged] = useState<DragState | null>(null);
  const [hoverColumn, setHoverColumn] = useState<OrderStatus | null>(null);
  const [optimisticStatusByOrderId, setOptimisticStatusByOrderId] = useState<Record<string, OrderStatus>>({});
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    setOptimisticStatusByOrderId((prev) => {
      const next = { ...prev };
      let changed = false;

      for (const order of orders) {
        const optimistic = next[order.id];
        if (optimistic && optimistic === order.status) {
          delete next[order.id];
          changed = true;
        }
      }

      return changed ? next : prev;
    });
  }, [orders]);

  const getEffectiveStatus = (order: Order): OrderStatus =>
    optimisticStatusByOrderId[order.id] ?? (order.status as OrderStatus);

  const handleCancelOrder = async (orderId: string) => {
    setOptimisticStatusByOrderId((prev) => ({ ...prev, [orderId]: 'CANCELLED' }));
    try {
      await updateStatus(orderId, 'CANCELLED');
      message.success('Pedido cancelado');
    } catch (error) {
      setOptimisticStatusByOrderId((prev) => {
        const next = { ...prev };
        delete next[orderId];
        return next;
      });
      message.error('Erro ao cancelar pedido');
    }
  };

  const moveOrderToStatus = async (orderId: string, toStatus: OrderStatus) => {
    setOptimisticStatusByOrderId((prev) => ({ ...prev, [orderId]: toStatus }));
    try {
      await updateStatus(orderId, toStatus);
      message.success(`Pedido movido para ${statusConfig[toStatus].label}`);
    } catch {
      setOptimisticStatusByOrderId((prev) => {
        const next = { ...prev };
        delete next[orderId];
        return next;
      });
      message.error('Erro ao mover pedido');
    }
  };

  const handleDropOnColumn = async (toStatus: OrderStatus) => {
    if (!dragged) return;

    if (dragged.status === 'CANCELLED' && toStatus !== 'CANCELLED') {
      message.warning('Pedido cancelado não pode voltar para outros status');
      setDragged(null);
      setHoverColumn(null);
      return;
    }

    if (dragged.status === toStatus) {
      setDragged(null);
      setHoverColumn(null);
      return;
    }
    await moveOrderToStatus(dragged.id, toStatus);
    setDragged(null);
    setHoverColumn(null);
  };

  const handleConfirmAllDelivered = async () => {
    if (onTheWayOrders.length === 0) return;
    setOptimisticStatusByOrderId((prev) => {
      const next = { ...prev };
      for (const order of onTheWayOrders) {
        next[order.id] = 'DELIVERED';
      }
      return next;
    });
    try {
      await Promise.all(onTheWayOrders.map((order) => updateStatus(order.id, 'DELIVERED')));
      message.success('Entregas confirmadas');
    } catch {
      setOptimisticStatusByOrderId((prev) => {
        const next = { ...prev };
        for (const order of onTheWayOrders) {
          delete next[order.id];
        }
        return next;
      });
      message.error('Erro ao confirmar entregas');
    }
  };

  const sortByCreatedAt = (a: Order, b: Order) =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

  const sortByUpdatedAt = (a: Order, b: Order) =>
    new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();

  const ordersWithEffectiveStatus = orders.map((order) => ({
    ...order,
    status: getEffectiveStatus(order)
  }));

  const isOrderFromSelectedDate = (order: Order): boolean => {
    const dateValue = order.pendingStartedAt || order.createdAt;
    return new Date(dateValue).toISOString().slice(0, 10) === selectedDate;
  };

  const filteredOrders = ordersWithEffectiveStatus.filter(isOrderFromSelectedDate);

  const pendingOrders = filteredOrders.filter(o => o.status === 'PENDING').sort(sortByCreatedAt);
  const preparingOrders = filteredOrders.filter(o => o.status === 'PREPARING').sort(sortByUpdatedAt);
  const onTheWayOrders = filteredOrders.filter(o => o.status === 'ON_THE_WAY').sort(sortByUpdatedAt);
  const deliveredOrders = filteredOrders.filter(o => o.status === 'DELIVERED').sort(sortByUpdatedAt);
  const canceledOrders = filteredOrders.filter(o => o.status === 'CANCELLED').sort(sortByUpdatedAt);

  const columns = [
    { status: 'PENDING' as OrderStatus, title: 'Pendente', orders: pendingOrders, color: '#C47A1E' },
    { status: 'PREPARING' as OrderStatus, title: 'Preparando', orders: preparingOrders, color: '#8A62B8' },
    { status: 'ON_THE_WAY' as OrderStatus, title: 'A caminho da mesa', orders: onTheWayOrders, color: '#3A9A8B' },
    { status: 'DELIVERED' as OrderStatus, title: 'Entregue', orders: deliveredOrders, color: '#5FA46F' },
    { status: 'CANCELLED' as OrderStatus, title: 'Cancelado', orders: canceledOrders, color: '#C75C66' }
  ];

  return (
    <div
      style={{
        padding: 16,
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #FFF9F2 0%, #F7F1EA 100%)'
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Space>
            <CoffeeOutlined style={{ fontSize: 32, color: '#d35400' }} />
            <div>
              <Title level={2} style={{ margin: 0, color: '#2c3e50' }}>
                Cozinha
              </Title>
              <Text type="secondary">Arraste os pedidos entre colunas</Text>
            </div>
          </Space>
          
          <div
            style={{
              border: '1px solid #d9d9d9',
              borderRadius: 10,
              padding: '8px 12px',
              background: '#FFFDF9',
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}
          >
            <Text strong style={{ color: '#2c3e50' }}>Sessão (dia):</Text>
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              style={{
                border: '1px solid #d9d9d9',
                borderRadius: 8,
                padding: '6px 10px',
                fontSize: 14
              }}
            />
          </div>
        </Row>

      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <SyncOutlined spin style={{ fontSize: 48, color: '#d35400' }} />
          <div style={{ marginTop: 16, color: '#666' }}>Carregando...</div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: 60, background: '#FFFCF8', borderRadius: 12, border: '1px solid #F0E4D5' }}>
          <CoffeeOutlined style={{ fontSize: 64, color: '#27ae60' }} />
          <Title level={3} style={{ color: '#2c3e50', marginTop: 16 }}>
            Nenhum pedido no dia selecionado
          </Title>
          <Text type="secondary">Escolha outra data ou aguarde novos pedidos.</Text>
        </Card>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, minmax(220px, 1fr))',
            gap: 16,
            overflowX: 'auto',
            paddingBottom: 6
          }}
        >
          {columns.map(col => (
            <div key={col.title}>
              <div style={{ 
                background: `${statusConfig[col.status].bg}`,
                borderRadius: 12, 
                padding: 12,
                minHeight: 500,
                border: `2px solid ${col.color}`,
                transition: 'background 0.15s ease, box-shadow 0.15s ease',
                backgroundColor: hoverColumn === col.status ? `${col.color}2B` : `${statusConfig[col.status].bg}`,
                boxShadow: hoverColumn === col.status ? `0 0 0 2px ${col.color}33 inset` : 'none'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 16,
                  padding: '12px 0',
                  borderBottom: `2px solid ${col.color}`,
                  borderRadius: 8
                }}>
                  <Text strong style={{ color: col.color, fontSize: 20 }}>
                    {col.title} ({col.orders.length})
                  </Text>
                  {col.status === 'ON_THE_WAY' && (
                    <Tooltip title="Confirmar entrega">
                      <button
                        onClick={handleConfirmAllDelivered}
                        disabled={onTheWayOrders.length === 0}
                        style={{
                          border: 'none',
                          width: 34,
                          height: 34,
                          borderRadius: 8,
                          background: onTheWayOrders.length === 0 ? '#f5f5f5' : '#e8f5e9',
                          color: onTheWayOrders.length === 0 ? '#999' : '#2e7d32',
                          cursor: onTheWayOrders.length === 0 ? 'not-allowed' : 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <CheckCircleOutlined />
                      </button>
                    </Tooltip>
                  )}
                </div>
                
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (dragged) setHoverColumn(col.status);
                  }}
                  onDragLeave={() => {
                    if (hoverColumn === col.status) setHoverColumn(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    void handleDropOnColumn(col.status);
                  }}
                  style={{ minHeight: 420 }}
                >
                  {col.orders.map(order => (
                    <OrderCard 
                      key={order.id} 
                      order={order} 
                      onCancel={handleCancelOrder}
                      onDragStart={(dragOrder) => setDragged({ id: dragOrder.id, status: getEffectiveStatus(dragOrder) })}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

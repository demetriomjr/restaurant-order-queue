import { useState, useEffect } from 'react';
import { Card, Button, Tag, Space, Typography, Row, Col, Statistic, Badge, Tooltip, message } from 'antd';
import { 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  SyncOutlined, 
  BellOutlined,
  PlayCircleOutlined,
  CheckOutlined,
  CarOutlined,
  CoffeeOutlined
} from '@ant-design/icons';
import { useKitchenOrders, useUpdateOrderStatus, useSSE, formatElapsedTime } from '../hooks/useKitchen';

const { Title, Text } = Typography;

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'COMPLETED';

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
  status: OrderStatus;
  total: number;
  items: OrderItem[];
  updatedAt: string;
  createdAt: string;
}

const statusConfig: Record<OrderStatus, { color: string; label: string; icon: any; nextStatus?: OrderStatus }> = {
  PENDING: { color: 'orange', label: 'Pendente', icon: <BellOutlined />, nextStatus: 'CONFIRMED' },
  CONFIRMED: { color: 'blue', label: 'Confirmado', icon: <CheckCircleOutlined />, nextStatus: 'PREPARING' },
  PREPARING: { color: 'purple', label: 'Preparando', icon: <CoffeeOutlined />, nextStatus: 'READY' },
  READY: { color: 'cyan', label: 'Pronto', icon: <PlayCircleOutlined />, nextStatus: 'DELIVERED' },
  DELIVERED: { color: 'green', label: 'Entregue', icon: <CarOutlined /> },
  COMPLETED: { color: 'default', label: 'Finalizado', icon: <CheckOutlined /> }
};

function OrderCard({ order, onUpdateStatus }: { order: Order; onUpdateStatus: (id: string, status: string) => void }) {
  const [elapsed, setElapsed] = useState(formatElapsedTime(order.createdAt));
  const config = statusConfig[order.status];
  const nextConfig = config.nextStatus ? statusConfig[config.nextStatus] : null;

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(formatElapsedTime(order.createdAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [order.createdAt]);

  const isWarning = parseInt(elapsed) > 600;

  return (
    <Card 
      className={`kitchen-card status-${order.status.toLowerCase()}`}
      style={{ marginBottom: 12 }}
      bodyStyle={{ padding: 16 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <Space>
            <Tag color={config.color} style={{ fontSize: 14, padding: '4px 12px' }}>
              {config.icon} {config.label}
            </Tag>
            <Text strong style={{ fontSize: 16, color: '#fff' }}>
              Mesa {order.tableId.replace('table-', '')}
            </Text>
          </Space>
        </div>
        <Tooltip title="Tempo desde o pedido">
          <div className={isWarning ? 'timer-warning' : 'timer-normal'} style={{ fontSize: 16 }}>
            <ClockCircleOutlined /> {elapsed}
          </div>
        </Tooltip>
      </div>

      <div style={{ marginBottom: 12 }}>
        {order.items.map((item, idx) => (
          <div key={idx} style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            padding: '8px 0',
            borderBottom: idx < order.items.length - 1 ? '1px solid #0f3460' : 'none'
          }}>
            <Text strong style={{ fontSize: 18, color: '#fff' }}>
              {item.quantity}x {item.productName}
            </Text>
            {item.notes && (
              <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                Obs: {item.notes}
              </Text>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text type="secondary">Pedido #{order.id.slice(0, 8)}</Text>
        
        {nextConfig && (
          <Button 
            type="primary"
            size="large"
            onClick={() => onUpdateStatus(order.id, config.nextStatus!)}
            icon={nextConfig.icon}
            style={{ 
              background: nextConfig.color === 'cyan' ? '#00d9ff' : undefined,
              borderColor: nextConfig.color === 'cyan' ? '#00d9ff' : undefined
            }}
          >
            {nextConfig.label}
          </Button>
        )}
      </div>
    </Card>
  );
}

export default function KitchenApp() {
  const { orders, loading } = useKitchenOrders();
  const { updateStatus } = useUpdateOrderStatus();
  const { connected } = useSSE();

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      await updateStatus(orderId, status);
      message.success(`Pedido atualizado para ${statusConfig[status as OrderStatus].label}`);
    } catch (error) {
      message.error('Erro ao atualizar status');
    }
  };

  const pendingOrders = orders.filter(o => o.status === 'PENDING');
  const confirmedOrders = orders.filter(o => o.status === 'CONFIRMED');
  const preparingOrders = orders.filter(o => o.status === 'PREPARING');
  const readyOrders = orders.filter(o => o.status === 'READY');

  const columns = [
    { title: 'Novos', orders: pendingOrders, color: '#f39c12' },
    { title: 'Confirmados', orders: confirmedOrders, color: '#3498db' },
    { title: 'Preparando', orders: preparingOrders, color: '#9b59b6' },
    { title: 'Prontos', orders: readyOrders, color: '#00d9ff' }
  ];

  return (
    <div style={{ padding: 16, minHeight: '100vh' }}>
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Space>
            <CoffeeOutlined style={{ fontSize: 32, color: '#e94560' }} />
            <div>
              <Title level={2} style={{ margin: 0, color: '#fff' }}>
                Kitchen Display
              </Title>
              <Text type="secondary">Painel de pedidos da cozinha</Text>
            </div>
          </Space>
          
          <Space>
            <Badge status={connected ? 'success' : 'error'} />
            <Text>{connected ? 'Conectado' : 'Desconectado'}</Text>
            <Tag color="blue">
              {orders.length} pedidos na fila
            </Tag>
          </Space>
        </Row>

        <Row gutter={16} style={{ marginTop: 24 }}>
          <Col span={6}>
            <Card className="kitchen-card" style={{ background: '#1a1a2e' }}>
              <Statistic 
                title={<Text style={{ color: '#888' }}>Pendentes</Text>} 
                value={pendingOrders.length} 
                valueStyle={{ color: '#f39c12', fontSize: 36 }}
                prefix={<BellOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="kitchen-card" style={{ background: '#1a1a2e' }}>
              <Statistic 
                title={<Text style={{ color: '#888' }}>Confirmados</Text>} 
                value={confirmedOrders.length} 
                valueStyle={{ color: '#3498db', fontSize: 36 }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="kitchen-card" style={{ background: '#1a1a2e' }}>
              <Statistic 
                title={<Text style={{ color: '#888' }}>Preparando</Text>} 
                value={preparingOrders.length} 
                valueStyle={{ color: '#9b59b6', fontSize: 36 }}
                prefix={<CoffeeOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="kitchen-card" style={{ background: '#1a1a2e' }}>
              <Statistic 
                title={<Text style={{ color: '#888' }}>Prontos</Text>} 
                value={readyOrders.length} 
                valueStyle={{ color: '#00d9ff', fontSize: 36 }}
                prefix={<PlayCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <SyncOutlined spin style={{ fontSize: 48, color: '#e94560' }} />
          <div style={{ marginTop: 16, color: '#888' }}>Carregando pedidos...</div>
        </div>
      ) : orders.length === 0 ? (
        <Card className="kitchen-card" style={{ textAlign: 'center', padding: 60 }}>
          <CheckCircleOutlined style={{ fontSize: 64, color: '#27ae60' }} />
          <Title level={3} style={{ color: '#fff', marginTop: 16 }}>
            Nenhum pedido na fila
          </Title>
          <Text type="secondary">Aguardando novos pedidos...</Text>
        </Card>
      ) : (
        <Row gutter={16}>
          {columns.map(col => (
            <Col span={6} key={col.title}>
              <div style={{ 
                background: '#16213e', 
                borderRadius: 8, 
                padding: 12,
                minHeight: 400,
                border: `2px solid ${col.color}22`
              }}>
                <div style={{ 
                  textAlign: 'center', 
                  marginBottom: 16,
                  padding: '8px 0',
                  borderBottom: `2px solid ${col.color}`,
                  background: `${col.color}22`,
                  borderRadius: 4
                }}>
                  <Text strong style={{ color: col.color, fontSize: 16 }}>
                    {col.title} ({col.orders.length})
                  </Text>
                </div>
                
                {col.orders.map(order => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    onUpdateStatus={handleUpdateStatus}
                  />
                ))}
              </div>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
import { Typography, Empty, Button, message, List, Modal, Row, Col, Tag } from 'antd';
import { DeleteOutlined, ExclamationCircleOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { useActiveOrders } from '../hooks/useOrder';
import { useMutation } from '@apollo/client';
import { UPDATE_ORDER_STATUS } from '../apollo/queries';
import { commandClient } from '../apollo/client';
import { PageHeader } from '../components/PageHeader';

const { Text } = Typography;

const statusFlow = [
  { status: 'PENDING', label: 'Pendente', color: '#F57C00' },
  { status: 'PREPARING', label: 'Preparando', color: '#7B1FA2' },
  { status: 'ON_THE_WAY', label: 'A caminho da mesa', color: '#148F77' },
  { status: 'DELIVERED', label: 'Entregue', color: '#388E3C' },
  { status: 'CANCELLED', label: 'Cancelado', color: '#D32F2F' }
];

function getStatusLabel(status: string): string {
  const step = statusFlow.find(s => s.status === status);
  return step?.label || status;
}

function getStatusColor(status: string): string {
  const step = statusFlow.find(s => s.status === status);
  return step?.color || '#F57C00';
}

export default function OrderStatusPage({ tableNumber, customerName }: { tableNumber: number; customerName: string }) {
  const tableId = `table-${tableNumber}`;
  const { orders, loading, refetch } = useActiveOrders(tableId);
  const [cancelMutation] = useMutation(UPDATE_ORDER_STATUS, { client: commandClient });

  const activeOrders = orders.filter((o: any) => 
    o.status !== 'DELIVERED' && o.status !== 'COMPLETED' && o.status !== 'CANCELLED'
  );

  const handleCancel = async (orderId: string) => {
    try {
      await cancelMutation({
        variables: { orderId, status: 'CANCELLED' }
      });
      message.success('Pedido cancelado');
    } catch (error) {
      message.error('Erro ao cancelar pedido');
    }
  };

  return (
    <div style={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(180deg, #FFF9F2 0%, #FFF4E7 100%)'
    }}>
      <PageHeader 
        title="Meus Pedidos" 
        icon={<UnorderedListOutlined />} 
        color="linear-gradient(135deg, #7B1FA2 0%, #4A148C 100%)"
        tableNumber={tableNumber}
        customerName={customerName}
      />
      
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {loading ? (
          <Empty description={<Text style={{ fontSize: 24 }}>Carregando pedidos...</Text>} />
        ) : activeOrders.length === 0 ? (
          <Empty 
            description={
              <div>
                <Text type="secondary" style={{ fontSize: 32 }}>Nenhum pedido ativo</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 28 }}>
                  Faça seus pedidos no Cardápio
                </Text>
              </div>
            } 
          />
        ) : (
          <List
            dataSource={activeOrders}
            renderItem={(order: any) => {
              const color = getStatusColor(order.status);
              const statusLabel = getStatusLabel(order.status);
              const isActive = order.status !== 'DELIVERED' && order.status !== 'COMPLETED' && order.status !== 'CANCELLED';
              const items = (order.items as any[]) || [];

              const handleCancelClick = () => {
                Modal.confirm({
                  title: 'Cancelar Pedido',
                  icon: <ExclamationCircleOutlined />,
                  content: 'Tem certeza que deseja cancelar este pedido?',
                  centered: true,
                  width: 560,
                  okText: 'Sim, cancelar',
                  okButtonProps: { 
                    danger: true,
                    style: { height: 48, fontSize: 18, fontWeight: 700, borderRadius: 10, paddingInline: 20 }
                  },
                  cancelText: 'Não',
                  cancelButtonProps: {
                    style: { height: 48, fontSize: 18, fontWeight: 600, borderRadius: 10, paddingInline: 20 }
                  },
                  styles: {
                    body: { fontSize: 20, paddingTop: 16, paddingBottom: 12 }
                  },
                  onOk() {
                    handleCancel(order.id);
                    setTimeout(() => refetch(), 500);
                  }
                });
              };

              return (
                <List.Item style={{ padding: '16px 0', borderBottom: '2px solid #eee' }}>
                  <Row style={{ width: '100%' }} gutter={16}>
                    <Col span={isActive ? 20 : 24}>
                      <Tag color={color} style={{ fontSize: 20, padding: '8px 16px', marginBottom: 12 }}>
                        {statusLabel}
                      </Tag>
                      <List
                        dataSource={items}
                        renderItem={(item: any) => (
                          <List.Item style={{ padding: '8px 0', border: 'none' }}>
                            <Text strong style={{ fontSize: 32 }}>{item.quantity}x {item.productName}</Text>
                          </List.Item>
                        )}
                      />
                    </Col>
                    {isActive && (
                      <Col span={4} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <Button 
                          danger 
                          size="large"
                          icon={<DeleteOutlined style={{ fontSize: 28 }} />}
                          onClick={handleCancelClick}
                          style={{ fontSize: 24, height: 64 }}
                        >
                          Cancelar
                        </Button>
                      </Col>
                    )}
                  </Row>
                </List.Item>
              );
            }}
          />
        )}
      </div>
    </div>
  );
}

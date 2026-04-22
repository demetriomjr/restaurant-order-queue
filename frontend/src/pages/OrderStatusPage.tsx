import { useState } from 'react';
import { Typography, Space, Tag, Progress, Card, Row, Col, Timeline, Descriptions, Button, List, Badge, Divider, Empty } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined, SyncOutlined, RestaurantOutlined, RightOutlined } from '@ant-design/icons';
import { useActiveOrders, useSSEConnection } from '../hooks/useOrder';

const { Title, Text, Paragraph } = Typography;

const statusFlow = [
  { status: 'PENDING', label: 'Pendente', color: 'orange' },
  { status: 'CONFIRMED', label: 'Confirmado', color: 'blue' },
  { status: 'PREPARING', label: 'Preparando', color: 'purple' },
  { status: 'READY', label: 'Pronto', color: 'cyan' },
  { status: 'DELIVERED', label: 'Entregue', color: 'green' },
  { status: 'COMPLETED', label: 'Finalizado', color: 'default' }
];

function getStepIndex(status: string): number {
  return statusFlow.findIndex(s => s.status === status);
}

function StatusTimeline({ status }: { status: string }) {
  const currentStep = getStepIndex(status);
  
  return (
    <div style={{ padding: '16px 0' }}>
      <Row gutter={8}>
        {statusFlow.map((step, index) => (
          <Col span={4} key={step.status}>
            <div style={{ textAlign: 'center', position: 'relative' }}>
              {index <= currentStep ? (
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #B8860B 0%, #8B6914 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  boxShadow: '0 2px 8px rgba(184, 134, 11, 0.3)'
                }}>
                  <CheckCircleOutlined style={{ color: 'white', fontSize: 16 }} />
                </div>
              ) : index === currentStep + 1 ? (
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: '#fff',
                  border: `2px solid ${step.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto'
                }}>
                  <SyncOutlined spin style={{ color: step.color, fontSize: 16 }} />
                </div>
              ) : (
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto'
                }}>
                  <ClockCircleOutlined style={{ color: '#d9d9d9', fontSize: 16 }} />
                </div>
              )}
              <div style={{ marginTop: 8 }}>
                <Text strong={index === currentStep} style={{ fontSize: 11, color: index <= currentStep ? '#2C1810' : '#bfbfbf' }}>
                  {step.label}
                </Text>
              </div>
            </div>
            {index < statusFlow.length - 1 && (
              <div style={{
                position: 'absolute',
                top: 18,
                left: '50%',
                width: '100%',
                height: 2,
                background: index < currentStep ? 'linear-gradient(90deg, #B8860B 0%, #B8860B 100%)' : '#e8e2dc',
                zIndex: -1
              }} />
            )}
          </Col>
        ))}
      </Row>
      <Progress 
        percent={((currentStep + 1) / statusFlow.length) * 100} 
        showInfo={false}
        strokeColor="linear-gradient(90deg, #B8860B 0%, #DAA520 100%)"
        trailColor="#E8E2DC"
        style={{ marginTop: 24 }}
      />
    </div>
  );
}

function OrderCard({ order }: { order: any }) {
  const currentStep = getStepIndex(order.status);
  const items = order.items as any[] || [];

  return (
    <Card 
      style={{ 
        borderRadius: 16,
        boxShadow: '0 4px 16px rgba(44, 24, 16, 0.08)',
        marginBottom: 24
      }}
      bodyStyle={{ padding: 0 }}
    >
      <div style={{
        background: 'linear-gradient(135deg, #2C1810 0%, #4A3428 100%)',
        padding: '20px 24px',
        color: 'white'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <RestaurantOutlined style={{ fontSize: 24 }} />
            <Title level={4} style={{ color: 'white', margin: 0, fontFamily: "'Playfair Display', serif" }}>
              Pedido #{order.id.slice(0, 8)}
            </Title>
          </Space>
          <Tag 
            color={
              order.status === 'PENDING' ? 'orange' :
              order.status === 'CONFIRMED' ? 'blue' :
              order.status === 'PREPARING' ? 'purple' :
              order.status === 'READY' ? 'cyan' :
              order.status === 'DELIVERED' ? 'green' : 'default'
            }
            style={{ fontSize: 12, padding: '4px 16px' }}
          >
            {statusFlow[currentStep]?.label || order.status}
          </Tag>
        </div>
      </div>

      <div style={{ padding: 24 }}>
        <Row gutter={24}>
          <Col xs={24} lg={14}>
            <Text strong style={{ fontSize: 16, fontFamily: "'Playfair Display', serif", display: 'block', marginBottom: 16 }}>
              Status do Pedido
            </Text>
            <StatusTimeline status={order.status} />

            <Divider />

            <Text strong style={{ fontSize: 16, fontFamily: "'Playfair Display', serif", display: 'block', marginBottom: 16 }}>
              Resumo
            </Text>
            <Descriptions column={2} size="small">
              <Descriptions.Item label="Mesa">{order.tableId}</Descriptions.Item>
              <Descriptions.Item label="Total">
                <Text strong style={{ color: '#B8860B', fontSize: 16 }}>
                  R$ {order.total?.toFixed(2)}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Itens">{items.length}</Descriptions.Item>
              <Descriptions.Item label="Atualizado">
                {new Date(order.updatedAt).toLocaleTimeString('pt-BR')}
              </Descriptions.Item>
            </Descriptions>
          </Col>

          <Col xs={24} lg={10}>
            <Text strong style={{ fontSize: 16, fontFamily: "'Playfair Display', serif", display: 'block', marginBottom: 16 }}>
              Itens Pedidos
            </Text>
            <List
              size="small"
              dataSource={items}
              style={{ maxHeight: 250, overflow: 'auto' }}
              renderItem={(item: any, index: number) => (
                <List.Item style={{ padding: '12px 0', borderBottom: index === items.length - 1 ? 'none' : '1px solid #E8E2DC' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <div>
                      <Text>{item.productName}</Text>
                      <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
                        R$ {item.unitPrice.toFixed(2)} cada
                      </Text>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <Badge 
                        count={`x${item.quantity}`} 
                        style={{ background: '#B8860B' }}
                      />
                      <Text strong style={{ display: 'block', color: '#B8860B' }}>
                        R$ {(item.unitPrice * item.quantity).toFixed(2)}
                      </Text>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </Col>
        </Row>
      </div>
    </Card>
  );
}

export default function OrderStatusPage() {
  const [tableId] = useState('table-1');
  const { orders, loading } = useActiveOrders(tableId);
  const { connected } = useSSEConnection(tableId);

  return (
    <div style={{ padding: '24px 32px', minHeight: '100vh' }}>
      <div style={{ marginBottom: 32 }}>
        <Row justify="space-between" align="middle">
          <Space align="center" size={16}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #B8860B 0%, #8B6914 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(184, 134, 11, 0.3)'
            }}>
              <RestaurantOutlined style={{ fontSize: 28, color: 'white' }} />
            </div>
            <div>
              <Title level={2} style={{ margin: 0, fontFamily: "'Playfair Display', serif" }}>
                Acompanhe seu Pedido
              </Title>
              <Text type="secondary">Mesa {tableId.split('-')[1]} • Restaurante Premium</Text>
            </div>
          </Space>
          
          <Space>
            <Badge status={connected ? 'success' : 'error'} />
            <Text type={connected ? 'success' : 'secondary'}>
              {connected ? 'Tempo real' : 'Atualizando...'}
            </Text>
          </Space>
        </Row>
      </div>
      
      {loading ? (
        <Card style={{ borderRadius: 16 }}>
          <div className="loading-pulse" style={{ textAlign: 'center', padding: 40 }}>
            <Text>Carregando pedidos...</Text>
          </div>
        </Card>
      ) : orders.length === 0 ? (
        <Card style={{ borderRadius: 16, textAlign: 'center', padding: 40 }}>
          <Empty 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div>
                <Title level={4} style={{ fontFamily: "'Playfair Display', serif" }}>
                  Nenhum pedido ativo
                </Title>
                <Text type="secondary">
                  Faça seu primeiro pedido no cardápio
                </Text>
              </div>
            }
          />
        </Card>
      ) : (
        <div className="fade-in-up">
          {orders.map((order, idx) => (
            <div key={order.id} style={{ animationDelay: `${idx * 100}ms` }}>
              <OrderCard order={order} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
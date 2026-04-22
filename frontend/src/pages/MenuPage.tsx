import { Badge, Card, Col, Row, Typography, Button, InputNumber, Space, message, List, Tag, Divider, Empty } from 'antd';
import { ShoppingCartOutlined, RestaurantOutlined, CoffeeOutlined, FireOutlined } from '@ant-design/icons';
import { useMenu, useActiveOrders, useCreateOrder } from '../hooks/useOrder';
import { useCartStore } from '../stores/cartStore';
import { useState, useMemo } from 'react';

const { Title, Text, Paragraph } = Typography;

interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
}

const categoryConfig: Record<string, { icon: any; color: string; gradient: string }> = {
  'Pratos Principais': { icon: <RestaurantOutlined />, color: '#B8860B', gradient: 'linear-gradient(135deg, #B8860B 0%, #8B6914 100%)' },
  'Entradas': { icon: <FireOutlined />, color: '#C62828', gradient: 'linear-gradient(135deg, #C62828 0%, #8E0000 100%)' },
  'Saladas': { icon: <RestaurantOutlined />, color: '#2E7D32', gradient: 'linear-gradient(135deg, #43A047 0%, #2E7D32 100%)' },
  'Acompanhamentos': { icon: <RestaurantOutlined />, color: '#F57C00', gradient: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)' },
  'Bebidas Não Alcoólicas': { icon: <CoffeeOutlined />, color: '#1565C0', gradient: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)' },
  'Cervejas': { icon: <CoffeeOutlined />, color: '#F9A825', gradient: 'linear-gradient(135deg, #FBC02D 0%, #F9A825 100%)' },
  'Vinhos': { icon: <CoffeeOutlined />, color: '#7B1FA2', gradient: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)' },
  'Drinks': { icon: <CoffeeOutlined />, color: '#00838F', gradient: 'linear-gradient(135deg, #00ACC1 0%, #00838F 100%)' },
  'Sobremesas': { icon: <RestaurantOutlined />, color: '#E91E63', gradient: 'linear-gradient(135deg, #EC407A 0%, #E91E63 100%)' },
};

function MenuCard({ item, onAdd }: { item: MenuItem; onAdd: (item: MenuItem) => void }) {
  const config = categoryConfig[item.category] || categoryConfig['Pratos Principais'];
  
  return (
    <Card 
      hoverable 
      className="menu-card"
      cover={
        <div style={{ 
          height: 140, 
          background: config.gradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.3) 100%)'
          }} />
          <div style={{ 
            color: 'white', 
            fontSize: 48,
            opacity: 0.3,
            position: 'absolute'
          }}>
            {config.icon}
          </div>
          <div style={{ 
            position: 'absolute',
            bottom: 12,
            left: 16,
            color: 'white',
            fontFamily: "'Playfair Display', serif",
            fontWeight: 600,
            fontSize: 14,
            textTransform: 'uppercase',
            letterSpacing: 1,
            opacity: 0.9
          }}>
            {item.category}
          </div>
        </div>
      }
    >
      <Card.Meta
        title={
          <Text strong style={{ fontSize: 16, fontFamily: "'Playfair Display', serif" }}>
            {item.name}
          </Text>
        }
        description={
          <Paragraph ellipsis={{ rows: 2 }} style={{ color: '#6B5B4F', marginBottom: 8, minHeight: 40 }}>
            {item.description}
          </Paragraph>
        }
      />
      <div style={{ 
        marginTop: 12, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        paddingTop: 12,
        borderTop: '1px solid #E8E2DC'
      }}>
        <Text strong style={{ fontSize: 20, color: '#B8860B', fontFamily: "'Playfair Display', serif" }}>
          R$ {item.price.toFixed(2)}
        </Text>
        <Button 
          type="primary" 
          size="large"
          onClick={() => onAdd(item)}
          style={{ borderRadius: 8 }}
        >
          Adicionar
        </Button>
      </div>
    </Card>
  );
}

function OrderStatusTag({ status }: { status: string }) {
  const config: Record<string, { color: string; label: string }> = {
    'PENDING': { color: 'orange', label: 'Pendente' },
    'CONFIRMED': { color: 'blue', label: 'Confirmado' },
    'PREPARING': { color: 'purple', label: 'Preparando' },
    'READY': { color: 'cyan', label: 'Pronto' },
    'DELIVERED': { color: 'green', label: 'Entregue' },
    'COMPLETED': { color: 'default', label: 'Finalizado' },
  };
  
  const { color, label } = config[status] || { color: 'default', label: status };
  
  return <Tag color={color} style={{ fontSize: 12, padding: '4px 12px' }}>{label}</Tag>;
}

export default function MenuPage() {
  const [tableId] = useState('table-1');
  const { menu, loading } = useMenu();
  const { orders } = useActiveOrders(tableId);
  const { createOrder, loading: creatingOrder } = useCreateOrder();
  const { items, addItem, removeItem, updateQuantity, clear } = useCartStore();

  const currentOrder = orders.find(o => 
    ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'].includes(o.status)
  );

  const groupedMenu = useMemo(() => {
    const groups: Record<string, MenuItem[]> = {};
    menu.forEach(item => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [menu]);

  const cartTotal = useMemo(() => 
    items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0), 
  [items]);

  const handleAddToCart = (item: MenuItem) => {
    addItem({
      productId: item.id,
      productName: item.name,
      quantity: 1,
      unitPrice: item.price
    });
    message.success({
      content: `${item.name} adicionado`,
      duration: 1,
      style: { marginTop: 60 }
    });
  };

  const handleSendOrder = async () => {
    if (items.length === 0) {
      message.warning('Adicione itens ao pedido');
      return;
    }

    try {
      await createOrder(tableId, items);
      clear();
      message.success({
        content: 'Pedido enviado com sucesso!',
        duration: 2,
        style: { marginTop: 60 }
      });
    } catch (error) {
      message.error('Erro ao enviar pedido');
    }
  };

  return (
    <div style={{ padding: '24px 32px', minHeight: '100vh' }}>
      <Row gutter={32}>
        <Col xs={24} lg={16}>
          <div style={{ marginBottom: 32 }}>
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
                  Cardápio
                </Title>
                <Text type="secondary">Mesa {tableId.split('-')[1]} • Restaurante Premium</Text>
              </div>
            </Space>
          </div>

          {loading ? (
            <Card>
              <div className="loading-pulse" style={{ textAlign: 'center', padding: 40 }}>
                <Text>Carregando cardápio...</Text>
              </div>
            </Card>
          ) : (
            Object.entries(groupedMenu).map(([category, items]) => (
              <div key={category} style={{ marginBottom: 32 }} className="fade-in-up">
                <Space align="center" size={12} style={{ marginBottom: 16 }}>
                  <Text strong style={{ fontSize: 22, fontFamily: "'Playfair Display', serif", color: '#2C1810' }}>
                    {category}
                  </Text>
                  <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, #E8E2DC 0%, transparent 100%)' }} />
                  <Text type="secondary">{items.length} itens</Text>
                </Space>
                <Row gutter={[16, 16]}>
                  {items.map((item, idx) => (
                    <Col xs={24} sm={12} xl={8} key={item.id} style={{ animationDelay: `${idx * 50}ms` }}>
                      <MenuCard item={item} onAdd={handleAddToCart} />
                    </Col>
                  ))}
                </Row>
              </div>
            ))
          )}
        </Col>

        <Col xs={24} lg={8}>
          <div style={{ position: 'sticky', top: 24 }}>
            <Card 
              style={{ 
                borderRadius: 16,
                boxShadow: '0 8px 32px rgba(44, 24, 16, 0.12)',
                overflow: 'hidden'
              }}
              bodyStyle={{ padding: 0 }}
            >
              <div style={{
                background: 'linear-gradient(135deg, #2C1810 0%, #4A3428 100%)',
                padding: '20px 24px',
                color: 'white'
              }}>
                <Space>
                  <ShoppingCartOutlined style={{ fontSize: 24 }} />
                  <Title level={4} style={{ color: 'white', margin: 0, fontFamily: "'Playfair Display', serif" }}>
                    Seu Pedido
                  </Title>
                  {items.length > 0 && (
                    <Badge count={items.length} style={{ background: '#B8860B' }} />
                  )}
                </Space>
              </div>

              <div style={{ padding: 20, minHeight: 200 }}>
                {items.length === 0 ? (
                  <Empty 
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      <Text type="secondary">Seu carrinho está vazio</Text>
                    }
                  />
                ) : (
                  <List
                    dataSource={items}
                    renderItem={item => (
                      <List.Item
                        style={{ padding: '12px 0', borderBottom: '1px solid #E8E2DC' }}
                        actions={[
                          <Button 
                            type="text" 
                            danger 
                            size="small"
                            icon={<span style={{ fontSize: 14 }}>✕</span>} 
                            onClick={() => removeItem(item.productId)}
                          />
                        ]}
                      >
                        <List.Item.Meta
                          title={
                            <Text strong style={{ fontSize: 14 }}>{item.productName}</Text>
                          }
                          description={
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              R$ {item.unitPrice.toFixed(2)} cada
                            </Text>
                          }
                        />
                        <InputNumber
                          size="small"
                          min={1}
                          value={item.quantity}
                          onChange={(val) => updateQuantity(item.productId, val || 1)}
                          style={{ width: 60 }}
                        />
                      </List.Item>
                    )}
                  />
                )}
              </div>

              {items.length > 0 && (
                <>
                  <Divider style={{ margin: 0 }} />
                  <div style={{ padding: '16px 20px', background: '#FAF8F5' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                      <Text strong style={{ fontSize: 16 }}>Total</Text>
                      <Title level={4} style={{ margin: 0, color: '#B8860B' }}>
                        R$ {cartTotal.toFixed(2)}
                      </Title>
                    </div>
                    <Button 
                      type="primary" 
                      size="large" 
                      block 
                      onClick={handleSendOrder}
                      loading={creatingOrder}
                      style={{ 
                        height: 52, 
                        fontSize: 16,
                        fontWeight: 600
                      }}
                    >
                      Enviar Pedido
                    </Button>
                  </div>
                </>
              )}
            </Card>

            {currentOrder && (
              <Card style={{ marginTop: 24, borderRadius: 16 }}>
                <Space direction="vertical" style={{ width: '100%' }} size={12}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong style={{ fontFamily: "'Playfair Display', serif", fontSize: 16 }}>
                      Pedido Atual
                    </Text>
                    <OrderStatusTag status={currentOrder.status} />
                  </div>
                  <Divider style={{ margin: '8px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">Pedido</Text>
                    <Text>#{currentOrder.id.slice(0, 8)}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">Itens</Text>
                    <Text>{(currentOrder.items as any[])?.length || 0}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">Total</Text>
                    <Text strong style={{ color: '#B8860B' }}>
                      R$ {currentOrder.total?.toFixed(2)}
                    </Text>
                  </div>
                </Space>
              </Card>
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
}
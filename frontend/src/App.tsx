import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Layout, Menu, Typography, Space } from 'antd';
import { AppstoreOutlined, UnorderedListOutlined, CoffeeOutlined } from '@ant-design/icons';
import MenuPage from './pages/MenuPage';
import OrderStatusPage from './pages/OrderStatusPage';

const { Header, Content, Footer } = Layout;
const { Text } = Typography;

function AppLayout() {
  const location = useLocation();

  return (
    <Layout style={{ minHeight: '100vh', background: 'transparent' }}>
      <Header style={{ 
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #E8E2DC',
        padding: '0 32px',
        height: 72,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <Space size={12}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #B8860B 0%, #8B6914 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(184, 134, 11, 0.3)'
          }}>
            <CoffeeOutlined style={{ fontSize: 22, color: 'white' }} />
          </div>
          <div>
            <Text strong style={{ fontSize: 18, fontFamily: "'Playfair Display', serif", color: '#2C1810' }}>
              Restaurante Premium
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>Sistema de Pedidos</Text>
          </div>
        </Space>

        <Menu 
          mode="horizontal" 
          selectedKeys={[location.pathname]}
          style={{ border: 'none', background: 'transparent', minWidth: 300 }}
          items={[
            {
              key: '/',
              icon: <AppstoreOutlined />,
              label: <Link to="/">Cardápio</Link>
            },
            {
              key: '/status',
              icon: <UnorderedListOutlined />,
              label: <Link to="/status">Meus Pedidos</Link>
            }
          ]}
        />
      </Header>

      <Content style={{ background: 'transparent' }}>
        <Routes>
          <Route path="/" element={<MenuPage />} />
          <Route path="/status" element={<OrderStatusPage />} />
        </Routes>
      </Content>

      <Footer style={{ 
        textAlign: 'center', 
        background: 'transparent',
        padding: '24px 32px',
        borderTop: '1px solid #E8E2DC'
      }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Restaurante Premium © 2026 • Sistema de Pedidos em Tempo Real
        </Text>
      </Footer>
    </Layout>
  );
}

export default function Root() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider, message } from 'antd';
import { useState } from 'react';
import MenuPage from './pages/MenuPage';
import OrderStatusPage from './pages/OrderStatusPage';
import AccountPage from './pages/AccountPage';
import SessionScreen from './pages/SessionScreen';
import BottomNav from './components/BottomNav';
import { useSSEConnection } from './hooks/useOrder';
import { apolloClient } from './apollo/client';
import { GET_ORDERS_BY_TABLE } from './apollo/queries';

interface Session {
  tableNumber: number;
  customerName: string;
}

function SSEConnector({ tableId }: { tableId: string }) {
  useSSEConnection(tableId, (event) => {
    if (event.type && event.type !== 'CONNECTED') {
      void message.info({
        content: 'Atualização recebida em tempo real',
        duration: 3
      });
    }
    void apolloClient.refetchQueries({
      include: [GET_ORDERS_BY_TABLE]
    });
  });
  return null;
}

export default function Root() {
  const [session, setSession] = useState<Session | null>(null);

  const handleJoin = (tableNumber: number, customerName: string) => {
    const newSession = { tableNumber, customerName };
    setSession(newSession);
  };

  const handleLeave = () => {
    setSession(null);
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#FF6F00',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          borderRadius: 12,
        },
      }}
    >
      <BrowserRouter>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          height: '100vh',
          overflow: 'hidden',
        }}>
          {!session ? (
            <SessionScreen onJoin={handleJoin} />
          ) : (
            <>
              <div style={{ 
                flex: 1,
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column',
              }}>
                <Routes>
                  <Route path="/" element={<MenuPage tableNumber={session.tableNumber} customerName={session.customerName} />} />
                  <Route path="/orders" element={<OrderStatusPage tableNumber={session.tableNumber} customerName={session.customerName} />} />
                  <Route path="/account" element={<AccountPage tableNumber={session.tableNumber} customerName={session.customerName} onLeave={handleLeave} />} />
                </Routes>
                {session && <SSEConnector tableId={`table-${session.tableNumber}`} />}
              </div>
              <BottomNav />
            </>
          )}
        </div>
      </BrowserRouter>
    </ConfigProvider>
  );
}

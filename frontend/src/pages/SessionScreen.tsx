import { useState, useRef, useEffect } from 'react';
import { Typography, Input, message } from 'antd';
import { UserOutlined, CoffeeOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

interface SessionScreenProps {
  onJoin: (tableNumber: number, customerName: string) => void;
}

export default function SessionScreen({ onJoin }: SessionScreenProps) {
  const [tableNumber, setTableNumber] = useState<number | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const savedTable = localStorage.getItem('lastTableNumber');
    if (savedTable) {
      setTableNumber(parseInt(savedTable, 10));
    }
  }, []);

  useEffect(() => {
    if (tableNumber) {
      localStorage.setItem('lastTableNumber', tableNumber.toString());
    }
  }, [tableNumber]);

  const handlePress = () => {
    timerRef.current = setTimeout(() => {
      setShowPicker(true);
    }, 3000);
  };

  const handleRelease = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleSelectTable = (num: number) => {
    setTableNumber(num);
    setShowPicker(false);
  };

  const handleJoin = () => {
    if (!tableNumber) {
      message.error('Selecione uma mesa');
      return;
    }
    if (!customerName.trim()) {
      message.error('Digite seu nome');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      onJoin(tableNumber, customerName);
      setLoading(false);
    }, 500);
  };

  if (showPicker) {
    return (
      <div 
        style={{
          height: '100%',
          background: 'linear-gradient(180deg, #FFF8F0 0%, #FFF5EB 100%)',
          padding: '4%',
          touchAction: 'manipulation',
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 16,
        }}>
          {Array.from({ length: 25 }, (_, i) => i + 1).map(num => (
            <button
              key={num}
              onClick={() => handleSelectTable(num)}
              onContextMenu={(e) => e.preventDefault()}
              style={{
                height: 100,
                fontSize: 40,
                fontWeight: 'bold',
                background: tableNumber === num ? '#2E7D32' : '#fff',
                color: tableNumber === num ? '#fff' : '#333',
                border: '3px solid #2E7D32',
                borderRadius: 20,
                cursor: 'pointer',
                touchAction: 'manipulation',
                userSelect: 'none',
                WebkitUserSelect: 'none',
              }}
            >
              {num}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      background: 'linear-gradient(180deg, #FFF8F0 0%, #FFF5EB 100%)',
      padding: '4%',
    }}>
      <div style={{ width: '100%' }}>
        <div style={{ marginBottom: 48, textAlign: 'center' }}>
          <CoffeeOutlined style={{ fontSize: 120, color: '#2E7D32' }} />
        </div>
        
        <Title level={1} style={{ color: '#2E7D32', marginBottom: 48, textAlign: 'center', fontSize: 48 }}>
          Restaurante Kiwi
        </Title>

        <div style={{ width: '100%' }}>
          <div style={{
            background: '#fff',
            borderRadius: 20,
            padding: 24,
          }}>
            <div style={{ marginBottom: 28 }}>
              <Text strong style={{ fontSize: 24, display: 'block', marginBottom: 16 }}>
                Mesa
              </Text>
              <button
                onMouseDown={handlePress}
                onMouseUp={handleRelease}
                onMouseLeave={handleRelease}
                onTouchStart={handlePress}
                onTouchEnd={handleRelease}
                onContextMenu={(e) => e.preventDefault()}
                style={{
                  width: '100%',
                  height: 80,
                  fontSize: 32,
                  fontWeight: 'bold',
                  background: tableNumber ? '#F57F17' : '#f5f5f5',
                  color: tableNumber ? '#fff' : '#999',
                  border: '3px solid #F57F17',
                  borderRadius: 16,
                  cursor: 'pointer',
                  touchAction: 'manipulation',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                }}
              >
                {tableNumber ? `Mesa ${tableNumber}` : '──'}
              </button>
            </div>

            <div style={{ marginBottom: 28 }}>
              <Text strong style={{ fontSize: 24, display: 'block', marginBottom: 16 }}>
                Seu nome
              </Text>
              <Input
                size="large"
                prefix={<UserOutlined />}
                placeholder="Digite seu nome"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                style={{ fontSize: 28, height: 72, width: '100%' }}
                onPressEnter={handleJoin}
              />
            </div>

            <button
              onClick={handleJoin}
              disabled={!tableNumber || !customerName.trim()}
              style={{
                width: '100%',
                height: 72,
                fontSize: 24,
                fontWeight: 'bold',
                background: (tableNumber && customerName.trim()) ? '#2E7D32' : '#ccc',
                color: '#fff',
                border: 'none',
                borderRadius: 16,
                cursor: (tableNumber && customerName.trim()) ? 'pointer' : 'default',
                touchAction: 'manipulation',
              }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
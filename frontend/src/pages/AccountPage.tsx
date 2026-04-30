import { useMemo, useState } from 'react';
import { Card, Typography, List, message, Modal, Row, Col } from 'antd';
import { CheckCircleOutlined, CloseOutlined, CreditCardOutlined, BankOutlined, MobileOutlined, DollarOutlined, WalletOutlined } from '@ant-design/icons';
import { useActiveOrders } from '../hooks/useOrder';
import { PageHeader } from '../components/PageHeader';
import { useMutation } from '@apollo/client';
import { UPDATE_ORDER_STATUS } from '../apollo/queries';
import { commandClient } from '../apollo/client';

const { Text } = Typography;

type PaymentMethod = 'dinheiro' | 'credito' | 'debito' | 'pix';

const PAYMENT_METHODS = [
  { id: 'dinheiro', label: 'Dinheiro', icon: <DollarOutlined /> },
  { id: 'credito', label: 'Crédito', icon: <CreditCardOutlined /> },
  { id: 'debito', label: 'Débito', icon: <BankOutlined /> },
  { id: 'pix', label: 'Pix', icon: <MobileOutlined /> },
];

export default function AccountPage({ tableNumber, customerName, onLeave }: { tableNumber: number; customerName: string; onLeave: () => void }) {
  const tableId = `table-${tableNumber}`;
  const { orders } = useActiveOrders(tableId);
  const [updateOrderStatus] = useMutation(UPDATE_ORDER_STATUS, { client: commandClient });
  const [showModal, setShowModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credito');
  const [precisaTroco, setPrecisaTroco] = useState(false);
  const [valorRecebido, setValorRecebido] = useState('');

  const deliveredOrders = orders.filter((o: any) => 
    o.status === 'DELIVERED' || o.status === 'COMPLETED'
  );

  const consolidatedItems = useMemo(() => {
    const grouped = new Map<string, { productName: string; unitPrice: number; quantity: number }>();

    for (const order of deliveredOrders) {
      const items = (order.items as any[]) || [];
      for (const item of items) {
        const key = `${item.productName}::${Number(item.unitPrice).toFixed(2)}`;
        const existing = grouped.get(key);
        if (existing) {
          existing.quantity += Number(item.quantity) || 0;
        } else {
          grouped.set(key, {
            productName: item.productName,
            unitPrice: Number(item.unitPrice) || 0,
            quantity: Number(item.quantity) || 0
          });
        }
      }
    }

    return Array.from(grouped.values()).sort((a, b) => a.productName.localeCompare(b.productName));
  }, [deliveredOrders]);

  const accountTotal = deliveredOrders.reduce((sum: number, order: any) => sum + (order.total || 0), 0);

  const activeOrders = orders.filter((o: any) =>
    o.status !== 'DELIVERED' && o.status !== 'COMPLETED' && o.status !== 'CANCELLED'
  );

  const cancelActiveOrders = async () => {
    await Promise.all(
      activeOrders.map((order: any) =>
        updateOrderStatus({
          variables: { orderId: order.id, status: 'CANCELLED' }
        }).catch(() => null)
      )
    );
  };

  const closeSession = async (successMessage: string) => {
    await cancelActiveOrders();
    message.success({ content: successMessage, duration: 4 });
    onLeave();
  };

  const handleFecharConta = () => {
    if (accountTotal <= 0) {
      void closeSession('Sessão encerrada. Nenhum consumo registrado.');
      return;
    }

    setPaymentMethod('credito');
    setPrecisaTroco(false);
    setValorRecebido('');
    setShowModal(true);
  };

  const handleConfirmar = () => {
    const metodoLabel = PAYMENT_METHODS.find(m => m.id === paymentMethod)?.label || paymentMethod;
    let msg = `Conta fechada! Método: ${metodoLabel}`;
    
    if (paymentMethod === 'dinheiro' && precisaTroco) {
      const troco = parseFloat(valorRecebido) - accountTotal;
      msg += `. Troco: R$ ${troco.toFixed(2)}`;
    }
    
    setShowModal(false);
    void closeSession(msg);
  };

  const troco = precisaTroco && valorRecebido ? parseFloat(valorRecebido) - accountTotal : 0;

  return (
    <div style={{ 
      height: '100%',
      background: 'linear-gradient(180deg, #FFF8F0 0%, #FFF5EB 100%)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <PageHeader 
        title="Conta" 
        icon={<WalletOutlined />} 
        color="linear-gradient(135deg, #FF6F00 0%, #E65100 100%)"
        tableNumber={tableNumber}
        customerName={customerName}
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        <Text strong style={{ fontSize: 24, marginBottom: 16, display: 'block' }}>Consumo</Text>
        
        {deliveredOrders.length === 0 ? (
          <Card style={{ borderRadius: 12, textAlign: 'center', padding: 32 }}>
            <Text type="secondary" style={{ fontSize: 30, lineHeight: 1.3 }}>Nenhum consumo registrado</Text>
          </Card>
        ) : (
          <List
            dataSource={consolidatedItems}
            renderItem={(item: any) => (
              <List.Item style={{ padding: '14px 0', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 12 }}>
                  <div style={{ display: 'grid', gap: 2 }}>
                    <Text style={{ fontSize: 18, color: '#666', lineHeight: 1.2 }}>Nome</Text>
                    <Text strong style={{ fontSize: 24, lineHeight: 1.2 }}>{item.productName}</Text>
                  </div>
                  <div style={{ display: 'grid', gap: 2 }}>
                    <Text style={{ fontSize: 18, color: '#666', lineHeight: 1.2 }}>Preço unitário</Text>
                    <Text strong style={{ fontSize: 24, lineHeight: 1.2 }}>R$ {item.unitPrice.toFixed(2)}</Text>
                  </div>
                  <div style={{ display: 'grid', gap: 2 }}>
                    <Text style={{ fontSize: 18, color: '#666', lineHeight: 1.2 }}>Quantidade</Text>
                    <Text strong style={{ fontSize: 24, lineHeight: 1.2 }}>{item.quantity}</Text>
                  </div>
                  <div style={{ display: 'grid', gap: 2 }}>
                    <Text style={{ fontSize: 18, color: '#666', lineHeight: 1.2 }}>Total</Text>
                    <Text strong style={{ fontSize: 24, lineHeight: 1.2 }}>R$ {(item.unitPrice * item.quantity).toFixed(2)}</Text>
                  </div>
                </div>
              </List.Item>
            )}
          />
        )}
      </div>

      {/* Footer com botão e total */}
      <div style={{ padding: 16, paddingBottom: 32 }}>
        <Row gutter={16}>
          <Col span={16}>
            <div style={{ 
              height: 72, 
              background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
              borderRadius: 12,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 12,
            }}>
              <Text style={{ fontSize: 16, color: 'white' }}>Total a pagar</Text>
              <Text strong style={{ fontSize: 32, color: 'white' }}>R$ {accountTotal.toFixed(2)}</Text>
            </div>
          </Col>
          <Col span={8}>
            <button
              onClick={handleFecharConta}
              style={{
                width: '100%',
                height: 72,
                backgroundColor: '#FF0000',
                border: 'none',
                borderRadius: 12,
                color: 'white',
                fontSize: 22,
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <CloseOutlined style={{ fontSize: 24 }} /> Fechar Conta
            </button>
          </Col>
        </Row>
      </div>

      {/* Payment Modal */}
      <Modal
        open={showModal}
        onCancel={() => setShowModal(false)}
        footer={null}
        centered
        width={500}
        styles={{ body: { padding: 32 } }}
      >
        <CheckCircleOutlined style={{ fontSize: 56, color: '#FF6F00', marginBottom: 20 }} />
        <Text strong style={{ fontSize: 26, display: 'block', marginBottom: 8 }}>
          Como você quer pagar?
        </Text>
        <Text type="secondary" style={{ fontSize: 18, display: 'block', marginBottom: 28 }}>
          Total: R$ {accountTotal.toFixed(2)}
        </Text>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
          {PAYMENT_METHODS.map((method) => (
            <div
              key={method.id}
              onClick={() => setPaymentMethod(method.id as PaymentMethod)}
              style={{
                padding: '20px 16px',
                borderRadius: 16,
                border: paymentMethod === method.id ? '3px solid #FF6F00' : '2px solid #ddd',
                background: paymentMethod === method.id ? '#FFF8F0' : '#fafafa',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span style={{ fontSize: 32 }}>{method.icon}</span>
              <Text strong style={{ fontSize: 20 }}>{method.label}</Text>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 28, minHeight: 88 }}>
          <div style={{ display: 'flex', gap: 16, opacity: paymentMethod === 'dinheiro' ? 1 : 0 }}>
            <div 
              onClick={() => setPrecisaTroco(!precisaTroco)}
              style={{
                flex: 1,
                padding: '16px 20px',
                borderRadius: 12,
                border: precisaTroco ? '2px solid #FF6F00' : '2px solid #ddd',
                background: precisaTroco ? '#FFF8F0' : '#fafafa',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text strong style={{ fontSize: 18 }}>Precisa de troco?</Text>
              <div style={{ 
                width: 24, 
                height: 24, 
                borderRadius: 12, 
                background: precisaTroco ? '#FF6F00' : '#ddd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: 14,
              }}>
                {precisaTroco && '✓'}
              </div>
            </div>
 
            <div style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, display: 'block', marginBottom: 8, opacity: precisaTroco ? 1 : 0.5 }}>
                Valor a dar
              </Text>
              <input
                type="number"
                value={valorRecebido}
                onChange={(e) => setValorRecebido(e.target.value)}
                placeholder="0,00"
                disabled={!precisaTroco}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  fontSize: 24,
                  borderRadius: 12,
                  border: '2px solid #FF6F00',
                  background: '#fff',
                  opacity: precisaTroco ? 1 : 0.5,
                }}
              />
              {precisaTroco && valorRecebido && troco > 0 && (
                <Text strong style={{ fontSize: 20, color: '#2E7D32', marginTop: 8, display: 'block' }}>
                  Troco: R$ {troco.toFixed(2)}
                </Text>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8 }}>
          <button
            onClick={() => setShowModal(false)}
            style={{
              flex: 1,
              padding: '20px 32px',
              fontSize: 22,
              fontWeight: 'bold',
              borderRadius: 16,
              border: '2px solid #ddd',
              background: '#f5f5f5',
              color: '#333',
              cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            style={{
              flex: 1,
              padding: '20px 32px',
              fontSize: 22,
              fontWeight: 'bold',
              borderRadius: 16,
              border: 'none',
              background: '#2E7D32',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            Confirmar
          </button>
        </div>
      </Modal>
    </div>
  );
}

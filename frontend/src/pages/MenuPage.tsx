import { useState, useMemo } from 'react';
import { Card, Row, Col, Typography, Button, message, Empty, Badge, Modal, Input } from 'antd';
import { PlusOutlined, MinusOutlined, CheckCircleOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useMenu, useCreateOrder } from '../hooks/useOrder';
import { PageHeader } from '../components/PageHeader';

const { Text } = Typography;
const { TextArea } = Input;

interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  imageUrl?: string;
}

const categoryColors: Record<string, string> = {
  'Pratos Principais': '#E65100',
  'Entradas': '#C62828',
  'Saladas': '#2E7D32',
  'Acompanhamentos': '#EF6C00',
  'Bebidas': '#0277BD',
  'Cervejas': '#F9A825',
  'Vinhos': '#7B1FA2',
  'Drinks': '#00838F',
  'Sobremesas': '#D81B60',
};

const gradientBg = `
  radial-gradient(ellipse at 20% 0%, rgba(255,138,0,0.12) 0%, transparent 50%),
  radial-gradient(ellipse at 80% 100%, rgba(255,87,34,0.1) 0%, transparent 50%),
  linear-gradient(180deg, #FFF8F0 0%, #FFF5EB 100%)
`;

function MenuItemCard({ item, quantity, onAdd, onChange }: { 
  item: MenuItem; 
  quantity: number; 
  onAdd: () => void;
  onChange: (qty: number) => void;
}) {
  const color = categoryColors[item.category] || '#E65100';
  const qty = quantity || 1;
  
  return (
    <Card 
      hoverable
      style={{ 
        borderRadius: 14,
        border: quantity > 0 ? `2px solid ${color}` : '1px solid #e8e8e8',
        overflow: 'hidden',
      }}
      bodyStyle={{ padding: 0, display: 'flex', alignItems: 'stretch', minHeight: 140 }}
    >
      <div style={{ width: '45%', position: 'relative', alignSelf: 'stretch', background: '#1f1f1f' }}>
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center center',
              background: '#1f1f1f',
            }}
          />
        ) : (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(135deg, ${color}30 0%, rgba(31,31,31,0.92) 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Text strong style={{ color: '#fff', fontSize: 38, opacity: 0.45, textTransform: 'uppercase' }}>
              {item.category.charAt(0)}
            </Text>
          </div>
        )}
        
        {quantity > 0 && (
          <Badge 
            count={quantity} 
            style={{ 
              position: 'absolute', 
              top: 6, 
              right: 6, 
              background: color,
            }} 
          />
        )}
      </div>
      
      <div style={{ width: '55%', padding: 10, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <Text strong style={{ fontSize: 19, display: 'block', lineHeight: 1.3 }}>
            {item.name}
          </Text>
          <Text strong style={{ fontSize: 22, color, marginTop: 6, display: 'block' }}>
            R$ {item.price.toFixed(2)}
          </Text>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Button
              size="small"
              icon={<MinusOutlined />}
              onClick={() => onChange(Math.max(1, qty - 1))}
              style={{ width: 38, height: 38, fontSize: 18, borderRadius: 8 }}
            />
            <Text strong style={{ minWidth: 30, textAlign: 'center', fontSize: 22 }}>
              {qty}
            </Text>
            <Button
              size="small"
              icon={<PlusOutlined />}
              onClick={() => onChange(Math.min(10, qty + 1))}
              style={{ width: 38, height: 38, fontSize: 18, borderRadius: 8 }}
            />
          </div>
          
          <Button
            type="primary"
            size="middle"
            icon={<CheckCircleOutlined style={{ fontSize: 28 }} />}
            onClick={onAdd}
            style={{ 
              background: color, 
              borderColor: color,
              width: 60,
              height: 60,
              borderRadius: 10,
            }}
          />
        </div>
      </div>
    </Card>
  );
}

interface CategorySectionProps {
  category: string;
  items: MenuItem[];
  quantities: Record<string, number>;
  onQuantityChange: (productId: string, qty: number) => void;
  onOrder: (item: MenuItem) => void;
}

function CategorySection({ category, items, quantities, onQuantityChange, onOrder }: CategorySectionProps) {
  const color = categoryColors[category] || '#E65100';
  
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ 
        marginBottom: 12, 
        padding: '12px 16px',
        background: `${color}15`,
        borderRadius: 12,
        borderLeft: `4px solid ${color}`,
      }}>
        <Text strong style={{ fontSize: 18, color }}>{category}</Text>
      </div>
      <Row gutter={[10, 10]}>
        {items.map(item => (
          <Col xs={12} key={item.id}>
            <MenuItemCard
              item={item}
              quantity={quantities[item.id] || 0}
              onAdd={() => onOrder(item)}
              onChange={(qty) => onQuantityChange(item.id, qty)}
            />
          </Col>
        ))}
      </Row>
    </div>
  );
}

export default function MenuPage({ tableNumber, customerName }: { tableNumber: number; customerName: string }) {
  const tableId = `table-${tableNumber}`;
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [pendingItem, setPendingItem] = useState<MenuItem | null>(null);
  const [pendingQty, setPendingQty] = useState(1);
  const { menu, loading } = useMenu();
  const { createOrder } = useCreateOrder();

  const handleQuantityChange = (productId: string, qty: number) => {
    setQuantities(prev => ({ ...prev, [productId]: qty }));
  };

  const openNoteModal = (item: MenuItem) => {
    const qty = quantities[item.id] || 1;
    setPendingItem(item);
    setPendingQty(qty);
    setNoteText('');
    setIsNoteModalOpen(true);
  };

  const submitOrder = async () => {
    if (!pendingItem) return;
    try {
      await createOrder(tableId, [{
        productId: pendingItem.id,
        productName: pendingItem.name,
        quantity: pendingQty,
        unitPrice: pendingItem.price,
        notes: noteText.trim() || undefined
      }]);
      message.success({ content: `${pendingQty}x ${pendingItem.name} pedido!`, duration: 1.5 });
      setQuantities(prev => ({ ...prev, [pendingItem.id]: 1 }));
      setIsNoteModalOpen(false);
      setPendingItem(null);
      setPendingQty(1);
      setNoteText('');
    } catch {
      message.error('Erro ao fazer pedido');
    }
  };

  const groupedMenu = useMemo(() => {
    const groups: Record<string, MenuItem[]> = {};
    menu.forEach(item => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [menu]);

  return (
    <div style={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: gradientBg,
    }}>
      <PageHeader 
        title="Cardápio" 
        icon={<AppstoreOutlined />} 
        color="linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)"
        tableNumber={tableNumber}
        customerName={customerName}
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
        {loading ? (
          <Empty description="Carregando..." />
        ) : (
          Object.entries(groupedMenu).map(([category, items]) => (
            <CategorySection
              key={category}
              category={category}
              items={items}
              quantities={quantities}
              onQuantityChange={handleQuantityChange}
              onOrder={openNoteModal}
            />
          ))
        )}
      </div>

      <Modal
        open={isNoteModalOpen}
        onCancel={() => {
          setIsNoteModalOpen(false);
          setPendingItem(null);
          setPendingQty(1);
          setNoteText('');
        }}
        onOk={submitOrder}
        okText="Confirmar Pedido"
        cancelText="Cancelar"
        centered
        width="92vw"
        style={{ maxWidth: 760 }}
        styles={{
          content: { borderRadius: 16, padding: 22 },
          header: { marginBottom: 8 },
          body: { paddingTop: 6, paddingBottom: 8 },
          footer: { marginTop: 18 }
        }}
        okButtonProps={{ style: { height: 58, minWidth: 190, fontSize: 22, fontWeight: 700, borderRadius: 12 } }}
        cancelButtonProps={{ style: { height: 58, minWidth: 150, fontSize: 21, fontWeight: 600, borderRadius: 12 } }}
      >
        <div style={{ marginTop: 8 }}>
          <Text strong style={{ fontSize: 32, lineHeight: 1.2, display: 'block', marginBottom: 12 }}>
            {pendingItem ? `${pendingQty}x ${pendingItem.name}` : 'Pedido'}
          </Text>
          <Text style={{ fontSize: 22, color: '#555', lineHeight: 1.35, display: 'block', marginBottom: 12 }}>
            Adicione uma observação (opcional)
          </Text>
          <TextArea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Ex.: sem cebola, ponto da carne, alergia, etc."
            autoSize={{ minRows: 5, maxRows: 8 }}
            maxLength={280}
            style={{ fontSize: 22, lineHeight: 1.35, borderRadius: 12, padding: '12px 14px' }}
          />
        </div>
      </Modal>
    </div>
  );
}

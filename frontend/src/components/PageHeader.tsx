import { Typography } from 'antd';

const { Text, Title } = Typography;

interface PageHeaderProps {
  title: string;
  icon: React.ReactNode;
  color: string;
  tableNumber: number;
  customerName: string;
  rightElement?: React.ReactNode;
}

export function PageHeader({ title, icon, color, tableNumber, customerName, rightElement }: PageHeaderProps) {
  return (
    <div style={{ 
      background: color,
      padding: '24px 32px',
      marginBottom: 8,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontSize: 40, color: 'white' }}>{icon}</span>
        <Title level={2} style={{ color: 'white', margin: 0 }}>
          {title}
        </Title>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: '12px 24px' }}>
          <Text strong style={{ fontSize: 28, color: 'white' }}>
            Mesa {tableNumber} - {customerName}
          </Text>
        </div>
        {rightElement}
      </div>
    </div>
  );
}

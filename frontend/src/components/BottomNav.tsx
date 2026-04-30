import { useLocation, useNavigate } from 'react-router-dom';
import { AppstoreOutlined, UnorderedListOutlined, FileTextOutlined } from '@ant-design/icons';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

function NavItem({ icon, label, active, onClick }: NavItemProps) {
  return (
    <div 
      onClick={onClick}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        padding: '6px 0',
        opacity: active ? 1 : 0.65,
        transition: 'all 0.2s ease',
      }}
    >
      <span style={{ fontSize: 28, display: 'block', color: active ? '#FF6F00' : '#999' }}>
        {icon}
      </span>
      <span style={{ 
        fontSize: 14, 
        fontWeight: 600,
        marginTop: 4,
        color: active ? '#FF6F00' : '#888',
        letterSpacing: 0.3,
      }}>
        {label}
      </span>
    </div>
  );
}

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div style={{
      background: 'linear-gradient(180deg, #FFF8F0 0%, #FFEDE0 100%)',
      borderTop: '1px solid rgba(255,111,0,0.15)',
      display: 'flex',
      padding: '6px 20px 8px',
      paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
      height: 72,
      boxShadow: '0 -2px 16px rgba(255,111,0,0.08)',
    }}>
      <NavItem 
        icon={<AppstoreOutlined />}
        label="Cardápio"
        active={isActive('/')}
        onClick={() => navigate('/')}
      />
      <NavItem 
        icon={<UnorderedListOutlined />}
        label="Pedidos"
        active={isActive('/orders')}
        onClick={() => navigate('/orders')}
      />
      <NavItem 
        icon={<FileTextOutlined />}
        label="Conta"
        active={isActive('/account')}
        onClick={() => navigate('/account')}
      />
    </div>
  );
}
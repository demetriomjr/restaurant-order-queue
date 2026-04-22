import React from 'react'
import ReactDOM from 'react-dom/client'
import { ApolloProvider } from '@apollo/client'
import { ConfigProvider, theme } from 'antd'
import ptBR from 'antd/locale/pt_BR'
import { apolloClient } from './apollo/client'
import App from './App'
import './index.css'

const restaurantTheme = {
  token: {
    colorPrimary: '#B8860B',
    colorSuccess: '#2E7D32',
    colorWarning: '#F57C00',
    colorError: '#C62828',
    colorInfo: '#1565C0',
    borderRadius: 8,
    fontFamily: "'Playfair Display', 'Merriweather', Georgia, serif",
  },
  components: {
    Button: {
      borderRadius: 6,
      controlHeight: 44,
      fontWeight: 500,
    },
    Card: {
      borderRadiusLG: 12,
    },
    Menu: {
      itemBorderRadius: 6,
      itemMarginInline: 8,
    }
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ApolloProvider client={apolloClient}>
      <ConfigProvider 
        locale={ptBR} 
        theme={restaurantTheme}
      >
        <App />
      </ConfigProvider>
    </ApolloProvider>
  </React.StrictMode>,
)
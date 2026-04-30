import React from 'react'
import ReactDOM from 'react-dom/client'
import { ApolloProvider } from '@apollo/client';
import { ConfigProvider } from 'antd';
import ptBR from 'antd/locale/pt_BR';
import KitchenApp from './KitchenApp';
import { queryClient } from './services/clients';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ApolloProvider client={queryClient}>
      <ConfigProvider locale={ptBR}>
        <KitchenApp />
      </ConfigProvider>
    </ApolloProvider>
  </React.StrictMode>,
)

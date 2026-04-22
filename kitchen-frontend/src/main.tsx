import React from 'react'
import ReactDOM from 'react-dom/client'
import { ApolloProvider, InMemoryCache, HttpLink } from '@apollo/client';
import { ApolloClient } from '@apollo/client';
import { ConfigProvider } from 'antd';
import ptBR from 'antd/locale/pt_BR';
import KitchenApp from './KitchenApp';
import './index.css';

const queryClient = new ApolloClient({
  link: new HttpLink({
    uri: 'http://localhost:4002/graphql'
  }),
  cache: new InMemoryCache()
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ApolloProvider client={queryClient}>
      <ConfigProvider locale={ptBR}>
        <KitchenApp />
      </ConfigProvider>
    </ApolloProvider>
  </React.StrictMode>,
)
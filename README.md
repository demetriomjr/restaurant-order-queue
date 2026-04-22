# Restaurant Order Queue

Sistema de pedidos de restaurante em tempo real com arquitetura CQRS + Microsserviços.

## 🚀 Demo

Em desenvolvimento local.

## 📋 Sobre o Projeto

Este é um projeto de portfólio desenvolvido com foco em **vibe coding** - demonstrando o poder de arquiteturas modernas de software através de uma implementação real e funcional.

O sistema permite que clientes façam pedidos via tablet na mesa e acompanhem o status em tempo real. A cozinha recebe os pedidos em um display dedicado e pode atualizar o status de cada pedido.

## 🏗️ Arquitetura

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│   Frontend      │────▶│  Command S.  │────▶│  RabbitMQ   │
│  (Client)       │     │  (port 4001) │     │             │
│  (port 5173)    │     └──────┬───────┘     └──────┬──────┘
└────────┬────────┘            │                    │
         │              GraphQL mutations      domain_events
         │                    │                    │
         │                    ▼                    ▼
         │            ┌──────────────┐     ┌──────────────┐
         │            │  Query S.    │◀────│  RabbitMQ    │
         │            │  (port 4002) │     │  (consumer)  │
         │            └──────┬───────┘     └──────────────┘
         │                   │
         │            GraphQL queries + SSE
         │                   │
         ▼                   ▼
┌─────────────────┐    ┌──────────────┐
│ Kitchen Display │    │   Frontend   │
│  (port 5174)    │    │  (real-time) │
└─────────────────┘    └──────────────┘
```

### Pattern: CQRS (Command Query Responsibility Segregation)

- **Command Service**: Responsável por todas as operações de escrita (mutations GraphQL)
- **Query Service**: Responsável por consultas e notificações em tempo real (SSE + Subscriptions)
- **Kitchen Display**: Interface da cozinha para gerenciar pedidos

### Technology Stack

| Camada | Tecnologia |
|--------|------------|
| Frontend Client | React + Vite + Ant Design + Apollo Client |
| Frontend Kitchen | React + Vite + Ant Design + Apollo Client |
| Backend | Node.js + TypeScript + Express |
| API | GraphQL (graphql-yoga + Nexus) |
| Database | PostgreSQL + Prisma (db push) |
| Message Broker | RabbitMQ |
| Real-time | Server-Sent Events (SSE) + GraphQL Subscriptions |
| Testes Unitários | Vitest |
| Testes E2E | Playwright |

## 📁 Estrutura do Projeto

```
restaurant-order-queue/
├── command-service/           # Microsserviço de comandos (escrita)
│   ├── prisma/               # Schema do banco (write model)
│   └── src/
│       ├── graphql/          # Mutations + Types
│       ├── domain/           # Events + Value Objects + Tests
│       └── infrastructure/   # RabbitMQ publisher
│
├── query-service/            # Microsserviço de consultas (leitura)
│   ├── prisma/               # Schema do banco (read model)
│   └── src/
│       ├── graphql/          # Queries + Subscriptions
│       └── infrastructure/   # SSE + RabbitMQ consumer
│
├── frontend/                 # Aplicação do cliente (tablet)
│   └── src/
│       ├── apollo/           # Client GraphQL
│       ├── hooks/            # Custom hooks
│       ├── pages/            # MenuPage, OrderStatusPage
│       └── stores/           # Zustand stores
│
├── kitchen-frontend/         # Display da cozinha
│   └── src/
│       ├── hooks/            # Kitchen hooks
│       └── services/         # GraphQL queries
│
├── integration-tests/        # Testes de integração
├── e2e-tests/                # Testes E2E (Playwright)
│
├── docker-compose.yml        # Orquestração de containers
├── README.md                 # Este arquivo
├── ROADMAP.md                # Histórico de decisões
└── AGENTS.md                 # Configuração do OpenCode
```

## 🛠️ Como Executar

### Pré-requisitos

- Node.js 20+
- Docker e Docker Compose
- PostgreSQL (via Docker)
- RabbitMQ (via Docker)

### Opção 1: Apenas Banco de Dados + RabbitMQ (desenvolvimento local)

```bash
# Iniciar apenas PostgreSQL e RabbitMQ
docker-compose up db rabbitmq

# Para os containers
docker-compose stop
```

### Opção 2: Desenvolvimento Completo

```bash
# 1. Clone o projeto e instale dependências
cd command-service && npm install && npx prisma generate
cd ../query-service && npm install && npx prisma generate
cd ../frontend && npm install
cd ../kitchen-frontend && npm install

# 2. Inicie o Docker com PostgreSQL e RabbitMQ
docker-compose up -d

# 3. Execute o Prisma DB Push (em cada serviço)
cd command-service && npx prisma db push
cd query-service && npx prisma db push

# 4. Seed do menu (GraphQL Playground no Query Service)
mutation { seedMenu }

# 5. Inicie os serviços (em terminais separados)
# Terminal 1 - Command Service
cd command-service && npm run dev

# Terminal 2 - Query Service
cd query-service && npm run dev

# Terminal 3 - Frontend Cliente
cd frontend && npm run dev

# Terminal 4 - Frontend Cozinha
cd kitchen-frontend && npm run dev
```

### Variáveis de Ambiente

Cada projeto possui `.env.example` e `.env` configurados:

```bash
# command-service/.env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/restaurant_order"
RABBITMQ_URL="amqp://guest:guest@localhost:5672"
CORS_ORIGIN="http://localhost:5173,http://localhost:5174"
PORT=4001

# query-service/.env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/restaurant_order"
RABBITMQ_URL="amqp://guest:guest@localhost:5672"
CORS_ORIGIN="http://localhost:5173,http://localhost:5174"
PORT=4002

# frontend/.env
VITE_API_URL="http://localhost:4002"
VITE_COMMAND_API_URL="http://localhost:4001"

# kitchen-frontend/.env
VITE_API_URL="http://localhost:4002"
```

### Auto-detecção de Portas

Os serviços detectam automaticamente se a porta padrão está em uso e tentam a próxima:
- Command Service: tenta 4001 → 4010
- Query Service: tenta 4002 (mas usa range 4001-4010)

### Opção 3: Produção (Docker)

```bash
# Build e iniciar todos os serviços
docker-compose up --build
```

## 📡 API GraphQL

### Command Service (port 4001, auto-incrementa 4001-4010)

```graphql
# Criar pedido
mutation CreateOrder($tableId: ID!, $items: [OrderItemInput!]!) {
  createOrder(tableId: $tableId, items: $items) {
    id
    status
    total
  }
}

# Atualizar status
mutation UpdateOrderStatus($orderId: ID!, $status: String!) {
  updateOrderStatus(orderId: $orderId, status: $status) {
    id
    status
  }
}

# Adicionar item
mutation AddOrderItem($orderId: ID!, $item: OrderItemInput!) {
  addOrderItem(orderId: $orderId, item: $item) {
    id
    total
  }
}

# Remover item
mutation RemoveOrderItem($orderId: ID!, $productId: String!) {
  removeOrderItem(orderId: $orderId, productId: $productId) {
    id
  }
}
```

### Query Service (port 4002, auto-incrementa)

```graphql
# Buscar pedidos por mesa
query GetOrdersByTable($tableId: String!) {
  ordersByTable(tableId: $tableId) {
    id
    status
    total
    items
  }
}

# Buscar todos os pedidos (cozinha)
query GetAllOrders {
  ordersByTable(tableId: "all") {
    id
    tableId
    status
    items
  }
}

# Cardápio
query GetMenu($category: String) {
  menu(category: $category) {
    id
    name
    price
    category
  }
}

# Subscription (tempo real)
subscription OnOrderUpdated($tableId: String!) {
  orderUpdated(tableId: $tableId) {
    id
    status
    total
  }
}
```

### SSE Endpoint

```javascript
// Frontend subscreve para atualizações em tempo real
const es = new EventSource('http://localhost:4002/sse/table/table-1');
es.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // { type: 'ORDER_STATUS_CHANGED', payload: {...} }
};

// Cozinha recebe todos os pedidos
const es = new EventSource('http://localhost:4002/sse/table/all');
```

## 🎯 Fluxo de Dados

1. **Cliente faz pedido** → Command Service (GraphQL Mutation)
2. **Command Service persiste** → PostgreSQL (write model)
3. **Command Service emite evento** → RabbitMQ (domain_events)
4. **Query Service consome evento** → PostgreSQL (read model)
5. **Query Service notifica** → SSE + GraphQL Subscription
6. **Frontend/Kitchen recebe** → Atualização em tempo real
7. **Cozinha atualiza status** → Command Service → RabbitMQ → Query Service → Cliente

## 📝 Decisões de Arquitetura

- **CQRS**: Separação clara entre operações de leitura e escrita
- **Microsserviços**: Command, Query e 2 Frontends separados
- **Prisma com db push**: Sem migrations, schema sempre sincronizado
- **GraphQL**: API unificada para frontend
- **SSE**: Para notificações em tempo real (mais leve que WebSockets para este caso)
- **RabbitMQ**: Message broker para comunicação entre serviços
- **Nexus**: Schema definition em código TypeScript

## 🧪 Testes e Qualidade de Código

```bash
# Lint - Verificar erros de código
cd command-service && npm run lint
cd query-service && npm run lint
cd frontend && npm run lint
cd kitchen-frontend && npm run lint

# Lint - Corrigir automaticamente
cd command-service && npm run lint:fix

# Testes Unitários
cd command-service && npm run test

# Testes de Integração (serviços devem estar rodando)
cd integration-tests && npm install && npm test

# Testes E2E (serviços devem estar rodando)
cd e2e-tests && npm install && npx playwright install chromium && npm test
```

### Regras ESLint

- `@typescript-eslint/no-unused-vars`: Error
- `@typescript-eslint/no-explicit-any`: Off (facilita desenvolvimento)
- `no-console`: Warning
- Importe extensions desabilitados para compatibilidade com TypeScript

## 📄 Licença

MIT

## 👨‍💻 Autor

[Seu Nome]

---

*Projeto desenvolvido com vibe coding 💻*
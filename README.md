# Restaurant Order Queue

Sistema de pedidos para restaurante com arquitetura **CQRS + Event-Driven**, atualização em tempo real e dois frontends:
- **Tablet da mesa** (cliente)
- **Kitchen Display** (cozinha)

Projeto pensado para portfólio, com foco em fluxo real de operação (pedido, preparo, entrega, consumo e encerramento de sessão).

---

## Visão Geral

O cliente inicia uma sessão na mesa, faz pedidos pelo tablet e acompanha status em tempo real.  
A cozinha recebe os pedidos em um board com colunas por status e move os cards via drag-and-drop.

Toda escrita acontece no **Command Service** e toda leitura/consulta no **Query Service**.  
As mudanças são propagadas por eventos no RabbitMQ e refletidas no frontend via SSE.

---

## Arquitetura

```text
Frontend Tablet ── GraphQL (mutations) ──▶ Command Service (4001)
       ▲                                          │
       │                                          │ publica eventos
       │                                          ▼
SSE (4002) ◀────────────────────────────── RabbitMQ (domain_events)
       │                                          ▲
       ▼                                          │ consome/projeta
Query Service (4002) ── GraphQL (queries) ───────┘
       ▲
       └──────────── Kitchen Frontend (5174)
```

### Responsabilidades

- **Command Service**
  - Escrita de pedidos e mudança de status
  - Publicação de eventos de domínio
- **Query Service**
  - Read model para consultas
  - Projeção de eventos consumidos do RabbitMQ
  - Endpoint SSE para atualização em tempo real
- **Frontend Tablet**
  - Sessão por cliente/mesa
  - Cardápio, pedidos ativos e conta consolidada
- **Kitchen Frontend**
  - Gestão operacional da cozinha por coluna/status
  - Sessão diária por data (filtro de calendário)

---

## Stack

- **Backend:** Node.js, TypeScript, Express, GraphQL Yoga, Prisma
- **Mensageria:** RabbitMQ
- **Banco:** PostgreSQL
- **Frontend:** React + Vite + Ant Design + Apollo Client
- **Tempo real:** SSE + refetch orientado a evento
- **Testes/Lint:** Vitest, ESLint

---

## Funcionalidades Implementadas

### Tablet (Mesa)

- Sessão iniciada por nome do cliente e mesa
- Header contextual em todas as páginas: `Mesa X - Nome do cliente`
- Cardápio com fluxo de observação opcional antes de confirmar pedido
- Pedidos com status traduzidos e alinhados ao fluxo da cozinha
- Conta com itens **consolidados** (nome + preço unitário), exibindo:
  - Nome
  - Preço unitário
  - Quantidade
  - Total
- Fechamento de conta:
  - Se não houve consumo: encerra sessão
  - Se houve consumo: fluxo de pagamento
- SSE ativo durante toda sessão:
  - Atualiza pedidos/conta em background
  - Exibe toast informativa de atualização por 3 segundos

### Cozinha

- Board com colunas:
  - `PENDING`
  - `PREPARING`
  - `ON_THE_WAY`
  - `DELIVERED`
  - `CANCELLED`
- Drag-and-drop entre colunas
- Ação em lote para confirmar entrega na coluna `ON_THE_WAY`
- Regra de domínio aplicada: `CANCELLED` é terminal (não volta)
- Timer operacional com tooltip de tempos por etapa
- Filtro por sessão diária via calendário
- Paleta visual pastel com cards/status diferenciados

---

## Regras de Negócio Relevantes

- Fluxo principal de status: `PENDING -> PREPARING -> ON_THE_WAY -> DELIVERED`
- `CANCELLED` não retorna para outros estados
- `DELIVERED` pode voltar para fluxo operacional se necessário
- Conta consolida itens iguais; aba de pedidos mantém separação operacional

---

## Contrato GraphQL

### Command Service (`:4001/graphql`)

- `createOrder(tableId, items)`
- `updateOrderStatus(orderId, status)`
- `addOrderItem(orderId, item)`
- `removeOrderItem(orderId, productId)`
- `seedMenu`

### Query Service (`:4002/graphql`)

- `ordersByTable(tableId)`
- `order(id)`
- `menu(category)`

### SSE (`:4002/sse/table/:tableId`)

- Atualizações de status e itens para mesa específica e canal `all` (cozinha)

---

## Estrutura do Projeto

```text
restaurant-order-queue/
├── command-service/
├── query-service/
├── frontend/
├── kitchen-frontend/
├── integration-tests/
├── e2e-tests/
├── docker-compose.yml
├── README.md
└── ROADMAP.md
```

---

## Variáveis de Ambiente

### command-service/.env

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/restaurant_order"
RABBITMQ_URL="amqp://guest:guest@localhost:5672"
CORS_ORIGIN="http://localhost:5173,http://localhost:5174"
PORT=4001
```

### query-service/.env

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/restaurant_order"
RABBITMQ_URL="amqp://guest:guest@localhost:5672"
RABBITMQ_QUEUE_NAME="query_service_order_projection"
CORS_ORIGIN="http://localhost:5173,http://localhost:5174"
PORT=4002
```

### frontend/.env

```env
VITE_API_URL="http://localhost:4002"
VITE_COMMAND_API_URL="http://localhost:4001"
```

### kitchen-frontend/.env

```env
VITE_API_URL="http://localhost:4002"
VITE_COMMAND_API_URL="http://localhost:4001"
```

---

## Segurança de Configuração (.env)

- Arquivos `.env` locais **não são versionados** (protegidos no `.gitignore` do repositório).
- Apenas arquivos `.env.example` devem ser commitados, sem segredos reais.
- Antes de abrir PR/push, revise se nenhum `.env` entrou no stage.
- Se algum segredo real for exposto por engano, rotacione imediatamente as credenciais.

Checklist rápido:

```bash
# não deve retornar arquivos .env versionados
git ls-files */.env

# revisar alterações staged antes de commit
git diff --staged
```

---

## Qualidade e Verificação

```bash
cd command-service && npm run lint
cd query-service && npm run lint
cd frontend && npm run lint
cd kitchen-frontend && npm run lint
```

### Testes de Backend

```bash
# Command Service (unit + integridade de commands)
cd command-service && npm test

# Query Service (integridade de SSE manager)
cd query-service && npm test
```

---

## Como Iniciar o Projeto

### 1) Infraestrutura

```bash
docker-compose up -d
```

### 2) Instalar dependências

```bash
cd command-service && npm install && npx prisma generate
cd ../query-service && npm install && npx prisma generate
cd ../frontend && npm install
cd ../kitchen-frontend && npm install
```

### 3) Aplicar schema no banco

```bash
cd command-service && npx prisma db push
cd ../query-service && npx prisma db push
```

### 4) Subir serviços (terminais separados)

```bash
# Terminal 1
cd command-service && npm run dev

# Terminal 2
cd query-service && npm run dev

# Terminal 3
cd frontend && npm run dev

# Terminal 4
cd kitchen-frontend && npm run dev
```

### 5) Acessos

- Tablet: `http://localhost:5173`
- Cozinha: `http://localhost:5174`
- Command GraphQL: `http://localhost:4001/graphql`
- Query GraphQL: `http://localhost:4002/graphql`

---

## E2E (Playwright)

```bash
cd e2e-tests
npm install
npx playwright install chromium
npm test
```

Cenários cobertos atualmente:
- fluxo de sessão e navegação principal do tablet
- abertura do modal de observação no pedido
- carregamento do board da cozinha com colunas atuais
- smoke de API GraphQL (Command + Query) com criação e consulta de pedido

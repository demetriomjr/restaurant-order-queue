# Roadmap do Projeto

Este documento registra o histórico de decisões e prompts durante o desenvolvimento do projeto.

## 📜 Histórico de Decisões

### 2026-04-22 - Decisão Inicial de Arquitetura

**Prompt Original:**
> "nessa pasta onde eu estou rodando o seu terminal, a gente vai criar um projeto para o meu portfólio... Esse projeto vai ter uma arquitetura CQRS... Send for Get e mais com todo alimentação SSE por trás"

**Decisões Tomadas:**
- ✅ Arquitetura CQRS (Command Query Responsibility Segregation)
- ✅ Domain-Driven Design (DDD)
- ✅ Node.js como backend
- ✅ RabbitMQ para comunicação entre microsserviços
- ✅ SSE para tempo real no frontend
- ✅ Vite + React + Ant Design para frontend

---

### 2026-04-22 - Estrutura Clean Architecture

**Prompt Original:**
> "sim por favor. a arquitetura de projeto é clean ok?"

**Decisões Tomadas:**
- ✅ Estrutura de diretórios clean: domain, application, infrastructure, interfaces
- ✅ Entities, Value Objects, Events separados
- ✅ Commands e Queries diferenciados
- ✅ Handlers para cada operação

---

### 2026-04-22 - Separação em Microsserviços

**Prompt Original:**
> "Na verdade, eu quero que você avalie para mim, a gente repartiu o back-end em dois serviços, um comands e outro query... Eu havia falado algo, mas aparentemente você ignorou."

**Decisões Tomadas:**
- ✅ Command Service (port 4001) - GraphQL Mutations
- ✅ Query Service (port 4002) - GraphQL Queries + SSE
- ✅ Cada serviço com seu próprio Prisma schema
- ✅ Write model no Command Service
- ✅ Read model (denormalizado) no Query Service

---

### 2026-04-22 - GraphQL em vez de REST

**Prompt Original:**
> "Então vamos separar o back-end em microsserviços, tá? Uma query e um command, cada um no seu projeto. E a gente, pra ficar mais simples de consumir a API, a gente pode implementar um GraphQL, o que que você acha?"

**Decisões Tomadas:**
- ✅ GraphQL como layer de API
- ✅ graphql-yoga + Nexus para schema
- ✅ Apollo Client no frontend
- ✅ GraphQL Subscriptions para tempo real
- ✅ SSE como fallback/alternativa para subscriptions

---

### 2026-04-22 - Prisma sem Migrations

**Prompt Original:**
> "Eu ia falar do esquema, mas como você já vai usar o esquema do próprio GraphQL, a gente deixa o Prisma de lado. O importante é que a gente não vai trabalhar com migrations aqui, tá? A gente vai trabalhar com DB push, ou seja, forçando o esquema sempre em cima do banco de dados."

**Decisões Tomadas:**
- ✅ Prisma com `db push` (sem migrations)
- ✅ Schema definido em `prisma/schema.prisma`
- ✅ Dois schemas diferentes (write model vs read model)
- ✅ `npx prisma generate` em cada serviço

---

### 2026-04-22 - Fluxo Completo entre Serviços

**Prompt Original:**
> "sim por favor. ja implemente toda a relação entre os microserviços tbm"

**Decisões Tomadas:**
- ✅ Command Service publica eventos para RabbitMQ
- ✅ Query Service consome eventos do RabbitMQ
- ✅ Query Service atualiza read model
- ✅ Query Service notifica frontend via SSE
- ✅ Apollo Client com subscriptions integradas
- ✅ Hooks React para gerenciar estado

---

### 2026-04-22 - Documentação e Infraestrutura

**Prompt Original:**
> "Como isso aqui é um projeto para portfólio, a gente vai ter que criar o README agora... E eu quero criar um outro MD na raiz também, chamado Roadmap. Esse Roadmap, ele funciona da seguinte forma, ele é seu, tá? Ah, você vai alimentando ele, você vai adicionar sempre lá dentro o prompt, um resumo do prompt que eu te der, né, obviamente, e quais as decisões que você tomou em cima disso. Esse projeto em específico, ele é para mostrar o poder da da do Vibe Coding, entendeu? Ele é literalmente para isso... Depois que você escrever os dois MDs, você já pode implementar o na raiz, você vai implementar na raiz toda, não é em cada um dos projetos, tá? É o Docker Compose e o Dockerfile dentro de cada projetos também, pra gente poder rodar em pelo menos os containers de banco de dados e do RabbitMQ no Docker, tá? Me dá a opção de rodar tudo ou só eles, pra poder pelo menos os projetos e código rodar local."

**Decisões Tomadas:**
- ✅ README.md com documentação completa do projeto
- ✅ ROADMAP.md para histórico de decisões e prompts
- ✅ Docker Compose na raiz com todas as opções:
  - `docker-compose up db rabbitmq` - apenas infraestrutura
  - `docker-compose up` - desenvolvimento completo
  - `docker-compose up --build` - produção
- ✅ Dockerfile em cada projeto (command-service, query-service, frontend)
- ✅ Health checks para PostgreSQL e RabbitMQ
- ✅ Volumes persistentes para dados
- ✅ Redes Docker isoladas

---

### 2026-04-22 - Enriquecimento do Cardápio

**Prompt Original:**
> "A gente vai dar uma enriquecida no CID, tá? Eu quero um CID com vários tipos de bebida, desde bebidas simples, como refrigerantes, até alcoólicas. Eu quero nome de pratos de comida famoso também, né? Risoto, rigatoni, pratos de restaurante de quatro a cinco estrelas, tá? Pode deixar bem varied. Eu não sei como a gente vai alimentar a imagem, mas a gente vai ter que alimentar a imagem mais pra frente também. Eu não sei se você consegue gerar ou baixar. Qualquer coisa, é só me avisar."

**Decisões Tomadas:**
- ✅ Cardápio enriquecido com 70+ itens
- ✅ Categorias criadas:
  - Pratos Principais (italiana + internacional)
  - Entradas
  - Saladas
  - Acompanhamentos
  - Bebidas Não Alcoólicas
  - Cervejas
  - Vinhos
  - Drinks
  - Sobremesas
- ✅ Pratos sofisticados: Risoto de Funghi, Rigatoni al Ragú, Pato Confitado, Filé Mignon, etc.
- ✅ Bebidas completas: refrigerantes, sucos, águas, cervejas, wines, drinks clássicos
- ⚠️ Imagens: Precisa ser adicionado futuramente (por enquanto usa gradiente CSS)

---

### 2026-04-22 - Design do Frontend

**Prompt Original:**
> "Agora eu quero que você foque no design do front-end, tá? O front-end ele é, ao mesmo tempo que ele é minimalista, ele é moderno. Ele tem uma colocação de componentes bem cara de restaurante, color palette bem cara de restaurante, tudo orientado àquele ambiente de alimentação, tá? E a interface, ela tem que ser dinâmica para isso. Apesar de eu ter mencionado que é para tablet, ele vai ser aberto no ambiente web, tá? E eu quero que você foque no design do front-end agora."

**Decisões Tomadas:**
- ✅ Paleta de cores premium:
  - Primary: `#B8860B` (Golden/Dourado)
  - Secondary: `#2C1810` (Marrom escuro/wine)
  - Background: `#FAF8F5` (Off-white/quase cream)
  - Borders: `#E8E2DC` (Bege claro)
- ✅ Tipografia: Playfair Display (títulos) + Inter (corpo)
- ✅ Design minimalista e moderno com sombras suaves
- ✅ Cards com hover effect e transições suaves
- ✅ Layout responsivo para tablet e web
- ✅ Header fixo com branding premium
- ✅ Status timeline visual para acompanhar pedidos
- ✅ Categorias com cores distintas no cardápio
- ✅ Badge de notificações e feedback visual

---

### 2026-04-22 - Kitchen Display (Frontend da Cozinha)

**Prompt Original:**
> "Bom, o front-end que tu criou, ele é baseado somente num lado do cliente, né? Agora a gente precisa de um front-end atendente, que é o front-end que a cozinha vai ter para receber os pedidos. Pode implementar esse novo projeto. É microserviços também, tá? Não é o mesmo projeto de front-end, é um front-end separado. Dessa vez você foca menos na modernização e sim mais na funcionalidade. Tem que ser funcional, certo? Ele tem que receber um SSC com os pedidos novos. A cozinha tem que marcar se ela tá preparando, né, enfim, tem todo um processo de status aí que vai ser exibido lá para o cliente."

**Decisões Tomadas:**
- ✅ Novo projeto separado: `kitchen-frontend/`
- ✅ Visual estilo "dark mode" para cozinha (melhor visibilidade)
- ✅ 4 colunasKanban: Pendentes → Confirmados → Preparando → Prontos
- ✅ Timer mostrando tempo desde o pedido
- ✅ Botões para avançar status (PENDING → CONFIRMED → PREPARING → READY → DELIVERED)
- ✅ SSE para receber pedidos em tempo real
- ✅ Polling a cada 5 segundos como backup
- ✅ Estatísticas em tempo real
- ✅ Query modificada no Query Service para buscar todos os pedidos (`tableId: "all"`)
- ✅ Broadcast para "all" no RabbitMQ e SSE

---

### 2026-04-22 - Testes Automatizados

**Prompt Original:**
> "Bom, como esse projeto é para um portfólio, você pode começar dando um git init, criando a branch main, né? E já na- sem trocar de branch mesmo, a gente já pode começar a implementar os testes Unity, Integration e E2E, por favor."

**Decisões Tomadas:**
- ✅ Git init + branch main criada
- ✅ Testes Unitários (Vitest): `command-service/src/domain/Order.test.ts`
- ✅ Testes de Integração (Apollo Client): `integration-tests/api.test.ts`
- ✅ Testes E2E (Playwright): `e2e-tests/tests/flow.test.ts`
- ✅ Configuração Vitest no command-service
- ✅ Configuração Playwright com Chromium
- ✅ Scripts no package.json raiz para rodar todos os testes

---

## 🎯 Próximos Passos Sugeridos

- [ ] Implementar autenticação
- [ ] Adicionar testes unitários
- [ ] Configurar CI/CD
- [ ] Adicionar métricas e logs
- [ ] Implementar cache (Redis)
- [ ] Adicionar validação com Zod
- [ ] Implementar rate limiting
- [ ] Adicionar documentação OpenAPI

---

## 📌 Notas Importantes

- Este é um projeto de portfólio focado em demonstrar **vibe coding** com arquiteturas modernas
- O projeto demonstra CQRS real com microsserviços
- GraphQL é consumido tanto por HTTP quanto por WebSockets
- SSE oferece alternativa mais leve para notificações em tempo real
- Prisma com db push permite evolução rápida do schema em desenvolvimento
- Cardápio multilíngue: pratos internacionais com nomes em português (restaurante brasileiro)
- Categorias ricas: Pratos Principais, Entradas, Saladas, Acompanhamentos, Bebidas Não Alcoólicas, Cervejas, Vinhos, Drinks, Sobremesas
- Fotos dos pratos: A serem adicionadas futuramente (por enquanto usa gradiente CSS)
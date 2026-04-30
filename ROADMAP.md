# Roadmap do Projeto

Este documento registra o histórico de decisões e prompts durante o desenvolvimento do projeto.

## 📜 Histórico de Decisões

### 2026-04-30 - Implementação de Testes Unitários/Integridade nos Backends

**Resumo do Prompt Original:**
> Implementar testes de unidade e de integridade nos backends e confirmar se frontend precisa de unit tests neste contexto.

**Decisões Tomadas:**
- ✅ `command-service` recebeu testes de commands com mock de infraestrutura (regras de status e publicação de eventos)
- ✅ `query-service` recebeu suíte de testes para integridade do gerenciador SSE (broadcast por mesa e broadcast global)
- ✅ `query-service` recebeu testes de projeção (`handleDomainEvent`) para `ORDER_CREATED` e fallback de `tableId` em `ORDER_STATUS_CHANGED`
- ✅ `query-service` passou a ter scripts formais de teste (`test` e `test:watch`) no `package.json`
- ✅ Testes legados do domínio no command foram corrigidos para estabilizar pipeline
- ✅ Execução validada com sucesso: `npm test` em ambos os backends

**Status:** ✅ completo

---

### 2026-04-30 - Hardening de Variáveis de Ambiente para Repositório

**Resumo do Prompt Original:**
> Garantir que variáveis locais de desenvolvimento não sejam publicadas, manter todos os `.env.example` atualizados e documentar práticas necessárias.

**Decisões Tomadas:**
- ✅ Verificado que `.env` locais não estão rastreados pelo Git (`git ls-files */.env` vazio)
- ✅ `command-service/.env.example` e `query-service/.env.example` alinhados com CORS atual (`6173/6174`)
- ✅ `query-service/.env` alinhado com `RABBITMQ_QUEUE_NAME`
- ✅ `kitchen-frontend/.env` alinhado com `VITE_COMMAND_API_URL`
- ✅ README recebeu seção específica de segurança/configuração para `.env` com checklist operacional

**Status:** ✅ completo

---

### 2026-04-30 - Reescrita Completa do README para Portfólio

**Resumo do Prompt Original:**
> Revisar funcionamento completo da aplicação e redigir README apresentável, bem explicado, incluindo instruções de inicialização no final.

**Decisões Tomadas:**
- ✅ README reestruturado com narrativa de portfólio (visão geral, arquitetura, stack e fluxos)
- ✅ Documentadas responsabilidades de Command/Query e integração via RabbitMQ + SSE
- ✅ Funcionalidades detalhadas dos dois frontends (tablet e cozinha)
- ✅ Regras de negócio centrais registradas de forma objetiva
- ✅ Contratos GraphQL e endpoint SSE consolidados
- ✅ Seção de operação reorganizada e **“Como Iniciar o Projeto”** posicionada no rodapé

**Status:** ✅ completo

---

### 2026-04-30 - Toast de Atualização SSE no Tablet

**Resumo do Prompt Original:**
> Exibir toast no frontend tablet quando chegar atualização em tempo real, com desaparecimento automático em 3 segundos.

**Decisões Tomadas:**
- ✅ Conector SSE central do tablet passou a disparar toast ao receber evento (exceto handshake `CONNECTED`)
- ✅ Toast configurada com duração de 3 segundos
- ✅ Mantido refetch automático de pedidos após evento SSE

**Status:** ✅ completo

---

### 2026-04-30 - Rework de Paleta (Cozinha + Pedidos no Tablet)

**Resumo do Prompt Original:**
> Reduzir visual branco/estático com paleta pastel concisa na cozinha e ajustar também a tela de pedidos no tablet.

**Decisões Tomadas:**
- ✅ Cozinha recebeu fundo em gradiente pastel e superfícies de coluna por status
- ✅ Cores de status ajustadas para tons mais suaves e consistentes
- ✅ Card vazio e painel de sessão da cozinha alinhados com a nova paleta
- ✅ Tela de pedidos do tablet deixou de usar fundo branco puro e passou para gradiente pastel

**Status:** ✅ completo

---

### 2026-04-30 - Nome do Cliente no Header do Tablet

**Resumo do Prompt Original:**
> Exibir no header das 3 páginas do tablet o contexto da sessão como `Mesa X - Nome do cliente`.

**Decisões Tomadas:**
- ✅ `PageHeader` recebeu `customerName` como prop obrigatória
- ✅ Header atualizado para mostrar `Mesa {número} - {nome do cliente}`
- ✅ Propagação do `customerName` feita via sessão em `App.tsx` para Cardápio, Pedidos e Conta

**Status:** ✅ completo

---

### 2026-04-30 - Consolidação de Itens Iguais na Conta (Tablet)

**Resumo do Prompt Original:**
> Na conta, itens iguais devem aparecer consolidados; manter separado apenas na tela de pedidos.

**Decisões Tomadas:**
- ✅ Conta do tablet passou a agrupar itens iguais por nome + preço unitário
- ✅ Quantidade e total são somados no resumo consolidado
- ✅ Observação (`notes`) não é usada na conta consolidada
- ✅ Separação cronológica dos pedidos permanece na aba de pedidos

**Status:** ✅ completo

---

### 2026-04-30 - Mini Rework da Conta no Tablet (UX de Consumo)

**Resumo do Prompt Original:**
> Remover referência irrelevante de ID de pedido na conta e mostrar apenas nome, preço unitário, quantidade e total, com visual tablet-first.

**Decisões Tomadas:**
- ✅ Removido texto técnico de pedido (`Pedido #...`) da tela de conta
- ✅ Lista de consumo simplificada por item com 4 informações: nome, unitário, quantidade e total
- ✅ Tipografia e espaçamento ampliados para leitura/toque em tablet

**Status:** ✅ completo

---

### 2026-04-30 - SSE Contínuo no Tablet + Alinhamento de Status da Cozinha

**Resumo do Prompt Original:**
> Atualizar frontend tablet em tempo real via SSE sem depender de troca de aba e alinhar status/cores/traduções com a cozinha.

**Decisões Tomadas:**
- ✅ Conexão SSE do tablet centralizada no `App` durante toda a sessão da mesa
- ✅ A cada evento SSE, o Apollo refaz queries de pedidos para atualizar UI em qualquer aba (Pedidos/Conta)
- ✅ Removida conexão SSE duplicada da página de pedidos
- ✅ Status do tablet alinhados ao fluxo da cozinha (`PENDING`, `PREPARING`, `ON_THE_WAY`, `DELIVERED`, `CANCELLED`)
- ✅ Tradução adicionada para `ON_THE_WAY` como **A caminho da mesa**

**Status:** ✅ completo

---

### 2026-04-30 - Escala Tablet-First no Modal de Observação da Mesa

**Resumo do Prompt Original:**
> Ajustar modal de observação do pedido para proporções tablet-first e registrar regra explícita para não voltar ao padrão desktop.

**Decisões Tomadas:**
- ✅ Modal de observação do `frontend` redimensionado para largura responsiva ampla em tablet
- ✅ Tipografia do título, descrição e textarea aumentada para leitura touch
- ✅ Botões de ação do modal ampliados com altura/largura de toque confortáveis
- ✅ Diretriz tablet-first registrada no `AGENTS.md` para o frontend da mesa

**Status:** ✅ completo

---

### 2026-04-30 - Regra de Estado Terminal + Sessão Diária na Cozinha

**Resumo do Prompt Original:**
> Definir que cancelado não volta para trás; entregue pode voltar/cancelar. Substituir indicador online por calendário para sessão diária da cozinha e exibir cards do dia selecionado.

**Decisões Tomadas:**
- ✅ Regra de domínio no `command-service`: pedido `CANCELLED` não pode transicionar para outro status
- ✅ UI da cozinha reforça a regra: cards cancelados não são arrastáveis e drop inválido mostra aviso
- ✅ Indicador de online removido do topo da cozinha
- ✅ Adicionado seletor de data (calendário) para sessão diária
- ✅ Board agora filtra pedidos pela data da sessão selecionada

**Status:** ✅ completo

---

### 2026-04-30 - Timer Total no Card + Tooltip por Etapa + Persistência no Command

**Resumo do Prompt Original:**
> Remover tempo de pedidos entregues e exibir, no relógio da cozinha, tempo total desde o pedido com tooltip detalhando tempo em cada etapa; persistir datas para cronanálise.

**Decisões Tomadas:**
- ✅ Card `DELIVERED` não mostra relógio (assim como `CANCELLED`)
- ✅ Relógio de cards ativos passou a mostrar tempo total desde criação do pedido
- ✅ Tooltip do relógio exibe tempos por etapa (`Pedido`, `Preparando`, `A caminho`)
- ✅ Persistência de timestamps de etapa adicionada também no banco do `command-service`
- ✅ Eventos de domínio passam a carregar timestamps de etapa para projeção consistente no `query-service`

**Status:** ✅ completo

---

### 2026-04-30 - Timer por Etapa no Board da Cozinha

**Resumo do Prompt Original:**
> O timer dos cards da cozinha deve ser por coluna/status: tempo desde criação (pendente), desde início de preparo e desde saída para entrega.

**Decisões Tomadas:**
- ✅ Timer modelado por etapa no read model (`query-service`) com campos dedicados:
- ✅ `pendingStartedAt`, `preparingStartedAt`, `onTheWayStartedAt`
- ✅ Projeção CQRS atualiza timestamps com base no `occurredAt` dos eventos
- ✅ GraphQL do Query Service expõe os novos campos no tipo `Order`
- ✅ Kitchen frontend passa a calcular o cronômetro conforme status atual do card

**Status:** ✅ completo

---

### 2026-04-30 - Correção GraphQL no Drag-and-Drop da Cozinha

**Resumo do Prompt Original:**
> Investigar erro "Schema is not configured to execute mutation operation" ao mover card no board da cozinha via drag-and-drop.

**Decisões Tomadas:**
- ✅ Separado cliente Apollo do kitchen por responsabilidade CQRS:
- ✅ `queryClient` aponta para Query Service (`:4002`) para leituras/subscriptions
- ✅ `commandClient` aponta para Command Service (`:4001`) para mutations (`updateOrderStatus`)
- ✅ Hook `useUpdateOrderStatus` ajustado para executar mutation no `commandClient`
- ✅ Variável `VITE_COMMAND_API_URL` adicionada ao `kitchen-frontend/.env.example`
- ✅ README atualizado com a nova variável de ambiente do Kitchen

**Status:** ✅ completo

---

### 2026-04-30 - Feedback Imediato de UI ao Mover Card na Cozinha

**Resumo do Prompt Original:**
> O card é movido com sucesso, mas a UI não reflete imediatamente a mudança de coluna.

**Decisões Tomadas:**
- ✅ Implementado estado otimista local por `orderId` no board da cozinha
- ✅ Ao arrastar/cancelar/confirmar entrega, o card muda de coluna imediatamente na UI
- ✅ Em caso de falha na mutation, o estado otimista é revertido
- ✅ Estado otimista é limpo automaticamente quando o Query Service confirma o novo status

**Status:** ✅ completo

---

### 2026-04-30 - Observação no Pedido + Ajuste Visual da Mesa no Kitchen

**Resumo do Prompt Original:**
> Adicionar outline no nome da mesa no card da cozinha e introduzir observação opcional no pedido via modal ao clicar em pedir.

**Decisões Tomadas:**
- ✅ Nome da mesa no card da cozinha ganhou outline para parecer componente visual dedicado
- ✅ Fluxo de pedido no tablet deixou de enviar imediatamente ao clicar em pedir
- ✅ Aberto modal de confirmação com campo de observação opcional antes do envio
- ✅ Observação enviada no payload do item como `notes`
- ✅ Mapeamento do hook de criação atualizado para repassar `notes` à mutation

**Status:** ✅ completo

---

### 2026-04-30 - Ajuste de Status no Kitchen Frontend

**Resumo do Prompt Original:**
> No kit frontend da cozinha, usar apenas os status: pendente, preparando, a caminho da mesa e entregue; remover status pronto.

**Decisões Tomadas:**
- ✅ Fluxo do Kitchen atualizado para `PENDING -> PREPARING -> ON_THE_WAY -> DELIVERED`
- ✅ Removidas referências visuais a `READY/Pronto` no board e nos cards
- ✅ Coluna e métrica renomeadas para **A caminho da mesa**
- ✅ Board do kitchen ajustado para 4 colunas, incluindo **Entregue**
- ✅ Board da cozinha expandido para 5 colunas, incluindo **Cancelado**
- ✅ Hook da cozinha ajustado para manter pedidos `DELIVERED` na lista (não remover no update local)
- ✅ Estilo de status ajustado em CSS para `status-on-the-way`
- ✅ Removido bloco redundante de cards-resumo no topo (status ficam só no board)
- ✅ Removido botão de "mover status" dos cards da cozinha
- ✅ Mantido apenas botão discreto de cancelar no canto do card (status `CANCELLED`)
- ✅ Mesa movida para a mesma linha superior de status/tempo/ação nos cards
- ✅ Coluna `Cancelado` não exibe relógio de tempo decorrido
- ✅ Texto dos cards com seleção desabilitada para preparar drag-and-drop
- ✅ Drag-and-drop implementado entre colunas de status no board da cozinha
- ✅ Ordenação automática por idade/entrada na coluna (sem reorder manual por arraste dentro da coluna)
- ✅ Botão no header de **A caminho da mesa** para confirmar entrega em lote (`DELIVERED`)

**Status:** ✅ completo

---

### 2026-04-30 - Escala de Placeholder na Aba de Conta

**Resumo do Prompt Original:**
> Aumentar texto de placeholder "Nenhum consumo registrado" para legibilidade adequada em tablet.

**Decisões Tomadas:**
- ✅ Placeholder de estado vazio da conta escalado para tipografia maior
- ✅ Ajuste focado em leitura tablet-first sem alterar fluxo funcional da tela

**Status:** ✅ completo

---

### 2026-04-30 - Modal de Cancelamento em Tablet First

**Resumo do Prompt Original:**
> Ajustar modal de confirmação de cancelamento de pedido para proporção tablet-first e posição central na tela.

**Decisões Tomadas:**
- ✅ Modal de confirmação de cancelamento configurado como centralizado (`centered`)
- ✅ Largura aumentada para melhor leitura/toque em tablet
- ✅ Botões de confirmação/cancelamento com altura e tipografia maiores
- ✅ Ajuste de tipografia do corpo do modal para legibilidade em tela touch

**Status:** ✅ completo

---

### 2026-04-30 - Tweak Visual do Cardápio (Cards com Imagem)

**Resumo do Prompt Original:**
> Ajustar cards do cardápio para imagem ocupar toda a altura do componente, inclusive quando o card crescer por texto, com recorte central e fallback escuro.

**Decisões Tomadas:**
- ✅ Área de imagem do card passou a ocupar 100% da altura do card
- ✅ Card mantém crescimento dinâmico por conteúdo sem “quebra” visual da coluna da imagem
- ✅ Preparado suporte para imagem real com `object-fit: cover` e `object-position: center`
- ✅ Adicionado fallback escuro/gradiente enquanto não houver imagem cadastrada
- ✅ Técnica atual de troca de mesa/sessão local foi preservada sem mudanças

**Status:** ✅ completo

---

### 2026-04-30 - Ajuste de Sessão no Frontend da Mesa

**Resumo do Prompt Original:**
> Corrigir fluxo de sessão da mesa para não reabrir sessão antiga automaticamente, e encerrar sessão corretamente ao fechar conta.

**Decisões Tomadas:**
- ✅ Removida restauração automática de sessão por `localStorage` no `frontend`
- ✅ Sessão passa a iniciar sempre fechada após reinício/reload da aplicação
- ✅ Sessão só é aberta após identificação do cliente na tela inicial
- ✅ `Fechar Conta` agora encerra sessão e retorna para tela de identificação
- ✅ Pedidos em andamento são cancelados ao encerrar sessão (`status: CANCELLED`)
- ✅ Quando total da conta é `R$ 0,00`, sessão é encerrada diretamente sem fluxo de pagamento

**Status:** ✅ completo

---

### 2026-04-30 - Refatoração CQRS para Estrutura de Portfólio

**Resumo do Prompt Original:**
> Analisar e refatorar estrutura de Command/Query para seguir padrões CQRS mais apresentáveis e limpos para portfólio.

**Decisões Tomadas:**
- ✅ `command-service` ficou mutation-only no GraphQL (sem queries de leitura de negócio)
- ✅ Separação explícita de camadas no Command:
  - `interfaces/graphql/schema.ts` para contrato GraphQL
  - `application/commands.ts` para casos de uso de escrita
  - `infrastructure/persistence.ts` para Prisma + RabbitMQ
- ✅ Eliminada escrita duplicada de cardápio no `query-service`:
  - removida mutation `seedMenu` da Query API
  - removido `seedMenu` do read side
  - leitura de menu passa a refletir apenas estado persistido
- ✅ Removido código GraphQL órfão em `query-service/src/graphql/*` (refactor incompleto)
- ✅ Contrato e documentação alinhados com o runtime atual (README atualizado)

**Status:** ✅ completo

---

### 2026-04-30 - Hardening do Event-Driven (Command/Query/RabbitMQ)

**Resumo do Prompt Original:**
> Revisar integração backend entre Command e Query via RabbitMQ/Event Driven e corrigir problemas de confiabilidade e propagação em tempo real.

**Decisões Tomadas:**
- ✅ Query Service agora usa fila durável nomeada (`query_service_order_projection`) em vez de fila efêmera exclusiva
- ✅ Consumer da Query ganhou tratamento explícito de erro com `try/catch`, `ack` em sucesso e `nack(requeue=false)` em falha
- ✅ Eventos `ORDER_STATUS_CHANGED`, `ORDER_ITEM_ADDED` e `ORDER_ITEM_REMOVED` passaram a incluir `tableId`
- ✅ Broadcast/SSE e pubsub para kitchen (`all`) foram alinhados para eventos de item
- ✅ Publicação de eventos no Command migrou para `confirm channel` com verificação de confirmação do broker
- ✅ Publicação de eventos no fluxo GraphQL do Command virou `await` para não falhar silenciosamente
- ✅ Teste de integração foi sincronizado com schema atual da Query (remoção de `activeOrdersByTable`)
- ✅ README atualizado com contrato de eventos e configuração da fila durável
- ✅ `.env.example` da Query atualizado com `RABBITMQ_QUEUE_NAME`

**Status:** ✅ completo

---

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
  - `docker compose up -d db redis rabbitmq` - infraestrutura
  - `docker compose up` - desenvolvimento completo
- ✅ Dockerfile em cada projeto (command-service, query-service, frontend)
- ✅ Health checks para PostgreSQL e RabbitMQ
- ✅ Volumes persistentes para dados
- ✅ Redes Docker isoladas

---

### 2026-04-22 - Enriquecimento do Cardápio

**Prompt Original:**
> "A gente vai dar uma enriquecida no CID, tá? Eu quero um CID com vários tipos de bebida, desde bebidas simples, como refrigerantes, até alcoólicas. Eu quero nome de pratos de comida famoso também, né? Risoto, rigatoni, pratos de restaurante de quatro a cinco estrelas, tá? Pode deixar bem varied. Eu não sei como a gente vai alimentar a imagem, mas a gente vai ter que alimentar a imagem mais pra frente também. Eu não sei se você consegue gerar ou baixar. Qualquer coisa, é só me avisar."

**Decisões Tomadas:**
- ✅ Cardápio enriquecido com 42 itens iniciais
- ✅ Categorias criadas:
  - Pratos Principais
  - Entradas
  - Saladas
  - Acompanhamentos
  - Bebidas
  - Cervejas
  - Vinhos
  - Drinks
  - Sobremesas
- ⚠️ Imagens: Precisa ser adicionado futuramente

---

### 2026-04-24 - Redesign Completo do Frontend (Tablet/iOS/Android)

**Prompt Original:**
> "Vamos falar do layout do menu agora, tá? Muito em breve eu vou... eu vou criar as imagens para cada item aí que a gente tem, mas por enquanto vamos trabalhar de uma forma simples, tá? Primeiro, a grade, o grid, né, é de dois itens na largura, ou seja, um row de dois itens, não de três como está. Foto à esquerda, ocupando 50% da altura e da largura, é com bem pouco padding no componente principal, tá? Porque eu quero que a foto ocupe o máximo de espaço possível. Logo abaixo da foto, a gente vai ter o preço e ao lado da foto a gente vai ter o nome do prato e a descrição. O botão adicionar, na verdade não é adicionar, é pedir, tá? Como que isso aqui vai funcionar? Toda vez que o usuário clica ali, ele vai poder pedir. Ele simplesmente manda pra cozinha pra pedir, entendeu? Então ele não vai montar um carrinho. Isso aqui é atendimento imediato. Ele clicou pra pedir, já vai chegar lá na cozinha pra começar a ser feito. Então a gente vai ter um selector ali, bem iPad friendly, pra selecionar a quantidade de 1 a 10 e o botão adicionar ele não precisa ter adicionar. No caso, seria o botão pedir, mas pode só usar o ícone sem texto."

**Decisões Tomadas:**
- ✅ Grid de 2 colunas para tablet
- ✅ Layout: imagem 50% esquerda / texto + botões 50% direita
- ✅ Pedido imediato (sem carrinho) - clique = envía para cozinha
- ✅ Seletor de quantidade 1-10 com botões +/- (iPad friendly)
- ✅ Botão "Pedir" círculo com ícone ✓ (sem texto)
- ✅ Bottom navigation bar estilo iOS/Android (3 abas)
- ✅ Fundo moderno com gradientes (cores quentes)
- ✅ Header com gradiente horizontal
- ✅ Containers agrupados por categoria
- ✅ Seed automático ao iniciar Command Service
- ✅ Cache em memória no Query Service

---

### 2026-04-24 - Header Uniforme e Cores por Página

**Prompt Original:**
> "Pode aumentar o tamanho do botão pedir, tá? Gostei do layout. Ah, o agrupamento de pratos, hoje tu tá colocando um chipzinho lá dentro, né? Eu não quero assim. Eu quero que o grupo de cards fique dentro de um grupo, tá? Tu remove aquele chipzinho dizendo se é acompanhamento, o que que é, e eu quero containers agrupando tudo. Eu não quero do jeito que tá hoje, e o botão pedir pode ser maior."

> "Na conta, você não precisa exibir a mesa dentro do container principal, já que a gente está exibindo no header, beleza? Tu só vai exibir a lista de consumo que foi pedido, né? E o total lá embaixo. E é isso."

> "Pode remover essas informações de Wi-Fi. O layout da lista de consumo não tá bom. pode dar uma melhorada nisso. Tá muito genérico, tá muito não moderno, não combina com o resto do design. Você pode pegar muitos elementos do formato aqui do cardápio. A única diferença é que a lista vai ser 100% horizontal, né? Vai ser do tipo row list, uma list view. E aí tu vai adicionar o botão fechar conta. botão fechar conta, o usuário vai escolher a forma de pagamento e aí vai aparecer uma mensagem para ele... para ele aguardar um atendente ir até a mesa dele e receber a conta. Como o ambiente é de teste, para o ambiente de teste a gente vai ter um botão conta recebida ali na tela, que vai resetar a conta, né? Vai zerar a conta e o pedido. Por enquanto, só implementar isso."

**Decisões Tomadas:**
- ✅ Headers uniformes em todas as páginas:
  - Cardápio: header laranja (#FF6F00)
  - Pedidos: header roxo (#7B1FA2)
  - Conta: header laranja (#FF6F00)
- ✅ Ícone grande + título em cada página
- ✅ Mesa exibida no header (direita)
- ✅ Ordem das tabs: Cardápio | Pedidos | Conta
- ✅ Layout da Conta reformado:
  - Lista horizontal de pedidos (estilo Cardápio)
  - Total geral com gradiente
  - Botão "Fechar Conta"
  - Modal de confirmação
- ✅ Container de grupo com borda colorida no Cardápio
- ✅ Botão pedir aumentado (52x52)

---

### 2026-04-24 - Seed Automático e Portas Customizadas

**Prompt Original:**
> "Eu vou precisar subir alguns serviços pro meu Docker, tá? Os ambientes do tipo serviço, né, que são os projetos Node e React, eu vou rodar local pelo terminal, mas os bancos de dados e o RabbitMQ eu vou rodar no Docker. Eu não vou instalar esses pacotes localmente no meu computador."

**Decisões Tomadas:**
- ✅ Docker Compose com perfil `infra`
- ✅ PostgreSQL + Redis + RabbitMQ no Docker
- ✅ Portas customizadas: Frontend 6173, Kitchen 6174
- ✅ Seed automático ao iniciar Command Service
- ✅ Cache em memória no Query Service

---

## 🎯 Próximos Passos Sugeridos

- [ ] Adicionar imagens reais aos pratos
- [ ] Implementar autenticação
- [ ] Adicionar testes unitários
- [ ] Configurar CI/CD
- [ ] Adicionar métricas e logs
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
- Cardápio com pratos em português brasileiro (restaurante brasileiro)
- Design para tablet/iOS/Android com cores quentes
- Seed automáticopopula banco ao iniciar Command Service

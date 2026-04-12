# 🛍️ Digital Store - Plataforma de Vendas de Produtos Digitais

Uma plataforma moderna e completa para vender produtos digitais, com catálogo, carrinho de compras, checkout seguro e mais.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Setup & Installation](#-setup--installation)
- [Project Structure](#-project-structure)
- [Documentation](#-documentation)
- [Commands](#-commands)

---

## ✨ Features

### ✅ Implementado

- 📦 **Catálogo de Produtos**
  - Listagem paginada com 6, 12 ou 24 itens
  - Filtros por categoria
  - Ordenação: Mais recente, Popular, Preço (asc/desc), Rating
  - Busca por texto em tempo real

- 📄 **Página Individual de Produto**
  - Imagem, descrição, preço
  - Rating com estrelas
  - Tamanho do arquivo
  - Breadcrumb navegável
  - Cards de benefícios

- 🎨 **Design System**
  - 50+ componentes UI prontos
  - Tailwind CSS
  - Dark mode integrado
  - Responsivo (mobile, tablet, desktop)

- 🛒 **Carrinho de Compras**
  - Persistência em localStorage
  - Adicionar/remover itens
  - Atualizar quantidade
  - Cálculo automático de total

- 🗄️ **Database**
  - Schema completo (Drizzle ORM)
  - Tabelas: users, products, orders, downloads, reviews, etc.

- 🔐 **Autenticação**
  - OAuth com Manus
  - Gerenciamento de sessão com cookies

### 🚧 Em Progresso / TODO

- 💳 **Checkout**
  - Integração Stripe
  - Processamento de pagamentos
  
- 📋 **Dashboard Admin**
  - CRUD de produtos
  - Upload de arquivos (S3)
  - Análise de vendas

- ⭐ **Reviews & Ratings**
  - Sistema de avaliações
  - Comentários verificados

- 📊 **Relatórios & Analytics**

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Wouter** - Routing
- **Shadcn/UI** - Component library
- **React Query (TanStack)** - Data fetching
- **tRPC** - Type-safe API

### Backend
- **Node.js** - Runtime
- **Express** - Server framework
- **tRPC** - Type-safe API
- **Drizzle ORM** - Database query builder
- **MySQL** - Database

### Infrastructure
- **AWS S3** - File storage
- **Stripe** - Payment processing
- **Docker** - Containerization (optional)

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js 18+ 
- pnpm (recomendado) ou npm
- MySQL database
- Git

### 1. Clone o Repositório

```bash
git clone https://github.com/yrandilson/digitalStore.git
cd digitalStore
```

### 2. Instale Dependências

```bash
pnpm install
# ou
npm install
```

### 3. Configure Variáveis de Ambiente

Crie um arquivo `.env` na raiz:

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/digital_store

# OAuth
OAUTH_CLIENT_ID=seu_client_id
OAUTH_CLIENT_SECRET=seu_client_secret

# AWS S3
AWS_ACCESS_KEY_ID=sua_access_key
AWS_SECRET_ACCESS_KEY=sua_secret_key
AWS_S3_BUCKET=seu_bucket

# Stripe
STRIPE_PUBLIC_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx

# Node
NODE_ENV=development
```

### 4. Configure o Banco de Dados

```bash
# Gerar migrations
pnpm db:push

# ou manualmente
npm run db:push
```

### 5. Inicie o Servidor

```bash
# Modo desenvolvimento (client + server)
pnpm dev

# ou separadamente
pnpm dev:server  # Terminal 1
pnpm dev:client  # Terminal 2
```

O projeto abrirá em `http://localhost:5173`

---

## 📁 Project Structure

```
digital_store/
│
├── client/                          # Frontend (React)
│   ├── public/
│   │   └── __manus__/              # Integrações externas
│   ├── src/
│   │   ├── _core/                  # Core utilities
│   │   │   └── hooks/
│   │   │       └── useAuth.ts
│   │   ├── components/
│   │   │   ├── ProductCard.tsx     # ✨ NOVO
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── ui/                 # ~50 componentes Shadcn
│   │   ├── pages/
│   │   │   ├── Products.tsx        # ✨ NOVO - Catálogo
│   │   │   ├── Product.tsx         # ✨ NOVO - Individual
│   │   │   ├── Home.tsx
│   │   │   └── NotFound.tsx
│   │   ├── contexts/
│   │   │   ├── CartContext.tsx     # ✨ NOVO - Gerenciar carrinho
│   │   │   └── ThemeContext.tsx
│   │   ├── hooks/
│   │   ├── lib/
│   │   │   ├── trpc.ts             # Configuração tRPC
│   │   │   └── utils.ts
│   │   ├── App.tsx                 # ✨ MODIFICADO
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   └── vite.config.ts
│
├── server/                          # Backend (Node.js)
│   ├── _core/
│   │   ├── productsRouter.ts       # ✨ NOVO - APIs de produtos
│   │   ├── trpc.ts                 # Setup tRPC
│   │   ├── context.ts              # Contexto tRPC
│   │   ├── index.ts                # Entry point
│   │   ├── sdk.ts                  # Manus SDK
│   │   ├── oauth.ts                # OAuth logic
│   │   └── ... (outros)
│   ├── routers.ts                  # ✨ MODIFICADO - Integração
│   ├── db.ts                       # Database helpers
│   └── auth.logout.test.ts
│
├── drizzle/                        # Database schema
│   ├── schema.ts                   # ✨ Schema completo
│   ├── relations.ts
│   └── migrations/
│
├── shared/                         # Código compartilhado
│   ├── types.ts                    # Type exports
│   └── const.ts
│
├── vite.config.ts                  # Vite config
├── drizzle.config.ts               # Drizzle config
├── tsconfig.json                   # TypeScript config
├── package.json
├── CHANGELOG.md                    # ✨ NOVO - Histórico
├── IMPLEMENTATION_GUIDE.md         # ✨ NOVO - Documentação técnica
└── README.md                       # Este arquivo
```

---

## 📚 Documentation

### Documentação Disponível

- **[CHANGELOG.md](./CHANGELOG.md)** - Histórico detalhado de mudanças v1.0.0
- **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)** - Guia técnico passo a passo

### Rotas Principais

```
/                    → Home
/products            → Catálogo de produtos
/products/:slug      → Página individual
/404                 → Página não encontrada
```

### APIs Disponíveis (tRPC)

```typescript
trpc.products.list()       // Listar com paginação/filtros
trpc.products.byId()       // Por ID
trpc.products.bySlug()     // Por slug
trpc.products.search()     // Buscar
trpc.products.categories() // Categorias
trpc.products.featured()   // Em destaque
```

---

## 💻 Commands

### Desenvolvimento

```bash
# Iniciar dev server (ambos client+server)
pnpm dev

# Iniciar apenas server
pnpm dev:server

# Iniciar apenas client (requer server rodando)
pnpm dev:client

# Build para produção
pnpm build

# Start servidor produção
pnpm start

# Type check
pnpm check

# Format código
pnpm format

# Testes
pnpm test
```

### Database

```bash
# Gerar migration e aplicar
pnpm db:push

# Ver log de migrations
pnpm db:log
```

---

## 🎯 Roadmap

### Phase 2 - Carrinho & Checkout
- [ ] Integração do CarrinhoConte no ProductCard
- [ ] Página de carrinho completa
- [ ] Checkout com Stripe
- [ ] Confirmação de compra

### Phase 3 - Admin Dashboard
- [ ] Dashboard principal
- [ ] CRUD de produtos
- [ ] Upload de arquivos S3
- [ ] Gerenciamento de pedidos

### Phase 4 - Mais Features
- [ ] Sistema de avaliações
- [ ] Wishlist de produtos
- [ ] Cupons/Promoções
- [ ] Email notifications
- [ ] Analytics & Reports

---

## 🔐 Segurança

- ✅ Type-safety com TypeScript
- ✅ Validação com Zod
- ✅ OAuth integrado
- ✅ CORS configurado
- ✅ Proteção de rotas (admin)
- ⏳ Rate limiting (TODO)
- ⏳ HTTPS em produção (TODO)

---

## 📞 Support & Contributing

Para reportar bugs ou sugerir features, abra uma issue no GitHub.

---

## 📄 License

MIT License - veja [LICENSE](./LICENSE) para detalhes.

---

## 👥 Author

Desenvolvido pelo time da Digital Store

**Links:**
- GitHub: https://github.com/yrandilson/digitalStore
- Documentação: Veja CHANGELOG.md e IMPLEMENTATION_GUIDE.md

---

## 📝 Última Atualização

**Data:** 12 de Abril de 2026  
**Versão:** 1.0.0  
**Status:** ✨ Catálogo Implementado

### Mudanças Recentes

✅ Catálogo de produtos (listagem, filtros, busca)  
✅ Página individual de produto  
✅ Contexto de carrinho com localStorage  
✅ Documentação completa  

[Ver CHANGELOG.md para detalhes completos](./CHANGELOG.md)


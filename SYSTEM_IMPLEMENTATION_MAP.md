# Mapa de Implementacao do Sistema (Digital Store)

Este documento explica como o sistema funciona de ponta a ponta:
- quais arquivos iniciam a aplicacao
- quais rotas existem
- quem chama quem (frontend -> API -> banco)
- o que cada funcao principal faz
- como autenticacao, carrinho e cadastro de produto estao conectados

## 1. Visao Geral da Arquitetura

- Frontend: React + Vite + Wouter + TanStack Query + tRPC client.
- Backend: Express + tRPC server + Drizzle ORM.
- Banco principal: MySQL via Drizzle.
- Auth hibrida:
  - Sessao via OAuth externo (cookie HTTP-only no backend).
  - Email/senha via Firebase Auth no frontend.

Fluxo macro:
1. Frontend sobe em `client/src/main.tsx`.
2. Frontend chama API tRPC em `/api/trpc`.
3. Backend sobe em `server/_core/index.ts`.
4. Backend monta `appRouter` de `server/routers.ts`.
5. Procedures do router usam `server/_core/productsRouter.ts` e `server/db.ts`.

## 2. Boot do Frontend

### `client/src/main.tsx`
Funcao no arquivo:
- cria `QueryClient` (cache das queries/mutations)
- cria cliente tRPC com `httpBatchLink` apontando para `/api/trpc`
- ativa `credentials: include` (envia cookies de sessao)
- renderiza App com providers (`trpc.Provider` + `QueryClientProvider`)

Chamadas principais:
- `trpc.createClient(...)` -> cria cliente de API.
- `createRoot(...).render(...)` -> renderiza `App`.
- `redirectToLoginIfUnauthorized(...)` -> observa erros de API e redireciona quando unauthorized.

## 3. Roteamento de Paginas (Frontend)

### `client/src/App.tsx`
`Router()` define as rotas:
- `/` -> Home
- `/login` -> Login
- `/register` -> Register
- `/products` -> Products
- `/products/:slug` -> Product
- `/cart` -> Cart
- `/checkout` -> Checkout
- `/orders` -> Orders
- `/downloads` -> Downloads
- `/profile` -> Profile
- `/dashboard` -> Dashboard
- `/dashboard/products` -> AdminProducts
- `/dashboard/orders` -> AdminOrders
- `/dashboard/users` -> AdminUsers
- `/dashboard/settings` -> AdminSettings

`App()` encadeia providers:
- `ErrorBoundary`
- `ThemeProvider`
- `CartProvider`
- `TooltipProvider`

## 4. Boot do Backend

### `server/_core/index.ts`
`startServer()`:
1. cria `express()` e `http server`.
2. habilita `express.json`/`urlencoded`.
3. registra callback OAuth em `/api/oauth/callback` (via `registerOAuthRoutes`).
4. monta tRPC middleware em `/api/trpc` com:
   - `router: appRouter`
   - `createContext`
5. em dev usa Vite middleware; em prod serve arquivos estaticos.
6. escolhe porta livre e inicia servidor.

## 5. Contexto e Autenticacao no Backend

### `server/_core/context.ts`
`createContext(opts)`:
- tenta autenticar request com `sdk.authenticateRequest(req)`.
- se falhar, `user = null`.
- retorna `{ req, res, user }` para todas procedures.

### `server/_core/sdk.ts`
Classe central de auth OAuth/sessao.

Funcoes principais:
- `exchangeCodeForToken(code, state)`:
  - troca authorization code por access token no servidor OAuth.
- `getUserInfo(accessToken)`:
  - busca dados do usuario no OAuth.
- `createSessionToken(openId, options)`:
  - gera JWT de sessao (cookie).
- `verifySession(cookie)`:
  - valida JWT da sessao.
- `authenticateRequest(req)`:
  - le cookie de sessao
  - valida JWT
  - busca usuario no banco (`db.getUserByOpenId`)
  - sincroniza usuario se necessario
  - retorna `User` autenticado

### `server/_core/oauth.ts`
`registerOAuthRoutes(app)` registra:
- `GET /api/oauth/callback`

Fluxo do callback:
1. recebe `code` + `state`.
2. `sdk.exchangeCodeForToken`.
3. `sdk.getUserInfo`.
4. `db.upsertUser`.
5. `sdk.createSessionToken`.
6. seta cookie (`COOKIE_NAME`).
7. redireciona para `/`.

### `server/_core/cookies.ts`
`getSessionCookieOptions(req)`:
- configura cookie HTTP-only
- path `/`
- sameSite `none`
- secure quando request for https

## 6. Router Principal da API

### `server/routers.ts`
`appRouter` expoe:
- `system: systemRouter`
- `auth.me` (retorna `ctx.user`)
- `auth.logout` (limpa cookie de sessao)
- `products: productsRouter`

## 7. Modulo de Produtos (API)

### `server/_core/productsRouter.ts`
Procedures e responsabilidades:

- `products.list(input)`:
  - pagina, filtra por categoria, ordena, retorna `data + pagination`.
- `products.byId({ id })`:
  - busca produto por ID.
- `products.bySlug({ slug })`:
  - busca produto por slug.
- `products.search({ query, limit })`:
  - pesquisa por nome (LIKE).
- `products.categories()`:
  - lista categorias.
- `products.featured({ limit })`:
  - lista produtos em destaque.
- `products.create(input)`:
  - valida dados
  - gera slug
  - evita slug duplicado
  - cria produto no banco
  - retorna produto criado

Dependencias:
- `getDb()` de `server/db.ts`
- tabelas `products` e `categories` de `drizzle/schema.ts`

## 8. Banco de Dados e Persistencia

### `server/db.ts`
Funcoes principais:
- `getDb()`:
  - cria conexao Drizzle de forma lazy (quando necessario).
- `upsertUser(user)`:
  - cria/atualiza usuario por `openId`.
- `getUserByOpenId(openId)`:
  - busca usuario por `openId`.

## 9. Auth no Frontend (Hibrida)

### `client/src/_core/hooks/useAuth.ts`
Hook de autenticacao unificada.

O que faz:
- consulta sessao backend via `trpc.auth.me.useQuery()`.
- observa auth Firebase via `useFirebaseAuth()`.
- cria `mergedUser`:
  - usa usuario backend quando existe
  - senao usa usuario Firebase
- fornece:
  - `user`
  - `loading`
  - `isAuthenticated`
  - `logout()` (logout backend + Firebase)
- redireciona para login quando `redirectOnUnauthenticated = true`.

### `client/src/hooks/useFirebaseAuth.ts`
- escuta `onAuthStateChanged(auth, ...)`.
- atualiza estado local de usuario Firebase.
- fornece `logout` via `signOut(auth)`.

### `client/src/lib/firebase.ts`
- inicializa Firebase App/Auth/Firestore/Storage.
- valida variaveis `VITE_FIREBASE_*` e loga erro se faltar.

### `client/src/const.ts`
`getLoginUrl()`:
- monta URL do OAuth externo.
- usa `VITE_OAUTH_PORTAL_URL` + `VITE_APP_ID`.
- se faltar, retorna `/login?auth=missing`.

## 10. Fluxos de Login/Cadastro

### Login email/senha
Arquivo: `client/src/pages/Login.tsx`

Funcoes:
- `handleLogin()`:
  - chama `signInWithEmailAndPassword(auth, email, password)`
  - em sucesso: navega para `/dashboard`
- `handleResetPassword()`:
  - chama `sendPasswordResetEmail(auth, email)`

Tambem oferece botao OAuth:
- chama `window.location.href = getLoginUrl()`.

### Cadastro email/senha
Arquivo: `client/src/pages/Register.tsx`

Funcao:
- `handleRegister()`:
  - `createUserWithEmailAndPassword`
  - `updateProfile` com nome completo
  - redireciona para `/dashboard`

## 11. Fluxo do Catalogo e Produto

### Lista de produtos
Arquivo: `client/src/pages/Products.tsx`

Chamadas API:
- `trpc.products.list.useQuery(...)`
- `trpc.products.categories.useQuery()`
- `trpc.products.search.useQuery(...)`

Renderiza cards via `ProductCard`.

### Card de produto
Arquivo: `client/src/components/ProductCard.tsx`

Ao clicar no botao carrinho:
- chama `useCart().addItem(...)`.

### Produto individual
Arquivo: `client/src/pages/Product.tsx`

Chamadas API:
- `trpc.products.bySlug.useQuery({ slug })`.

Funcao local:
- `handleAddToCart()` chama `addItem(...)` do carrinho.

## 12. Fluxo de Carrinho e Checkout

### Estado global do carrinho
Arquivo: `client/src/contexts/CartContext.tsx`

Funcoes:
- `addItem(product, quantity)`
- `updateItemQuantity(id, quantity)`
- `removeItem(id)`
- `clearCart()`

Persistencia:
- carrega de `localStorage` no mount.
- salva em `localStorage` a cada alteracao.

### Pagina de checkout
Arquivo: `client/src/pages/Checkout.tsx`

Funcao principal:
- `handleFinishPurchase()`:
  - valida nome/email
  - simula processamento
  - limpa carrinho
  - confirma pedido na UI

Observacao:
- checkout ainda local (sem Stripe real e sem persistencia de pedido no backend).

## 13. Dashboard e Admin

### Protecao de dashboard
Arquivo: `client/src/components/DashboardLayout.tsx`

Fluxo:
- usa `useAuth()`.
- se `loading`, mostra skeleton.
- se sem `user`, mostra tela de bloqueio com:
  - botao login email (`/login`)
  - botao login OAuth
- se autenticado, renderiza sidebar e conteudo.

### Cadastro de produtos no admin
Arquivo: `client/src/pages/AdminProducts.tsx`

Quem chama quem:
- Formulario -> `handleCreateProduct()`
- `handleCreateProduct` -> `createMutation.mutate(...)`
- `createMutation` -> `trpc.products.create`
- backend `products.create` -> `db.insert(products)`
- sucesso -> `utils.products.list.invalidate()` -> atualiza tabela

## 14. Mapa Rapido de Chamadas (Resumo)

1. Usuario abre `/products`:
- `Products.tsx` -> `trpc.products.list` -> `productsRouter.list` -> `db.select(products)`

2. Usuario abre `/products/:slug`:
- `Product.tsx` -> `trpc.products.bySlug` -> `productsRouter.bySlug` -> `db.select(products)`

3. Usuario clica adicionar no card:
- `ProductCard.tsx` -> `useCart().addItem`

4. Usuario finaliza checkout:
- `Checkout.tsx` -> `handleFinishPurchase` -> `clearCart`

5. Admin cadastra produto:
- `AdminProducts.tsx` -> `trpc.products.create` -> `productsRouter.create` -> `db.insert(products)`

6. Sessao OAuth no backend:
- `/api/oauth/callback` -> `sdk.exchangeCodeForToken` -> `sdk.getUserInfo` -> `db.upsertUser` -> cookie sessao

7. Resolucao de auth no frontend:
- `useAuth()` combina `trpc.auth.me` + `useFirebaseAuth()`

## 15. Variaveis de Ambiente Relevantes

Backend/servidor:
- `DATABASE_URL`
- `JWT_SECRET`
- `OAUTH_SERVER_URL`
- `VITE_APP_ID` (tambem usado em fluxo OAuth no servidor)
- `OWNER_OPEN_ID`

Frontend/Firebase:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

Frontend/OAuth:
- `VITE_OAUTH_PORTAL_URL`
- `VITE_APP_ID`

## 16. Pontos Ja Implementados x Pendentes

Ja implementado:
- catalogo com listagem/filtro/busca
- produto detalhado
- carrinho local
- checkout local
- login/cadastro Firebase
- reset de senha Firebase
- dashboard com bloqueio por auth
- cadastro real de produto no admin

Pendente (proximos passos naturais):
- pedidos reais no backend (tabela `orders`/`orderItems`)
- integracao de pagamento (Stripe)
- controle de permissao admin no `products.create` (hoje esta `publicProcedure`)
- CRUD completo de produtos (editar/remover)
- telas de pedidos/downloads com dados reais

---

Se quiser, no proximo passo eu gero uma versao 2 deste documento com diagramas Mermaid (sequencia e arquitetura) para facilitar onboarding de qualquer dev novo no projeto.

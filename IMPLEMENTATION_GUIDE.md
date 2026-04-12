# 📖 Guia de Implementação - Catálogo de Produtos

Este documento detalha passo a passo como as funcionalidades foram implementadas e como usá-las.

---

## 1️⃣ ROUTER DE PRODUTOS (Backend)

**Arquivo:** `server/_core/productsRouter.ts`

### Como Funciona

1. **Criação do Router**
   ```typescript
   export const productsRouter = router({
     list: publicProcedure.input(...).query(...),
     byId: publicProcedure.input(...).query(...),
     // ... outros endpoints
   });
   ```

2. **Integração em `server/routers.ts`**
   ```typescript
   import { productsRouter } from "./_core/productsRouter";
   
   export const appRouter = router({
     products: productsRouter,
     // ... outros routers
   });
   ```

### Endpoints Disponíveis

#### `.list()` - Listar Produtos
```typescript
// Query
trpc.products.list.useQuery({
  page: 1,
  limit: 12,
  categoryId: undefined,
  sortBy: "newest"
})

// Backend Query
db.select().from(products)
  .where(eq(products.active, true))
  .orderBy(desc(products.createdAt))
  .limit(12)
  .offset(0)
```

**Opções de Ordenação:**
- `"newest"` → Mais recente (createdAt DESC)
- `"popular"` → Mais vendido (salesCount DESC)
- `"price-asc"` → Menor preço (price ASC)
- `"price-desc"` → Maior preço (price DESC)
- `"rating"` → Melhor avaliação (rating DESC)

#### `.bySlug()` - Obter por Slug
```typescript
// URL: /products/nome-do-produto
const { data: product } = trpc.products.bySlug.useQuery({ 
  slug: "nome-do-produto" 
});

// Retorna um produto ou erro "not found"
```

#### `.search()` - Buscar por Texto
```typescript
// Busca em tempo real
const { data: results } = trpc.products.search.useQuery(
  { query: "javascript", limit: 20 },
  { enabled: query.length > 2 } // Ativa apenas depois de 2 char
);
```

---

## 2️⃣ PÁGINA DE CATÁLOGO

**Arquivo:** `client/src/pages/Products.tsx`

### Componentes & Estados

```typescript
// Estados
const [page, setPage] = useState(1);          // Página atual
const [limit, setLimit] = useState(12);       // Itens por página
const [categoryId, setCategoryId] = useState<number | undefined>();
const [sortBy, setSortBy] = useState<"newest" | ...>("newest");
const [searchQuery, setSearchQuery] = useState("");
```

### Fluxo de Renderização

1. **Se há busca ativa** (query.length > 2)
   - Mostrar resultados de `products.search()`
   - Desabilitar paginação
   
2. **Se não há busca**
   - Mostrar produtos do `products.list()`
   - Habilitar paginação

3. **Loading State**
   - Renderizar 12 Skeletons
   - Mostrar `isLoading` true

4. **Renderizar Grid**
   - Usar `ProductCard` para cada item
   - Passar props necessários

### Filtros em Detalhes

```typescript
// Filtro de Categoria
<Select value={categoryId?.toString() || "all"}>
  <SelectItem value="all">Todas as categorias</SelectItem>
  {categories.map(cat => (
    <SelectItem value={cat.id.toString()}>{cat.name}</SelectItem>
  ))}
</Select>

// Ao alterar
onValueChange={(value) => {
  setCategoryId(value === "all" ? undefined : parseInt(value));
  setPage(1); // ⚠️ Reset para página 1
}}
```

---

## 3️⃣ PÁGINA INDIVIDUAL DO PRODUTO

**Arquivo:** `client/src/pages/Product.tsx`

### Obter Slug da URL

```typescript
import { useRoute } from "wouter";

const [, params] = useRoute("/products/:slug");
const slug = params?.slug as string;

// Query do produto
const { data: product } = trpc.products.bySlug.useQuery(
  { slug },
  { enabled: !!slug } // Só executa se slug existe
);
```

### Estrutura do Componente

```
┌─ Breadcrumb
│  └─ Início > Produtos > Nome do Produto
│
├─ Grid 2 Colunas (Desktop)
│  ├─ Esquerda: Imagem + Demo
│  └─ Direita: Detalhes + CTA
│
├─ Rating com Estrelas (se houver)
│
├─ Preço + Tamanho
│
├─ Quantity Selector + Add to Cart
│
├─ Share Button
│
├─ Descrição
│
└─ Cards de Benefícios
```

### Formatação de Preço

```typescript
const price = parseFloat(product.price).toLocaleString("pt-BR", {
  style: "currency",
  currency: "BRL",
});
// Resultado: "R$ 99,90"
```

### Rating Visual

```typescript
const ratingValue = product.rating ? parseFloat(product.rating) : 0;

{Array.from({ length: 5 }).map((_, i) => (
  <Star
    key={i}
    className={
      i < Math.round(ratingValue)
        ? "fill-yellow-400" // Preenchida
        : "text-muted-foreground" // Vazia
    }
  />
))}
```

---

## 4️⃣ COMPONENTE PRODUCTCARD

**Arquivo:** `client/src/components/ProductCard.tsx`

### Props

```typescript
interface ProductCardProps {
  id: number;              // ID do produto
  slug: string;            // URL-friendly
  name: string;            // Nome
  price: string;           // Preço em string (decimal)
  imageUrl?: string | null;// URL da imagem ou null
  rating?: string;         // Rating 0-5
  reviewCount?: number;    // Número de avaliações
  category?: string;       // Nome da categoria
  featured?: boolean;      // Se está em destaque
}
```

### Estrutura

```
Card
├─ Image Container
│  ├─ Imagem (com hover zoom)
│  └─ Featured Badge
│
├─ Content
│  ├─ Category Badge
│  ├─ Product Name (2 linhas max)
│  ├─ Rating (se houver)
│  │  └─ Estrelas + review count
│  ├─ Spacer (grow)
│  │
│  └─ Bottom Row
│     ├─ Preço (BRL)
│     └─ Add to Cart Button
```

### Hover Effects

```css
/* Image Zoom */
.group-hover:scale-110

/* Text Link Color */
.group-hover:text-blue-600

/* Shadow */
.hover:shadow-lg
```

### Link para Produto

```typescript
// O card inteiro é um Link
<Link href={`/products/${slug}`}>
  <Card>
    {/* ... */}
  </Card>
</Link>

// Só o botão não navega (preventDefault)
<Button onClick={(e) => {
  e.preventDefault();
  // TODO: Add to cart
}}>
```

---

## 5️⃣ CONTEXTO DE CARRINHO

**Arquivo:** `client/src/contexts/CartContext.tsx`

### Setup

1. **Envolver app com Provider**
   ```typescript
   // main.tsx ou App.tsx
   <CartProvider>
     <App />
   </CartProvider>
   ```

2. **Usar hook em qualquer componente**
   ```typescript
   import { useCart } from "@/contexts/CartContext";
   
   function MyComponent() {
     const { items, totalPrice, addItem } = useCart();
   }
   ```

### Funcionalidades

#### Adicionar Item
```typescript
const { addItem } = useCart();

// Se produto já existe, incrementa quantidade
// Se não existe, cria novo item
addItem(product, quantity);
```

#### Atualizar Quantidade
```typescript
const { updateItemQuantity } = useCart();

// Se quantidade <= 0, remove automaticamente
updateItemQuantity(itemId, newQuantity);
```

#### Remover Item
```typescript
const { removeItem } = useCart();
removeItem(itemId);
```

#### Dados do Carrinho
```typescript
const { 
  items,        // CartItem[]
  totalItems,   // número total de items
  totalPrice,   // preço total
  isOpen        // carrinho aberto?
} = useCart();
```

### Persistência

O carrinho é **salvo automaticamente** em localStorage com chave `digital_store_cart`:

```typescript
// Salvamento automático ao mudar
useEffect(() => {
  localStorage.setItem("digital_store_cart", JSON.stringify(items));
}, [items]);

// Carregamento ao montar
useEffect(() => {
  const stored = localStorage.getItem("digital_store_cart");
  if (stored) setItems(JSON.parse(stored));
}, []);
```

---

## 6️⃣ ATUALIZAÇÃO DE ROTAS

**Arquivo:** `client/src/App.tsx`

### Rotas Adicionadas

```typescript
<Switch>
  <Route path="/" component={Home} />
  <Route path="/products" component={Products} />    // Catálogo
  <Route path="/products/:slug" component={Product} /> // Individual
  <Route path="/404" component={NotFound} />
  <Route component={NotFound} /> {/* Fallback */}
</Switch>
```

### Navegação

```typescript
// Link para catálogo
<Link href="/products">Ver Todos</Link>

// Link para produto (dinâmico)
<Link href={`/products/${product.slug}`}>
  {product.name}
</Link>

// Programática
import { useLocation } from "wouter";
const [, navigate] = useLocation();
navigate("/products");
```

---

## 🔗 Fluxo Completo de Dados

### Listar Produtos

```
1. User abre /products
2. Products.tsx monta
3. Chama trpc.products.list.useQuery()
4. Request vai ao backend
5. productsRouter.list() executa
   ├─ getDb() conecta DB
   ├─ SELECT * FROM products WHERE active=true
   ├─ Aplica filtros (category, sort)
   ├─ Aplica limit/offset (paginação)
   └─ Retorna { data: [], pagination: {...} }
6. Frontend renderiza grid com ProductCards
```

### Buscar Produto

```
1. User digita "javascript" na barra
2. searchQuery muda
3. Se length > 2, ativa useQuery
4. Chama trpc.products.search.useQuery()
5. Backend: SELECT * FROM products 
            WHERE name LIKE "%javascript%"
6. Mostra resultados

⚠️ Paginação desativada durante busca
```

### Abrir Página do Produto

```
1. User clica em ProductCard
2. Navigate para /products/nome-do-produto
3. Product.tsx monta
4. useRoute() extrai slug
5. Chama trpc.products.bySlug.useQuery()
6. Backend: SELECT * FROM products WHERE slug=?
7. Renderiza página individual
```

---

## 🐛 Tratamento de Erros

### Frontend

```typescript
if (isLoading) {
  return <SkeletonsGrid />;
}

if (error || !product) {
  return (
    <Alert variant="destructive">
      <AlertDescription>Produto não encontrado</AlertDescription>
    </Alert>
  );
}
```

### Backend

```typescript
if (!db) throw new Error("Database connection failed");
if (!product[0]) throw new Error("Product not found");
```

---

## 📱 Responsividade

### Breakpoints

```typescript
// TailwindCSS
- Mobile: < 640px
- Tablet: 640px - 1024px  (md:)
- Desktop: > 1024px       (lg:)

// Grid de Produtos
grid-cols-1          // Mobile: 1 coluna
sm:grid-cols-2       // Tablet: 2 colunas
lg:grid-cols-4       // Desktop: 4 colunas
```

### Página Individual

```typescript
// Desktop: 2 colunas (imagem | detalhes)
// Mobile: 1 coluna (imagem, depois detalhes)
md:grid-cols-2
```

---

## 🎨 Temas e Cores

### Dark Mode

Todos os componentes suportam dark mode via classes:

```typescript
className="bg-blue-50 dark:bg-slate-900"
className="text-muted-foreground" // Auto ajusta
className="border-blue-200 dark:border-slate-800"
```

---

## ✅ Checklist de Funcionalidades

- ✅ Listar produtos com paginação
- ✅ Filtrar por categoria
- ✅ Ordenação múltipla
- ✅ Busca por texto
- ✅ Página individual
- ✅ Rating visual
- ✅ Preço formatado em BRL
- ✅ Contexto de carrinho (localStorage)
- ✅ Responsividade
- ✅ Dark mode
- ✅ Loading states
- ✅ Error handling
- ⏳ (TODO) Adicionar ao carrinho (UI)
- ⏳ (TODO) Página de carrinho
- ⏳ (TODO) Checkout com Stripe

---

## 🚀 Próximes Implementações

1. **Integrar CartContext em ProductCard e Product.tsx**
   - Botão "Adicionar ao Carrinho" funcional
   - Toast de confirmação

2. **Página de Carrinho (Cart.tsx)**
   - Listar itens
   - Editar quantidade
   - Remover items
   - Resumo de preço

3. **Checkout**
   - Integração Stripe
   - Formulário de dados
   - Processamento de pagamento


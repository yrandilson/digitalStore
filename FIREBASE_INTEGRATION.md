# 🔥 Firebase Integration Guide

Este documento explica como integrar Firestore aos componentes existentes do projeto.

---

## 📦 Instalação

```bash
pnpm add firebase
```

---

## 🔧 Setup Básico

### 1. Configurar Firebase (já feito)

Arquivo: `client/src/lib/firebase.ts`

```typescript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

### 2. Helpers de Produtos (já feito)

Arquivo: `client/src/lib/firebase-products.ts`

Funções disponíveis:
- `getProducts()` - Todos os produtos ativos
- `getProductById(id)` - Por ID
- `getProductBySlug(slug)` - Por slug
- `getProductsByCategory(category)` - Por categoria
- `getFeaturedProducts(limit)` - Em destaque

---

## 🔄 Migração da Página de Catálogo

### De tRPC MySQL para Firestore

**Antes (Products.tsx com MySQL):**
```typescript
const { data: productsData } = trpc.products.list.useQuery({...});
```

**Depois (com Firestore):**
```typescript
import { getProducts } from "@/lib/firebase-products";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts();
        setProducts(data);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  // ... resto do componente
}
```

### Hook Customizado (Recomendado)

Criar `client/src/hooks/useFirestoreProducts.ts`:

```typescript
import { useState, useEffect } from "react";
import { getProducts, getProductsByCategory, Product } from "@/lib/firebase-products";

export function useFirestoreProducts(category?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      try {
        const data = category 
          ? await getProductsByCategory(category)
          : await getProducts();
        setProducts(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading products");
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [category]);

  return { products, loading, error };
}
```

Uso:
```typescript
const { products, loading } = useFirestoreProducts();
```

---

## 🔐 Implementar Firebase Auth

### Hook de Autenticação (já criado)

`client/src/hooks/useFirebaseAuth.ts`

```typescript
import { useFirebaseAuth } from "@/_core/hooks/useFirebaseAuth";

function MyComponent() {
  const { user, logout, isAuthenticated } = useFirebaseAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div>
      Bem-vindo, {user?.displayName}
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Substituir OAuth no Home.tsx

**Antes:**
```typescript
const { user, logout } = useAuth(); // OAuth
```

**Depois:**
```typescript
const { user, logout } = useFirebaseAuth(); // Firebase
```

---

## 💳 Carrinho com Firestore

### Salvar Carrinho na Nuvem (Opcional)

```typescript
import { collection, setDoc, doc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

export async function saveCartToFirebase(items: CartItem[]) {
  if (!auth.currentUser) return;

  const cartRef = doc(collection(db, "users", auth.currentUser.uid, "cart"), "items");
  await setDoc(cartRef, {
    items,
    updatedAt: new Date(),
  });
}

export async function loadCartFromFirebase() {
  if (!auth.currentUser) return [];

  try {
    const docRef = doc(db, "users", auth.currentUser.uid, "cart/items");
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data().items : [];
  } catch {
    return [];
  }
}
```

---

## 📋 Criar Pedido no Firestore

### Função para Checkout

```typescript
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

export async function createOrder(orderData: {
  products: Array<{ productId: string; quantity: number; price: number }>;
  totalAmount: number;
  stripePaymentIntentId: string;
}) {
  if (!auth.currentUser) throw new Error("Not authenticated");

  const ordersRef = collection(db, "orders");
  const docRef = await addDoc(ordersRef, {
    userId: auth.currentUser.uid,
    userEmail: auth.currentUser.email,
    ...orderData,
    status: "completed",
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}
```

---

## 📥 Upload de Arquivos (Storage)

### Upload de Imagem

```typescript
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

export async function uploadProductImage(file: File, productId: string) {
  const storageRef = ref(storage, `products/${productId}/image`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return url;
}
```

### Upload de Arquivo Digital

```typescript
export async function uploadProductFile(file: File, productId: string) {
  const storageRef = ref(storage, `products/${productId}/file`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return url;
}
```

---

## 🔄 Comparação: MySQL vs Firestore

| Aspecto | MySQL + tRPC | Firestore |
|---------|-------------|-----------|
| **Setup** | Complexo (servidor) | Simples (SDK) |
| **Real-time** | Não (polling) | Sim (listeners) |
| **Escalabilidade** | Vertical | Horizontal |
| **Custo** | Servidor 24/7 | Pay-as-you-go |
| **Autenticação** | OAuth custom | Firebase Auth |
| **Queries** | SQL | Queries Firestore |
| **Limite gratuito** | - | 1GB storage |

---

## 🚀 Implementação Step-by-Step

### Phase 1: Setup Inicial
- [ ] Instalar Firebase
- [ ] Criar arquivo firebase.ts
- [ ] Configurar .env

### Phase 2: Produtos
- [ ] Criar firebase-products.ts
- [ ] Migrar Products.tsx para Firestore
- [ ] Testar listagem

### Phase 3: Autenticação
- [ ] Substituir OAuth por Firebase Auth
- [ ] Criar página de login
- [ ] Testar login/logout

### Phase 4: Carrinho & Pedidos
- [ ] Integrar carrinho com Firestore
- [ ] Criar função createOrder
- [ ] Testar checkout

### Phase 5: Storage
- [ ] Setup upload de imagens
- [ ] Integrar S3 → Firebase Storage
- [ ] Testar downloads

---

## 🐛 Troubleshooting

### "Permission denied" no Firestore
**Problema:** Regras de segurança muito restritivas  
**Solução:** Verificar Firestore → Regras e aplicar as corretas

### Images não carregam
**Problema:** URL de Storage expirada  
**Solução:** Usar `getDownloadURL()` em tempo real

### Firestore muito lento
**Problema:** Queries complexas  
**Solução:** Usar indexação automática (Firestore sugere)

---

## 📚 Referências

- [Firebase Auth Docs](https://firebase.google.com/docs/auth)
- [Firestore Docs](https://firebase.google.com/docs/firestore)
- [Firebase Storage Docs](https://firebase.google.com/docs/storage)
- [Firebase Console](https://console.firebase.google.com)


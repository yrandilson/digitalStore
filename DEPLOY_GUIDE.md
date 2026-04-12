# 🚀 Guia de Deploy - Vercel + Firebase

Este guia explica como fazer deploy de um projeto fullstack para Vercel com Firebase como banco de dados e autenticação.

---

## 📋 Prerequisites

- GitHub account
- Vercel account (gratuito em vercel.com)
- Firebase project (gratuito em firebase.google.com)
- Node.js 18+
- Git

---

## 1️⃣ FIREBASE SETUP

### Criar Projeto Firebase

1. Acesse [firebase.google.com](https://firebase.google.com)
2. Clique "Ir para console"
3. Clique "+ Adicionar projeto"
4. Nome: `digital-store-prod`
5. Analytics: Desabilitar (opcional)
6. Criar projeto

### Ativar Serviços

#### 1. Authentication
```
Firebase Console → Authentication → Primeiros passos
Ativar provedores:
✅ Email/Password
✅ Google
✅ GitHub (opcional)
```

#### 2. Firestore Database
```
Firebase Console → Firestore Database → Criar banco de dados
- Modo: Iniciar em modo de teste
- Localização: us-central1 (ou próximo a você)
- Criar
```

#### 3. Storage
```
Firebase Console → Storage → Começar
- Localização: us-central1
- Criar
```

### Gerar Config do Web App

```
Firebase Console → Configurações do projeto
Abra "Apps": Clique <> (Web)
Registre o app: digital-store

Copie as credenciais:
{
  "apiKey": "AIza...",
  "authDomain": "seu-projeto.firebaseapp.com",
  "projectId": "seu-projeto",
  "storageBucket": "seu-projeto.appspot.com",
  "messagingSenderId": "123456789",
  "appId": "1:123456789:web:abc123..."
}
```

---

## 2️⃣ CONFIGURAR VARIÁVEIS DE AMBIENTE

### No Arquivo Local `.env`

```env
# Firebase (copie do step anterior)
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123...

# Database (opcional se usar Firestore)
DATABASE_URL=mysql://user:pass@host/db

# Stripe
STRIPE_PUBLIC_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
```

---

## 3️⃣ INSTALAR FIREBASE NO PROJETO

```bash
cd digital_store
pnpm add firebase
# ou
npm install firebase
```

---

## 4️⃣ VERCEL SETUP

### 1. Push para GitHub

```bash
git remote set-url origin https://github.com/seu-usuario/digitalStore.git
git branch -M main
git push -u origin main
```

### 2. Conectar Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Clique "New Project"
3. Conecte sua conta GitHub
4. Selecione repositório `digitalStore`
5. Clique "Import"

### 2.1 Nome do Projeto (evitar erro de validação)

Regras do nome na Vercel:
- Até 100 caracteres
- Somente minúsculas
- Pode usar: letras, números, `.`, `_`, `-`
- Não pode conter `---`

Exemplos válidos:
- `digital-store-yrandilson`
- `digital-store-caa9f`
- `digital_store_2026`

Exemplos inválidos:
- `Digital-Store` (maiúsculas)
- `digital store` (espaço)
- `digital---store` (três hífens seguidos)

### 3. Configurar Variáveis de Ambiente

No Vercel Dashboard:

```
Project Settings → Environment Variables

Adicione:
VITE_FIREBASE_API_KEY = AIza...
VITE_FIREBASE_AUTH_DOMAIN = seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID = seu-projeto
VITE_FIREBASE_STORAGE_BUCKET = seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID = 123456789
VITE_FIREBASE_APP_ID = 1:123456789:web:abc123...
DATABASE_URL = mysql://... (opcional)
STRIPE_SECRET_KEY = sk_live_xxx
```

### 4. Build Settings

- Framework Preset: **Vite**
- Build Command: `pnpm build:vercel` (já configurado)
- Output Directory: `dist`
- Install Command: `pnpm install --frozen-lockfile`

### 5. Deploy

Vercel automaticamente:
1. Clona o repositório
2. Instala dependências
3. Executa build
4. Faz deploy

---

## 5️⃣ FIRESTORE REGRAS DE SEGURANÇA

### Permissões Básicas (Desenvolvimento)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura/escrita para usuários autenticados
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
    }
    
    match /products/{document=**} {
      allow read: if true; // Público
      allow write: if request.auth.token.admin == true; // Só admins
    }
    
    match /orders/{document=**} {
      allow read: if request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.userId;
    }
  }
}
```

Aplicar em **Firestore → Regras**

### Permissões Storage

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /products/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth.token.admin == true;
    }
    
    match /downloads/{uid}/{allPaths=**} {
      allow read, write: if request.auth.uid == uid;
    }
  }
}
```

---

## 6️⃣ CONFIGURAR NO PROJETO (Code)

### Usar Firebase Auth (ao invés de OAuth)

```typescript
// client/src/App.tsx ou componente de login
import { useFirebaseAuth } from "@/_core/hooks/useFirebaseAuth";

export function App() {
  const { user, logout, isAuthenticated } = useFirebaseAuth();

  if (isAuthenticated) {
    return (
      <div>
        Bem-vindo, {user?.displayName}
        <button onClick={logout}>Logout</button>
      </div>
    );
  }

  return <LoginPage />;
}
```

### Login com Google

```typescript
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
}
```

### Usar Firestore (exemplo)

```typescript
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Listar produtos
export async function getProducts() {
  const querySnapshot = await getDocs(collection(db, "products"));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

// Criar pedido
export async function createOrder(orderData) {
  const docRef = await addDoc(collection(db, "orders"), {
    ...orderData,
    createdAt: new Date(),
  });
  return docRef.id;
}
```

---

## 7️⃣ ESTRUTURA FIRESTORE RECOMENDADA

```
firestore/
├── users/
│   └── {uid}/
│       ├── email: string
│       ├── displayName: string
│       ├── photoURL: string
│       ├── role: "user" | "admin"
│       └── createdAt: timestamp
│
├── products/
│   └── {productId}/
│       ├── name: string
│       ├── price: number
│       ├── description: string
│       ├── imageUrl: string
│       ├── fileUrl: string (Storage reference)
│       ├── category: string
│       ├── rating: number
│       └── createdAt: timestamp
│
├── orders/
│   └── {orderId}/
│       ├── userId: string
│       ├── products: [{ productId, quantity, price }]
│       ├── totalAmount: number
│       ├── status: "pending" | "completed"
│       ├── stripePaymentIntentId: string
│       └── createdAt: timestamp
│
└── downloads/
    └── {downloadId}/
        ├── userId: string
        ├── productId: string
        ├── orderId: string
        ├── downloadUrl: string
        ├── expiresAt: timestamp
        └── downloadCount: number
```

---

## ✅ Checklist de Deploy

- [ ] Firebase projeto criado
- [ ] Authentication habilitado
- [ ] Firestore criado
- [ ] Storage habilitado
- [ ] Credenciais copiadas
- [ ] `.env` preenchido localmente
- [ ] Testado em desenvolvimento (`pnpm dev`)
- [ ] Código commitado e pusheado
- [ ] GitHub conectado ao Vercel
- [ ] Variáveis de ambiente no Vercel
- [ ] Build Settings configurados
- [ ] Deploy realizado
- [ ] Chrome aberto em vercel app URL
- [ ] Firestore regras configuradas
- [ ] Storage regras configuradas

---

## 🔗 Links Úteis

- [Firebase Console](https://console.firebase.google.com)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Firebase SDK Docs](https://firebase.google.com/docs)
- [Vercel Docs](https://vercel.com/docs)

---

## 🐛 Troubleshooting

### "CORS error" ao usar Firebase Storage
**Solução:** Configure CORS no Firebase Storage console

### "Database URL undefined" no servidor
**Solução:** Adicione `DATABASE_URL` no `.env` de desenvolvimento

### Vercel build falha
**Solução:** Verifique logs em Vercel → Deployments → Build & Logs

### Firebase Auth não funciona
**Solução:** Adicione seu domínio em Firebase Console → Authentication → Authorized domains

---

## 📝 Próximas Steps

1. Migrar OAuth para Firebase Auth
2. Migrar dados do MySQL para Firestore (se aplicável)
3. Configurar Stripe entre Vercel + Firebase
4. Setup de backups automáticos
5. Monitorar performance com Firebase Performance Monitoring


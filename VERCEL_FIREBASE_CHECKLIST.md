# ✅ Vercel + Firebase Setup Checklist

Complete este checklist para fazer deploy do seu projeto com Vercel + Firebase.

---

## 📋 FIREBASE SETUP

### Criar Projeto
- [ ] Acesse firebase.google.com
- [ ] Crie novo projeto "digital-store-prod"
- [ ] Confirme localização
- [ ] Projeto criado ✅

### Ativar Serviços
- [ ] Authentication: Email/Password ✅
- [ ] Authentication: Google ✅
- [ ] Firestore Database (Modo produção)
- [ ] Storage para arquivos
- [ ] Todos habilitados ✅

### Gerar Credenciais
- [ ] Firebase Console → Configurações
- [ ] Copie credenciais Web
- [ ] Salve em local seguro

---

## 💻 CONFIGURAR PROJETO LOCAL

### Instalar Dependências
```bash
pnpm add firebase
```
- [ ] Firebase instalado

### Variáveis de Ambiente
- [ ] Crie `.env` baseado em `.env.example`
- [ ] Adicione credenciais Firebase
- [ ] Adicione DATABASE_URL (se usar MySQL)
- [ ] Adicione STRIPE_SECRET_KEY

### Testar Localmente
```bash
pnpm dev
```
- [ ] Projeto roda sem erros
- [ ] Tela de login aparece
- [ ] Pode fazer login com Google/Email

---

## 🌐 GITHUB SETUP

### Push para GitHub
```bash
git add .
git commit -m "feat: Add Vercel + Firebase integration"
git push
```
- [ ] Código no GitHub
- [ ] Branch main criado

---

## 🚀 VERCEL DEPLOYMENT

### Conectar Vercel
- [ ] Acesse vercel.com
- [ ] Clique "New Project"
- [ ] Conecte GitHub
- [ ] Selecione repositório `digitalStore`
- [ ] Clique "Import"

### Configurar Build
- [ ] Framework: Vite ✅
- [ ] Build Command: `pnpm build:vercel`
- [ ] Output Dir: `dist`
- [ ] Install: `pnpm install --frozen-lockfile`

### Adicionar Variáveis de Ambiente
```
VITE_FIREBASE_API_KEY = AIza...
VITE_FIREBASE_AUTH_DOMAIN = seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID = seu-projeto
VITE_FIREBASE_STORAGE_BUCKET = seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID = 123456789
VITE_FIREBASE_APP_ID = 1:123456789:web:abc123...
STRIPE_PUBLIC_KEY = pk_live_... (opcional)
```
- [ ] Todas as variáveis adicionadas

### Deploy
- [ ] Clique "Deploy"
- [ ] Aguarde build completar (~2-3 min)
- [ ] Deploy realizado ✅

### Verificar
- [ ] URL do Vercel funciona
- [ ] Login com Google funciona
- [ ] Produtos carregam
- [ ] Sem erros no console

---

## 🔒 FIRESTORE SEGURANÇA

### Configurar Regras
1. Firebase Console → Firestore → Regras
2. Cole as regras do `DEPLOY_GUIDE.md`
3. Publicar ✅

- [ ] Regras de Firestore configuradas
- [ ] Regras de Storage configuradas

### Testar Permissões
- [ ] Usuário pode ler produtos
- [ ] Usuário pode criar pedidos
- [ ] Admin pode editar produtos

---

## 📱 FUNCIONALIDADES ATIVAS

- [ ] Catálogo de produtos funciona
- [ ] Filtros funcionam
- [ ] Busca funciona
- [ ] Página individual funciona
- [ ] Carrinho funciona
- [ ] Login funciona
- [ ] Logout funciona

---

## 📊 MONITORAMENTO

### Verificar Status
- [ ] Vercel Dashboard: Deploy bem-sucedido
- [ ] Firebase Console: Database em uso
- [ ] Storage: Sem erros

### Otimizações (Bônus)
- [ ] Habilitar caching no Vercel
- [ ] Configurar CDN
- [ ] Monitorar performance
- [ ] Backups automáticos Firebase

---

## 🎉 DONE!

Parabéns! Seu projeto está no ar com:
- ✅ Frontend em Vercel
- ✅ Banco em Firebase
- ✅ Autenticação com Firebase Auth
- ✅ Storage com Firebase Storage

### Próximas Steps
- [ ] Conectar Stripe para pagamentos
- [ ] Criar dashboard admin
- [ ] Implementar reviews
- [ ] Configurar emails
- [ ] Analytics com GA4

---

## 🔗 Links Úteis

- [Seu site Vercel](https://seu-dominio.vercel.app)
- [Firebase Console](https://console.firebase.google.com)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Documentação](https://github.com/seu-usuario/digitalStore)

---

## 📞 Suporte

Se tiver problemas:

1. Verifique DEPLOY_GUIDE.md
2. Verifique FIREBASE_INTEGRATION.md
3. Veja logs no Vercel
4. Veja logs no Firebase
5. Abra issue no GitHub


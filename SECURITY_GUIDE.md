# 🔐 GUIA DE SEGURANÇA - Firebase & Environment Variables

**CRÍTICO:** Nunca commit credenciais Firebase no GitHub!

---

## ⚠️ O QUE FAZER IMEDIATAMENTE

### 1. REVOGAR CHAVES COMPROMETIDAS

Como você compartilhou suas credenciais Firebase, você DEVE:

1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Vá em **Projeto → Configurações → Chaves do API**
3. **DELETE a chave comprometida**
4. Gere uma **nova chave** (ela será manuellement incluída em `.env`)

### 2. GERAR NOVAS CREDENCIAIS

```
Firebase Console → Configurações do projeto
Apps → Web app (digital-store)
Copie o novo objeto de configuração
Cole em .env (nunca em código!)
```

### 3. VERIFICAR GITHUB

```bash
# Ver se credenciais foram commitadas
git log -p | grep -i "apikey\|projectId"

# Se sim, você PRECISA:
# 1. Revogar as chaves (item 1 acima)
# 2. Reescrever histórico do git
# 3. Force push (cuidado!)
```

---

## ✅ SEGURANÇA CORRETA

### Usar Variáveis de Ambiente

**✅ CORRETO:**
```typescript
// client/src/lib/firebase.ts
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,  // Carregado de .env
  // ... resto
};
```

**❌ ERRADO:**
```typescript
// ❌ Nunca faça isso!
const firebaseConfig = {
  apiKey: "AIzaSyCK8_54u7qz30qSvMcP4LjTCVZrX7_cN3o",  // Hardcoded!
  // ...
};
```

### Arquivos .env

**❌ NÃO COMMIT:**
```bash
git commit -m "Add config" # ← Evite, especialmente se tiver .env
git push  # Verifica se .gitignore está correto
```

**✅ SEMPRE:**
```bash
# Verificar que .gitignore está certo
cat .gitignore | grep ".env"

# Resultado esperado:
# .env
# .env.local
# .env.*.local
```

---

## 🔒 Fluxo de Segurança Recomendado

### Local (Seu PC)
```
1. Crie arquivo .env local com credenciais
2. NUNCA faça commit do .env
3. Arquivo fica só na sua máquina
4. .gitignore garante proteção
```

### GitHub
```
1. Código vai para GitHub (SEM .env)
2. Credenciais NUNCA aparecem no histórico
3. .env.example mostra o FORMATO (valores fake)
```

### Vercel (Produção)
```
1. Conecta ao GitHub
2. Vai em Project Settings → Environment Variables
3. Adiciona as VARIÁVEIS MANUALMENTE (não clona do repo)
4. Seu site roda com credenciais seguras
```

---

## 🎯 Checklist de Segurança

### Antes de Fazer Commit

- [ ] `.env` está em `.gitignore`?
  ```bash
  grep "^.env" .gitignore
  ```

- [ ] Nenhuma credencial em archivos `.ts` / `.tsx`?
  ```bash
  grep -r "AIzaSy\|sk_live\|pk_live" client/ server/
  ```

- [ ] Existe `.env.example` com valores de exemplo?
  ```bash
  cat .env.example
  # Resultado: valores fake, não reais
  ```

### Antes de Fazer Push

```bash
# Ver o que vai ser commitado
git diff --staged

# Se verificar qualquer credencial: PARE! Não faça push
git reset  # Desfazer staged
```

### Se Acidentalmente Commitou Credenciais

```bash
# 1. IMEDIATAMENTE revogar chaves Firebase
# (veja "O QUE FAZER IMEDIATAMENTE" acima)

# 2. Remove arquivo do histórico
git rm --cached .env

# 3. Commit essa remoção
git commit -m "security: Remove .env from tracking"

# 4. Force push (cuidado com isso!)
# git push --force-with-lease

# 5. Verificar que foi removido
git log --name-status | grep ".env"
# Não deve aparecer
```

---

## 🔑 Variáveis de Ambiente Seguras

### Conven ção de Nomes

```env
# Frontend (exposto, só dados públicos)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=...

# Backend (secreto, não expor!)
STRIPE_SECRET_KEY=...  # ← Sem VITE_
DATABASE_URL=...        # ← Sem VITE_
OAUTH_CLIENT_SECRET=... # ← Sem VITE_
```

**Nota:** Tudo com `VITE_` fica disponível no browser (cuidado!). Sem `VITE_` fica só no servidor.

### .env.example (Modelo Seguro)

```env
# ✅ Copie este arquivo para .env e preencha com SUAS credenciais

# Firebase (pública, ok expor)
VITE_FIREBASE_API_KEY=seu_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=seu_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_project_id
VITE_FIREBASE_STORAGE_BUCKET=seu_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id

# Stripe (SECRETO - não expor!)
STRIPE_SECRET_KEY=sk_live_xxxxx  # ← Sem VITE_
STRIPE_PUBLIC_KEY=pk_live_xxxxx

# Database (SECRETO)
DATABASE_URL=mysql://user:pass@host/db

# Node
NODE_ENV=development
```

---

## 🚨 O Que NUNCA Fazer

| ❌ NUNCA | ✅ FAÇA |
|---------|--------|
| Commit `.env` | Adicione em `.gitignore` |
| Hardcode credenciais | Use variáveis de ambiente |
| Share `.env` por email | Use Vercel/Firebase console |
| Coloque secret no `VITE_` | Prefixe secrets sem `VITE_` |
| GitHub credentials públicas | Revogar e gerar novas |
| Expor no README | Use `.env.example` |

---

## 📞 Se Comprometida Credencial

1. **Imediatamente:** Revogar chaves (Firebase Console)
2. **Gerar nova:** Nova credencial em Firebase
3. **Atualizar:** Copiar para `.env` local
4. **Vercel:** Atualizar em Project Settings
5. **GitHub:** Procurar no histórico
6. **Se commitou:** Reescrever história com `git reflog`

---

## 🎓 Recursos Educacionais

- [Firebase Security Best Practices](https://firebase.google.com/docs/security)
- [OWASP: Secrets Management](https://owasp.org/www-community/Secrets_Management)
- [GitHub: Keeping secrets safe](https://github.blog/2021-04-27-behind-the-scenes-how-we-secured-github-from-the-log4j-exploit/)

---

## ✅ Seu Projeto Está Seguro Agora

1. ✅ `.env` criado localmente
2. ✅ `.env` está no `.gitignore`
3. ✅ `firebase.ts` usa variáveis de ambiente
4. ✅ `.env.example` documenta formato
5. ✅ Validação de variáveis no código

**Próximo passo:** Fazer deploy em Vercel + Firebase (seguir DEPLOY_GUIDE.md)


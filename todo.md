# Digital Store - TODO

## Arquitetura e Setup
- [ ] Definir schema do banco de dados (produtos, pedidos, itens de pedido, downloads, avaliações)
- [ ] Configurar Stripe API keys e webhooks
- [ ] Configurar credenciais S3 (AWS)
- [ ] Adicionar secrets ao projeto (STRIPE_SECRET_KEY, AWS_ACCESS_KEY_ID, etc)
- [ ] Criar estrutura de pastas do projeto

## Design System e Componentes Base
- [ ] Definir paleta de cores elegante e moderna
- [ ] Configurar tipografia (Google Fonts)
- [ ] Criar componentes base: Header, Footer, Navigation
- [ ] Criar componentes de UI: ProductCard, Button, Input, Modal
- [ ] Implementar layout responsivo mobile-first

## Página Inicial (Landing Page)
- [ ] Hero section com CTA principal
- [ ] Seção de categorias de produtos
- [ ] Vitrine de produtos em destaque
- [ ] Seção de benefícios/features
- [ ] Footer com links e informações

## Catálogo de Produtos
- [ ] Página de listagem com grid de produtos
- [ ] Implementar filtros por categoria
- [ ] Implementar busca por texto
- [ ] Implementar ordenação (preço, popularidade, recente)
- [ ] Paginação ou infinite scroll
- [ ] Página individual de produto com descrição, preview, avaliações

## Carrinho e Checkout
- [ ] Implementar carrinho de compras (estado local/context)
- [ ] Página de carrinho com listagem de itens
- [ ] Página de checkout com resumo de pedido
- [ ] Integração com Stripe para pagamentos
- [ ] Confirmação de pagamento e geração de link de download

## Autenticação e Perfil de Usuário
- [ ] Página de login/registro
- [ ] Perfil do usuário com dados pessoais
- [ ] Histórico de pedidos do usuário
- [ ] Página de downloads adquiridos
- [ ] Integração com Manus OAuth

## Dashboard Administrativo
- [ ] Layout com sidebar de navegação
- [ ] Página de dashboard principal com overview
- [ ] Gestão de produtos (CRUD)
- [ ] Upload de arquivos digitais e imagens via S3
- [ ] Gestão de pedidos (visualizar, atualizar status)
- [ ] Gestão de usuários (visualizar, editar, deletar)
- [ ] Configurações gerais da loja

## Análises e Métricas
- [ ] Gráfico de receita por período
- [ ] Gráfico de vendas por período
- [ ] Produtos mais vendidos
- [ ] Estatísticas de usuários
- [ ] Integração com Recharts para visualizações

## Controle de Acesso (Roles)
- [ ] Implementar enum de roles (admin, user)
- [ ] Proteger rotas do frontend baseado em role
- [ ] Proteger procedures do backend com adminProcedure
- [ ] Validar permissões em todas as operações sensíveis

## Testes e Validação
- [ ] Testes unitários com Vitest
- [ ] Testar fluxo de compra completo
- [ ] Validar controle de acesso por roles
- [ ] Testar upload e download de arquivos
- [ ] Testar integração com Stripe

## Deploy e Documentação
- [ ] Preparar variáveis de ambiente para Vercel
- [ ] Documentar processo de setup
- [ ] Criar guia de uso do dashboard
- [ ] Preparar checkpoint final

# Dante Assistant — Painel Web

Painel de gestão para o Dante Assistant, um assistente de negócios via WhatsApp para autônomos brasileiros.

## Stack

- **React 18** + **Vite 6**
- **Tailwind CSS** + design system customizado
- **shadcn/ui** (componentes Radix UI)
- **Framer Motion** (animações de página e componentes)
- **Recharts** (gráfico de receitas)
- **Axios** (cliente HTTP com interceptors JWT)
- **React Query v5** (cache e sincronização de estado servidor)
- **React Router v6**

## Pré-requisitos

- Node.js 18+
- npm 9+

## Como rodar localmente

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor de desenvolvimento
npm run dev
```

O app estará disponível em `http://localhost:5173`.

## Build de produção

```bash
npm run build
```

Os arquivos gerados ficam em `dist/`. Para servir localmente:

```bash
npm run preview
```

## Variáveis de ambiente

Arquivo `.env` (já criado):

```
VITE_API_URL=http://187.77.226.66:8085
```

Para apontar para outro backend, edite este arquivo antes do build.

## Estrutura de pastas

```
src/
├── api/              # Instância Axios + funções por domínio
│   ├── axios.js      # Configuração base + interceptors
│   ├── auth.js
│   ├── dashboard.js
│   ├── transactions.js
│   ├── appointments.js
│   └── services.js
├── components/       # Componentes reutilizáveis
│   ├── ui/           # Primitivos (button, input, dialog, etc.)
│   ├── Layout.jsx    # Sidebar + navegação
│   ├── PageWrapper.jsx
│   ├── OwlLogo.jsx   # Mascote SVG
│   ├── Skeleton.jsx
│   ├── EmptyState.jsx
│   └── ConfirmDialog.jsx
├── context/
│   ├── AuthContext.jsx   # JWT, login, logout
│   └── ThemeContext.jsx  # Dark/light mode
├── pages/
│   ├── login/        # Autenticação em 2 passos
│   ├── dashboard/    # Métricas + gráfico + transações
│   ├── historico/    # Tabela paginada + filtros
│   ├── agenda/       # Agendamentos por dia
│   └── servicos/     # CRUD de serviços
└── utils/
    ├── formatters.js  # Moeda, datas (pt-BR)
    └── cn.js          # Utilitário clsx + tailwind-merge
```

## Fluxo de autenticação

1. Usuário digita número de WhatsApp brasileiro
2. Backend envia código OTP de 6 dígitos via WhatsApp
3. Usuário insere o código nos 6 inputs individuais
4. Backend retorna JWT + tenantId + businessName
5. Token salvo no `localStorage`, injetado em todas as requisições
6. Expiração (401) redireciona automaticamente para `/login`

## Páginas

| Rota         | Descrição                                    |
|--------------|----------------------------------------------|
| `/login`     | Autenticação OTP via WhatsApp                |
| `/dashboard` | Métricas do dia + gráfico + últimas transações |
| `/historico` | Histórico paginado com filtros de data/tipo  |
| `/agenda`    | Agendamentos por dia com atualização de status |
| `/servicos`  | CRUD de serviços com emoji picker            |

## Design

- Cor primária: verde escuro `#1a472a`
- Accent: âmbar `#f59e0b`
- Suporte completo a dark/light mode
- Responsivo: mobile-first com sidebar no desktop e menu lateral no mobile
- Animações de entrada/saída em todas as páginas e componentes

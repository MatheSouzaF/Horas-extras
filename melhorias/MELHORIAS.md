# Documento de Melhorias — Horas Extras

**Versão:** 1.0 | **Data:** 2026-03-14 | **Escopo:** Frontend + Backend + Arquitetura

---

## Índice

1. [Resumo Executivo](#1-resumo-executivo)
2. [Melhorias Visuais e de UI/UX](#2-melhorias-visuais-e-de-uiux)
3. [Melhorias de Arquitetura Frontend](#3-melhorias-de-arquitetura-frontend)
4. [Melhorias de Arquitetura Backend](#4-melhorias-de-arquitetura-backend)
5. [Melhorias de Lógica de Negócio](#5-melhorias-de-lógica-de-negócio)
6. [Segurança](#6-segurança)
7. [Performance](#7-performance)
8. [Priorização](#8-priorização)

---

## 1. Resumo Executivo

O projeto **Horas Extras** é uma aplicação full-stack bem estruturada para controle de horas e cálculo de ganhos. O core funcional está sólido, mas há oportunidades claras de melhoria em três frentes:

- **Visual/UX**: A interface é funcional mas carece de polish, feedback visual e estados de erro/vazio adequados.
- **Arquitetura frontend**: `App.tsx` com ~1.450 linhas centraliza demais — estado, lógica de cálculo, chamadas de API e renderização.
- **Backend**: Lógica de cálculo duplicada entre frontend/backend, ausência de rate limiting, validações de segurança ausentes.

---

## 2. Melhorias Visuais e de UI/UX

### 2.1 Design System — Tokens e Consistência

**Problema atual**: cores, espaçamentos e tipografia definidos inline ou dispersos no CSS sem tokens centralizados. Qualquer mudança visual exige busca em múltiplos arquivos.

**Melhoria sugerida**: criar um arquivo de variáveis CSS com tokens semânticos:

```css
/* src/styles/tokens.css */
:root {
  /* Cores primárias */
  --color-primary: #1f2937;
  --color-primary-hover: #374151;
  --color-accent: #2563eb;

  /* Superfícies */
  --color-surface: #ffffff;
  --color-surface-raised: #f9fafb;
  --color-border: #e5e7eb;

  /* Texto */
  --color-text-primary: #111827;
  --color-text-secondary: #6b7280;
  --color-text-hint: #9ca3af;

  /* Feedback */
  --color-success: #16a34a;
  --color-error: #dc2626;
  --color-warning: #d97706;

  /* Espaçamento (escala 4pt) */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;

  /* Border radius */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;

  /* Sombras */
  --shadow-card: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-modal: 0 10px 40px rgba(0, 0, 0, 0.15);

  /* Tipografia */
  --font-heading: "Inter", system-ui, sans-serif;
  --font-body: "Inter", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", "Fira Code", monospace;
}
```

**Impacto**: manutenção centralizada, suporte a dark mode trivial futuramente, consistência visual automática.

---

### 2.2 Tipografia — Hierarquia Visual

**Problema atual**: ausência de escala tipográfica clara. Títulos de seção e dados numéricos competem visualmente.

**Melhoria sugerida**:

| Papel      | Tag     | Tamanho | Peso | Uso                                                |
| ---------- | ------- | ------- | ---- | -------------------------------------------------- |
| Display    | `h1`    | 32px    | 700  | Valores monetários grandes                         |
| Heading    | `h2`    | 20px    | 600  | Títulos de seção (Resumo Mensal, Dias Trabalhados) |
| Subheading | `h3`    | 16px    | 600  | Títulos de card individual                         |
| Body       | `p`     | 14px    | 400  | Texto corrido                                      |
| Label      | `span`  | 12px    | 500  | Rótulos de campo (ENTRADA, SAÍDA, VALOR GANHO)     |
| Hint       | `small` | 11px    | 400  | Textos auxiliares                                  |
| Mono       | `data`  | 16px    | 500  | Horas e valores financeiros                        |

Os valores monetários e de horas devem usar `font-variant-numeric: tabular-nums` para que os dígitos se alinhem corretamente em listas.

---

### 2.3 Cards de Dia — Redesign

**Problema atual**: os cards de dia contêm muita informação em layout vertical simples, sem hierarquia clara entre data, horários e valor.

**Melhoria sugerida** — estrutura em três zonas:

```
┌─────────────────────────────────────────────┐
│ 14/03/2026  [Portobello]          [Sexta]   │  ← zona de contexto
│─────────────────────────────────────────────│
│   10:00  ──────────────────────→  19:00     │  ← zona de horário
│         [Hora Extra 100%]  9h trabalhadas   │  ← zona de modelo
│─────────────────────────────────────────────│
│   R$ 787,50                    [Editar ✏]   │  ← zona de valor + ação
└─────────────────────────────────────────────┘
```

**Detalhe visual**:

- Data com peso 600, tamanho 15px
- Projeto como badge colorido (cor gerada do hash do nome, como já é feito nas estatísticas)
- Dia da semana exibido como texto secundário (Sexta, Sábado em vermelho para indicar adicional)
- Seta entre horários com linha mais suave
- Valor monetário em destaque com `font-size: 20px; font-weight: 700`
- Botão de editar visível apenas no hover/focus (reduz poluição visual)

---

### 2.4 Resumo Mensal — Melhorar Cards de KPI

**Problema atual**: o `Summary` exibe apenas duas linhas de texto simples sem hierarquia visual.

**Melhoria sugerida** — cards KPI lado a lado:

```
┌──────────────────────┐  ┌──────────────────────┐
│   Total de Horas     │  │   Total Calculado    │
│                      │  │                      │
│   180,67 h           │  │   R$ 10.922,92       │
│                      │  │                      │
│   34 dias • Mar/26   │  │   salário base ÷160  │
└──────────────────────┘  └──────────────────────┘
```

O subtexto "salário base ÷ 160" contextualiza como o valor foi calculado sem precisar o usuário ir até Configurações para entender.

---

### 2.5 Navegação — MonthNavigator

**Problema atual**: o `MonthNavigator` exibe apenas `<` e `>` com o mês no meio. Não há indicação de quantos meses têm dados.

**Melhoria sugerida**:

- Mostrar indicador visual (ponto) nos meses com registros
- Ao clicar no mês, abrir um mini seletor mensal (grade 3x4 dos meses do ano) em vez de navegar sequencialmente
- Adicionar atalho de teclado: `Alt+←` e `Alt+→` para navegar entre meses

---

### 2.6 Estados Vazios

**Problema atual**: quando não há dias cadastrados, a lista simplesmente fica vazia.

**Melhoria sugerida** — empty state descritivo:

```
┌─────────────────────────────────────────────┐
│                                             │
│              📋  (ícone SVG)                │
│                                             │
│       Nenhum dia trabalhado em Mar/26       │
│   Adicione seu primeiro dia para começar    │
│                                             │
│         [+ Adicionar Dia]                   │
│                                             │
└─────────────────────────────────────────────┘
```

Aplicar o mesmo padrão para: Resumo Geral sem registros, Estatísticas sem dados, Resumo Anual sem meses.

---

### 2.7 Feedback de Sincronização

**Problema atual**: a sincronização automática acontece silenciosamente — o usuário não sabe se os dados foram salvos ou se houve erro.

**Melhoria sugerida** — indicador de status discreto no header:

```
Board do Matheus          [● Salvo às 14:32]   [Logout]
                          [⟳ Salvando...]
                          [⚠ Erro ao salvar]
```

Usar um pequeno badge no canto com três estados: salvando (spinner), salvo (✓ verde, desaparece em 3s), erro (⚠ laranja, persiste até resolver).

---

### 2.8 Feedback de Ações Destrutivas

**Problema atual**: ao remover um dia, a ação é imediata sem confirmação.

**Melhoria sugerida**:

- Diálogo de confirmação ao remover um dia com entrada preenchida
- Toast de "Entrada removida" com ação **Desfazer** (mantida por 5 segundos) — permite recuperação sem necessidade de modal bloqueante
- Diferenciação visual: botão de remover em cor vermelha suave (`text-red-500`) separado das ações primárias

---

### 2.9 Modal de Adicionar/Editar Dia

**Problema atual**: o modal não fornece feedback visual sobre qual modelo está selecionado, nem preview do valor calculado em tempo real.

**Melhorias sugeridas**:

1. **Preview de valor em tempo real**: enquanto o usuário preenche horários/modelo, mostrar o valor calculado na base do formulário:

```
  ENTRADA  10:00    SAÍDA  19:00    →  9h trabalhadas
  Modelo: [Hora Extra 100%]

  ┌──────────────────────────────────┐
  │  Valor estimado: R$ 787,50       │
  └──────────────────────────────────┘

  [Cancelar]                [Salvar]
```

2. **Validação inline**: mostrar erro abaixo do campo específico (ex: "Horário de saída deve ser após a entrada") em vez de bloquear o submit silenciosamente.

3. **Campo de projeto com autocomplete melhorado**: exibir badge colorido ao selecionar projeto existente, mostrando quantos dias já foram registrados para aquele projeto no mês.

---

### 2.10 Estatísticas — Melhorar Gráficos

**Problema atual**: os gráficos de barras são implementados via CSS puro (altura relativa), sem tooltips, sem valores exatos ao hover, sem acessibilidade.

**Melhoria sugerida**: adicionar biblioteca leve de gráficos. Opções ordenadas por custo/benefício:

| Biblioteca                 | Tamanho | Pros                               | Contra             |
| -------------------------- | ------- | ---------------------------------- | ------------------ |
| **Recharts**               | ~150KB  | Componentes React nativos, simples | Médio              |
| **Chart.js**               | ~200KB  | Madura, bem documentada            | Não é React-native |
| **Tremor** (apenas charts) | ~80KB   | Design pronto, acessível           | Opinionado         |

Com qualquer biblioteca, aplicar:

- Tooltips ao hover mostrando valor exato + percentual do total
- Legenda clicável para filtrar séries
- Cores acessíveis (não depender apenas de cor para distinguir projetos)
- Texto alternativo para screen readers (`aria-label` no container do gráfico com resumo textual)

---

### 2.11 Responsividade Mobile

**Problema atual**: a grade de cards de dia usa `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))`, o que pode resultar em cards muito estreitos em mobile pequeno (< 360px).

**Melhorias**:

- Mínimo de 300px por card ou coluna única abaixo de 480px
- Sidebar hambúrguer funcional verificada em iOS Safari (safe area, `env(safe-area-inset-*))`)
- Tabela do Resumo Anual (Meses × Colunas) deve virar cards empilhados em mobile
- Formulário modal em mobile deve usar `position: fixed; inset: 0` com scroll interno ao invés de overlay

---

### 2.12 Dark Mode

Hoje apenas light mode. Dado o contexto de uso (dashboard financeiro, consultado frequentemente), dark mode seria bem-vindo.

**Abordagem recomendada**: usar `prefers-color-scheme` + tokens CSS já definidos (melhoria 2.1):

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-surface: #111827;
    --color-surface-raised: #1f2937;
    --color-border: #374151;
    --color-text-primary: #f9fafb;
    --color-text-secondary: #9ca3af;
  }
}
```

Zero mudança nos componentes — tudo via tokens.

---

## 3. Melhorias de Arquitetura Frontend

### 3.1 Quebrar App.tsx (CRÍTICO)

**Problema atual**: `App.tsx` tem ~1.450 linhas misturando estado, lógica de negócio, chamadas HTTP, helpers de cálculo e renderização. É o maior risco de manutenibilidade do projeto.

**Melhoria sugerida** — separação em camadas:

```
src/
├── hooks/
│   ├── useAuth.ts              # estado de sessão, login, logout, refresh
│   ├── useMonthlyData.ts       # carregamento/salvamento de dados mensais
│   ├── useGeralData.ts         # carregamento de todos os registros
│   ├── useAnnualData.ts        # carregamento do resumo anual
│   └── useTotals.ts            # cálculo de totais a partir dos dias
│
├── lib/
│   ├── calculations.ts         # calculateWorkedHours, getDayValue, etc.
│   └── formatters.ts           # formatCurrency, formatDateToBr, etc.
│
├── services/
│   └── api.ts                  # já existe, manter
│
├── stores/ (opcional, se crescer)
│   └── appStore.ts             # Zustand ou Context para estado global
│
└── components/                 # já existe
```

**Exemplo — extrair hook `useAuth.ts`**:

```ts
// src/hooks/useAuth.ts
export function useAuth() {
  const [session, setSession] = useState<AuthSession | null>(() => loadSession());
  const [authError, setAuthError] = useState('');

  const login = async (email: string, password: string, deviceName?: string) => { ... };
  const logout = async () => { ... };
  const requestWithRefresh = async <T>(path: string, options?) => { ... };

  return { session, authError, login, logout, requestWithRefresh };
}
```

`App.tsx` passaria a ser apenas composição de hooks + layout de alto nível, com menos de 200 linhas.

---

### 3.2 Eliminar Duplicação de Lógica de Cálculo

**Problema atual**: as funções `calculateWorkedHours`, `calculateStandardModelValue`, `getDayValue` existem **idênticas** em `src/App.tsx` e `server/src/routes/hours.routes.ts`. Qualquer bug corrigido em um lado precisa ser replicado manualmente no outro.

**Melhoria sugerida — shared package**:

```
projeto/
├── packages/
│   └── calc/
│       ├── package.json        # { "name": "@horas/calc", "main": "index.ts" }
│       └── index.ts            # exporta todas as funções de cálculo
│
├── src/                        # frontend usa @horas/calc
└── server/                     # backend usa @horas/calc
```

`packages/calc/index.ts`:

```ts
export const STANDARD_MODEL_ID = 'default-standard';
export const NIGHT_START_MINUTES = 22 * 60;
export const NIGHT_END_MINUTES   = 8  * 60;

export function calculateWorkedHours(startTime: string, endTime: string): number { ... }
export function getDayValue(day, modelMap, hourlyValue): number { ... }
// ...
```

Ambos frontend e backend importam do mesmo lugar. Um bug corrigido = ambos corrigidos.

---

### 3.3 URL como Estado (Deep Linking)

**Problema atual**: trocar de mês, mudar entre "Mensal"/"Geral", ou navegar para o resumo anual não reflete na URL. Não é possível compartilhar um link para "Março de 2026" ou bookmarkar o resumo anual.

**Melhoria sugerida**: usar `react-router-dom` com URLs expressivas:

```
/            → redireciona para /mes/atual
/mes/2026-03 → view mensal, Março 2026
/geral       → view geral
/anual/2026  → resumo anual de 2026
/config      → configurações
```

Isso também resolve o problema de o botão "Voltar" do browser não funcionar corretamente hoje.

---

### 3.4 Gerenciamento de Estado com Zustand (Opcional)

Se o projeto crescer além do tamanho atual, considerar substituir o estado local em `App.tsx` por [Zustand](https://github.com/pmndrs/zustand):

```ts
// src/stores/appStore.ts
const useAppStore = create<AppState>((set, get) => ({
  session: null,
  selectedMonth: getCurrentMonth(),
  days: [],
  salary: 0,
  calculationModels: createDefaultModels(),

  setSelectedMonth: (month) => set({ selectedMonth: month }),
  addDay: (day) => set((s) => ({ days: [...s.days, day] })),
  // ...
}));
```

Vantagens: evita prop drilling, facilita testes unitários dos stores, React DevTools integration.

---

### 3.5 Componente `SalaryInput.tsx` Não Utilizado

O arquivo `src/components/SalaryInput.tsx` existe mas não é importado em nenhum lugar. Deve ser removido para manter a base de código limpa.

---

### 3.6 Tratamento de Erros Global

**Problema atual**: erros de API são capturados localmente em cada `useEffect`, resultando em mensagens de erro inconsistentes e código repetido de tratamento de 401.

**Melhoria sugerida**: `ErrorBoundary` + interceptor central:

```ts
// src/services/api.ts — adicionar interceptor
export function createApiClient(
  getToken: () => string | null,
  onUnauthorized: () => void,
) {
  return {
    async request<T>(path: string, options?) {
      try {
        return await apiRequest<T>(path, { ...options, token: getToken() });
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          onUnauthorized(); // centraliza o redirect para login
        }
        throw err;
      }
    },
  };
}
```

---

## 4. Melhorias de Arquitetura Backend

### 4.1 Modelos de Cálculo Armazenados como Raw SQL

**Problema atual**: `modelsJson` é uma coluna adicionada via `$executeRaw` e lida via `$queryRaw` porque não está no schema Prisma. Isso contorna o type safety do Prisma e é frágil.

```ts
// atual — frágil
await transaction.$executeRaw`
  UPDATE "MonthlyRecord" SET "modelsJson" = ${JSON.stringify(calculationModels)} WHERE "id" = ${id}
`;
```

**Melhoria sugerida**: adicionar `modelsJson` ao `schema.prisma` como campo `Json`:

```prisma
model MonthlyRecord {
  id         String     @id @default(cuid())
  userId     String
  month      String
  salary     Float      @default(0)
  modelsJson Json?      // ← adicionar este campo
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt
  // ...
}
```

Isso elimina todos os `$queryRaw` para models e permite usar `record.modelsJson` diretamente com type safety.

---

### 4.2 Separar Rotas em Módulos

**Problema atual**: `hours.routes.ts` tem ~570 linhas com rotas, helpers, esquemas Zod e lógica de cálculo misturados.

**Melhoria sugerida**:

```
server/src/
├── modules/
│   └── hours/
│       ├── hours.routes.ts      # apenas definição de rotas (handler delegation)
│       ├── hours.service.ts     # lógica de negócio (queries Prisma, cálculos)
│       ├── hours.schema.ts      # schemas Zod de validação
│       └── hours.calc.ts        # funções de cálculo (ou usar @horas/calc)
└── routes/
    └── index.ts                 # monta todos os módulos
```

---

### 4.3 Rate Limiting

**Problema atual**: nenhum rate limiting nas rotas. Um atacante pode fazer brute force no endpoint `/auth/login` indefinidamente.

**Melhoria sugerida**: adicionar `express-rate-limit`:

```ts
// npm install express-rate-limit
import rateLimit from "express-rate-limit";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20, // 20 tentativas por janela
  message: { message: "Muitas tentativas. Tente novamente em 15 minutos." },
  standardHeaders: true,
});

app.use("/auth/login", authLimiter);
app.use("/auth/register", authLimiter);
```

---

### 4.4 Rotação de Refresh Tokens

**Problema atual**: o refresh token não é rotacionado ao ser usado. Se um token vazado for usado, o invasor mantém acesso indefinidamente.

**Melhoria sugerida**: ao usar o refresh token para gerar um novo access token, **revogar o token atual e emitir um novo refresh token**:

```ts
// Em POST /auth/refresh:
// 1. Revogar a sessão atual
await prisma.refreshSession.update({
  where: { id: session.id },
  data: { revokedAt: new Date() },
});

// 2. Criar nova sessão com novo refresh token
const newRefreshToken = generateToken();
await prisma.refreshSession.create({ data: { userId, tokenHash: hash(newRefreshToken), ... } });

// 3. Retornar novo par de tokens
return { token: newAccessToken, refreshToken: newRefreshToken };
```

---

### 4.5 Validação de Mês no PUT /hours

**Problema atual**: ao salvar via `PUT /hours?month=2026-03`, o backend já loga dias fora do mês (`outsideMonth`) mas não os bloqueia — apenas emite um `console.warn`.

**Melhoria sugerida**: retornar erro 422 quando dias fora do mês forem enviados:

```ts
const outsideMonth = days.filter((day) => !day.date.startsWith(monthParam));
if (outsideMonth.length > 0) {
  return response.status(422).json({
    message: `${outsideMonth.length} dia(s) fora do mês ${monthParam}.`,
    dates: outsideMonth.map((d) => d.date),
  });
}
```

---

### 4.6 Paginação no /hours/all

**Problema atual**: `/hours/all` carrega **todos os registros** do banco de uma vez. Para usuários com anos de histórico, isso pode ser centenas de registros em uma única query.

**Melhoria sugerida**: adicionar paginação por cursor ou offset:

```
GET /hours/all?page=0&limit=50
```

Resposta:

```json
{
  "days": [...],
  "total": 342,
  "page": 0,
  "hasMore": true
}
```

O frontend já tem paginação visual (20 itens/página) — basta conectá-la à paginação real do backend.

---

## 5. Melhorias de Lógica de Negócio

### 5.1 Detecção de Entradas Duplicadas

**Problema atual**: é possível salvar dois registros com a mesma data (ex: duas entradas para 14/03/2026), causando confusão no cálculo.

**Melhoria sugerida**: validar no frontend (antes de abrir o modal) e no backend (antes de salvar):

```ts
// Frontend — antes de adicionar dia
const isDuplicate = days.some((d) => d.date === newDate && d.id !== editingId);
if (isDuplicate) {
  setError("Já existe uma entrada para esta data. Edite a existente.");
  return;
}
```

---

### 5.2 Salário por Projeto (Múltiplos Contratos)

**Necessidade identificada**: usuários com contratos diferentes (ex: Portobello paga R$ 5.000/mês, Favo paga por hora a R$ 120/h) precisam de salários base distintos por projeto.

**Situação atual**: existe um único salário por mês, e modelos com `hourlyRate` customizado funcionam como workaround.

**Melhoria sugerida**: deixar explícito na UI que `hourlyRate` no modelo é "taxa por hora para este projeto", e exibir na tela de configurações:

```
┌─────────────────────────────────────────────────┐
│ Modelo: Hora Extra 100%                         │
│ Multiplicador: 2x                               │
│ Taxa horária:  R$ 87,50 (baseado no salário)    │  ← calculado
│ Substituir taxa: [ R$ 120,00 ]                  │  ← campo opcional
└─────────────────────────────────────────────────┘
```

---

### 5.3 Exportação de Dados

**Problema atual**: exportação disponível apenas como PDF por projeto. Não é possível exportar todos os dados para análise em planilha.

**Melhorias sugeridas**:

1. **Exportar CSV** de todos os registros (botão no Resumo Geral)
2. **Exportar PDF mensal completo** (não apenas por projeto)
3. Estrutura do CSV:
   ```
   Data,Entrada,Saída,Horas,Projeto,Modelo,Valor
   14/03/2026,10:00,19:00,9.00,Portobello,Hora Extra 100%,"R$ 787,50"
   ```

---

### 5.4 Histórico de Salário

**Problema atual**: o salário pode mudar a cada mês, mas não há forma de visualizar o histórico de salários ao longo do tempo.

**Melhoria sugerida**: o Resumo Anual já tem acesso aos salários por mês (`record.salary`). Adicionar na tabela do resumo anual:

```
Mês       | Dias | Horas    | Salário Base | Total
Janeiro   |   0  |  0.00 h  | -            | R$ 0,00
Fevereiro |  12  | 111.67 h | R$ 3.500,00  | R$ 7.656,25
Março     |  22  |  69.00 h | R$ 3.500,00  | R$ 3.281,25
```

---

### 5.5 Meta Mensal de Horas

**Melhoria sugerida**: permitir configurar uma meta mensal de horas (ex: 40h extras/mês). No Resumo Mensal, exibir progresso:

```
Total de Horas:  69.00 h / 80.00 h meta
                 [██████████████░░░░]  86%
```

---

## 6. Segurança

### 6.1 Tokens Armazenados em localStorage (XSS)

**Problema atual**: `session` (que contém JWT) é salvo em `localStorage`. Se houver qualquer XSS na aplicação, os tokens são comprometidos.

**Melhoria**: mover para `httpOnly cookies`. Exige mudança no backend para enviar o cookie:

```ts
// Backend: ao fazer login
res.cookie("access_token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 15 * 60 * 1000,
});
```

Isso elimina a necessidade de enviar o token no header `Authorization` do frontend.

---

### 6.2 Requisito de Senha

**Problema atual**: apenas comprimento mínimo de 6 caracteres é validado.

**Melhoria sugerida**:

- Mínimo 8 caracteres
- Pelo menos 1 número ou símbolo
- Indicador de força de senha no formulário de registro

---

## 7. Performance

### 7.1 Virtualização da Lista Geral

**Problema atual**: o Resumo Geral renderiza até `GERAL_PAGE_SIZE = 20` cards por página, mas sem virtualização — todos os 20 estão no DOM simultaneamente.

Para usuários com anos de dados, se a paginação do backend for implementada (melhoria 4.6), o frontend pode usar `react-virtual` ou `@tanstack/react-virtual` para renderizar apenas os itens visíveis.

---

### 7.2 Debounce de Salvamento

**Situação atual**: salvamento automático com debounce de 500ms. Aceitável, mas qualquer mudança (inclusive pequena) dispara o PUT.

**Melhoria**: comparar o estado atual com o último estado salvo antes de disparar o PUT — evitar requests desnecessários quando o usuário desfaz uma mudança nos 500ms:

```ts
const lastSavedRef = useRef(JSON.stringify(days));
// no efeito de sync:
const current = JSON.stringify(completeDays);
if (current === lastSavedRef.current) return;
lastSavedRef.current = current;
// ...fazer PUT
```

---

### 7.3 Code Splitting por Rota

**Melhoria sugerida**: se `react-router` for adicionado (melhoria 3.3), usar `React.lazy` para carregar `AnnualSummary` e `StatisticsPanel` apenas quando necessário:

```tsx
const AnnualSummary = React.lazy(() => import("./components/AnnualSummary"));
const StatisticsPanel = React.lazy(
  () => import("./components/StatisticsPanel"),
);
```

Reduz o bundle inicial significativamente (jsPDF/autotable também podem ser carregados somente quando o PDF for gerado).

---

## 8. Priorização

### Matriz de Impacto × Esforço

| #    | Melhoria                    | Impacto  | Esforço  | Prioridade       |
| ---- | --------------------------- | -------- | -------- | ---------------- |
| 3.1  | Quebrar App.tsx em hooks    | 🔴 Alto  | 🟡 Médio | **P1 — Urgente** |
| 3.2  | Shared package de cálculo   | 🔴 Alto  | 🟡 Médio | **P1 — Urgente** |
| 4.1  | modelsJson no schema Prisma | 🔴 Alto  | 🟢 Baixo | **P1 — Urgente** |
| 2.7  | Indicador de sync           | 🟠 Médio | 🟢 Baixo | **P2 — Alta**    |
| 2.8  | Toast com Desfazer          | 🟠 Médio | 🟢 Baixo | **P2 — Alta**    |
| 2.9  | Preview de valor no modal   | 🟠 Médio | 🟢 Baixo | **P2 — Alta**    |
| 4.3  | Rate limiting               | 🔴 Alto  | 🟢 Baixo | **P2 — Alta**    |
| 4.4  | Rotação refresh token       | 🔴 Alto  | 🟡 Médio | **P2 — Alta**    |
| 2.1  | Design tokens CSS           | 🟠 Médio | 🟢 Baixo | **P2 — Alta**    |
| 2.6  | Empty states                | 🟠 Médio | 🟢 Baixo | **P2 — Alta**    |
| 3.3  | URL como estado             | 🟠 Médio | 🟡 Médio | **P3 — Normal**  |
| 4.6  | Paginação /hours/all        | 🟡 Baixo | 🟡 Médio | **P3 — Normal**  |
| 2.10 | Biblioteca de gráficos      | 🟡 Baixo | 🟡 Médio | **P3 — Normal**  |
| 5.3  | Exportar CSV                | 🟠 Médio | 🟢 Baixo | **P3 — Normal**  |
| 2.12 | Dark mode                   | 🟡 Baixo | 🟡 Médio | **P4 — Futura**  |
| 5.5  | Meta mensal de horas        | 🟡 Baixo | 🟡 Médio | **P4 — Futura**  |
| 6.1  | httpOnly cookies            | 🔴 Alto  | 🔴 Alto  | **P4 — Futura**  |

---

### Ordem de Execução Sugerida

**Sprint 1 — Fundação (sem features novas, só refactor + segurança rápida)**

1. Criar `src/lib/calculations.ts` e `src/lib/formatters.ts` (extrair de App.tsx)
2. Criar `src/hooks/useAuth.ts`, `useMonthlyData.ts`, `useGeralData.ts`
3. Adicionar `modelsJson` ao schema Prisma (migration simples)
4. Adicionar rate limiting nas rotas de auth
5. Remover `SalaryInput.tsx` não utilizado

**Sprint 2 — UX Rápida (alto impacto, baixo esforço)**

1. Indicador de status de sincronização (salvo/salvando/erro)
2. Toast com "Desfazer" ao remover entrada
3. Empty states para lista vazia e view geral vazia
4. Design tokens CSS centralizados
5. Preview de valor no modal de adicionar/editar

**Sprint 3 — Arquitetura e Features**

1. React Router para deep linking de meses/views
2. Paginação real no `/hours/all` backend
3. Exportar CSV de todos os registros
4. Salário base visível no Resumo Anual por mês

**Sprint 4 — Polimento**

1. Biblioteca de gráficos com tooltips
2. Redesign de cards de dia
3. Dark mode via tokens CSS
4. Meta mensal de horas

---

_Documento gerado em 2026-03-14. Revisar após cada sprint._

# Migração: Supabase → PostgreSQL Local (Docker)

## Visão geral

```
Supabase (nuvem)  →  pg_dump / COPY  →  backup SQL  →  Docker PostgreSQL local
```

O banco local roda via Docker com volume persistente. Os dados do Supabase
foram exportados para `database/init/01-restore.sql` e são carregados
automaticamente na primeira inicialização do container.

---

## Pré-requisitos

- Docker e Docker Compose instalados
- Node.js 18+
- Porta 5432 livre na máquina

---

## Passo a passo

### 1. Subir o banco local

```bash
cd database
docker compose up -d
```

Aguarde ~5 segundos. O PostgreSQL carrega o script `init/01-restore.sql`
automaticamente na primeira vez (quando o volume ainda está vazio).

Verifique que o banco subiu:

```bash
docker compose logs postgres
# deve mostrar: database system is ready to accept connections
```

### 2. Atualizar o .env do servidor

Abra `server/.env` e substitua a linha `DATABASE_URL`:

```env
# Antes (Supabase)
DATABASE_URL="postgresql://postgres.xxx:senha@aws-1-us-east-1.pooler.supabase.com:5432/postgres"

# Depois (local)
DATABASE_URL="postgresql://horas:horas_secret@localhost:5432/horas_extras"
```

### 3. Verificar as migrations do Prisma

As tabelas já foram criadas pelo script de restore. Marque as migrations
existentes como aplicadas sem rodar novamente:

```bash
cd server
npx prisma migrate resolve --applied <nome-da-migration>
# ou simplesmente:
npx prisma db pull   # sincroniza o schema com o banco existente
```

Se preferir recriar tudo do zero via Prisma (só schema, sem dados):

```bash
npx prisma migrate deploy
```

### 4. Iniciar o servidor

```bash
cd server
npm run dev
```

### 5. Verificar os dados

Acesse o app e confirme que usuários, registros mensais e entradas de dias
aparecem corretamente.

---

## Backup manual (local)

Para gerar um backup do banco local a qualquer momento:

```bash
docker exec horas-extras-db pg_dump \
  -U horas horas_extras \
  --no-owner --no-acl \
  > database/backup-$(date +%Y%m%d-%H%M%S).sql
```

Para restaurar um backup:

```bash
docker exec -i horas-extras-db psql -U horas horas_extras < database/backup-YYYYMMDD.sql
```

---

## Resetar o banco (se necessário)

```bash
cd database
docker compose down -v   # remove o container E o volume
docker compose up -d     # recria tudo do zero (roda o init script novamente)
```

---

## Estrutura das pastas

```
database/
├── docker-compose.yml          # definição do container PostgreSQL
├── init/
│   └── 01-restore.sql          # dump do Supabase (carregado na 1ª inicialização)
└── supabase-backup-YYYYMMDD.sql  # cópias de segurança manuais

arquitetura-database/
└── MIGRACAO.md                 # este documento
```

---

## Variáveis de ambiente locais

| Variável           | Valor                                               |
|--------------------|-----------------------------------------------------|
| `POSTGRES_USER`    | `horas`                                             |
| `POSTGRES_PASSWORD`| `horas_secret`                                      |
| `POSTGRES_DB`      | `horas_extras`                                      |
| `DATABASE_URL`     | `postgresql://horas:horas_secret@localhost:5432/horas_extras` |

---

## Observações

- O volume Docker `postgres_data` persiste os dados mesmo após `docker compose down`.
  Só é apagado com `docker compose down -v`.
- O script `init/01-restore.sql` só roda na **primeira** inicialização do volume.
  Nas vezes seguintes o Docker ignora a pasta `init/`.
- Para adicionar novos scripts de inicialização, nomeie como `02-xxx.sql`,
  `03-xxx.sql` etc. O PostgreSQL os executa em ordem alfabética.

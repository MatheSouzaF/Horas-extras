# Passo 1, 2, 3 e 4 — Usuários + Horas + Sessão Robusta + Logout Global

API Node.js + TypeScript com autenticação JWT (access + refresh) e persistência de horas por usuário.

## Endpoints

- `POST /auth/register`
  - body: `{ "name": "Matheus", "email": "matheus@email.com", "password": "123456" }`
- `POST /auth/login`
  - body: `{ "email": "matheus@email.com", "password": "123456" }`
  - retorno: `{ token, refreshToken, user }`
- `POST /auth/refresh`
  - body: `{ "refreshToken": "..." }`
  - retorno: `{ token, refreshToken, user }`
- `POST /auth/logout`
  - body: `{ "refreshToken": "..." }`
  - revoga a sessão/dispositivo atual
- `POST /auth/logout-all`
  - header: `Authorization: Bearer <token>`
  - revoga todas as sessões do usuário
- `GET /auth/me`
  - header: `Authorization: Bearer <token>`
- `GET /hours?month=YYYY-MM`
  - header: `Authorization: Bearer <token>`
  - retorno: `{ salary, month, days[] }`
- `PUT /hours?month=YYYY-MM`
  - header: `Authorization: Bearer <token>`
  - body:
    ```json
    {
      "salary": 3200,
      "days": [
        {
          "date": "2026-02-14",
          "startTime": "08:00",
          "endTime": "18:00"
        }
      ]
    }
    ```

## Banco de dados

Este projeto **precisa de banco** para que o usuário veja os dados em qualquer dispositivo.

Sugestão local com Docker (PostgreSQL):

```bash
docker run --name horas-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=horas_extras \
  -p 5432:5432 \
  -d postgres:16
```

Atualize o `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/horas_extras?schema=public"
JWT_SECRET="coloque-um-segredo-forte-com-mais-de-16-chars"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="outro-segredo-forte-com-mais-de-16-chars"
JWT_REFRESH_EXPIRES_IN="7d"
PORT="3333"
```

## Como executar

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Se você já estava com o projeto rodando antes do Passo 4, rode a migração novamente para criar a tabela `RefreshSession`.

Servidor: `http://localhost:3333`

Healthcheck: `GET /health`

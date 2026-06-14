<div align="center">

# 🐱 KittyTask

**A Trello-style kanban app for organizing your work — boards, lists, and cards with drag-and-drop, labels, sharing, and real-time collaboration.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![.NET](https://img.shields.io/badge/.NET-10-512BD4?logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

🌐 **Live:** [kittytask.hamzaalsafi.com](https://kittytask.hamzaalsafi.com/)

</div>

---

## ✨ Features

- 🗂️ **Boards, lists & cards** — organize tasks the way you think
- 🖱️ **Drag & drop** — reorder lists and cards, move cards between lists
- 🏷️ **Color labels & card covers** — 8 labels and background colors per card
- 👥 **Sharing** — invite teammates by email to collaborate on a board
- ⚡ **Real-time** — changes appear instantly for everyone on a shared board (SignalR)
- 🔐 **Accounts** — email/password auth with JWT, auto-generated avatars
- 🎨 **Custom backgrounds** — gradient and image board backgrounds
- 📱 **Responsive** — works on desktop, tablet, and mobile
- 🐳 **Self-hostable** — one `docker compose up` brings up the entire stack

## 🧱 Tech stack

| Layer        | Technology                                              |
| ------------ | ------------------------------------------------------- |
| **Frontend** | Next.js (App Router), TypeScript, Tailwind CSS, dnd-kit, Framer Motion, TanStack Query |
| **Backend**  | ASP.NET Core (.NET 10) Web API, EF Core, ASP.NET Identity, JWT |
| **Database** | PostgreSQL                                              |
| **Realtime** | SignalR (WebSockets)                                    |
| **Delivery** | Docker Compose + Caddy reverse proxy                    |

> Originally built with Vite + React + Firebase, KittyTask was fully rewritten
> into this typed, self-hostable architecture — keeping the original UI while
> replacing Firebase with a .NET API and PostgreSQL.

## 🏗️ Architecture

```
                          ┌──────────────────────────┐
   Browser  ──────────▶   │   Caddy reverse proxy     │
                          │  /api,/hubs → backend     │
                          │  everything else → web    │
                          └─────────┬─────────┬───────┘
                                    │         │
                        ┌───────────▼──┐  ┌───▼────────────┐
                        │  Next.js     │  │  .NET Web API   │
                        │  (frontend)  │  │  REST + SignalR │
                        └──────────────┘  └───┬────────────┘
                                              │
                                       ┌──────▼───────┐
                                       │  PostgreSQL  │
                                       └──────────────┘
```

Board sharing is **normalized**: one board row with a `BoardMember` join table,
rather than copying a board into every member's data and fanning out writes. A
single SignalR group per board pushes live updates to all members.

### Data model

| Entity     | Fields                                                                     |
| ---------- | ------------------------------------------------------------------------- |
| **User**   | name, email, avatar (color + initials)                                    |
| **Board**  | title, background, backgroundImage, visibility (`private`/`shareable`), members |
| **List**   | title, order                                                              |
| **Card**   | title, order, background, labels (8 booleans)                             |

## 🚀 Getting started

### Run everything with Docker (recommended)

```bash
git clone https://github.com/Hamzaalsafi/KittyTask.git
cd KittyTask
cp .env.example .env          # set JWT_SECRET, POSTGRES_PASSWORD, APP_ORIGIN
docker compose up -d --build
```

Open **http://localhost:8080**. That's it — the proxy, frontend, API, and
database all start together, and database migrations run automatically.

### Local development

Requires **.NET 10 SDK**, **Node 20+**, and a PostgreSQL instance.

```bash
# 1. Postgres
docker run -d --name kittytask-pg -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=kittytask -p 5432:5432 postgres:16-alpine

# 2. Backend → http://localhost:5043  (applies EF migrations on startup)
cd backend && dotnet run

# 3. Frontend → http://localhost:3000
cd frontend && npm install --legacy-peer-deps && npm run dev
```

The frontend reads `NEXT_PUBLIC_API_BASE_URL` (defaults to `http://localhost:5043`).

## 📁 Project structure

```
KittyTask/
├── backend/                 # ASP.NET Core Web API (.NET 10)
│   ├── Controllers/         # Auth, Boards, Lists, Cards, Users
│   ├── Domain/              # Entities: ApplicationUser, Board, BoardMember, BoardList, Card
│   ├── Data/                # AppDbContext + EF migrations
│   ├── Hubs/                # BoardHub (SignalR)
│   ├── Services/            # TokenService, BoardAccess
│   └── Dtos/
├── frontend/                # Next.js app
│   ├── app/                 # Routes: / (login), /home, /board/[id], /create-board, /archive
│   ├── components/          # Board view, lists, cards, nav, menus, animations
│   └── lib/                 # api client, auth context, realtime hook, board state, types
├── Caddyfile                # Reverse proxy config
├── docker-compose.yml
└── .env.example
```

## 🔌 API overview

All endpoints live under `/api` and are JWT-protected except register/login.

| Method & path                          | Description                  |
| -------------------------------------- | --------------------------- |
| `POST /auth/register` · `/auth/login`  | Create account / sign in    |
| `GET /auth/me`                         | Current user                |
| `GET /boards` · `POST /boards`         | List / create boards        |
| `GET·PATCH·DELETE /boards/{id}`        | Read / update / delete board|
| `POST·DELETE /boards/{id}/members`     | Share / unshare a board     |
| `POST /boards/{id}/lists`              | Add a list                  |
| `PATCH·DELETE /lists/{id}`             | Rename / delete a list      |
| `PUT /boards/{id}/lists/order`         | Reorder lists               |
| `POST /lists/{id}/cards`               | Add a card                  |
| `PATCH·DELETE /cards/{id}`             | Update / delete a card      |
| `PUT /lists/{id}/cards/order`          | Reorder cards               |
| `POST /cards/{id}/move` · `/cards/copy`| Move / copy a card          |

Real-time updates are delivered over the SignalR hub at `/hubs/board`.

## ☁️ Deployment

KittyTask is deployed with Docker Compose on a VPS. The host's reverse proxy
terminates TLS and forwards `kittytask.hamzaalsafi.com` to the bundled Caddy
proxy. Because the frontend uses same-origin requests, the same image works on
any domain — set `APP_ORIGIN` and a strong `JWT_SECRET` in `.env` and run
`docker compose up -d --build`.

## 📝 License

Released under the [MIT License](LICENSE).

---

<div align="center">
Built with ❤️ by <a href="https://github.com/Hamzaalsafi">Hamza Alsafi</a>
</div>

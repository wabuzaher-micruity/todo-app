# Todo App

A collaborative todo application with rich features and real-time list sharing built with React and Supabase.

## Features

- **Todo Management** — Create, edit, delete, and reorder todos with drag-and-drop
- **Priority & Due Dates** — Set priority levels and due dates with visual indicators
- **Tags** — Organize todos with color-coded tags
- **Subtasks** — Break todos into smaller subtasks
- **Search** — Full-text search powered by Postgres `tsvector`
- **Filters** — Filter by priority, due date, tags, and completion status
- **Real-time Collaboration** — Share lists with other users via invite links
- **Role-based Access** — Viewer and editor roles with row-level security
- **Dark Mode** — Theme toggle with system preference support

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite 6
- **UI:** shadcn/ui (Radix UI + Tailwind CSS v4)
- **Backend:** Supabase (Postgres, Auth, Real-time, RLS)
- **Data Fetching:** TanStack Query v5
- **Routing:** React Router v7
- **Drag & Drop:** dnd-kit
- **Forms:** React Hook Form + Zod

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### Setup

1. **Clone and install dependencies:**

   ```bash
   git clone <repo-url>
   cd todo-app
   npm install
   ```

2. **Configure environment variables:**

   Create a `.env` file in the project root:

   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Run database migrations:**

   ```bash
   npx supabase link --project-ref your_project_ref
   npx supabase db push
   ```

4. **Start the dev server:**

   ```bash
   npm run dev
   ```

   Open [http://localhost:5173](http://localhost:5173).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |
| `npm test` | Run all tests (Vitest) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run db:push` | Push SQL migrations to Supabase |

## Project Structure

```
src/
├── components/
│   ├── auth/          # Login and signup forms
│   ├── layout/        # Sidebar, header, app shell
│   ├── lists/         # List creation and management
│   ├── search/        # Command palette search
│   ├── subtasks/      # Subtask list and items
│   ├── tags/          # Tag picker and badges
│   ├── todos/         # Todo items, filters, detail panel, drag-and-drop
│   └── ui/            # shadcn/ui primitives
├── hooks/             # Data fetching hooks (TanStack Query + Supabase)
├── lib/               # Supabase client, utilities, constants
├── pages/             # Route-level page components
├── providers/         # Auth, Query, and Theme providers
├── test/              # Test setup and utilities
└── types/             # TypeScript type definitions
supabase/
└── migrations/        # SQL migrations (tables, RLS, realtime, functions)
```

## Database

7 tables with row-level security enabled on all:

- `todo_lists` — User-owned lists
- `todos` — Todo items with priority, due dates, and full-text search
- `subtasks` — Nested subtasks under todos
- `tags` / `todo_tags` — Tagging system
- `list_shares` — Shared list access with roles
- `share_invites` — Invite links for list sharing

## License

MIT

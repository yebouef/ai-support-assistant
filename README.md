# AI Customer Support Assistant Demo

An interview-ready Prince Tech LLC demo that shows how a small business can use AI to reduce repetitive customer support while still escalating unresolved issues to a human.

The example business is BrightPath Tutoring. The assistant answers common parent questions from a knowledge base, recommends escalation when confidence is low, creates support tickets, and tracks product KPIs.

## What It Demonstrates

- Grounded support answers from a controlled FAQ knowledge base.
- OpenAI API integration path with deterministic local fallback.
- Supabase-ready PostgreSQL schema for FAQs, tickets, and support events.
- Ticket escalation for unresolved or human-requested issues.
- Product-owner artifacts: charter, epics, user stories, KPIs, architecture, and case study.

## Tech Stack

- React + Vite
- Node + Express
- OpenAI API
- Supabase PostgreSQL
- Cloudflare-ready frontend/backend shape

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open the Vite URL, usually `http://localhost:5173`.

The API runs on `http://localhost:8787`.

## Demo Mode

By default, `.env.example` sets `DEMO_MODE=true`. This makes the assistant use deterministic FAQ matching instead of calling OpenAI. That is intentional for interviews and local demos where secrets should not be required.

To enable OpenAI later:

```bash
DEMO_MODE=false
OPENAI_API_KEY=your_key_here
```

Keep this in `.env.local`; never commit it.

## Supabase Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Add these values to `.env.local`:

```bash
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_publishable_or_anon_key
```

If Supabase env vars are missing, the app stores local tickets and events in `data/local-store.json`, which is ignored by git.

## Demo Script

1. Ask: `How do I reschedule a tutoring session?`
2. Show that the assistant answers from the FAQ.
3. Ask: `I need to talk to a human about a billing issue.`
4. Fill in the ticket form.
5. Show the KPI panel updating escalation and ticket counts.
6. Open `docs/` to explain the product-owner artifacts.

## Product Artifacts

- `docs/project-charter.md`
- `docs/epics-and-user-stories.md`
- `docs/kpis-and-dashboard.md`
- `docs/architecture.md`
- `docs/case-study.md`

## Git Safety

`.gitignore` excludes:

- `.env`
- `.env.local`
- `node_modules/`
- `dist/`
- `data/local-store.json`

Before pushing to GitHub:

```bash
git status
git init
git add .
git commit -m "Initial commit: AI support assistant demo"
```

Add your GitHub remote only after creating the public repository.

# Architecture Notes

## Runtime
- React + Vite serves the demo interface.
- Express exposes the chat, ticket, and KPI API.
- Local demo mode stores tickets and events in `data/local-store.json`.
- Supabase can replace local storage when `SUPABASE_URL` and `SUPABASE_ANON_KEY` are configured.
- OpenAI can replace deterministic responses when `OPENAI_API_KEY` exists and `DEMO_MODE` is not `true`.

## Chat Flow
1. User sends a support question.
2. API loads active FAQs from Supabase or local seed data.
3. API scores FAQ overlap against the user question.
4. If confidence is low or the user asks for a human, the assistant recommends escalation.
5. If confidence is acceptable, the assistant answers from the matched FAQ.
6. Conversation events are recorded for KPI reporting.

## Escalation Flow
1. User fills out name, contact, and issue summary.
2. API creates an open ticket.
3. API records a ticket event.
4. KPI dashboard refreshes.

## Design Decisions
- Local-first mode keeps the demo runnable during interviews without exposing secrets.
- FAQ retrieval is simple keyword overlap so the logic is easy to explain.
- Supabase SQL is included as a clear migration path from demo to live project.
- The system prompt explicitly tells the model to stay grounded in supplied FAQ context.

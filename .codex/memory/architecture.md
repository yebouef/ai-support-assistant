# Architecture Memory

The demo is local-first and interview-oriented. It should run without OpenAI or Supabase credentials, while keeping real integration paths ready through environment variables.

Core decisions:
- Business example: BrightPath Tutoring.
- Frontend: React + Vite.
- Backend: Node + Express.
- AI path: OpenAI Responses API when `OPENAI_API_KEY` exists and `DEMO_MODE` is not `true`.
- Data path: Supabase tables for FAQs, tickets, and conversation events when Supabase env vars exist.
- Local fallback: seeded FAQs from `data/faqs.json`; tickets/events stored in ignored `data/local-store.json`.
- Escalation rule: recommend ticket creation when confidence is low or user asks for a human.

Keep the implementation explainable for a product-owner interview. Avoid heavy abstractions unless they make the demo easier to explain.

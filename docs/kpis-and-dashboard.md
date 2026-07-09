# KPIs and Dashboard Queries

## KPI 1: Deflection Rate
Definition: percentage of support chats answered without creating or recommending an escalation.

Formula:
```sql
answered_events / total_chat_events
```

Example query:
```sql
select
  count(*) filter (where event_type = 'answered')::numeric
  / nullif(count(*) filter (where event_type in ('answered', 'escalation_recommended')), 0)
  as deflection_rate
from public.conversation_events;
```

## KPI 2: Escalation Rate
Definition: percentage of support chats that required human follow-up.

Example query:
```sql
select
  count(*) filter (where escalated = true)::numeric
  / nullif(count(*) filter (where event_type in ('answered', 'escalation_recommended')), 0)
  as escalation_rate
from public.conversation_events;
```

## KPI 3: Answer Accuracy Proxy
Definition: average assistant confidence score. In production, this should be replaced or validated with human QA review.

Example query:
```sql
select avg(confidence) as answer_accuracy_proxy
from public.conversation_events
where event_type in ('answered', 'escalation_recommended');
```

## Dashboard v1
The app includes a local KPI panel that calls `GET /api/kpis`. It is intentionally simple: enough for a product owner interview, not a full BI implementation.

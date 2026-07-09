create extension if not exists "pgcrypto";

create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  question text not null,
  answer text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  contact text not null,
  issue_summary text not null,
  transcript_excerpt text,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists public.conversation_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  confidence numeric not null default 0,
  escalated boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.faqs enable row level security;
alter table public.tickets enable row level security;
alter table public.conversation_events enable row level security;

create policy "Read active FAQs"
on public.faqs
for select
to anon, authenticated
using (active = true);

create policy "Create support tickets"
on public.tickets
for insert
to anon, authenticated
with check (true);

create policy "Create conversation events"
on public.conversation_events
for insert
to anon, authenticated
with check (true);

create policy "Read KPI events"
on public.conversation_events
for select
to anon, authenticated
using (true);

create policy "Read ticket KPI status"
on public.tickets
for select
to anon, authenticated
using (true);

insert into public.faqs (category, question, answer, active) values
  ('Scheduling', 'How do I reschedule a tutoring session?', 'You can reschedule a tutoring session up to 24 hours before the appointment from the parent portal. Open the session, choose Reschedule, and pick an available time with the same tutor.', true),
  ('Billing', 'What payment methods do you accept?', 'BrightPath Tutoring accepts major credit cards, debit cards, and ACH bank payments. Monthly plans are billed on the first day of each month.', true),
  ('Programs', 'Do you offer SAT prep?', 'Yes. BrightPath offers SAT prep in 8-week and 12-week tracks. Each track includes diagnostic testing, weekly tutoring, practice assignments, and a final progress review.', true),
  ('Tutors', 'Can I choose my child''s tutor?', 'Families can request a preferred tutor. If that tutor is unavailable, BrightPath recommends a tutor based on subject, grade level, learning goals, and schedule.', true),
  ('Cancellations', 'What is your cancellation policy?', 'Sessions canceled at least 24 hours in advance are credited back to the family account. Late cancellations may be charged unless there is an emergency.', true),
  ('Progress', 'How do parents track progress?', 'Parents receive a monthly progress summary with attendance, topics covered, tutor notes, and recommended next steps. Tutors may also send quick notes after individual sessions.', true)
on conflict do nothing;

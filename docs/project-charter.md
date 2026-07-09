# Project Charter: AI Customer Support Assistant

## Problem
Small tutoring businesses answer many repeat questions about scheduling, billing, programs, cancellations, and student progress. Staff time is spent on routine support instead of higher-value family follow-up.

## Users
- Parents and guardians who need fast answers.
- Support coordinators who handle escalations.
- Business owners who need visibility into support volume and unresolved issues.

## Solution
Build a web-based AI support assistant for BrightPath Tutoring. The assistant answers from a controlled FAQ knowledge base, refuses to invent unsupported answers, and creates a support ticket when the user needs a human or the answer is low confidence.

## In Scope
- Seeded FAQ knowledge base.
- Grounded chat workflow.
- Escalation capture for name, contact, and issue summary.
- Ticket storage in local demo mode or Supabase.
- KPI dashboard for deflection rate, escalation rate, and answer quality proxy.
- README and case study for interview presentation.

## Out of Scope
- Full authentication and role-based admin portal.
- Payment processing.
- Omnichannel support integrations.
- Production monitoring and incident response.
- Fine-tuning or custom model training.

## Success Criteria
- A recruiter or interviewer can run the demo locally.
- The happy path answers common questions without escalation.
- Unknown or human-requested questions create a ticket.
- Product artifacts explain the business value, user stories, and KPIs.

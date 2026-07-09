# Epics and User Stories

## Epic 1: Grounded Customer Answers
As a parent, I want the assistant to answer common tutoring questions from the official knowledge base so that I can get help without waiting for staff.

Acceptance criteria:
- Given a question that matches an active FAQ, the assistant returns the FAQ-grounded answer.
- The answer includes a source question or source metadata.
- The assistant does not answer unsupported questions as if they are facts.

## Epic 2: Escalation to Support
As a parent, I want to request a human or submit an unresolved issue so that staff can follow up.

Acceptance criteria:
- Given a low-confidence answer, the assistant recommends escalation.
- Given a direct request for a human, the assistant recommends escalation.
- The user can submit name, contact, and issue summary.
- A ticket is created with open status and transcript context.

## Epic 3: Support KPI Visibility
As a business owner, I want to see support automation KPIs so that I can judge whether the assistant is helping.

Acceptance criteria:
- The dashboard shows deflection rate.
- The dashboard shows escalation rate.
- The dashboard shows an answer accuracy proxy from confidence scores.
- KPI values update after chat and ticket events.

## Epic 4: Interview-Ready Delivery
As the Prince Tech owner, I want the project to be easy to explain so that I can use it in job applications and interviews.

Acceptance criteria:
- README explains setup, architecture, and demo flow.
- Product-owner docs exist in the `docs/` folder.
- Supabase schema is ready for a real database.
- Local demo mode works without secrets.

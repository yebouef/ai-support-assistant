# Case Study: AI Customer Support Assistant

Prince Tech LLC built a conversational AI support assistant for a fictional tutoring company, BrightPath Tutoring. The assistant answers common parent questions from a controlled FAQ knowledge base, such as scheduling changes, SAT prep, payment methods, cancellations, tutor matching, and progress reporting. When the assistant cannot answer confidently or the customer asks for a human, it collects the customer's name, contact information, and issue summary, then creates a support ticket for follow-up.

The stack is React and Vite for the web demo, Node and Express for the API, Supabase/PostgreSQL for the production-ready data model, and the OpenAI API for grounded response generation. The project also includes local demo mode, so it can run without cloud credentials during an interview.

The product KPIs are deflection rate, escalation rate, and an answer accuracy proxy based on confidence scores. These metrics show whether the assistant is reducing repetitive support load while still routing unresolved issues to people.

Next improvements would include authenticated staff ticket management, human QA scoring for answer accuracy, semantic search over a larger knowledge base, Cloudflare deployment, and operational monitoring for model quality and support outcomes.

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import { deterministicAnswer, loadSeedFaqs, retrieveFaqs, shouldEscalate } from './knowledge.js';
import { createTicket, getFaqsFromSupabase, getKpis, recordConversationEvent } from './store.js';

const app = express();
const port = process.env.PORT || 8787;
const demoMode = process.env.DEMO_MODE === 'true' || !process.env.OPENAI_API_KEY;
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

app.use(cors());
app.use(express.json());

async function getFaqs() {
  try {
    const supabaseFaqs = await getFaqsFromSupabase();
    return supabaseFaqs?.length ? supabaseFaqs : loadSeedFaqs();
  } catch (error) {
    console.warn('Falling back to seeded FAQs:', error.message);
    return loadSeedFaqs();
  }
}

async function generateGroundedAnswer(message, matches) {
  if (demoMode || !openai || shouldEscalate(message, matches)) {
    return deterministicAnswer(message, matches);
  }

  const context = matches.map((faq) => `Q: ${faq.question}\nA: ${faq.answer}`).join('\n\n');
  const response = await openai.responses.create({
    model: 'gpt-4o-mini',
    input: [
      {
        role: 'system',
        content: 'You are BrightPath Tutoring support. Answer only from the supplied FAQ context. If the answer is not in context, say you do not know and recommend escalation. Keep answers concise.'
      },
      {
        role: 'user',
        content: `FAQ context:\n${context}\n\nCustomer question: ${message}`
      }
    ]
  });

  return {
    answer: response.output_text || deterministicAnswer(message, matches).answer,
    confidence: matches.length ? Math.min(0.95, 0.65 + matches[0].score * 0.06) : 0.25,
    needsEscalation: matches.length === 0,
    sources: matches.map(({ id, question, category }) => ({ id, question, category }))
  };
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, mode: demoMode ? 'demo' : 'openai' });
});

app.post('/api/chat', async (req, res) => {
  try {
    const message = String(req.body.message || '').trim();
    if (!message) return res.status(400).json({ error: 'Message is required.' });

    const faqs = await getFaqs();
    const matches = retrieveFaqs(message, faqs);
    const result = await generateGroundedAnswer(message, matches);

    await recordConversationEvent({
      eventType: result.needsEscalation ? 'escalation_recommended' : 'answered',
      confidence: result.confidence,
      escalated: result.needsEscalation
    });

    res.json({ ...result, mode: demoMode ? 'demo' : 'openai' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'The assistant could not process the request.' });
  }
});

app.post('/api/tickets', async (req, res) => {
  try {
    const { name, contact, issueSummary, transcriptExcerpt } = req.body;
    if (!name || !contact || !issueSummary) {
      return res.status(400).json({ error: 'Name, contact, and issue summary are required.' });
    }

    const ticket = await createTicket({ name, contact, issueSummary, transcriptExcerpt });
    res.status(201).json({ ticket });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'The support ticket could not be created.' });
  }
});

app.get('/api/kpis', async (_req, res) => {
  try {
    res.json(await getKpis());
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'KPIs could not be loaded.' });
  }
});

app.listen(port, () => {
  console.log(`AI support assistant API running on http://localhost:${port}`);
});

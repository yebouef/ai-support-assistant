import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const faqPath = path.join(__dirname, '..', 'data', 'faqs.json');

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'can', 'do', 'for', 'how', 'i', 'is', 'my', 'of',
  'on', 'or', 'the', 'to', 'what', 'when', 'with', 'you', 'your'
]);

export async function loadSeedFaqs() {
  const raw = await fs.readFile(faqPath, 'utf8');
  return JSON.parse(raw).filter((faq) => faq.active);
}

export function tokenize(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 1 && !STOP_WORDS.has(word));
}

export function retrieveFaqs(message, faqs, limit = 3) {
  const queryTokens = new Set(tokenize(message));

  return faqs
    .map((faq) => {
      const haystack = tokenize(`${faq.category} ${faq.question} ${faq.answer}`);
      const overlap = haystack.filter((word) => queryTokens.has(word)).length;
      const exactQuestion = faq.question.toLowerCase().includes(String(message).toLowerCase());
      const score = overlap + (exactQuestion ? 3 : 0);
      return { ...faq, score };
    })
    .filter((faq) => faq.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function shouldEscalate(message, matches) {
  const text = String(message).toLowerCase();
  const asksForHuman = /\b(human|person|agent|representative|manager|call me|support ticket)\b/.test(text);
  return asksForHuman || matches.length === 0 || matches[0].score < 2;
}

export function deterministicAnswer(message, matches) {
  if (shouldEscalate(message, matches)) {
    return {
      answer: "I do not have enough information in the BrightPath knowledge base to answer that confidently. I can create a support ticket so a team member can follow up.",
      confidence: 0.35,
      needsEscalation: true,
      sources: matches.map(({ id, question, category }) => ({ id, question, category }))
    };
  }

  const best = matches[0];
  return {
    answer: `${best.answer}\n\nSource: ${best.question}`,
    confidence: Math.min(0.92, 0.55 + best.score * 0.08),
    needsEscalation: false,
    sources: matches.map(({ id, question, category }) => ({ id, question, category }))
  };
}

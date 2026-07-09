import test from 'node:test';
import assert from 'node:assert/strict';
import { deterministicAnswer, retrieveFaqs, shouldEscalate } from './knowledge.js';

const faqs = [
  {
    id: '1',
    category: 'Scheduling',
    question: 'How do I reschedule a tutoring session?',
    answer: 'Use the parent portal.',
    active: true
  }
];

test('retrieves relevant FAQ matches', () => {
  const matches = retrieveFaqs('Can I reschedule tutoring?', faqs);
  assert.equal(matches[0].id, '1');
});

test('escalates when a customer asks for a human', () => {
  const matches = retrieveFaqs('I need a human agent', faqs);
  assert.equal(shouldEscalate('I need a human agent', matches), true);
});

test('returns a grounded deterministic answer for known questions', () => {
  const matches = retrieveFaqs('reschedule tutoring session', faqs);
  const result = deterministicAnswer('reschedule tutoring session', matches);
  assert.equal(result.needsEscalation, false);
  assert.match(result.answer, /parent portal/i);
});

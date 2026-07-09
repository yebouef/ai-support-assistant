import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localStorePath = path.join(__dirname, '..', 'data', 'local-store.json');
let localWriteQueue = Promise.resolve();

function getSupabase() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) return null;
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
}

async function readLocalStore() {
  try {
    const raw = await fs.readFile(localStorePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return { tickets: [], conversation_events: [] };
  }
}

async function writeLocalStore(store) {
  await fs.writeFile(localStorePath, `${JSON.stringify(store, null, 2)}\n`);
}

async function updateLocalStore(updater) {
  localWriteQueue = localWriteQueue.then(async () => {
    const store = await readLocalStore();
    const result = await updater(store);
    await writeLocalStore(store);
    return result;
  });
  return localWriteQueue;
}

export async function getFaqsFromSupabase() {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('faqs')
    .select('id, category, question, answer, active')
    .eq('active', true);

  if (error) throw error;
  return data;
}

export async function recordConversationEvent(event) {
  const payload = {
    event_type: event.eventType,
    confidence: event.confidence,
    escalated: event.escalated,
    created_at: new Date().toISOString()
  };

  const supabase = getSupabase();
  if (supabase) {
    const { error } = await supabase.from('conversation_events').insert(payload);
    if (error) throw error;
    return payload;
  }

  return updateLocalStore((store) => {
    store.conversation_events.push({ id: randomUUID(), ...payload });
    return payload;
  });
}

export async function createTicket(ticket) {
  const payload = {
    customer_name: ticket.name,
    contact: ticket.contact,
    issue_summary: ticket.issueSummary,
    transcript_excerpt: ticket.transcriptExcerpt || '',
    status: 'open',
    created_at: new Date().toISOString()
  };

  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase.from('tickets').insert(payload).select().single();
    if (error) throw error;
    return data;
  }

  const localTicket = { id: randomUUID(), ...payload };
  return updateLocalStore((store) => {
    store.tickets.push(localTicket);
    store.conversation_events.push({
      id: randomUUID(),
      event_type: 'ticket_created',
      confidence: 0,
      escalated: true,
      created_at: payload.created_at
    });
    return localTicket;
  });
}

export async function getKpis() {
  const supabase = getSupabase();
  let events = [];
  let tickets = [];

  if (supabase) {
    const [eventResult, ticketResult] = await Promise.all([
      supabase.from('conversation_events').select('event_type, confidence, escalated, created_at'),
      supabase.from('tickets').select('id, status, created_at')
    ]);
    if (eventResult.error) throw eventResult.error;
    if (ticketResult.error) throw ticketResult.error;
    events = eventResult.data;
    tickets = ticketResult.data;
  } else {
    const store = await readLocalStore();
    events = store.conversation_events;
    tickets = store.tickets;
  }

  const chatEvents = events.filter((event) => ['answered', 'escalation_recommended'].includes(event.event_type));
  const answered = chatEvents.filter((event) => event.event_type === 'answered').length;
  const escalated = chatEvents.filter((event) => event.escalated).length;
  const totalChats = chatEvents.length;
  const confidenceEvents = chatEvents.filter((event) => Number.isFinite(Number(event.confidence)));
  const averageConfidence = confidenceEvents.length
    ? confidenceEvents.reduce((sum, event) => sum + Number(event.confidence), 0) / confidenceEvents.length
    : 0;

  return {
    totalChats,
    ticketsOpen: tickets.filter((ticket) => ticket.status === 'open').length,
    deflectionRate: totalChats ? answered / totalChats : 0,
    escalationRate: totalChats ? escalated / totalChats : 0,
    answerAccuracyProxy: averageConfidence
  };
}

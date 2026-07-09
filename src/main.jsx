import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BarChart3, Bot, CheckCircle2, GraduationCap, LifeBuoy, Send, ShieldCheck, Ticket } from 'lucide-react';
import './styles.css';

const starterPrompts = [
  'How do I reschedule a tutoring session?',
  'Do you offer SAT prep?',
  'I need to talk to a human about a billing issue'
];

const initialMessages = [
  {
    role: 'assistant',
    text: 'Hi, I am the BrightPath support assistant. Ask me about scheduling, billing, SAT prep, tutors, cancellations, or progress reports.'
  }
];

function formatPercent(value) {
  return `${Math.round((value || 0) * 100)}%`;
}

function KpiPanel({ kpis, onRefresh }) {
  const cards = [
    { label: 'Deflection rate', value: formatPercent(kpis.deflectionRate), icon: CheckCircle2 },
    { label: 'Escalation rate', value: formatPercent(kpis.escalationRate), icon: Ticket },
    { label: 'Accuracy proxy', value: formatPercent(kpis.answerAccuracyProxy), icon: ShieldCheck },
    { label: 'Open tickets', value: kpis.ticketsOpen ?? 0, icon: LifeBuoy }
  ];

  return (
    <section className="panel kpi-panel" aria-label="KPI dashboard">
      <div className="section-heading">
        <div>
          <p>Product owner dashboard</p>
          <h2>Support KPIs</h2>
        </div>
        <button className="icon-button" onClick={onRefresh} aria-label="Refresh KPIs">
          <BarChart3 size={18} />
        </button>
      </div>
      <div className="kpi-grid">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <article className="kpi-card" key={card.label}>
              <Icon size={18} />
              <span>{card.label}</span>
              <strong>{card.value}</strong>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function TicketForm({ transcript, onCreated }) {
  const [form, setForm] = useState({ name: '', contact: '', issueSummary: '' });
  const [status, setStatus] = useState('');

  async function submitTicket(event) {
    event.preventDefault();
    setStatus('Creating ticket...');
    const response = await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        transcriptExcerpt: transcript.slice(-4).map((message) => `${message.role}: ${message.text}`).join('\n')
      })
    });
    const result = await response.json();
    if (!response.ok) {
      setStatus(result.error || 'Ticket could not be created.');
      return;
    }
    setForm({ name: '', contact: '', issueSummary: '' });
    setStatus(`Ticket created: ${result.ticket.id || 'saved'}`);
    onCreated();
  }

  return (
    <form className="ticket-form" onSubmit={submitTicket}>
      <label>
        Name
        <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
      </label>
      <label>
        Contact
        <input value={form.contact} onChange={(event) => setForm({ ...form, contact: event.target.value })} required />
      </label>
      <label>
        Issue summary
        <textarea value={form.issueSummary} onChange={(event) => setForm({ ...form, issueSummary: event.target.value })} required />
      </label>
      <button className="primary-button" type="submit">
        <Ticket size={17} />
        Create support ticket
      </button>
      {status && <p className="form-status">{status}</p>}
    </form>
  );
}

function ChatWidget({ onKpiChange }) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const needsEscalation = messages.some((message) => message.needsEscalation);

  async function sendMessage(text = input) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMessage = { role: 'user', text: trimmed };
    setMessages((current) => [...current, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Request failed.');
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          text: result.answer,
          needsEscalation: result.needsEscalation,
          confidence: result.confidence,
          sources: result.sources
        }
      ]);
      onKpiChange();
    } catch (error) {
      setMessages((current) => [...current, { role: 'assistant', text: error.message, needsEscalation: true }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="chat-shell" aria-label="AI support chat">
      <div className="chat-header">
        <div className="bot-mark">
          <Bot size={24} />
        </div>
        <div>
          <p>BrightPath Tutoring</p>
          <h1>AI Support Assistant</h1>
        </div>
      </div>

      <div className="prompt-row" aria-label="Sample questions">
        {starterPrompts.map((prompt) => (
          <button key={prompt} onClick={() => sendMessage(prompt)}>
            {prompt}
          </button>
        ))}
      </div>

      <div className="message-list">
        {messages.map((message, index) => (
          <article className={`message ${message.role}`} key={`${message.role}-${index}`}>
            <p>{message.text}</p>
            {message.confidence !== undefined && (
              <span>Confidence: {formatPercent(message.confidence)}</span>
            )}
          </article>
        ))}
        {loading && <article className="message assistant"><p>Checking the knowledge base...</p></article>}
      </div>

      <div className="composer">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') sendMessage();
          }}
          placeholder="Ask a customer support question"
        />
        <button className="primary-button" onClick={() => sendMessage()} disabled={loading}>
          <Send size={17} />
          Send
        </button>
      </div>

      {needsEscalation && <TicketForm transcript={messages} onCreated={onKpiChange} />}
    </section>
  );
}

function App() {
  const [kpis, setKpis] = useState({});
  const [apiMode, setApiMode] = useState('demo');

  const refreshKpis = async () => {
    const response = await fetch('/api/kpis');
    if (response.ok) setKpis(await response.json());
  };

  useEffect(() => {
    refreshKpis();
    fetch('/api/health')
      .then((response) => response.json())
      .then((data) => setApiMode(data.mode))
      .catch(() => setApiMode('offline'));
  }, []);

  const architecturePoints = useMemo(() => [
    'FAQ retrieval keeps answers grounded before model generation.',
    'Low-confidence or human-requested chats become support tickets.',
    'KPIs show deflection, escalation, and answer-quality signal.'
  ], []);

  return (
    <main className="app">
      <section className="hero">
        <div className="hero-copy">
          <div className="brand-row">
            <GraduationCap size={28} />
            <span>Prince Tech LLC demo</span>
          </div>
          <h1>Customer support AI a product owner can explain.</h1>
          <p>
            A local-first demo for BrightPath Tutoring: grounded answers from a knowledge base,
            clean escalation into tickets, and measurable support KPIs.
          </p>
          <div className="mode-pill">API mode: {apiMode}</div>
        </div>
        <KpiPanel kpis={kpis} onRefresh={refreshKpis} />
      </section>

      <section className="workspace">
        <div className="panel architecture">
          <div className="section-heading">
            <div>
              <p>Interview walkthrough</p>
              <h2>How the system works</h2>
            </div>
          </div>
          <ol>
            {architecturePoints.map((point) => <li key={point}>{point}</li>)}
          </ol>
        </div>
        <ChatWidget onKpiChange={refreshKpis} />
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);

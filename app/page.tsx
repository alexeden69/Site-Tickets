'use client';

import { useEffect, useMemo, useState } from 'react';

type TicketStatus = 'En stock' | 'Vendu' | 'Expiré';

type Ticket = {
  id: number;
  event: string;
  section: string;
  seats: string;
  price: number;
  salePrice: number;
  status: TicketStatus;
  notes: string;
  createdAt: string;
};

type Settings = {
  associateName: string;
};

const initialTickets: Ticket[] = [
  {
    id: 1,
    event: 'Concert',
    section: 'P1',
    seats: 'A12',
    price: 90,
    salePrice: 120,
    status: 'En stock',
    notes: 'À suivre',
    createdAt: new Date().toISOString(),
  },
];

const storageKey = 'guichet-dashboard-state';

export default function HomePage() {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [settings, setSettings] = useState<Settings>({ associateName: '' });
  const [form, setForm] = useState({
    event: '',
    section: '',
    seats: '',
    price: '',
    salePrice: '',
    notes: '',
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (parsed.tickets) setTickets(parsed.tickets);
      if (parsed.settings) setSettings(parsed.settings);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(storageKey, JSON.stringify({ tickets, settings }));
  }, [tickets, settings]);

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => ticket.status !== 'Vendu');
  }, [tickets]);

  const stats = useMemo(() => {
    const active = tickets.filter((t) => t.status === 'En stock').length;
    const sold = tickets.filter((t) => t.status === 'Vendu').length;
    const expired = tickets.filter((t) => t.status === 'Expiré').length;
    const totalMargin = tickets.reduce((sum, ticket) => sum + Math.max(0, ticket.salePrice - ticket.price), 0);
    return { active, sold, expired, totalMargin };
  }, [tickets]);

  const addTicket = (event: React.FormEvent) => {
    event.preventDefault();
    const price = Number(form.price);
    const salePrice = Number(form.salePrice);
    if (!form.event || !form.section || !form.seats || Number.isNaN(price) || Number.isNaN(salePrice)) return;
    const newTicket: Ticket = {
      id: Date.now(),
      event: form.event,
      section: form.section,
      seats: form.seats,
      price,
      salePrice,
      status: 'En stock',
      notes: form.notes,
      createdAt: new Date().toISOString(),
    };
    setTickets((prev) => [newTicket, ...prev]);
    setForm({ event: '', section: '', seats: '', price: '', salePrice: '', notes: '' });
  };

  const updateTicketStatus = (id: number, status: TicketStatus) => {
    setTickets((prev) => prev.map((ticket) => (ticket.id === id ? { ...ticket, status } : ticket)));
  };

  const removeTicket = (id: number) => {
    setTickets((prev) => prev.filter((ticket) => ticket.id !== id));
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(148,163,184,0.08),_transparent_24%)] p-6 text-slate-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="rounded-[28px] border border-slate-700/70 bg-slate-900/80 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-slate-400">Guichet</p>
              <h1 className="text-3xl font-semibold text-white">Tableau de bord tickets</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-300">Application séparée du bot Viagogo, pensée pour suivre les offres, les ventes et les marges.</p>
            </div>
            <div className="rounded-2xl border border-slate-700/70 bg-slate-950/80 px-4 py-3 shadow-[0_4px_18px_rgba(0,0,0,0.25)]">
              <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Associé</label>
              <input
                value={settings.associateName}
                onChange={(e) => setSettings((prev) => ({ ...prev, associateName: e.target.value }))}
                placeholder="Nom"
                className="mt-1 w-48 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none ring-0"
              />
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          {[
            { label: 'En stock', value: stats.active, accent: 'text-emerald-300' },
            { label: 'Vendus', value: stats.sold, accent: 'text-sky-300' },
            { label: 'Expirés', value: stats.expired, accent: 'text-rose-300' },
            { label: 'Marge totale', value: `${stats.totalMargin} €`, accent: 'text-amber-300' },
          ].map((card) => (
            <div key={card.label} className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-4 shadow-[0_4px_14px_rgba(0,0,0,0.2)]">
              <p className="text-sm text-slate-400">{card.label}</p>
              <p className={`mt-2 text-2xl font-semibold ${card.accent}`}>{card.value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-slate-800/80 bg-slate-900/70 p-5 shadow-[0_6px_18px_rgba(0,0,0,0.2)]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Tickets en stock</h2>
              <span className="text-sm text-slate-400">{filteredTickets.length} visibles</span>
            </div>
            <div className="space-y-3">
              {filteredTickets.map((ticket) => (
                <article key={ticket.id} className="rounded-2xl border border-slate-800/70 bg-slate-800/70 p-4 shadow-[0_4px_12px_rgba(0,0,0,0.18)]">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white">{ticket.event}</h3>
                        <span className="rounded-full border border-slate-700 bg-slate-700/80 px-2 py-0.5 text-xs text-slate-300">{ticket.section}</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-400">Sièges {ticket.seats}</p>
                      <p className="mt-2 text-sm text-slate-300">Prix d’achat : {ticket.price} € • Prix de vente : {ticket.salePrice} €</p>
                      {ticket.notes ? <p className="mt-2 text-sm text-slate-400">{ticket.notes}</p> : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => updateTicketStatus(ticket.id, 'En stock')} className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">En stock</button>
                      <button onClick={() => updateTicketStatus(ticket.id, 'Vendu')} className="rounded-lg border border-sky-500/20 bg-sky-500/10 px-3 py-2 text-sm text-sky-300">Vendu</button>
                      <button onClick={() => updateTicketStatus(ticket.id, 'Expiré')} className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">Expiré</button>
                      <button onClick={() => removeTicket(ticket.id)} className="rounded-lg border border-slate-700 bg-slate-700/80 px-3 py-2 text-sm text-slate-200">Supprimer</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <form onSubmit={addTicket} className="rounded-3xl border border-slate-800/80 bg-slate-900/70 p-5 shadow-[0_6px_18px_rgba(0,0,0,0.2)]">
              <h2 className="text-xl font-semibold text-white">Ajouter un ticket</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <input value={form.event} onChange={(e) => setForm((prev) => ({ ...prev, event: e.target.value }))} placeholder="Événement" className="rounded-xl border border-cyan-400/20 bg-slate-900 px-3 py-2 text-sm text-white outline-none" />
                <input value={form.section} onChange={(e) => setForm((prev) => ({ ...prev, section: e.target.value }))} placeholder="Section" className="rounded-xl border border-cyan-400/20 bg-slate-900 px-3 py-2 text-sm text-white outline-none" />
                <input value={form.seats} onChange={(e) => setForm((prev) => ({ ...prev, seats: e.target.value }))} placeholder="Sièges" className="rounded-xl border border-cyan-400/20 bg-slate-900 px-3 py-2 text-sm text-white outline-none" />
                <input type="number" value={form.price} onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))} placeholder="Prix d’achat" className="rounded-xl border border-cyan-400/20 bg-slate-900 px-3 py-2 text-sm text-white outline-none" />
                <input type="number" value={form.salePrice} onChange={(e) => setForm((prev) => ({ ...prev, salePrice: e.target.value }))} placeholder="Prix de vente" className="rounded-xl border border-cyan-400/20 bg-slate-900 px-3 py-2 text-sm text-white outline-none" />
                <input value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} placeholder="Notes" className="rounded-xl border border-cyan-400/20 bg-slate-900 px-3 py-2 text-sm text-white outline-none" />
              </div>
              <button type="submit" className="mt-4 rounded-xl bg-slate-100 px-4 py-2 font-semibold text-slate-950">Ajouter</button>
            </form>

            <div className="rounded-3xl border border-slate-800/80 bg-slate-900/70 p-5 shadow-[0_6px_18px_rgba(0,0,0,0.2)]">
              <h2 className="text-xl font-semibold text-white">Résumé</h2>
              <ul className="mt-4 space-y-2 text-sm text-slate-300">
                <li>• Les données restent sauvegardées localement dans le navigateur.</li>
                <li>• Le dashboard est isolé du bot Viagogo pour une utilisation plus simple.</li>
                <li>• Le projet peut être lancé depuis le dossier dashboard.</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

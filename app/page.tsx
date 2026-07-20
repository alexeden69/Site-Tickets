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
    <main className="min-h-screen bg-[#050816] p-4 text-slate-100 sm:p-6 lg:p-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row">
        <aside className="w-full rounded-[32px] border border-white/10 bg-slate-900/75 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl lg:w-72">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-emerald-400 text-lg font-semibold text-white">
              G
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Guichet</p>
              <p className="text-xs text-slate-400">Dashboard</p>
            </div>
          </div>

          <nav className="mt-8 space-y-2 text-sm">
            {['Vue d’ensemble', 'Tickets', 'Marge', 'Historique'].map((item, index) => (
              <button
                key={item}
                className={`flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left transition ${index === 0 ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                <span>{item}</span>
                <span className="text-xs text-slate-500">0{index + 1}</span>
              </button>
            ))}
          </nav>

          <div className="mt-8 rounded-2xl border border-white/10 bg-slate-800/70 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Associé</p>
            <input
              value={settings.associateName}
              onChange={(e) => setSettings((prev) => ({ ...prev, associateName: e.target.value }))}
              placeholder="Nom"
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white outline-none"
            />
          </div>
        </aside>

        <div className="flex-1 space-y-5">
          <header className="rounded-[32px] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800/90 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.3)] backdrop-blur-xl">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.35em] text-slate-400">Suivi opérationnel</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Tableau de bord tickets</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                  Vue claire pour suivre les offres, analyser les marges et garder un œil sur les ventes en temps réel.
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                Sync active
              </div>
            </div>
          </header>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'En stock', value: stats.active, accent: 'text-emerald-300', glow: 'from-emerald-500/15 to-emerald-400/5' },
              { label: 'Vendus', value: stats.sold, accent: 'text-sky-300', glow: 'from-sky-500/15 to-sky-400/5' },
              { label: 'Expirés', value: stats.expired, accent: 'text-rose-300', glow: 'from-rose-500/15 to-rose-400/5' },
              { label: 'Marge', value: `${stats.totalMargin} €`, accent: 'text-amber-300', glow: 'from-amber-500/15 to-amber-400/5' },
            ].map((card) => (
              <div key={card.label} className={`rounded-[24px] border border-white/10 bg-gradient-to-br ${card.glow} p-4 shadow-[0_12px_35px_rgba(0,0,0,0.2)]`}>
                <p className="text-sm text-slate-400">{card.label}</p>
                <p className={`mt-3 text-3xl font-semibold ${card.accent}`}>{card.value}</p>
              </div>
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-5 shadow-[0_16px_50px_rgba(0,0,0,0.22)] backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">Tickets en stock</h2>
                  <p className="mt-1 text-sm text-slate-400">{filteredTickets.length} visibles • suivi actif</p>
                </div>
              </div>

              <div className="space-y-3">
                {filteredTickets.map((ticket) => (
                  <article key={ticket.id} className="rounded-2xl border border-white/10 bg-slate-800/70 p-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-white">{ticket.event}</h3>
                          <span className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.25em] text-slate-300">
                            {ticket.section}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-400">Sièges {ticket.seats}</p>
                        <p className="mt-2 text-sm text-slate-300">Achat {ticket.price} € • Vente {ticket.salePrice} €</p>
                        {ticket.notes ? <p className="mt-2 text-sm text-slate-400">{ticket.notes}</p> : null}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => updateTicketStatus(ticket.id, 'En stock')} className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">En stock</button>
                        <button onClick={() => updateTicketStatus(ticket.id, 'Vendu')} className="rounded-xl border border-sky-500/20 bg-sky-500/10 px-3 py-2 text-sm text-sky-300">Vendu</button>
                        <button onClick={() => updateTicketStatus(ticket.id, 'Expiré')} className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">Expiré</button>
                        <button onClick={() => removeTicket(ticket.id)} className="rounded-xl border border-white/10 bg-slate-700/80 px-3 py-2 text-sm text-slate-200">Supprimer</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <form onSubmit={addTicket} className="rounded-[28px] border border-white/10 bg-slate-900/70 p-5 shadow-[0_16px_50px_rgba(0,0,0,0.22)] backdrop-blur-xl">
                <h2 className="text-xl font-semibold text-white">Ajouter un ticket</h2>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <input value={form.event} onChange={(e) => setForm((prev) => ({ ...prev, event: e.target.value }))} placeholder="Événement" className="rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2.5 text-sm text-white outline-none" />
                  <input value={form.section} onChange={(e) => setForm((prev) => ({ ...prev, section: e.target.value }))} placeholder="Section" className="rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2.5 text-sm text-white outline-none" />
                  <input value={form.seats} onChange={(e) => setForm((prev) => ({ ...prev, seats: e.target.value }))} placeholder="Sièges" className="rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2.5 text-sm text-white outline-none" />
                  <input type="number" value={form.price} onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))} placeholder="Prix d’achat" className="rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2.5 text-sm text-white outline-none" />
                  <input type="number" value={form.salePrice} onChange={(e) => setForm((prev) => ({ ...prev, salePrice: e.target.value }))} placeholder="Prix de vente" className="rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2.5 text-sm text-white outline-none" />
                  <input value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} placeholder="Notes" className="rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2.5 text-sm text-white outline-none" />
                </div>
                <button type="submit" className="mt-4 rounded-2xl bg-white px-4 py-2.5 font-semibold text-slate-950">Ajouter</button>
              </form>

              <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-5 shadow-[0_16px_50px_rgba(0,0,0,0.22)] backdrop-blur-xl">
                <h2 className="text-xl font-semibold text-white">Résumé</h2>
                <ul className="mt-4 space-y-2 text-sm text-slate-300">
                  <li>• Données enregistrées localement dans le navigateur.</li>
                  <li>• Interface pensée pour un usage rapide et propre.</li>
                  <li>• À utiliser comme centre de suivi quotidien.</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

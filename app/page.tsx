'use client';

import { type FormEvent, useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

type TicketStatus = 'achete' | 'listed' | 'vendu' | 'livre' | 'passe';

type Ticket = {
  id: number;
  event: string;
  eventDate: string;
  qty: number;
  buyUsd: number;
  sellUsd: number;
  status: TicketStatus;
  purchasedBy: string;
  category: string;
  bloc: string;
  rang: string;
  seats: string;
  listingNumber: string;
  accountEmail: string;
  accountPassword: string;
};

type TicketRow = {
  id: number;
  event: string;
  event_date: string;
  qty: number;
  buy_usd: number;
  sell_usd: number;
  status: TicketStatus;
  purchased_by: string;
  category: string | null;
  bloc: string | null;
  rang: string | null;
  seats: string | null;
  listing_number: string | null;
  account_email: string | null;
  account_password: string | null;
};

const fromRow = (row: TicketRow): Ticket => ({
  id: row.id,
  event: row.event,
  eventDate: row.event_date,
  qty: row.qty,
  buyUsd: row.buy_usd,
  sellUsd: row.sell_usd,
  status: row.status,
  purchasedBy: row.purchased_by,
  category: row.category || '',
  bloc: row.bloc || '',
  rang: row.rang || '',
  seats: row.seats || '',
  listingNumber: row.listing_number || '',
  accountEmail: row.account_email || '',
  accountPassword: row.account_password || '',
});

const STOCK_STATUSES: TicketStatus[] = ['achete', 'listed'];
const SOLD_STATUSES: TicketStatus[] = ['vendu', 'livre'];

const COLORS = {
  bg: '#000000',
  panel: '#0e0e14',
  line: 'rgba(255,255,255,0.09)',
  text: '#ffffff',
  textMuted: '#9a9aa8',
  amber: '#ff7a1a',
  green: '#00e676',
  red: '#ff2d55',
  blue: '#00c8ff',
  yellow: '#ffd60a',
};

const fmtUSD = (value: number) =>
  (value || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function StatCard({ label, value, sub, accent, icon }: { label: string; value: string; sub?: string; accent: string; icon: string }) {
  return (
    <div
      style={{
        background: COLORS.panel,
        borderRadius: 10,
        padding: '18px 18px 16px',
        borderTop: `3px solid ${accent}`,
        boxShadow: '0 1px 0 rgba(255,255,255,0.02) inset',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 15 }}>{icon}</span>
        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, letterSpacing: '0.04em', color: COLORS.textMuted }}>{label}</span>
      </div>
      <div style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 26, color: COLORS.text, lineHeight: 1.05 }}>{value}</div>
      {sub ? <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 6, fontFamily: 'IBM Plex Mono, monospace' }}>{sub}</div> : null}
    </div>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: COLORS.panel, borderRadius: 10, padding: 18, flex: 1, minWidth: 280 }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, color: COLORS.text, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{title}</div>
        {subtitle ? <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>{subtitle}</div> : null}
      </div>
      {children}
    </div>
  );
}

function StatusBadge({ status }: { status: TicketStatus }) {
  const map: Record<TicketStatus, { label: string; color: string }> = {
    achete: { label: 'Acheté', color: COLORS.textMuted },
    listed: { label: 'Listé', color: COLORS.amber },
    vendu: { label: 'Vendu', color: COLORS.green },
    livre: { label: 'Livré', color: COLORS.blue },
    passe: { label: 'Passé', color: COLORS.red },
  };
  const current = map[status] || map.achete;
  return (
    <span
      style={{
        fontFamily: 'IBM Plex Mono, monospace',
        fontSize: 10,
        textTransform: 'uppercase',
        padding: '3px 9px',
        borderRadius: 20,
        border: `1px solid ${current.color}55`,
        color: current.color,
      }}
    >
      {current.label}
    </span>
  );
}

export default function HomePage() {
  const [session, setSession] = useState<Session | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    event: '',
    eventDate: '',
    qty: '',
    buyUsd: '',
    sellUsd: '',
    purchasedBy: '',
    category: '',
    bloc: '',
    rang: '',
    seats: '',
    listingNumber: '',
    accountEmail: '',
    accountPassword: '',
  });
  const [eventFilter, setEventFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'past' | 'upcoming'>('all');
  const [events, setEvents] = useState<string[]>([]);
  const [newEventName, setNewEventName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    event: '',
    eventDate: '',
    qty: '',
    buyUsd: '',
    sellUsd: '',
    purchasedBy: '',
    category: '',
    bloc: '',
    rang: '',
    seats: '',
    listingNumber: '',
    accountEmail: '',
    accountPassword: '',
  });
  const [revealedPasswords, setRevealedPasswords] = useState<Set<number>>(new Set());

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthChecked(true);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError(null);
    setLoggingIn(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginForm.email,
      password: loginForm.password,
    });
    setLoggingIn(false);
    if (error) {
      setLoginError(error.message);
      return;
    }
    setLoginForm({ email: '', password: '' });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  useEffect(() => {
    if (!session) return;
    let isMounted = true;

    const loadTickets = async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select('id, event, event_date, qty, buy_usd, sell_usd, status, purchased_by, category, bloc, rang, seats, listing_number, account_email, account_password')
        .order('event_date', { ascending: true });
      if (!isMounted) return;
      if (error) {
        setErrorMessage(error.message);
      } else {
        setTickets((data as TicketRow[]).map(fromRow));
        setErrorMessage(null);
      }
      setLoading(false);
    };

    const loadEvents = async () => {
      const { data, error } = await supabase.from('events').select('name').order('name', { ascending: true });
      if (!isMounted) return;
      if (!error) setEvents((data as { name: string }[]).map((row) => row.name));
    };

    loadTickets();
    loadEvents();

    const channel = supabase
      .channel('tickets-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => {
        loadTickets();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => {
        loadEvents();
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [session]);

  const eventOptions = useMemo(
    () => Array.from(new Set([...events, ...tickets.map((ticket) => ticket.event)])).sort((a, b) => a.localeCompare(b)),
    [events, tickets]
  );

  const filteredTickets = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    return tickets
      .filter((ticket) => eventFilter === 'all' || ticket.event === eventFilter)
      .filter((ticket) => {
        if (timeFilter === 'all') return true;
        const isPast = new Date(ticket.eventDate) < startOfToday;
        return timeFilter === 'past' ? isPast : !isPast;
      });
  }, [tickets, eventFilter, timeFilter]);

  const byEvent = useMemo(() => {
    const map: Record<string, { event: string; achat: number; revente: number; qty: number; profit: number }> = {};
    filteredTickets.forEach((ticket) => {
      if (!map[ticket.event]) {
        map[ticket.event] = { event: ticket.event, achat: 0, revente: 0, qty: 0, profit: 0 };
      }
      map[ticket.event].achat += ticket.buyUsd * ticket.qty;
      map[ticket.event].revente += (ticket.sellUsd || 0) * ticket.qty;
      map[ticket.event].qty += ticket.qty;
      if (SOLD_STATUSES.includes(ticket.status)) {
        map[ticket.event].profit += ticket.qty * ((ticket.sellUsd || 0) - ticket.buyUsd);
      }
    });
    return Object.values(map);
  }, [filteredTickets]);

  const stats = useMemo(() => {
    const bought = filteredTickets.reduce((sum, ticket) => sum + ticket.qty, 0);
    const soldQty = filteredTickets.filter((ticket) => SOLD_STATUSES.includes(ticket.status)).reduce((sum, ticket) => sum + ticket.qty, 0);
    const stockQty = filteredTickets.filter((ticket) => STOCK_STATUSES.includes(ticket.status)).reduce((sum, ticket) => sum + ticket.qty, 0);
    const revenue = filteredTickets.filter((ticket) => SOLD_STATUSES.includes(ticket.status)).reduce((sum, ticket) => sum + ticket.qty * (ticket.sellUsd || 0), 0);
    const cost = filteredTickets.filter((ticket) => SOLD_STATUSES.includes(ticket.status)).reduce((sum, ticket) => sum + ticket.qty * ticket.buyUsd, 0);
    const profit = revenue - cost;
    const roi = cost > 0 ? (profit / cost) * 100 : 0;
    return { bought, soldQty, stockQty, revenue, profit, roi };
  }, [filteredTickets]);

  const statusData = useMemo(() => {
    const sold = filteredTickets.filter((ticket) => SOLD_STATUSES.includes(ticket.status)).reduce((sum, ticket) => sum + ticket.qty, 0);
    const stock = filteredTickets.filter((ticket) => STOCK_STATUSES.includes(ticket.status)).reduce((sum, ticket) => sum + ticket.qty, 0);
    return [
      { name: 'Vendues', value: sold, color: COLORS.green },
      { name: 'En stock', value: stock, color: COLORS.yellow },
    ].filter((entry) => entry.value > 0);
  }, [filteredTickets]);

  const alerts = useMemo(() => {
    const now = new Date();
    return tickets
      .filter((ticket) => !SOLD_STATUSES.includes(ticket.status))
      .map((ticket) => {
        const eventDate = new Date(ticket.eventDate);
        const daysLeft = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return { ...ticket, daysLeft };
      })
      .filter((ticket) => ticket.daysLeft >= 0 && ticket.daysLeft <= 7)
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [tickets]);

  const addTicket = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const qty = Number(form.qty);
    const buyUsd = Number(form.buyUsd);
    const sellUsd = Number(form.sellUsd);
    if (!form.event || !form.eventDate || Number.isNaN(qty) || Number.isNaN(buyUsd)) return;

    const { error } = await supabase.from('tickets').insert({
      event: form.event,
      event_date: form.eventDate,
      qty,
      buy_usd: buyUsd,
      sell_usd: Number.isNaN(sellUsd) ? 0 : sellUsd,
      status: 'achete',
      purchased_by: form.purchasedBy || 'commun',
      category: form.category || null,
      bloc: form.bloc || null,
      rang: form.rang || null,
      seats: form.seats || null,
      listing_number: form.listingNumber || null,
      account_email: form.accountEmail || null,
      account_password: form.accountPassword || null,
    });
    if (error) {
      setErrorMessage(error.message);
      return;
    }
    setForm({
      event: '',
      eventDate: '',
      qty: '',
      buyUsd: '',
      sellUsd: '',
      purchasedBy: '',
      category: '',
      bloc: '',
      rang: '',
      seats: '',
      listingNumber: '',
      accountEmail: '',
      accountPassword: '',
    });
  };

  const addEvent = async () => {
    const name = newEventName.trim();
    if (!name) return;
    const { error } = await supabase.from('events').upsert({ name }, { onConflict: 'name', ignoreDuplicates: true });
    if (error) {
      setErrorMessage(error.message);
      return;
    }
    setForm((prev) => ({ ...prev, event: name }));
    setNewEventName('');
  };

  const updateTicketStatus = async (id: number, status: TicketStatus) => {
    const { error } = await supabase.from('tickets').update({ status }).eq('id', id);
    if (error) setErrorMessage(error.message);
  };

  const removeTicket = async (id: number) => {
    const { error } = await supabase.from('tickets').delete().eq('id', id);
    if (error) setErrorMessage(error.message);
  };

  const startEdit = (ticket: Ticket) => {
    setEditingId(ticket.id);
    setEditForm({
      event: ticket.event,
      eventDate: ticket.eventDate,
      qty: String(ticket.qty),
      buyUsd: String(ticket.buyUsd),
      sellUsd: String(ticket.sellUsd),
      purchasedBy: ticket.purchasedBy,
      category: ticket.category,
      bloc: ticket.bloc,
      rang: ticket.rang,
      seats: ticket.seats,
      listingNumber: ticket.listingNumber,
      accountEmail: ticket.accountEmail,
      accountPassword: ticket.accountPassword,
    });
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async (id: number) => {
    const qty = Number(editForm.qty);
    const buyUsd = Number(editForm.buyUsd);
    const sellUsd = Number(editForm.sellUsd);
    if (!editForm.event || !editForm.eventDate || Number.isNaN(qty) || Number.isNaN(buyUsd)) return;

    const { error } = await supabase
      .from('tickets')
      .update({
        event: editForm.event,
        event_date: editForm.eventDate,
        qty,
        buy_usd: buyUsd,
        sell_usd: Number.isNaN(sellUsd) ? 0 : sellUsd,
        purchased_by: editForm.purchasedBy || 'commun',
        category: editForm.category || null,
        bloc: editForm.bloc || null,
        rang: editForm.rang || null,
        seats: editForm.seats || null,
        listing_number: editForm.listingNumber || null,
        account_email: editForm.accountEmail || null,
        account_password: editForm.accountPassword || null,
      })
      .eq('id', id);
    if (error) {
      setErrorMessage(error.message);
      return;
    }
    setEditingId(null);
  };

  const togglePasswordReveal = (id: number) => {
    setRevealedPasswords((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <main style={{ minHeight: '100vh', background: COLORS.bg, color: COLORS.text, fontFamily: 'Inter, sans-serif', padding: 28, borderRadius: 12 }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: COLORS.amber, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Oswald, sans-serif', fontWeight: 700, color: '#1a1206', fontSize: 18 }}>G</div>
            <div>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 20, letterSpacing: '0.01em' }}>Guichet</div>
              <div style={{ fontSize: 12, color: COLORS.textMuted }}>Tableau de bord opérationnel</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, padding: '4px 10px', borderRadius: 20, background: 'rgba(232,150,60,0.15)', color: COLORS.amber }}>● Suivi en cours</span>
            {session ? (
              <button onClick={handleLogout} style={{ ...actionButtonStyle, background: 'transparent' }}>Se déconnecter</button>
            ) : null}
          </div>
        </div>

        {errorMessage ? (
          <div style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 8, background: 'rgba(217,95,74,0.12)', border: `1px solid ${COLORS.red}55`, color: COLORS.red, fontSize: 13 }}>
            Erreur de connexion à la base : {errorMessage}
          </div>
        ) : null}

        {!authChecked ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: COLORS.textMuted, fontSize: 13 }}>
            Chargement…
          </div>
        ) : !session ? (
          <div style={{ maxWidth: 360, margin: '40px auto', background: COLORS.panel, borderRadius: 10, padding: 24 }}>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 16, marginBottom: 4 }}>Connexion</div>
            <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 16 }}>Accès réservé aux comptes autorisés.</div>
            <form onSubmit={handleLogin} style={{ display: 'grid', gap: 10 }}>
              <input
                type="email"
                required
                value={loginForm.email}
                onChange={(event) => setLoginForm((prev) => ({ ...prev, email: event.target.value }))}
                placeholder="Email"
                style={inputStyle}
              />
              <input
                type="password"
                required
                value={loginForm.password}
                onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
                placeholder="Mot de passe"
                style={inputStyle}
              />
              {loginError ? <div style={{ color: COLORS.red, fontSize: 12 }}>{loginError}</div> : null}
              <button
                type="submit"
                disabled={loggingIn}
                style={{ padding: '10px 14px', borderRadius: 8, background: COLORS.amber, color: '#1a1206', fontWeight: 700, border: 'none', cursor: 'pointer', opacity: loggingIn ? 0.6 : 1 }}
              >
                {loggingIn ? 'Connexion…' : 'Se connecter'}
              </button>
            </form>
          </div>
        ) : loading ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: COLORS.textMuted, fontSize: 13 }}>
            Chargement des billets…
          </div>
        ) : (
        <>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, letterSpacing: '0.1em', color: COLORS.textMuted, textTransform: 'uppercase' }}>Synthèse opération</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: COLORS.textMuted }}>
              Filtrer par événement
              <select
                value={eventFilter}
                onChange={(event) => setEventFilter(event.target.value)}
                style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${COLORS.line}`, color: COLORS.text, borderRadius: 8, padding: '6px 10px', fontSize: 12, outline: 'none' }}
              >
                <option value="all" style={optionStyle}>Tous les événements</option>
                {eventOptions.map((eventName) => (
                  <option key={eventName} value={eventName} style={optionStyle}>{eventName}</option>
                ))}
              </select>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: COLORS.textMuted }}>
              Période
              <select
                value={timeFilter}
                onChange={(event) => setTimeFilter(event.target.value as 'all' | 'past' | 'upcoming')}
                style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${COLORS.line}`, color: COLORS.text, borderRadius: 8, padding: '6px 10px', fontSize: 12, outline: 'none' }}
              >
                <option value="all" style={optionStyle}>Tous</option>
                <option value="upcoming" style={optionStyle}>Événements à venir</option>
                <option value="past" style={optionStyle}>Événements passés</option>
              </select>
            </label>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginBottom: 28 }}>
          <StatCard icon="🎟️" label="Billets achetés" value={String(stats.bought)} accent={COLORS.amber} />
          <StatCard icon="✅" label="Billets vendus" value={String(stats.soldQty)} accent={COLORS.green} />
          <StatCard icon="📦" label="En stock" value={String(stats.stockQty)} accent={COLORS.yellow} />
          <StatCard icon="💰" label="Recettes réalisées" value={fmtUSD(stats.revenue)} accent={COLORS.blue} />
          <StatCard icon="📈" label="Bénéfice net" value={fmtUSD(stats.profit)} accent={stats.profit >= 0 ? COLORS.green : COLORS.red} />
          <StatCard icon="⚡" label="ROI" value={`${stats.roi.toFixed(0)}%`} accent={COLORS.amber} sub="Bénéfice / coût d'achat" />
        </div>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
          <Panel title="Ajout / suivi" subtitle="Créer un nouveau lot et gérer son état">
            <form onSubmit={addTicket} style={{ display: 'grid', gap: 10 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={newEventName}
                  onChange={(event) => setNewEventName(event.target.value)}
                  placeholder="Nouvel événement"
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button
                  type="button"
                  onClick={addEvent}
                  style={{ padding: '0 14px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', color: COLORS.text, border: `1px solid ${COLORS.line}`, cursor: 'pointer', fontSize: 12 }}
                >
                  Ajouter
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
                <select
                  value={form.event}
                  onChange={(event) => setForm((prev) => ({ ...prev, event: event.target.value }))}
                  style={inputStyle}
                >
                  <option value="" style={optionStyle}>-- Choisir un événement --</option>
                  {eventOptions.map((eventName) => (
                    <option key={eventName} value={eventName} style={optionStyle}>{eventName}</option>
                  ))}
                </select>
                <input type="date" value={form.eventDate} onChange={(event) => setForm((prev) => ({ ...prev, eventDate: event.target.value }))} style={inputStyle} />
                <input type="number" min="1" value={form.qty} onChange={(event) => setForm((prev) => ({ ...prev, qty: event.target.value }))} placeholder="Qté" style={inputStyle} />
                <input type="number" min="0" value={form.buyUsd} onChange={(event) => setForm((prev) => ({ ...prev, buyUsd: event.target.value }))} placeholder="Achat / u." style={inputStyle} />
                <input type="number" min="0" value={form.sellUsd} onChange={(event) => setForm((prev) => ({ ...prev, sellUsd: event.target.value }))} placeholder="Revente / u." style={inputStyle} />
                <input value={form.purchasedBy} onChange={(event) => setForm((prev) => ({ ...prev, purchasedBy: event.target.value }))} placeholder="Acheteur" style={inputStyle} />
              </div>

              <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 4 }}>Détails billet (optionnel)</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 10 }}>
                <input value={form.category} onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))} placeholder="Catégorie" style={inputStyle} />
                <input value={form.bloc} onChange={(event) => setForm((prev) => ({ ...prev, bloc: event.target.value }))} placeholder="Bloc" style={inputStyle} />
                <input value={form.rang} onChange={(event) => setForm((prev) => ({ ...prev, rang: event.target.value }))} placeholder="Rang" style={inputStyle} />
                <input value={form.seats} onChange={(event) => setForm((prev) => ({ ...prev, seats: event.target.value }))} placeholder="Sièges" style={inputStyle} />
                <input value={form.listingNumber} onChange={(event) => setForm((prev) => ({ ...prev, listingNumber: event.target.value }))} placeholder="N° Listing" style={inputStyle} />
              </div>

              <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 4 }}>Compte plateforme (optionnel)</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
                <input type="email" value={form.accountEmail} onChange={(event) => setForm((prev) => ({ ...prev, accountEmail: event.target.value }))} placeholder="Email du compte" style={inputStyle} />
                <input type="password" value={form.accountPassword} onChange={(event) => setForm((prev) => ({ ...prev, accountPassword: event.target.value }))} placeholder="Mot de passe" style={inputStyle} />
              </div>

              <button type="submit" style={{ padding: '10px 14px', borderRadius: 8, background: COLORS.amber, color: '#1a1206', fontWeight: 700, border: 'none', cursor: 'pointer' }}>Ajouter le lot</button>
            </form>
          </Panel>

          <Panel title="Alertes d’échéance" subtitle="Événements à surveiller dans les 7 prochains jours">
            <div style={{ display: 'grid', gap: 8 }}>
              {alerts.length > 0 ? alerts.map((ticket) => (
                <div key={ticket.id} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px 12px', fontSize: 12 }}>
                  <div style={{ color: COLORS.text, fontWeight: 600 }}>{ticket.event}</div>
                  <div style={{ color: COLORS.textMuted, marginTop: 2 }}>J-{ticket.daysLeft} • {ticket.qty} billet{ticket.qty > 1 ? 's' : ''}</div>
                </div>
              )) : <div style={{ color: COLORS.textMuted, fontSize: 12 }}>Aucune alerte à venir.</div>}
            </div>
          </Panel>
        </div>

        <div style={{ marginBottom: 10, fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, letterSpacing: '0.1em', color: COLORS.textMuted, textTransform: 'uppercase' }}>Analyse par événement</div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
          <Panel title="Coût vs recette" subtitle="Prix d'achat / prix de revente, par événement">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={byEvent}>
                <CartesianGrid stroke={COLORS.line} vertical={false} />
                <XAxis dataKey="event" tick={{ fill: COLORS.textMuted, fontSize: 10 }} axisLine={{ stroke: COLORS.line }} tickLine={false} />
                <YAxis tick={{ fill: COLORS.textMuted, fontSize: 10 }} axisLine={{ stroke: COLORS.line }} tickLine={false} />
                <Tooltip contentStyle={{ background: COLORS.bg, border: `1px solid ${COLORS.line}`, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="achat" name="Achat total" fill={COLORS.red} radius={[3, 3, 0, 0]} />
                <Bar dataKey="revente" name="Revente réalisée" fill={COLORS.green} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Panel>

          <Panel title="Statut des billets" subtitle="Répartition vendues / en stock">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={2}>
                  {statusData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} stroke={COLORS.panel} strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: COLORS.bg, border: `1px solid ${COLORS.line}`, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </Panel>

          <Panel title="Bénéfice par événement" subtitle="Profit net réalisé, par lot">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={byEvent} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid stroke={COLORS.line} horizontal={false} />
                <XAxis type="number" tick={{ fill: COLORS.textMuted, fontSize: 10 }} axisLine={{ stroke: COLORS.line }} tickLine={false} />
                <YAxis type="category" dataKey="event" tick={{ fill: COLORS.textMuted, fontSize: 10 }} axisLine={{ stroke: COLORS.line }} tickLine={false} width={100} />
                <Tooltip contentStyle={{ background: COLORS.bg, border: `1px solid ${COLORS.line}`, fontSize: 12 }} />
                <Bar dataKey="profit" name="Bénéfice ($)" radius={[0, 3, 3, 0]}>
                  {byEvent.map((entry, index) => (
                    <Cell key={index} fill={entry.profit >= 0 ? COLORS.green : COLORS.red} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Panel>
        </div>

        <div style={{ marginBottom: 10, fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, letterSpacing: '0.1em', color: COLORS.textMuted, textTransform: 'uppercase' }}>Détail des opérations</div>
        <div style={{ background: COLORS.panel, borderRadius: 10, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['Événement', 'Date', 'Qté', 'Achat/u.', 'Revente/u.', 'Coût total', 'Recette', 'Bénéfice net', 'Acheteur', 'Placement', 'Compte', 'Statut', 'Actions'].map((header) => (
                  <th key={header} style={{ textAlign: 'left', padding: '10px 14px', fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, letterSpacing: '0.05em', textTransform: 'uppercase', color: COLORS.textMuted, borderBottom: `1px solid ${COLORS.line}` }}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((ticket) => {
                const costTotal = ticket.qty * ticket.buyUsd;
                const revenue = ticket.qty * (ticket.sellUsd || 0);
                const profit = SOLD_STATUSES.includes(ticket.status) ? revenue - costTotal : null;

                if (editingId === ticket.id) {
                  return (
                    <tr key={ticket.id}>
                      <td style={cellStyle}>
                        <select value={editForm.event} onChange={(event) => setEditForm((prev) => ({ ...prev, event: event.target.value }))} style={editInputStyle}>
                          {eventOptions.map((eventName) => (
                            <option key={eventName} value={eventName} style={optionStyle}>{eventName}</option>
                          ))}
                        </select>
                      </td>
                      <td style={cellStyle}>
                        <input type="date" value={editForm.eventDate} onChange={(event) => setEditForm((prev) => ({ ...prev, eventDate: event.target.value }))} style={editInputStyle} />
                      </td>
                      <td style={cellStyle}>
                        <input type="number" min="1" value={editForm.qty} onChange={(event) => setEditForm((prev) => ({ ...prev, qty: event.target.value }))} style={{ ...editInputStyle, width: 60 }} />
                      </td>
                      <td style={cellStyle}>
                        <input type="number" min="0" value={editForm.buyUsd} onChange={(event) => setEditForm((prev) => ({ ...prev, buyUsd: event.target.value }))} style={{ ...editInputStyle, width: 80 }} />
                      </td>
                      <td style={cellStyle}>
                        <input type="number" min="0" value={editForm.sellUsd} onChange={(event) => setEditForm((prev) => ({ ...prev, sellUsd: event.target.value }))} style={{ ...editInputStyle, width: 80 }} />
                      </td>
                      <td style={{ ...cellStyle, fontFamily: 'IBM Plex Mono, monospace', color: COLORS.textMuted }}>{fmtUSD(costTotal)}</td>
                      <td style={{ ...cellStyle, fontFamily: 'IBM Plex Mono, monospace', color: COLORS.textMuted }}>{revenue ? fmtUSD(revenue) : '—'}</td>
                      <td style={{ ...cellStyle, color: COLORS.textMuted }}>—</td>
                      <td style={cellStyle}>
                        <input value={editForm.purchasedBy} onChange={(event) => setEditForm((prev) => ({ ...prev, purchasedBy: event.target.value }))} style={{ ...editInputStyle, width: 80 }} />
                      </td>
                      <td style={cellStyle}>
                        <div style={{ display: 'grid', gap: 4 }}>
                          <input value={editForm.category} onChange={(event) => setEditForm((prev) => ({ ...prev, category: event.target.value }))} placeholder="Catégorie" style={{ ...editInputStyle, width: 100 }} />
                          <input value={editForm.bloc} onChange={(event) => setEditForm((prev) => ({ ...prev, bloc: event.target.value }))} placeholder="Bloc" style={{ ...editInputStyle, width: 100 }} />
                          <input value={editForm.rang} onChange={(event) => setEditForm((prev) => ({ ...prev, rang: event.target.value }))} placeholder="Rang" style={{ ...editInputStyle, width: 100 }} />
                          <input value={editForm.seats} onChange={(event) => setEditForm((prev) => ({ ...prev, seats: event.target.value }))} placeholder="Sièges" style={{ ...editInputStyle, width: 100 }} />
                          <input value={editForm.listingNumber} onChange={(event) => setEditForm((prev) => ({ ...prev, listingNumber: event.target.value }))} placeholder="N° Listing" style={{ ...editInputStyle, width: 100 }} />
                        </div>
                      </td>
                      <td style={cellStyle}>
                        <div style={{ display: 'grid', gap: 4 }}>
                          <input type="email" value={editForm.accountEmail} onChange={(event) => setEditForm((prev) => ({ ...prev, accountEmail: event.target.value }))} placeholder="Email" style={{ ...editInputStyle, width: 130 }} />
                          <input type="password" value={editForm.accountPassword} onChange={(event) => setEditForm((prev) => ({ ...prev, accountPassword: event.target.value }))} placeholder="Mot de passe" style={{ ...editInputStyle, width: 130 }} />
                        </div>
                      </td>
                      <td style={cellStyle}><StatusBadge status={ticket.status} /></td>
                      <td style={cellStyle}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <button onClick={() => saveEdit(ticket.id)} style={{ ...actionButtonStyle, background: COLORS.amber, color: '#1a1206', border: 'none', fontWeight: 700 }}>Enregistrer</button>
                          <button onClick={cancelEdit} style={actionButtonStyle}>Annuler</button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={ticket.id}>
                    <td style={cellStyle}>{ticket.event}</td>
                    <td style={cellStyle}>{new Date(ticket.eventDate).toLocaleDateString('fr-FR')}</td>
                    <td style={{ ...cellStyle, fontFamily: 'IBM Plex Mono, monospace' }}>{ticket.qty}</td>
                    <td style={{ ...cellStyle, fontFamily: 'IBM Plex Mono, monospace' }}>{fmtUSD(ticket.buyUsd)}</td>
                    <td style={{ ...cellStyle, fontFamily: 'IBM Plex Mono, monospace' }}>{ticket.sellUsd ? fmtUSD(ticket.sellUsd) : '—'}</td>
                    <td style={{ ...cellStyle, fontFamily: 'IBM Plex Mono, monospace' }}>{fmtUSD(costTotal)}</td>
                    <td style={{ ...cellStyle, fontFamily: 'IBM Plex Mono, monospace' }}>{revenue ? fmtUSD(revenue) : '—'}</td>
                    <td style={{ ...cellStyle, fontFamily: 'IBM Plex Mono, monospace', color: profit == null ? COLORS.textMuted : profit >= 0 ? COLORS.green : COLORS.red }}>{profit == null ? '—' : `${profit >= 0 ? '+' : ''}${fmtUSD(profit)}`}</td>
                    <td style={cellStyle}>{ticket.purchasedBy}</td>
                    <td style={{ ...cellStyle, fontSize: 12, color: COLORS.textMuted }}>
                      {[ticket.category, ticket.bloc && `Bloc ${ticket.bloc}`, ticket.rang && `Rang ${ticket.rang}`, ticket.seats && `Sièges ${ticket.seats}`, ticket.listingNumber && `#${ticket.listingNumber}`]
                        .filter(Boolean)
                        .join(' · ') || '—'}
                    </td>
                    <td style={cellStyle}>
                      {ticket.accountEmail || ticket.accountPassword ? (
                        <div style={{ fontSize: 12 }}>
                          <div>{ticket.accountEmail || '—'}</div>
                          <div style={{ color: COLORS.textMuted, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
                              {revealedPasswords.has(ticket.id) ? (ticket.accountPassword || '—') : '••••••••'}
                            </span>
                            {ticket.accountPassword ? (
                              <button onClick={() => togglePasswordReveal(ticket.id)} style={{ ...actionButtonStyle, padding: '2px 6px' }}>
                                {revealedPasswords.has(ticket.id) ? 'Cacher' : 'Voir'}
                              </button>
                            ) : null}
                          </div>
                        </div>
                      ) : '—'}
                    </td>
                    <td style={cellStyle}><StatusBadge status={ticket.status} /></td>
                    <td style={cellStyle}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button onClick={() => startEdit(ticket)} style={actionButtonStyle}>Modifier</button>
                        <button onClick={() => updateTicketStatus(ticket.id, 'achete')} style={actionButtonStyle}>Acheté</button>
                        <button onClick={() => updateTicketStatus(ticket.id, 'listed')} style={actionButtonStyle}>Listé</button>
                        <button onClick={() => updateTicketStatus(ticket.id, 'vendu')} style={actionButtonStyle}>Vendu</button>
                        <button onClick={() => updateTicketStatus(ticket.id, 'livre')} style={actionButtonStyle}>Livré</button>
                        <button onClick={() => removeTicket(ticket.id)} style={{ ...actionButtonStyle, border: `1px solid ${COLORS.line}` }}>Suppr.</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        </>
        )}
      </div>
    </main>
  );
}

const cellStyle = { padding: '10px 14px', borderBottom: `1px solid ${COLORS.line}` };

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.03)',
  border: `1px solid ${COLORS.line}`,
  color: COLORS.text,
  borderRadius: 8,
  padding: '10px 12px',
  fontSize: 12,
  outline: 'none',
};

const editInputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: `1px solid ${COLORS.line}`,
  color: COLORS.text,
  borderRadius: 6,
  padding: '5px 8px',
  fontSize: 12,
  outline: 'none',
};

const optionStyle: React.CSSProperties = {
  color: COLORS.bg,
  background: COLORS.text,
};

const actionButtonStyle: React.CSSProperties = {
  padding: '4px 8px',
  borderRadius: 999,
  fontSize: 10,
  border: `1px solid ${COLORS.line}`,
  background: 'rgba(255,255,255,0.04)',
  color: COLORS.text,
  cursor: 'pointer',
};

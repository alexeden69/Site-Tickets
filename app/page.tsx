'use client';

import { type FormEvent, useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
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
  localCurrency: string;
  localBuyAmount: number | null;
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
  local_currency: string | null;
  local_buy_amount: number | null;
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
  localCurrency: row.local_currency || '',
  localBuyAmount: row.local_buy_amount,
});

const STOCK_STATUSES: TicketStatus[] = ['achete', 'listed'];
const SOLD_STATUSES: TicketStatus[] = ['vendu', 'livre'];
const PURCHASER_OPTIONS = ['Alexandre', 'Charles', 'Commun'];

const COLORS = {
  bg: '#000000',
  panel: '#0e0e14',
  line: 'rgba(255,255,255,0.09)',
  text: '#ffffff',
  textMuted: '#9a9aa8',
  amber: '#2563eb',
  green: '#22c55e',
  red: '#ef4444',
  blue: '#06b6d4',
  yellow: '#ffffff',
};

const fmtUSD = (value: number) =>
  (value || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const fmtLocal = (value: number, currency: string) => {
  try {
    return value.toLocaleString('fr-FR', { style: 'currency', currency, maximumFractionDigits: 0 });
  } catch {
    return `${value} ${currency}`;
  }
};

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

type AcoStatus = 'paye' | 'en_attente';
type AcoDealType = 'aco' | 'profit_split' | 'sign_up';

type AcoTransaction = {
  id: number;
  event: string;
  category: string;
  bloc: string;
  rang: string;
  seats: string;
  qty: number;
  discordHandle: string;
  transactionDate: string;
  amount: number;
  purchasedBy: string;
  dealType: AcoDealType;
  status: AcoStatus;
  accountEmail: string;
  accountPassword: string;
  notes: string;
};

type AcoRow = {
  id: number;
  event: string;
  category: string | null;
  bloc: string | null;
  rang: string | null;
  seats: string | null;
  qty: number;
  discord_handle: string | null;
  transaction_date: string;
  amount: number;
  purchased_by: string;
  deal_type: AcoDealType;
  status: AcoStatus;
  account_email: string | null;
  account_password: string | null;
  notes: string | null;
};

const fromAcoRow = (row: AcoRow): AcoTransaction => ({
  id: row.id,
  event: row.event,
  category: row.category || '',
  bloc: row.bloc || '',
  rang: row.rang || '',
  seats: row.seats || '',
  qty: row.qty,
  discordHandle: row.discord_handle || '',
  transactionDate: row.transaction_date,
  amount: row.amount,
  purchasedBy: row.purchased_by,
  dealType: row.deal_type,
  status: row.status,
  accountEmail: row.account_email || '',
  accountPassword: row.account_password || '',
  notes: row.notes || '',
});

const ACO_DEAL_TYPE_LABELS: Record<AcoDealType, string> = {
  aco: 'ACO',
  profit_split: 'Profit Split',
  sign_up: 'Sign-up',
};

const ACO_STATUS_LABELS: Record<AcoStatus, { label: string; color: string }> = {
  paye: { label: 'Payé', color: COLORS.green },
  en_attente: { label: 'En attente de paiement', color: COLORS.amber },
};

const emptyAcoForm = {
  event: '',
  category: '',
  bloc: '',
  rang: '',
  seats: '',
  qty: '1',
  discordHandle: '',
  transactionDate: '',
  amount: '',
  purchasedBy: 'Commun',
  dealType: 'aco' as AcoDealType,
  status: 'en_attente' as AcoStatus,
  accountEmail: '',
  accountPassword: '',
  notes: '',
};

function AcoTab({ eventOptions }: { eventOptions: string[] }) {
  const [transactions, setTransactions] = useState<AcoTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [form, setForm] = useState(emptyAcoForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState(emptyAcoForm);
  const [eventFilter, setEventFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'past' | 'upcoming'>('all');
  const [revealedPasswords, setRevealedPasswords] = useState<Set<number>>(new Set());

  const togglePasswordReveal = (id: number) => {
    setRevealedPasswords((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      const { data, error } = await supabase
        .from('aco_transactions')
        .select('id, event, category, bloc, rang, seats, qty, discord_handle, transaction_date, amount, purchased_by, deal_type, status, account_email, account_password, notes')
        .order('transaction_date', { ascending: false });
      if (!isMounted) return;
      if (error) {
        setErrorMessage(error.message);
      } else {
        setTransactions((data as AcoRow[]).map(fromAcoRow));
        setErrorMessage(null);
      }
      setLoading(false);
    };

    load();

    const channel = supabase
      .channel('aco-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'aco_transactions' }, () => load())
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredTransactions = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    return transactions
      .filter((t) => eventFilter === 'all' || t.event === eventFilter)
      .filter((t) => {
        if (timeFilter === 'all') return true;
        const isPast = new Date(t.transactionDate) < startOfToday;
        return timeFilter === 'past' ? isPast : !isPast;
      });
  }, [transactions, eventFilter, timeFilter]);

  const stats = useMemo(() => {
    const count = filteredTransactions.length;
    const paidTransactions = filteredTransactions.filter((t) => t.status === 'paye');
    const pnl = paidTransactions.reduce((sum, t) => sum + t.amount, 0);
    const pending = filteredTransactions.filter((t) => t.status === 'en_attente').reduce((sum, t) => sum + t.amount, 0);
    return { count, pnl, pending, pnlLatent: pnl + pending, avg: paidTransactions.length > 0 ? pnl / paidTransactions.length : 0 };
  }, [filteredTransactions]);

  const pnlOverTime = useMemo(() => {
    const paid = filteredTransactions
      .filter((t) => t.status === 'paye')
      .slice()
      .sort((a, b) => a.transactionDate.localeCompare(b.transactionDate));
    let running = 0;
    return paid.map((t) => {
      running += t.amount;
      return { date: new Date(t.transactionDate).toLocaleDateString('fr-FR'), pnl: running };
    });
  }, [filteredTransactions]);

  const addTransaction = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const amount = Number(form.amount);
    const qty = Number(form.qty);
    if (!form.event || !form.transactionDate || Number.isNaN(amount) || Number.isNaN(qty)) return;
    const { error } = await supabase.from('aco_transactions').insert({
      event: form.event,
      category: form.category || null,
      bloc: form.bloc || null,
      rang: form.rang || null,
      seats: form.seats || null,
      qty,
      discord_handle: form.discordHandle || null,
      transaction_date: form.transactionDate,
      amount,
      purchased_by: form.purchasedBy,
      deal_type: form.dealType,
      status: form.status,
      account_email: form.accountEmail || null,
      account_password: form.accountPassword || null,
      notes: form.notes || null,
    });
    if (error) {
      setErrorMessage(error.message);
      return;
    }
    setForm(emptyAcoForm);
  };

  const removeTransaction = async (id: number) => {
    const { error } = await supabase.from('aco_transactions').delete().eq('id', id);
    if (error) setErrorMessage(error.message);
  };

  const startEdit = (t: AcoTransaction) => {
    setEditingId(t.id);
    setEditForm({
      event: t.event,
      category: t.category,
      bloc: t.bloc,
      rang: t.rang,
      seats: t.seats,
      qty: String(t.qty),
      discordHandle: t.discordHandle,
      transactionDate: t.transactionDate,
      amount: String(t.amount),
      purchasedBy: t.purchasedBy,
      dealType: t.dealType,
      status: t.status,
      accountEmail: t.accountEmail,
      accountPassword: t.accountPassword,
      notes: t.notes,
    });
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async (id: number) => {
    const amount = Number(editForm.amount);
    const qty = Number(editForm.qty);
    if (!editForm.event || !editForm.transactionDate || Number.isNaN(amount) || Number.isNaN(qty)) return;
    const { error } = await supabase
      .from('aco_transactions')
      .update({
        event: editForm.event,
        category: editForm.category || null,
        bloc: editForm.bloc || null,
        rang: editForm.rang || null,
        seats: editForm.seats || null,
        qty,
        discord_handle: editForm.discordHandle || null,
        transaction_date: editForm.transactionDate,
        amount,
        purchased_by: editForm.purchasedBy,
        deal_type: editForm.dealType,
        status: editForm.status,
        account_email: editForm.accountEmail || null,
        account_password: editForm.accountPassword || null,
        notes: editForm.notes || null,
      })
      .eq('id', id);
    if (error) {
      setErrorMessage(error.message);
      return;
    }
    setEditingId(null);
  };

  if (loading) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center', color: COLORS.textMuted, fontSize: 13 }}>
        Chargement ACO…
      </div>
    );
  }

  return (
    <div>
      {errorMessage ? (
        <div style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 8, background: 'rgba(217,95,74,0.12)', border: `1px solid ${COLORS.red}55`, color: COLORS.red, fontSize: 13 }}>
          Erreur : {errorMessage}
        </div>
      ) : null}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, letterSpacing: '0.1em', color: COLORS.textMuted, textTransform: 'uppercase' }}>Synthèse ACO</div>
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
              <option value="upcoming" style={optionStyle}>À venir</option>
              <option value="past" style={optionStyle}>Passés</option>
            </select>
          </label>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginBottom: 28 }}>
        <StatCard icon="🧺" label="Transactions" value={String(stats.count)} accent={COLORS.amber} />
        <StatCard icon="💰" label="PNL" value={fmtLocal(stats.pnl, 'EUR')} accent={COLORS.green} />
        <StatCard icon="⏳" label="En attente" value={fmtLocal(stats.pending, 'EUR')} accent={COLORS.amber} />
        <StatCard icon="🔮" label="PNL latent" value={fmtLocal(stats.pnlLatent, 'EUR')} accent={COLORS.blue} />
        <StatCard icon="📊" label="Moyenne" value={fmtLocal(stats.avg, 'EUR')} accent={COLORS.blue} />
      </div>

      {pnlOverTime.length > 1 ? (
        <div style={{ marginBottom: 28 }}>
          <Panel title="PNL dans le temps">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={pnlOverTime}>
                <CartesianGrid stroke={COLORS.line} vertical={false} />
                <XAxis dataKey="date" tick={{ fill: COLORS.textMuted, fontSize: 10 }} axisLine={{ stroke: COLORS.line }} tickLine={false} />
                <YAxis tick={{ fill: COLORS.textMuted, fontSize: 10 }} axisLine={{ stroke: COLORS.line }} tickLine={false} />
                <Tooltip contentStyle={{ background: COLORS.bg, border: `1px solid ${COLORS.line}`, fontSize: 12 }} />
                <Line type="monotone" dataKey="pnl" name="PNL cumulé (€)" stroke={COLORS.green} strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </Panel>
        </div>
      ) : null}

      <Panel title="Ajouter une transaction ACO">
        <form onSubmit={addTransaction} style={{ display: 'grid', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
            <select value={form.event} onChange={(event) => setForm((prev) => ({ ...prev, event: event.target.value }))} style={inputStyle}>
              <option value="" style={optionStyle}>-- Choisir un événement --</option>
              {eventOptions.map((eventName) => (
                <option key={eventName} value={eventName} style={optionStyle}>{eventName}</option>
              ))}
            </select>
            <input type="date" value={form.transactionDate} onChange={(event) => setForm((prev) => ({ ...prev, transactionDate: event.target.value }))} style={inputStyle} />
            <input type="number" min="1" value={form.qty} onChange={(event) => setForm((prev) => ({ ...prev, qty: event.target.value }))} placeholder="Qté" style={inputStyle} />
            <input type="number" min="0" value={form.amount} onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))} placeholder="Prix du PAS (€)" style={inputStyle} />
            <select value={form.dealType} onChange={(event) => setForm((prev) => ({ ...prev, dealType: event.target.value as AcoDealType }))} style={inputStyle}>
              <option value="aco" style={optionStyle}>ACO</option>
              <option value="profit_split" style={optionStyle}>Profit Split</option>
              <option value="sign_up" style={optionStyle}>Sign-up</option>
            </select>
            <select value={form.status} onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value as AcoStatus }))} style={inputStyle}>
              <option value="en_attente" style={optionStyle}>En attente de paiement</option>
              <option value="paye" style={optionStyle}>Payé</option>
            </select>
          </div>

          <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 4 }}>Détails billet (optionnel)</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 10 }}>
            <input value={form.category} onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))} placeholder="Catégorie" style={inputStyle} />
            <input value={form.bloc} onChange={(event) => setForm((prev) => ({ ...prev, bloc: event.target.value }))} placeholder="Bloc" style={inputStyle} />
            <input value={form.rang} onChange={(event) => setForm((prev) => ({ ...prev, rang: event.target.value }))} placeholder="Rangée" style={inputStyle} />
            <input value={form.seats} onChange={(event) => setForm((prev) => ({ ...prev, seats: event.target.value }))} placeholder="Siège" style={inputStyle} />
            <input value={form.discordHandle} onChange={(event) => setForm((prev) => ({ ...prev, discordHandle: event.target.value }))} placeholder="Pseudonyme Discord" style={inputStyle} />
          </div>

          <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 4 }}>Compte plateforme (optionnel)</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
            <input type="email" value={form.accountEmail} onChange={(event) => setForm((prev) => ({ ...prev, accountEmail: event.target.value }))} placeholder="Email du compte" style={inputStyle} />
            <input type="password" value={form.accountPassword} onChange={(event) => setForm((prev) => ({ ...prev, accountPassword: event.target.value }))} placeholder="Mot de passe" style={inputStyle} />
          </div>

          <input value={form.notes} onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))} placeholder="Note (optionnel)" style={inputStyle} />

          <button type="submit" style={{ padding: '10px 14px', borderRadius: 8, background: COLORS.amber, color: '#ffffff', fontWeight: 700, border: 'none', cursor: 'pointer' }}>Ajouter</button>
        </form>
      </Panel>

      <div style={{ marginTop: 28, marginBottom: 10, fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, letterSpacing: '0.1em', color: COLORS.textMuted, textTransform: 'uppercase' }}>Détail ACO</div>
      <div style={{ background: COLORS.panel, borderRadius: 10, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              {['Événement', 'Date', 'Qté', 'Prix du PAS', 'Placement', 'Discord', 'Type', 'Compte', 'Statut', 'Note', 'Actions'].map((header) => (
                <th key={header} style={{ textAlign: 'left', padding: '10px 14px', fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, letterSpacing: '0.05em', textTransform: 'uppercase', color: COLORS.textMuted, borderBottom: `1px solid ${COLORS.line}` }}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((t) => {
              if (editingId === t.id) {
                return (
                  <tr key={t.id}>
                    <td style={cellStyle}>
                      <select value={editForm.event} onChange={(event) => setEditForm((prev) => ({ ...prev, event: event.target.value }))} style={editInputStyle}>
                        {eventOptions.map((eventName) => (
                          <option key={eventName} value={eventName} style={optionStyle}>{eventName}</option>
                        ))}
                      </select>
                    </td>
                    <td style={cellStyle}>
                      <input type="date" value={editForm.transactionDate} onChange={(event) => setEditForm((prev) => ({ ...prev, transactionDate: event.target.value }))} style={editInputStyle} />
                    </td>
                    <td style={cellStyle}>
                      <input type="number" min="1" value={editForm.qty} onChange={(event) => setEditForm((prev) => ({ ...prev, qty: event.target.value }))} style={{ ...editInputStyle, width: 60 }} />
                    </td>
                    <td style={cellStyle}>
                      <input type="number" min="0" value={editForm.amount} onChange={(event) => setEditForm((prev) => ({ ...prev, amount: event.target.value }))} style={{ ...editInputStyle, width: 80 }} />
                    </td>
                    <td style={cellStyle}>
                      <div style={{ display: 'grid', gap: 4 }}>
                        <input value={editForm.category} onChange={(event) => setEditForm((prev) => ({ ...prev, category: event.target.value }))} placeholder="Catégorie" style={{ ...editInputStyle, width: 100 }} />
                        <input value={editForm.bloc} onChange={(event) => setEditForm((prev) => ({ ...prev, bloc: event.target.value }))} placeholder="Bloc" style={{ ...editInputStyle, width: 100 }} />
                        <input value={editForm.rang} onChange={(event) => setEditForm((prev) => ({ ...prev, rang: event.target.value }))} placeholder="Rangée" style={{ ...editInputStyle, width: 100 }} />
                        <input value={editForm.seats} onChange={(event) => setEditForm((prev) => ({ ...prev, seats: event.target.value }))} placeholder="Siège" style={{ ...editInputStyle, width: 100 }} />
                      </div>
                    </td>
                    <td style={cellStyle}>
                      <input value={editForm.discordHandle} onChange={(event) => setEditForm((prev) => ({ ...prev, discordHandle: event.target.value }))} style={{ ...editInputStyle, width: 110 }} />
                    </td>
                    <td style={cellStyle}>
                      <select value={editForm.dealType} onChange={(event) => setEditForm((prev) => ({ ...prev, dealType: event.target.value as AcoDealType }))} style={{ ...editInputStyle, width: 100 }}>
                        <option value="aco" style={optionStyle}>ACO</option>
                        <option value="profit_split" style={optionStyle}>Profit Split</option>
                        <option value="sign_up" style={optionStyle}>Sign-up</option>
                      </select>
                    </td>
                    <td style={cellStyle}>
                      <div style={{ display: 'grid', gap: 4 }}>
                        <input type="email" value={editForm.accountEmail} onChange={(event) => setEditForm((prev) => ({ ...prev, accountEmail: event.target.value }))} placeholder="Email" style={{ ...editInputStyle, width: 130 }} />
                        <input type="password" value={editForm.accountPassword} onChange={(event) => setEditForm((prev) => ({ ...prev, accountPassword: event.target.value }))} placeholder="Mot de passe" style={{ ...editInputStyle, width: 130 }} />
                      </div>
                    </td>
                    <td style={cellStyle}>
                      <select value={editForm.status} onChange={(event) => setEditForm((prev) => ({ ...prev, status: event.target.value as AcoStatus }))} style={{ ...editInputStyle, width: 130 }}>
                        <option value="en_attente" style={optionStyle}>En attente</option>
                        <option value="paye" style={optionStyle}>Payé</option>
                      </select>
                    </td>
                    <td style={cellStyle}>
                      <input value={editForm.notes} onChange={(event) => setEditForm((prev) => ({ ...prev, notes: event.target.value }))} style={{ ...editInputStyle, width: 120 }} />
                    </td>
                    <td style={cellStyle}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button onClick={() => saveEdit(t.id)} style={{ ...actionButtonStyle, background: COLORS.amber, color: '#ffffff', border: 'none', fontWeight: 700 }}>Enregistrer</button>
                        <button onClick={cancelEdit} style={actionButtonStyle}>Annuler</button>
                      </div>
                    </td>
                  </tr>
                );
              }
              const statusInfo = ACO_STATUS_LABELS[t.status] || ACO_STATUS_LABELS.en_attente;
              return (
                <tr key={t.id}>
                  <td style={cellStyle}>{t.event}</td>
                  <td style={cellStyle}>{new Date(t.transactionDate).toLocaleDateString('fr-FR')}</td>
                  <td style={{ ...cellStyle, fontFamily: 'IBM Plex Mono, monospace' }}>{t.qty}</td>
                  <td style={{ ...cellStyle, fontFamily: 'IBM Plex Mono, monospace', color: COLORS.green }}>{fmtLocal(t.amount, 'EUR')}</td>
                  <td style={{ ...cellStyle, fontSize: 12, color: COLORS.textMuted }}>
                    {[t.category, t.bloc && `Bloc ${t.bloc}`, t.rang && `Rangée ${t.rang}`, t.seats && `Siège ${t.seats}`].filter(Boolean).join(' · ') || '—'}
                  </td>
                  <td style={cellStyle}>{t.discordHandle || '—'}</td>
                  <td style={cellStyle}>{ACO_DEAL_TYPE_LABELS[t.dealType] || ACO_DEAL_TYPE_LABELS.aco}</td>
                  <td style={cellStyle}>
                    {t.accountEmail || t.accountPassword ? (
                      <div style={{ fontSize: 12 }}>
                        <div>{t.accountEmail || '—'}</div>
                        <div style={{ color: COLORS.textMuted, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
                            {revealedPasswords.has(t.id) ? (t.accountPassword || '—') : '••••••••'}
                          </span>
                          {t.accountPassword ? (
                            <button onClick={() => togglePasswordReveal(t.id)} style={{ ...actionButtonStyle, padding: '2px 6px' }}>
                              {revealedPasswords.has(t.id) ? 'Cacher' : 'Voir'}
                            </button>
                          ) : null}
                        </div>
                      </div>
                    ) : '—'}
                  </td>
                  <td style={cellStyle}>
                    <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, textTransform: 'uppercase', padding: '3px 9px', borderRadius: 20, border: `1px solid ${statusInfo.color}55`, color: statusInfo.color }}>
                      {statusInfo.label}
                    </span>
                  </td>
                  <td style={{ ...cellStyle, color: COLORS.textMuted }}>{t.notes || '—'}</td>
                  <td style={cellStyle}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button onClick={() => startEdit(t)} style={actionButtonStyle}>Modifier</button>
                      {t.status === 'en_attente' ? (
                        <button
                          onClick={async () => {
                            const { error } = await supabase.from('aco_transactions').update({ status: 'paye' }).eq('id', t.id);
                            if (error) setErrorMessage(error.message);
                          }}
                          style={actionButtonStyle}
                        >
                          Marquer payé
                        </button>
                      ) : null}
                      <button onClick={() => removeTransaction(t.id)} style={{ ...actionButtonStyle, border: `1px solid ${COLORS.line}` }}>Suppr.</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
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
    purchasedBy: 'Commun',
    category: '',
    bloc: '',
    rang: '',
    seats: '',
    listingNumber: '',
    accountEmail: '',
    accountPassword: '',
    localCurrency: '',
    localBuyAmount: '',
  });
  const [eventFilter, setEventFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'past' | 'upcoming'>('all');
  const [purchaserFilter, setPurchaserFilter] = useState('all');
  const [events, setEvents] = useState<string[]>([]);
  const [newEventName, setNewEventName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    event: '',
    eventDate: '',
    qty: '',
    buyUsd: '',
    sellUsd: '',
    purchasedBy: 'Commun',
    category: '',
    bloc: '',
    rang: '',
    seats: '',
    listingNumber: '',
    accountEmail: '',
    accountPassword: '',
    localCurrency: '',
    localBuyAmount: '',
  });
  const [revealedPasswords, setRevealedPasswords] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<'tickets' | 'aco'>('tickets');

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
        .select('id, event, event_date, qty, buy_usd, sell_usd, status, purchased_by, category, bloc, rang, seats, listing_number, account_email, account_password, local_currency, local_buy_amount')
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

  const purchaserOptions = useMemo(
    () => Array.from(new Set([...PURCHASER_OPTIONS, ...tickets.map((ticket) => ticket.purchasedBy)])),
    [tickets]
  );

  const filteredTickets = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    return tickets
      .filter((ticket) => eventFilter === 'all' || ticket.event === eventFilter)
      .filter((ticket) => purchaserFilter === 'all' || ticket.purchasedBy === purchaserFilter)
      .filter((ticket) => {
        if (timeFilter === 'all') return true;
        const isPast = new Date(ticket.eventDate) < startOfToday;
        return timeFilter === 'past' ? isPast : !isPast;
      });
  }, [tickets, eventFilter, timeFilter, purchaserFilter]);

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

  const ticketPnlOverTime = useMemo(() => {
    const sold = filteredTickets
      .filter((ticket) => SOLD_STATUSES.includes(ticket.status))
      .slice()
      .sort((a, b) => a.eventDate.localeCompare(b.eventDate));
    let running = 0;
    return sold.map((ticket) => {
      running += ticket.qty * ((ticket.sellUsd || 0) - ticket.buyUsd);
      return { date: new Date(ticket.eventDate).toLocaleDateString('fr-FR'), pnl: running };
    });
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
      purchased_by: form.purchasedBy,
      category: form.category || null,
      bloc: form.bloc || null,
      rang: form.rang || null,
      seats: form.seats || null,
      listing_number: form.listingNumber || null,
      account_email: form.accountEmail || null,
      account_password: form.accountPassword || null,
      local_currency: form.localCurrency || null,
      local_buy_amount: form.localBuyAmount ? Number(form.localBuyAmount) : null,
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
      purchasedBy: 'Commun',
      category: '',
      bloc: '',
      rang: '',
      seats: '',
      listingNumber: '',
      accountEmail: '',
      accountPassword: '',
      localCurrency: '',
      localBuyAmount: '',
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
      localCurrency: ticket.localCurrency,
      localBuyAmount: ticket.localBuyAmount != null ? String(ticket.localBuyAmount) : '',
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
        purchased_by: editForm.purchasedBy,
        category: editForm.category || null,
        bloc: editForm.bloc || null,
        rang: editForm.rang || null,
        seats: editForm.seats || null,
        listing_number: editForm.listingNumber || null,
        account_email: editForm.accountEmail || null,
        account_password: editForm.accountPassword || null,
        local_currency: editForm.localCurrency || null,
        local_buy_amount: editForm.localBuyAmount ? Number(editForm.localBuyAmount) : null,
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

  const exportCsv = () => {
    const headers = [
      'Événement', 'Date', 'Qté', 'Achat/u. (USD)', 'Revente/u. (USD)', 'Devise locale', 'Montant local achat',
      'Coût total', 'Recette', 'Bénéfice net', 'Acheteur', 'Catégorie', 'Bloc', 'Rang', 'Sièges', 'N° Listing',
      'Email compte', 'Statut',
    ];
    const rows = filteredTickets.map((ticket) => {
      const costTotal = ticket.qty * ticket.buyUsd;
      const revenue = ticket.qty * (ticket.sellUsd || 0);
      const profit = SOLD_STATUSES.includes(ticket.status) ? revenue - costTotal : '';
      return [
        ticket.event, ticket.eventDate, ticket.qty, ticket.buyUsd, ticket.sellUsd || '',
        ticket.localCurrency, ticket.localBuyAmount ?? '', costTotal, revenue || '', profit,
        ticket.purchasedBy, ticket.category, ticket.bloc, ticket.rang, ticket.seats, ticket.listingNumber,
        ticket.accountEmail, ticket.status,
      ];
    });
    const escapeCell = (value: unknown) => {
      const str = String(value ?? '');
      return /[",;\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
    };
    const csv = [headers, ...rows].map((row) => row.map(escapeCell).join(';')).join('\n');
    const blob = new Blob([String.fromCharCode(0xfeff) + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `billets-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main style={{ minHeight: '100vh', background: COLORS.bg, color: COLORS.text, fontFamily: 'Inter, sans-serif', padding: 28, borderRadius: 12 }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: COLORS.amber, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Oswald, sans-serif', fontWeight: 700, color: '#ffffff', fontSize: 18 }}>G</div>
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
                style={{ padding: '10px 14px', borderRadius: 8, background: COLORS.amber, color: '#ffffff', fontWeight: 700, border: 'none', cursor: 'pointer', opacity: loggingIn ? 0.6 : 1 }}
              >
                {loggingIn ? 'Connexion…' : 'Se connecter'}
              </button>
            </form>
          </div>
        ) : (
        <>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <button
            onClick={() => setActiveTab('tickets')}
            style={{
              padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
              border: `1px solid ${activeTab === 'tickets' ? COLORS.amber : COLORS.line}`,
              background: activeTab === 'tickets' ? 'rgba(245,158,11,0.15)' : 'transparent',
              color: activeTab === 'tickets' ? COLORS.amber : COLORS.textMuted,
            }}
          >
            Billets
          </button>
          <button
            onClick={() => setActiveTab('aco')}
            style={{
              padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
              border: `1px solid ${activeTab === 'aco' ? COLORS.amber : COLORS.line}`,
              background: activeTab === 'aco' ? 'rgba(245,158,11,0.15)' : 'transparent',
              color: activeTab === 'aco' ? COLORS.amber : COLORS.textMuted,
            }}
          >
            ACO
          </button>
        </div>

        {activeTab === 'aco' ? (
          <AcoTab eventOptions={eventOptions} />
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
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: COLORS.textMuted }}>
              Filtrer par acheteur
              <select
                value={purchaserFilter}
                onChange={(event) => setPurchaserFilter(event.target.value)}
                style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${COLORS.line}`, color: COLORS.text, borderRadius: 8, padding: '6px 10px', fontSize: 12, outline: 'none' }}
              >
                <option value="all" style={optionStyle}>Tous les acheteurs</option>
                {purchaserOptions.map((name) => (
                  <option key={name} value={name} style={optionStyle}>{name}</option>
                ))}
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
                <select value={form.purchasedBy} onChange={(event) => setForm((prev) => ({ ...prev, purchasedBy: event.target.value }))} style={inputStyle}>
                  {purchaserOptions.map((name) => (
                    <option key={name} value={name} style={optionStyle}>{name}</option>
                  ))}
                </select>
              </div>

              <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 4 }}>Détails billet (optionnel)</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 10 }}>
                <input value={form.category} onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))} placeholder="Catégorie" style={inputStyle} />
                <input value={form.bloc} onChange={(event) => setForm((prev) => ({ ...prev, bloc: event.target.value }))} placeholder="Bloc" style={inputStyle} />
                <input value={form.rang} onChange={(event) => setForm((prev) => ({ ...prev, rang: event.target.value }))} placeholder="Rang" style={inputStyle} />
                <input value={form.seats} onChange={(event) => setForm((prev) => ({ ...prev, seats: event.target.value }))} placeholder="Sièges" style={inputStyle} />
                <input value={form.listingNumber} onChange={(event) => setForm((prev) => ({ ...prev, listingNumber: event.target.value }))} placeholder="N° Listing" style={inputStyle} />
              </div>

              <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 4 }}>Prix en monnaie locale (optionnel — tu payes en $US mais le billet était affiché ailleurs)</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 10 }}>
                <input value={form.localCurrency} onChange={(event) => setForm((prev) => ({ ...prev, localCurrency: event.target.value.toUpperCase() }))} placeholder="Devise (EUR, GBP…)" maxLength={3} style={inputStyle} />
                <input type="number" min="0" value={form.localBuyAmount} onChange={(event) => setForm((prev) => ({ ...prev, localBuyAmount: event.target.value }))} placeholder="Prix d'achat local" style={inputStyle} />
              </div>

              <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 4 }}>Compte plateforme (optionnel)</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
                <input type="email" value={form.accountEmail} onChange={(event) => setForm((prev) => ({ ...prev, accountEmail: event.target.value }))} placeholder="Email du compte" style={inputStyle} />
                <input type="password" value={form.accountPassword} onChange={(event) => setForm((prev) => ({ ...prev, accountPassword: event.target.value }))} placeholder="Mot de passe" style={inputStyle} />
              </div>

              <button type="submit" style={{ padding: '10px 14px', borderRadius: 8, background: COLORS.amber, color: '#ffffff', fontWeight: 700, border: 'none', cursor: 'pointer' }}>Ajouter le lot</button>
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

        {ticketPnlOverTime.length > 1 ? (
          <div style={{ marginBottom: 28 }}>
            <Panel title="PNL dans le temps" subtitle="Cumul du bénéfice net des billets vendus/livrés, par date d'événement">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={ticketPnlOverTime}>
                  <CartesianGrid stroke={COLORS.line} vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: COLORS.textMuted, fontSize: 10 }} axisLine={{ stroke: COLORS.line }} tickLine={false} />
                  <YAxis tick={{ fill: COLORS.textMuted, fontSize: 10 }} axisLine={{ stroke: COLORS.line }} tickLine={false} />
                  <Tooltip contentStyle={{ background: COLORS.bg, border: `1px solid ${COLORS.line}`, fontSize: 12 }} />
                  <Line type="monotone" dataKey="pnl" name="Bénéfice cumulé ($)" stroke={COLORS.green} strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </Panel>
          </div>
        ) : null}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, letterSpacing: '0.1em', color: COLORS.textMuted, textTransform: 'uppercase' }}>Détail des opérations</div>
          <button onClick={exportCsv} style={{ ...actionButtonStyle, padding: '6px 12px' }}>Exporter CSV</button>
        </div>
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
                        <div style={{ display: 'grid', gap: 4 }}>
                          <input type="number" min="0" value={editForm.buyUsd} onChange={(event) => setEditForm((prev) => ({ ...prev, buyUsd: event.target.value }))} style={{ ...editInputStyle, width: 80 }} />
                          <div style={{ display: 'flex', gap: 4 }}>
                            <input value={editForm.localCurrency} onChange={(event) => setEditForm((prev) => ({ ...prev, localCurrency: event.target.value.toUpperCase() }))} placeholder="Dev." maxLength={3} style={{ ...editInputStyle, width: 40 }} />
                            <input type="number" min="0" value={editForm.localBuyAmount} onChange={(event) => setEditForm((prev) => ({ ...prev, localBuyAmount: event.target.value }))} placeholder="Montant" style={{ ...editInputStyle, width: 70 }} />
                          </div>
                        </div>
                      </td>
                      <td style={cellStyle}>
                        <input type="number" min="0" value={editForm.sellUsd} onChange={(event) => setEditForm((prev) => ({ ...prev, sellUsd: event.target.value }))} style={{ ...editInputStyle, width: 80 }} />
                      </td>
                      <td style={{ ...cellStyle, fontFamily: 'IBM Plex Mono, monospace', color: COLORS.textMuted }}>{fmtUSD(costTotal)}</td>
                      <td style={{ ...cellStyle, fontFamily: 'IBM Plex Mono, monospace', color: COLORS.textMuted }}>{revenue ? fmtUSD(revenue) : '—'}</td>
                      <td style={{ ...cellStyle, color: COLORS.textMuted }}>—</td>
                      <td style={cellStyle}>
                        <select value={editForm.purchasedBy} onChange={(event) => setEditForm((prev) => ({ ...prev, purchasedBy: event.target.value }))} style={{ ...editInputStyle, width: 90 }}>
                          {purchaserOptions.map((name) => (
                            <option key={name} value={name} style={optionStyle}>{name}</option>
                          ))}
                        </select>
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
                          <button onClick={() => saveEdit(ticket.id)} style={{ ...actionButtonStyle, background: COLORS.amber, color: '#ffffff', border: 'none', fontWeight: 700 }}>Enregistrer</button>
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
                    <td style={{ ...cellStyle, fontFamily: 'IBM Plex Mono, monospace' }}>
                      {fmtUSD(ticket.buyUsd)}
                      {ticket.localBuyAmount && ticket.localCurrency ? (
                        <div style={{ color: COLORS.textMuted, fontSize: 11, marginTop: 2 }}>{fmtLocal(ticket.localBuyAmount, ticket.localCurrency)}</div>
                      ) : null}
                    </td>
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

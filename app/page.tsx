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
});

const STOCK_STATUSES: TicketStatus[] = ['achete', 'listed'];
const SOLD_STATUSES: TicketStatus[] = ['vendu', 'livre'];

const COLORS = {
  bg: '#12151c',
  panel: '#191d26',
  line: 'rgba(240,238,230,0.08)',
  text: '#f0eee6',
  textMuted: '#8d94a3',
  amber: '#e8963c',
  green: '#3fae6a',
  red: '#d95f4a',
  blue: '#4f9fd1',
  yellow: '#e0c04a',
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
  });
  const [eventFilter, setEventFilter] = useState('all');

  useEffect(() => {
    let isMounted = true;

    const loadTickets = async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select('id, event, event_date, qty, buy_usd, sell_usd, status, purchased_by')
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

    loadTickets();

    const channel = supabase
      .channel('tickets-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => {
        loadTickets();
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const eventOptions = useMemo(
    () => Array.from(new Set(tickets.map((ticket) => ticket.event))).sort((a, b) => a.localeCompare(b)),
    [tickets]
  );

  const filteredTickets = useMemo(
    () => (eventFilter === 'all' ? tickets : tickets.filter((ticket) => ticket.event === eventFilter)),
    [tickets, eventFilter]
  );

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
    });
    if (error) {
      setErrorMessage(error.message);
      return;
    }
    setForm({ event: '', eventDate: '', qty: '', buyUsd: '', sellUsd: '', purchasedBy: '' });
  };

  const updateTicketStatus = async (id: number, status: TicketStatus) => {
    const { error } = await supabase.from('tickets').update({ status }).eq('id', id);
    if (error) setErrorMessage(error.message);
  };

  const removeTicket = async (id: number) => {
    const { error } = await supabase.from('tickets').delete().eq('id', id);
    if (error) setErrorMessage(error.message);
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
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, padding: '4px 10px', borderRadius: 20, background: 'rgba(232,150,60,0.15)', color: COLORS.amber }}>● Suivi en cours</span>
          </div>
        </div>

        {errorMessage ? (
          <div style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 8, background: 'rgba(217,95,74,0.12)', border: `1px solid ${COLORS.red}55`, color: COLORS.red, fontSize: 13 }}>
            Erreur de connexion à la base : {errorMessage}
          </div>
        ) : null}

        {loading ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: COLORS.textMuted, fontSize: 13 }}>
            Chargement des billets…
          </div>
        ) : (
        <>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, letterSpacing: '0.1em', color: COLORS.textMuted, textTransform: 'uppercase' }}>Synthèse opération</div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: COLORS.textMuted }}>
            Filtrer par événement
            <select
              value={eventFilter}
              onChange={(event) => setEventFilter(event.target.value)}
              style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${COLORS.line}`, color: COLORS.text, borderRadius: 8, padding: '6px 10px', fontSize: 12, outline: 'none' }}
            >
              <option value="all">Tous les événements</option>
              {eventOptions.map((eventName) => (
                <option key={eventName} value={eventName}>{eventName}</option>
              ))}
            </select>
          </label>
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
                <input value={form.event} onChange={(event) => setForm((prev) => ({ ...prev, event: event.target.value }))} placeholder="Événement" style={inputStyle} />
                <input type="date" value={form.eventDate} onChange={(event) => setForm((prev) => ({ ...prev, eventDate: event.target.value }))} style={inputStyle} />
                <input type="number" min="1" value={form.qty} onChange={(event) => setForm((prev) => ({ ...prev, qty: event.target.value }))} placeholder="Qté" style={inputStyle} />
                <input type="number" min="0" value={form.buyUsd} onChange={(event) => setForm((prev) => ({ ...prev, buyUsd: event.target.value }))} placeholder="Achat / u." style={inputStyle} />
                <input type="number" min="0" value={form.sellUsd} onChange={(event) => setForm((prev) => ({ ...prev, sellUsd: event.target.value }))} placeholder="Revente / u." style={inputStyle} />
                <input value={form.purchasedBy} onChange={(event) => setForm((prev) => ({ ...prev, purchasedBy: event.target.value }))} placeholder="Acheteur" style={inputStyle} />
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
        <div style={{ background: COLORS.panel, borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['Événement', 'Date', 'Qté', 'Achat/u.', 'Revente/u.', 'Coût total', 'Recette', 'Bénéfice net', 'Statut', 'Actions'].map((header) => (
                  <th key={header} style={{ textAlign: 'left', padding: '10px 14px', fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, letterSpacing: '0.05em', textTransform: 'uppercase', color: COLORS.textMuted, borderBottom: `1px solid ${COLORS.line}` }}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((ticket) => {
                const costTotal = ticket.qty * ticket.buyUsd;
                const revenue = ticket.qty * (ticket.sellUsd || 0);
                const profit = SOLD_STATUSES.includes(ticket.status) ? revenue - costTotal : null;
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
                    <td style={cellStyle}><StatusBadge status={ticket.status} /></td>
                    <td style={cellStyle}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button onClick={() => updateTicketStatus(ticket.id, 'achete')} style={actionButtonStyle}>Acheté</button>
                        <button onClick={() => updateTicketStatus(ticket.id, 'listed')} style={actionButtonStyle}>Listé</button>
                        <button onClick={() => updateTicketStatus(ticket.id, 'vendu')} style={actionButtonStyle}>Vendu</button>
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

const actionButtonStyle: React.CSSProperties = {
  padding: '4px 8px',
  borderRadius: 999,
  fontSize: 10,
  border: `1px solid ${COLORS.line}`,
  background: 'rgba(255,255,255,0.04)',
  color: COLORS.text,
  cursor: 'pointer',
};

import React, { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

/**
 * TicketDashboard — composant de référence pour Claude Code
 * -----------------------------------------------------------
 * Reprend le modèle de données défini dans brief-dashboard-billetterie.md
 * (table `tickets`). Remplacer SAMPLE_TICKETS par les données réelles
 * venant de Supabase une fois branché.
 *
 * Palette : fond encre (#12151c), accent principal ambre/orange (#e8963c),
 * vert succès (#3fae6a), rouge coût/perte (#d95f4a), bleu neutre (#4f9fd1).
 * Police : display condensée (Oswald) pour les titres, Inter pour le corps,
 * IBM Plex Mono pour tous les chiffres.
 */

const SAMPLE_TICKETS = [
  { id: 1, event: "RG Win", eventDate: "2026-05-24", qty: 6, buyUsd: 50, sellUsd: 60, status: "vendu", purchasedBy: "commun" },
  { id: 2, event: "1er Tour – Lenglen", eventDate: "2026-05-25", qty: 3, buyUsd: 159, sellUsd: 266.51, status: "vendu", purchasedBy: "A" },
  { id: 3, event: "1er Tour – Chatrier", eventDate: "2026-05-25", qty: 2, buyUsd: 140, sellUsd: 210, status: "vendu", purchasedBy: "B" },
  { id: 4, event: "Annexes", eventDate: "2026-05-26", qty: 4, buyUsd: 40, sellUsd: 0, status: "achete", purchasedBy: "commun" },
  { id: 5, event: "3T Chatrier (x2)", eventDate: "2026-05-30", qty: 2, buyUsd: 300, sellUsd: 0, status: "listed", purchasedBy: "A" },
  { id: 6, event: "DF2 Homme", eventDate: "2026-06-07", qty: 2, buyUsd: 950, sellUsd: 0, status: "achete", purchasedBy: "commun" },
  { id: 7, event: "Finale H", eventDate: "2026-06-08", qty: 2, buyUsd: 620, sellUsd: 1180, status: "vendu", purchasedBy: "B" },
];

const STOCK_STATUSES = ["achete", "listed"];
const SOLD_STATUSES = ["vendu", "livre"];

const COLORS = {
  bg: "#12151c",
  panel: "#191d26",
  line: "rgba(240,238,230,0.08)",
  text: "#f0eee6",
  textMuted: "#8d94a3",
  amber: "#e8963c",
  green: "#3fae6a",
  red: "#d95f4a",
  blue: "#4f9fd1",
  yellow: "#e0c04a",
};

const fmtUSD = (n) =>
  (n || 0).toLocaleString("fr-FR", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function StatCard({ label, value, sub, accent, icon }) {
  return (
    <div
      style={{
        background: COLORS.panel,
        borderRadius: 10,
        padding: "18px 18px 16px",
        borderTop: `3px solid ${accent}`,
        boxShadow: "0 1px 0 rgba(255,255,255,0.02) inset",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 15 }}>{icon}</span>
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11,
            letterSpacing: "0.04em",
            color: COLORS.textMuted,
          }}
        >
          {label}
        </span>
      </div>
      <div
        style={{
          fontFamily: "'Oswald', sans-serif",
          fontWeight: 700,
          fontSize: 26,
          color: COLORS.text,
          lineHeight: 1.05,
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 6, fontFamily: "'IBM Plex Mono', monospace" }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function Panel({ title, subtitle, children }) {
  return (
    <div style={{ background: COLORS.panel, borderRadius: 10, padding: 18, flex: 1, minWidth: 280 }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 14, color: COLORS.text, textTransform: "uppercase", letterSpacing: "0.03em" }}>
          {title}
        </div>
        {subtitle && <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

export default function TicketDashboard({ tickets = SAMPLE_TICKETS }) {
  const byEvent = useMemo(() => {
    const map = {};
    tickets.forEach((t) => {
      if (!map[t.event]) map[t.event] = { event: t.event, achat: 0, revente: 0, qty: 0, profit: 0 };
      map[t.event].achat += t.buyUsd;
      map[t.event].revente += t.sellUsd || 0;
      map[t.event].qty += t.qty;
      if (SOLD_STATUSES.includes(t.status)) {
        map[t.event].profit += t.qty * ((t.sellUsd || 0) - t.buyUsd);
      }
    });
    return Object.values(map);
  }, [tickets]);

  const stats = useMemo(() => {
    const bought = tickets.reduce((s, t) => s + t.qty, 0);
    const soldQty = tickets.filter((t) => SOLD_STATUSES.includes(t.status)).reduce((s, t) => s + t.qty, 0);
    const stockQty = tickets.filter((t) => STOCK_STATUSES.includes(t.status)).reduce((s, t) => s + t.qty, 0);
    const revenue = tickets.filter((t) => SOLD_STATUSES.includes(t.status)).reduce((s, t) => s + t.qty * (t.sellUsd || 0), 0);
    const cost = tickets.filter((t) => SOLD_STATUSES.includes(t.status)).reduce((s, t) => s + t.qty * t.buyUsd, 0);
    const profit = revenue - cost;
    const roi = cost > 0 ? (profit / cost) * 100 : 0;
    return { bought, soldQty, stockQty, revenue, profit, roi };
  }, [tickets]);

  const statusData = useMemo(() => {
    const sold = tickets.filter((t) => SOLD_STATUSES.includes(t.status)).reduce((s, t) => s + t.qty, 0);
    const stock = tickets.filter((t) => STOCK_STATUSES.includes(t.status)).reduce((s, t) => s + t.qty, 0);
    return [
      { name: "Vendues", value: sold, color: COLORS.green },
      { name: "En stock", value: stock, color: COLORS.yellow },
    ].filter((d) => d.value > 0);
  }, [tickets]);

  return (
    <div
      style={{
        background: COLORS.bg,
        color: COLORS.text,
        fontFamily: "'Inter', sans-serif",
        padding: 28,
        borderRadius: 12,
        minHeight: "100%",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div
            style={{
              width: 40, height: 40, borderRadius: 10, background: COLORS.amber,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Oswald', sans-serif", fontWeight: 700, color: "#1a1206", fontSize: 18,
            }}
          >
            G
          </div>
          <div>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 700, fontSize: 20, letterSpacing: "0.01em" }}>
              Guichet
            </div>
            <div style={{ fontSize: 12, color: COLORS.textMuted }}>Tableau de bord opérationnel</div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, padding: "4px 10px",
              borderRadius: 20, background: "rgba(232,150,60,0.15)", color: COLORS.amber,
            }}
          >
            ● Suivi en cours
          </span>
        </div>
      </div>

      {/* Stats */}
      <div style={{ marginBottom: 10, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: "0.1em", color: COLORS.textMuted, textTransform: "uppercase" }}>
        Synthèse opération
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, marginBottom: 28 }}>
        <StatCard icon="🎟️" label="Billets achetés" value={stats.bought} accent={COLORS.amber} />
        <StatCard icon="✅" label="Billets vendus" value={stats.soldQty} accent={COLORS.green} />
        <StatCard icon="📦" label="En stock" value={stats.stockQty} accent={COLORS.yellow} />
        <StatCard icon="💰" label="Recettes réalisées" value={fmtUSD(stats.revenue)} accent={COLORS.blue} />
        <StatCard icon="📈" label="Bénéfice net" value={fmtUSD(stats.profit)} accent={stats.profit >= 0 ? COLORS.green : COLORS.red} />
        <StatCard icon="⚡" label="ROI" value={`${stats.roi.toFixed(0)}%`} accent={COLORS.amber} sub="Bénéfice / coût d'achat" />
      </div>

      {/* Charts */}
      <div style={{ marginBottom: 10, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: "0.1em", color: COLORS.textMuted, textTransform: "uppercase" }}>
        Analyse par événement
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
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
                {statusData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke={COLORS.panel} strokeWidth={2} />
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
                {byEvent.map((entry, i) => (
                  <Cell key={i} fill={entry.profit >= 0 ? COLORS.green : COLORS.red} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      {/* Detail table */}
      <div style={{ marginBottom: 10, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: "0.1em", color: COLORS.textMuted, textTransform: "uppercase" }}>
        Détail des opérations
      </div>
      <div style={{ background: COLORS.panel, borderRadius: 10, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>
              {["Événement", "Date", "Qté", "Achat/u.", "Revente/u.", "Coût total", "Recette", "Bénéfice net", "Statut"].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: "left", padding: "10px 14px", fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 10, letterSpacing: "0.05em", textTransform: "uppercase", color: COLORS.textMuted,
                    borderBottom: `1px solid ${COLORS.line}`,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => {
              const costTotal = t.qty * t.buyUsd;
              const revenue = t.qty * (t.sellUsd || 0);
              const profit = SOLD_STATUSES.includes(t.status) ? revenue - costTotal : null;
              return (
                <tr key={t.id}>
                  <td style={cellStyle}>{t.event}</td>
                  <td style={cellStyle}>{new Date(t.eventDate).toLocaleDateString("fr-FR")}</td>
                  <td style={{ ...cellStyle, fontFamily: "'IBM Plex Mono', monospace" }}>{t.qty}</td>
                  <td style={{ ...cellStyle, fontFamily: "'IBM Plex Mono', monospace" }}>{fmtUSD(t.buyUsd)}</td>
                  <td style={{ ...cellStyle, fontFamily: "'IBM Plex Mono', monospace" }}>{t.sellUsd ? fmtUSD(t.sellUsd) : "—"}</td>
                  <td style={{ ...cellStyle, fontFamily: "'IBM Plex Mono', monospace" }}>{fmtUSD(costTotal)}</td>
                  <td style={{ ...cellStyle, fontFamily: "'IBM Plex Mono', monospace" }}>{revenue ? fmtUSD(revenue) : "—"}</td>
                  <td style={{ ...cellStyle, fontFamily: "'IBM Plex Mono', monospace", color: profit == null ? COLORS.textMuted : profit >= 0 ? COLORS.green : COLORS.red }}>
                    {profit == null ? "—" : (profit >= 0 ? "+" : "") + fmtUSD(profit)}
                  </td>
                  <td style={cellStyle}>
                    <StatusBadge status={t.status} />
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

const cellStyle = { padding: "10px 14px", borderBottom: `1px solid ${COLORS.line}` };

function StatusBadge({ status }) {
  const map = {
    achete: { label: "Acheté", color: COLORS.textMuted },
    listed: { label: "Listé", color: COLORS.amber },
    vendu: { label: "Vendu", color: COLORS.green },
    livre: { label: "Livré", color: COLORS.blue },
    passe: { label: "Passé", color: COLORS.red },
  };
  const s = map[status] || map.achete;
  return (
    <span
      style={{
        fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, textTransform: "uppercase",
        padding: "3px 9px", borderRadius: 20, border: `1px solid ${s.color}55`, color: s.color,
      }}
    >
      {s.label}
    </span>
  );
}

import React, { useMemo, useState } from "react";
import PageLayout from "../components/PageLayout";
import { BarsChart } from "../components/Charts";
import TransactionRow from "../components/TransactionRow";
import { ArrowDownLeftIcon, ArrowUpRightIcon, WalletIcon } from "../components/Icons";
import { useTransactions } from "../hooks/useTransactions";
import { formatCurrency, formatShortDate, parseDate, toISODate } from "../utils/format";

type Preset = "month" | "7d" | "30d" | "year" | "custom";

const rangeFor = (preset: Exclude<Preset, "custom">): [string, string] => {
  const today = new Date();
  const end = toISODate(today);
  switch (preset) {
    case "7d":
      return [toISODate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6)), end];
    case "30d":
      return [toISODate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29)), end];
    case "year":
      return [toISODate(new Date(today.getFullYear(), 0, 1)), end];
    default:
      return [toISODate(new Date(today.getFullYear(), today.getMonth(), 1)), end];
  }
};

const presets: [Exclude<Preset, "custom">, string][] = [
  ["month", "Este mês"],
  ["7d", "7 dias"],
  ["30d", "30 dias"],
  ["year", "Este ano"],
];

const AnalyticsPage: React.FC = () => {
  const { transactions, loading } = useTransactions();
  const [preset, setPreset] = useState<Preset>("month");
  const [[startDate, endDate], setRange] = useState<[string, string]>(rangeFor("month"));

  const choosePreset = (p: Exclude<Preset, "custom">) => {
    setPreset(p);
    setRange(rangeFor(p));
  };

  const data = useMemo(() => {
    const inRange = transactions.filter((t) => {
      const d = t.transactionDate.slice(0, 10);
      return d >= startDate && d <= endDate;
    });
    const income = inRange.filter((t) => t.type === 0).reduce((s, t) => s + t.amount, 0);
    const expense = inRange.filter((t) => t.type === 1).reduce((s, t) => s + t.amount, 0);

    // One bucket per day, or per month when the range is longer than ~2 months.
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1);
    const monthly = days > 62;
    const buckets = new Map<string, { label: string; income: number; expense: number }>();
    if (monthly) {
      for (let d = new Date(start.getFullYear(), start.getMonth(), 1); d <= end; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) {
        const key = toISODate(d).slice(0, 7);
        buckets.set(key, { label: d.toLocaleDateString("pt-BR", { month: "short" }), income: 0, expense: 0 });
      }
    } else {
      for (let i = 0; i < days; i++) {
        const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
        buckets.set(toISODate(d), { label: formatShortDate(d), income: 0, expense: 0 });
      }
    }
    inRange.forEach((t) => {
      const key = monthly ? t.transactionDate.slice(0, 7) : t.transactionDate.slice(0, 10);
      const bucket = buckets.get(key);
      if (!bucket) return;
      if (t.type === 0) bucket.income += t.amount;
      else bucket.expense += t.amount;
    });

    const expenseDays = new Set(inRange.filter((t) => t.type === 1).map((t) => t.transactionDate.slice(0, 10))).size;
    return {
      inRange,
      income,
      expense,
      balance: income - expense,
      bars: Array.from(buckets.values()),
      dailyAverage: expense / days,
      expenseDays,
      days,
    };
  }, [transactions, startDate, endDate]);

  return (
    <PageLayout title="Análise do período" subtitle="Compare entradas e saídas e veja para onde o dinheiro foi.">
      <div className="stack">
        <div className="card" style={{ padding: 16 }}>
          <div className="row" style={{ flexWrap: "wrap", gap: 16 }}>
            <div className="chips">
              {presets.map(([key, label]) => (
                <button key={key} className={`chip ${preset === key ? "active" : ""}`} onClick={() => choosePreset(key)}>
                  {label}
                </button>
              ))}
            </div>
            <span className="spacer" />
            <div className="row" style={{ gap: 8 }}>
              <input
                type="date"
                className="input"
                aria-label="Data inicial"
                value={startDate}
                max={endDate}
                onChange={(e) => {
                  setPreset("custom");
                  setRange([e.target.value, endDate]);
                }}
                style={{ width: 170, padding: "9px 12px" }}
              />
              <span className="text-muted">até</span>
              <input
                type="date"
                className="input"
                aria-label="Data final"
                value={endDate}
                min={startDate}
                onChange={(e) => {
                  setPreset("custom");
                  setRange([startDate, e.target.value]);
                }}
                style={{ width: 170, padding: "9px 12px" }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-3">
          <div className="card">
            <div className="stat-label">
              <span className="icon-badge income">
                <ArrowDownLeftIcon />
              </span>
              Receitas
            </div>
            <div className="stat-value text-income">{formatCurrency(data.income)}</div>
            <div className="stat-hint">{data.inRange.filter((t) => t.type === 0).length} lançamentos</div>
          </div>
          <div className="card">
            <div className="stat-label">
              <span className="icon-badge expense">
                <ArrowUpRightIcon />
              </span>
              Despesas
            </div>
            <div className="stat-value text-expense">{formatCurrency(data.expense)}</div>
            <div className="stat-hint">Média de {formatCurrency(data.dailyAverage)} por dia</div>
          </div>
          <div className="card">
            <div className="stat-label">
              <span className="icon-badge accent">
                <WalletIcon size={18} />
              </span>
              Saldo do período
            </div>
            <div className={`stat-value ${data.balance < 0 ? "text-expense" : ""}`}>{formatCurrency(data.balance)}</div>
            <div className="stat-hint">
              {data.income > 0 ? `${Math.round((data.expense / data.income) * 100)}% da renda foi gasta` : "Sem receitas no período"}
            </div>
          </div>
        </div>

        <section className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Entradas e saídas</h2>
              <p className="card-subtitle">{data.days > 62 ? "Por mês" : "Por dia"}</p>
            </div>
            <div className="legend">
              <span style={{ color: "var(--income)" }}>
                <em style={{ color: "var(--muted)", fontStyle: "normal" }}>Receitas</em>
              </span>
              <span style={{ color: "var(--expense)" }}>
                <em style={{ color: "var(--muted)", fontStyle: "normal" }}>Despesas</em>
              </span>
            </div>
          </div>
          {loading ? <div className="skeleton" style={{ height: 220 }} /> : <BarsChart data={data.bars} />}
        </section>

        <section className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Transações do período</h2>
              <p className="card-subtitle">{data.inRange.length} no total</p>
            </div>
          </div>
          {data.inRange.length === 0 ? (
            <div className="empty">Nenhuma transação entre essas datas.</div>
          ) : (
            <div className="tx-list">
              {data.inRange.map((t) => (
                <TransactionRow key={t.id} transaction={t} />
              ))}
            </div>
          )}
        </section>
      </div>
    </PageLayout>
  );
};

export default AnalyticsPage;

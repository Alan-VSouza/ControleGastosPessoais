import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTransactions } from "../hooks/useTransactions";
import { formatCurrency, formatShortDate, parseDate, toISODate } from "../utils/format";
import { AreaChart } from "../components/Charts";
import TransactionRow from "../components/TransactionRow";
import { ArrowDownLeftIcon, ArrowUpRightIcon, PlusIcon, WalletIcon } from "../components/Icons";

const monthName = new Intl.DateTimeFormat("pt-BR", { month: "long" });

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { transactions, loading, error } = useTransactions();

  const data = useMemo(() => {
    const signed = (t: { type: number; amount: number }) => (t.type === 0 ? t.amount : -t.amount);
    const balance = transactions.reduce((sum, t) => sum + signed(t), 0);

    const now = new Date();
    const monthPrefix = toISODate(now).slice(0, 7);
    const month = transactions.filter((t) => t.transactionDate.startsWith(monthPrefix));
    const monthIncome = month.filter((t) => t.type === 0).reduce((s, t) => s + t.amount, 0);
    const monthExpense = month.filter((t) => t.type === 1).reduce((s, t) => s + t.amount, 0);
    const savingsRate = monthIncome > 0 ? (monthIncome - monthExpense) / monthIncome : 0;

    // Running balance for each of the last 30 days.
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
    let running = transactions
      .filter((t) => parseDate(t.transactionDate) < start)
      .reduce((s, t) => s + signed(t), 0);
    const byDay = new Map<string, number>();
    transactions.forEach((t) => {
      const key = t.transactionDate.slice(0, 10);
      byDay.set(key, (byDay.get(key) ?? 0) + signed(t));
    });
    const series = Array.from({ length: 30 }, (_, i) => {
      const day = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      running += byDay.get(toISODate(day)) ?? 0;
      return { label: formatShortDate(day), value: Math.round(running * 100) / 100 };
    });

    // Biggest expenses of the month, grouped by description.
    const groups = new Map<string, number>();
    month
      .filter((t) => t.type === 1)
      .forEach((t) => groups.set(t.description, (groups.get(t.description) ?? 0) + t.amount));
    const topExpenses = Array.from(groups.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return { balance, monthIncome, monthExpense, savingsRate, series, topExpenses, recent: transactions.slice(0, 6) };
  }, [transactions]);

  const firstName = user?.fullName?.split(" ")[0] ?? "";
  const currentMonth = monthName.format(new Date());

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Olá, {firstName}</h1>
          <p className="page-subtitle">Este é o resumo das suas finanças em {currentMonth}.</p>
        </div>
        <Link to="/transactions" className="btn btn-primary">
          <PlusIcon /> Nova transação
        </Link>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

      {loading ? (
        <div className="stack">
          <div className="skeleton" style={{ height: 150 }} />
          <div className="grid grid-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="skeleton" style={{ height: 120 }} />
            ))}
          </div>
        </div>
      ) : (
        <div className="stack">
          <section className="hero-card">
            <div className="row" style={{ position: "relative", zIndex: 1, flexWrap: "wrap", alignItems: "flex-end" }}>
              <div>
                <div className="stat-label" style={{ color: "rgba(255,255,255,0.75)" }}>
                  <span className="icon-badge accent" style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}>
                    <WalletIcon size={18} />
                  </span>
                  Saldo atual
                </div>
                <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: "-0.04em", marginTop: 14 }}>
                  {formatCurrency(data.balance)}
                </div>
                <div style={{ color: "rgba(255,255,255,0.6)", marginTop: 4, fontSize: 14 }}>
                  Todas as receitas menos todas as despesas
                </div>
              </div>
              <div className="spacer" />
              <div className="hero-side">
                <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 600 }}>Economia do mês</div>
                <div style={{ fontSize: 26, fontWeight: 800, marginTop: 4 }}>
                  {Math.round(data.savingsRate * 100)}%
                </div>
                <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>da renda guardada</div>
              </div>
            </div>
          </section>

          <div className="grid grid-3">
            <div className="card">
              <div className="stat-label">
                <span className="icon-badge income">
                  <ArrowDownLeftIcon />
                </span>
                Receitas do mês
              </div>
              <div className="stat-value text-income">{formatCurrency(data.monthIncome)}</div>
              <div className="stat-hint">Entradas desde o dia 1º</div>
            </div>
            <div className="card">
              <div className="stat-label">
                <span className="icon-badge expense">
                  <ArrowUpRightIcon />
                </span>
                Despesas do mês
              </div>
              <div className="stat-value text-expense">{formatCurrency(data.monthExpense)}</div>
              <div className="stat-hint">Saídas desde o dia 1º</div>
            </div>
            <div className="card">
              <div className="stat-label">
                <span className="icon-badge accent">
                  <WalletIcon size={18} />
                </span>
                Resultado do mês
              </div>
              <div className={`stat-value ${data.monthIncome - data.monthExpense < 0 ? "text-expense" : ""}`}>
                {formatCurrency(data.monthIncome - data.monthExpense)}
              </div>
              <div className="stat-hint">Receitas menos despesas</div>
            </div>
          </div>

          <div className="grid grid-main">
            <section className="card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">Evolução do saldo</h2>
                  <p className="card-subtitle">Últimos 30 dias</p>
                </div>
              </div>
              <AreaChart points={data.series} />
            </section>

            <section className="card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">Maiores despesas</h2>
                  <p className="card-subtitle">Em {currentMonth}</p>
                </div>
              </div>
              {data.topExpenses.length === 0 ? (
                <div className="empty">Nenhuma despesa neste mês.</div>
              ) : (
                <div className="stack" style={{ gap: 14 }}>
                  {data.topExpenses.map((item) => (
                    <div key={item.name}>
                      <div className="row" style={{ justifyContent: "space-between", fontSize: 14, marginBottom: 6 }}>
                        <span style={{ fontWeight: 600 }}>{item.name}</span>
                        <span style={{ fontWeight: 700 }}>{formatCurrency(item.value)}</span>
                      </div>
                      <div style={{ height: 8, borderRadius: 4, background: "var(--surface-3)", overflow: "hidden" }}>
                        <div
                          style={{
                            width: `${Math.max(4, (item.value / data.monthExpense) * 100)}%`,
                            height: "100%",
                            borderRadius: 4,
                            background: "linear-gradient(90deg, #fb7185, #f472b6)",
                          }}
                        />
                      </div>
                      <div className="stat-hint" style={{ fontSize: 12 }}>
                        {Math.round((item.value / data.monthExpense) * 100)}% das despesas
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <section className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">Últimas transações</h2>
                <p className="card-subtitle">As movimentações mais recentes</p>
              </div>
              <Link to="/history" className="btn btn-ghost">
                Ver histórico
              </Link>
            </div>
            {data.recent.length === 0 ? (
              <div className="empty">Você ainda não tem transações. Comece cadastrando sua primeira receita.</div>
            ) : (
              <div className="tx-list">
                {data.recent.map((t) => (
                  <TransactionRow key={t.id} transaction={t} />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
};

export default Dashboard;

import React, { FormEvent, useMemo, useState } from "react";
import axios from "axios";
import { formatCurrency, toISODate } from "../utils/format";
import { API_BASE_URL, authHeaders, useTransactions } from "../hooks/useTransactions";
import TransactionRow from "./TransactionRow";
import { ArrowDownLeftIcon, ArrowUpRightIcon, PlusIcon, WalletIcon } from "./Icons";

interface TransactionFormProps {
  onTransactionAdded: () => void;
}

type Kind = "Income" | "Expense";

const suggestions: Record<Kind, string[]> = {
  Income: ["Salário", "Freelance", "Reembolso", "Rendimentos"],
  Expense: ["Mercado", "Aluguel", "Transporte", "Lazer", "Farmácia"],
};

const TransactionForm: React.FC<TransactionFormProps> = ({ onTransactionAdded }) => {
  const { transactions, reload } = useTransactions();
  const [kind, setKind] = useState<Kind>("Expense");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [transactionDate, setTransactionDate] = useState(toISODate(new Date()));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const balance = useMemo(
    () => transactions.reduce((sum, t) => sum + (t.type === 0 ? t.amount : -t.amount), 0),
    [transactions]
  );
  const parsedAmount = parseFloat(amount.replace(",", "."));
  const preview = Number.isFinite(parsedAmount) ? balance + (kind === "Income" ? parsedAmount : -parsedAmount) : balance;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!description.trim()) {
      setError("Informe uma descrição.");
      return;
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Informe um valor maior que zero.");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${API_BASE_URL}/api/transaction`,
        { Type: kind, Description: description.trim(), Amount: parsedAmount, TransactionDate: transactionDate },
        { headers: authHeaders() }
      );
      setSuccess(`${kind === "Income" ? "Receita" : "Despesa"} de ${formatCurrency(parsedAmount)} registrada.`);
      onTransactionAdded();
      await reload();
      setDescription("");
      setAmount("");
      setTransactionDate(toISODate(new Date()));
      setTimeout(() => setSuccess(""), 3500);
    } catch (err) {
      console.error(err);
      setError("Não foi possível salvar a transação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-main" style={{ alignItems: "start" }}>
      <form className="card stack" style={{ gap: 20, padding: 26 }} onSubmit={handleSubmit}>
        <div className="segmented" role="tablist" aria-label="Tipo de transação">
          <button
            type="button"
            className={`${kind === "Expense" ? "active expense" : ""}`}
            onClick={() => setKind("Expense")}
          >
            <ArrowUpRightIcon /> Despesa
          </button>
          <button
            type="button"
            className={`${kind === "Income" ? "active income" : ""}`}
            onClick={() => setKind("Income")}
          >
            <ArrowDownLeftIcon /> Receita
          </button>
        </div>

        <div className="field">
          <label htmlFor="amount">Valor</label>
          <div style={{ position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: 16,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--faint)",
                fontWeight: 700,
                fontSize: 20,
              }}
            >
              R$
            </span>
            <input
              id="amount"
              className="input"
              inputMode="decimal"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d.,]/g, ""))}
              style={{ fontSize: 28, fontWeight: 800, padding: "14px 16px 14px 58px", letterSpacing: "-0.02em" }}
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="description">Descrição</label>
          <input
            id="description"
            className="input"
            placeholder={kind === "Income" ? "Ex.: Salário" : "Ex.: Mercado"}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={80}
          />
          <div className="chips">
            {suggestions[kind].map((s) => (
              <button type="button" key={s} className={`chip ${description === s ? "active" : ""}`} onClick={() => setDescription(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label htmlFor="date">Data</label>
          <input id="date" type="date" className="input" value={transactionDate} onChange={(e) => setTransactionDate(e.target.value)} />
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
          <PlusIcon /> {loading ? "Salvando..." : `Adicionar ${kind === "Income" ? "receita" : "despesa"}`}
        </button>
      </form>

      <div className="stack">
        <section className="hero-card" style={{ padding: 24 }}>
          <div style={{ position: "relative", zIndex: 1 }}>
            <div className="stat-label" style={{ color: "rgba(255,255,255,0.75)" }}>
              <span className="icon-badge" style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}>
                <WalletIcon size={18} />
              </span>
              Saldo atual
            </div>
            <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.03em", marginTop: 12 }}>{formatCurrency(balance)}</div>
            {Number.isFinite(parsedAmount) && parsedAmount > 0 && (
              <div style={{ marginTop: 8, color: "rgba(255,255,255,0.7)", fontSize: 14 }}>
                Depois deste lançamento: <strong style={{ color: "#fff" }}>{formatCurrency(preview)}</strong>
              </div>
            )}
          </div>
        </section>

        <section className="card">
          <h2 className="card-title" style={{ marginBottom: 8 }}>
            Lançados recentemente
          </h2>
          {transactions.length === 0 ? (
            <div className="empty" style={{ padding: 20 }}>
              Nada por aqui ainda.
            </div>
          ) : (
            <div className="tx-list">
              {transactions.slice(0, 4).map((t) => (
                <TransactionRow key={t.id} transaction={t} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default TransactionForm;

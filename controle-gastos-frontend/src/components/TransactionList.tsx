import React, { FormEvent, useMemo, useState } from "react";
import axios from "axios";
import { API_BASE_URL, authHeaders, Transaction, useTransactions } from "../hooks/useTransactions";
import { formatCurrency, formatDayLabel } from "../utils/format";
import TransactionRow from "./TransactionRow";
import { CloseIcon, PencilIcon, SearchIcon, TrashIcon } from "./Icons";

interface Props {
  onChanged?: () => void;
}

type Filter = "all" | "income" | "expense";

const TransactionList: React.FC<Props> = ({ onChanged }) => {
  const { transactions, loading, error, reload } = useTransactions();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [actionError, setActionError] = useState("");

  const visible = useMemo(
    () =>
      transactions.filter(
        (t) =>
          (filter === "all" || (filter === "income" ? t.type === 0 : t.type === 1)) &&
          t.description.toLowerCase().includes(query.trim().toLowerCase())
      ),
    [transactions, filter, query]
  );

  const groups = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    visible.forEach((t) => {
      const key = t.transactionDate.slice(0, 10);
      map.set(key, [...(map.get(key) ?? []), t]);
    });
    return Array.from(map.entries());
  }, [visible]);

  const totals = useMemo(
    () => ({
      income: visible.filter((t) => t.type === 0).reduce((s, t) => s + t.amount, 0),
      expense: visible.filter((t) => t.type === 1).reduce((s, t) => s + t.amount, 0),
    }),
    [visible]
  );

  const handleDelete = async (t: Transaction) => {
    if (!window.confirm(`Excluir "${t.description}" (${formatCurrency(t.amount)})?`)) return;
    try {
      setActionError("");
      await axios.delete(`${API_BASE_URL}/api/transaction/${t.id}`, { headers: authHeaders() });
      await reload();
      onChanged?.();
    } catch (err) {
      console.error("Erro ao excluir transação:", err);
      setActionError("Não foi possível excluir a transação.");
    }
  };

  return (
    <div className="stack">
      <div className="card" style={{ padding: 16 }}>
        <div className="row" style={{ flexWrap: "wrap" }}>
          <div className="input-with-icon" style={{ flex: "1 1 260px" }}>
            <SearchIcon />
            <input
              className="input"
              placeholder="Buscar por descrição"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="chips">
            {(
              [
                ["all", "Todas"],
                ["income", "Receitas"],
                ["expense", "Despesas"],
              ] as [Filter, string][]
            ).map(([key, label]) => (
              <button key={key} className={`chip ${filter === key ? "active" : ""}`} onClick={() => setFilter(key)}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="row" style={{ marginTop: 14, gap: 20, fontSize: 14, flexWrap: "wrap" }}>
          <span className="text-muted">
            {visible.length} {visible.length === 1 ? "transação" : "transações"}
          </span>
          <span>
            Entradas <strong className="text-income">{formatCurrency(totals.income)}</strong>
          </span>
          <span>
            Saídas <strong className="text-expense">{formatCurrency(totals.expense)}</strong>
          </span>
        </div>
      </div>

      {(error || actionError) && <div className="alert alert-error">{error || actionError}</div>}

      <section className="card">
        {loading ? (
          <div className="empty">Carregando...</div>
        ) : groups.length === 0 ? (
          <div className="empty">
            {transactions.length === 0 ? "Sem transações ainda." : "Nenhuma transação encontrada com esses filtros."}
          </div>
        ) : (
          groups.map(([day, items], index) => {
            const dayTotal = items.reduce((s, t) => s + (t.type === 0 ? t.amount : -t.amount), 0);
            return (
              <div key={day}>
                <div className="row group-label" style={{ marginTop: index === 0 ? 0 : 18 }}>
                  <span>{formatDayLabel(day)}</span>
                  <span className="spacer" />
                  <span style={{ letterSpacing: 0 }}>
                    {dayTotal >= 0 ? "+ " : "− "}
                    {formatCurrency(Math.abs(dayTotal))}
                  </span>
                </div>
                <div className="tx-list">
                  {items.map((t) => (
                    <TransactionRow
                      key={t.id}
                      transaction={t}
                      showDate={false}
                      actions={
                        <span className="row" style={{ gap: 2 }}>
                          <button className="icon-btn" onClick={() => setEditing(t)} aria-label={`Editar ${t.description}`} title="Editar">
                            <PencilIcon />
                          </button>
                          <button
                            className="icon-btn danger"
                            onClick={() => handleDelete(t)}
                            aria-label={`Excluir ${t.description}`}
                            title="Excluir"
                          >
                            <TrashIcon />
                          </button>
                        </span>
                      }
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </section>

      {editing && (
        <EditModal
          transaction={editing}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            await reload();
            onChanged?.();
          }}
        />
      )}
    </div>
  );
};

const EditModal: React.FC<{ transaction: Transaction; onClose: () => void; onSaved: () => void }> = ({
  transaction,
  onClose,
  onSaved,
}) => {
  const [description, setDescription] = useState(transaction.description);
  const [amount, setAmount] = useState(transaction.amount.toFixed(2).replace(".", ","));
  const [date, setDate] = useState(transaction.transactionDate.slice(0, 10));
  const [isIncome, setIsIncome] = useState(transaction.type === 0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const value = parseFloat(amount.replace(",", "."));
    if (!description.trim() || !Number.isFinite(value) || value <= 0) {
      setError("Preencha a descrição e um valor maior que zero.");
      return;
    }
    try {
      setSaving(true);
      await axios.put(
        `${API_BASE_URL}/api/transaction/${transaction.id}`,
        { Type: isIncome ? "Income" : "Expense", Description: description.trim(), Amount: value, TransactionDate: date },
        { headers: authHeaders() }
      );
      onSaved();
    } catch (err) {
      console.error("Erro ao editar:", err);
      setError("Não foi possível salvar as alterações.");
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal stack" onClick={(e) => e.stopPropagation()} onSubmit={submit} role="dialog" aria-label="Editar transação">
        <div className="row">
          <h2 className="card-title" style={{ fontSize: 19 }}>
            Editar transação
          </h2>
          <span className="spacer" />
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Fechar">
            <CloseIcon />
          </button>
        </div>
        <div className="segmented">
          <button type="button" className={!isIncome ? "active expense" : ""} onClick={() => setIsIncome(false)}>
            Despesa
          </button>
          <button type="button" className={isIncome ? "active income" : ""} onClick={() => setIsIncome(true)}>
            Receita
          </button>
        </div>
        <div className="field">
          <label htmlFor="edit-description">Descrição</label>
          <input id="edit-description" className="input" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div className="field">
            <label htmlFor="edit-amount">Valor (R$)</label>
            <input
              id="edit-amount"
              className="input"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d.,]/g, ""))}
            />
          </div>
          <div className="field">
            <label htmlFor="edit-date">Data</label>
            <input id="edit-date" type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="row" style={{ justifyContent: "flex-end" }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionList;

import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5148";

interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: number; // 0 = Income, 1 = Expense
  transactionDate: string;
}

interface Props {
  onChanged?: () => void;
}

const TransactionList: React.FC<Props> = ({ onChanged }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");
      const res = await axios.get(`${API_BASE_URL}/api/transaction`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const all = res.data as Transaction[];
      const ordered = [...all].sort(
        (a, b) =>
          new Date(b.transactionDate).getTime() -
          new Date(a.transactionDate).getTime()
      );
      setTransactions(ordered);
    } catch (err) {
      console.error("Erro ao carregar transações:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleEdit = async (t: Transaction) => {
    const newDesc = prompt("Nova descrição:", t.description);
    if (!newDesc) return;

    const newAmount = prompt("Novo valor:", t.amount.toString());
    if (!newAmount || isNaN(parseFloat(newAmount))) {
      alert("Valor inválido");
      return;
    }

    try {
      const token = localStorage.getItem("auth_token");
      await axios.put(
        `${API_BASE_URL}/api/transaction/${t.id}`,
        {
          Type: t.type === 0 ? "Income" : "Expense",
          Description: newDesc,
          Amount: parseFloat(newAmount),
          TransactionDate: t.transactionDate,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await load();
      onChanged?.();
      alert("Transação editada com sucesso!");
    } catch (err) {
      console.error("Erro ao editar:", err);
      alert("Erro ao editar transação.");
    }
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm("Confirma excluir esta transação?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("auth_token");
      await axios.delete(`${API_BASE_URL}/api/transaction/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await load();
      onChanged?.();
    } catch (err) {
      console.error("Erro ao excluir transação:", err);
      alert("Erro ao excluir transação.");
    }
  };

  return (
    <div style={{ marginTop: 24 }}>
      <h2 style={{ marginBottom: 12 }}>Minhas Transações</h2>
      {loading && <p style={{ color: "#9ca3af" }}>Carregando...</p>}
      {!loading && transactions.length === 0 && (
        <p style={{ color: "#9ca3af" }}>Sem transações ainda.</p>
      )}
      {!loading && transactions.length > 0 && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: 8,
            fontSize: 13,
            background: "#020617",
            borderRadius: 16,
            border: "1px solid rgba(55,65,81,0.9)",
            overflow: "hidden",
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  textAlign: "left",
                  padding: 10,
                  borderBottom: "1px solid rgba(31,41,55,0.9)",
                  color: "#9ca3af",
                  fontWeight: 500,
                }}
              >
                Data
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: 10,
                  borderBottom: "1px solid rgba(31,41,55,0.9)",
                  color: "#9ca3af",
                  fontWeight: 500,
                }}
              >
                Descrição
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: 10,
                  borderBottom: "1px solid rgba(31,41,55,0.9)",
                  color: "#9ca3af",
                  fontWeight: 500,
                }}
              >
                Tipo
              </th>
              <th
                style={{
                  textAlign: "right",
                  padding: 10,
                  borderBottom: "1px solid rgba(31,41,55,0.9)",
                  color: "#9ca3af",
                  fontWeight: 500,
                }}
              >
                Valor (R$)
              </th>
              <th
                style={{
                  textAlign: "center",
                  padding: 10,
                  borderBottom: "1px solid rgba(31,41,55,0.9)",
                  color: "#9ca3af",
                  fontWeight: 500,
                }}
              >
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => {
              const isIncome = t.type === 0;
              const sinal = isIncome ? "+" : "-";
              const cor = isIncome ? "#22c55e" : "#ef4444";

              return (
                <tr key={t.id}>
                  <td style={{ padding: 10, color: "#e5e7eb" }}>
                    {new Date(t.transactionDate).toLocaleDateString()}
                  </td>
                  <td style={{ padding: 10, color: "#e5e7eb" }}>
                    {t.description}
                  </td>
                  <td style={{ padding: 10, color: "#e5e7eb" }}>
                    {isIncome ? "Receita" : "Despesa"}
                  </td>
                  <td
                    style={{
                      padding: 10,
                      textAlign: "right",
                      color: cor,
                      fontWeight: 600,
                    }}
                  >
                    {sinal} R$ {t.amount.toFixed(2)}
                  </td>
                  <td style={{ padding: 10, textAlign: "center" }}>
                    <button
                      style={{
                        padding: "4px 10px",
                        background: "#0ea5e9",
                        color: "#fff",
                        border: "none",
                        borderRadius: 4,
                        cursor: "pointer",
                        fontSize: 11,
                        fontWeight: 500,
                        marginRight: 6,
                      }}
                      onClick={() => handleEdit(t)}
                    >
                      Editar
                    </button>
                    <button
                      style={{
                        padding: "4px 10px",
                        background: "#dc3545",
                        color: "#fff",
                        border: "none",
                        borderRadius: 4,
                        cursor: "pointer",
                        fontSize: 11,
                        fontWeight: 500,
                      }}
                      onClick={() => handleDelete(t.id)}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TransactionList;

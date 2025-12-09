import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5148";

interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: number; // 0 = Income, 1 = Expense
  transactionDate: string;
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [saldo, setSaldo] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string>("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("auth_token");

      const [saldoRes, transRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/transaction/saldo`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE_URL}/api/transaction`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setSaldo(saldoRes.data as number);

      const all = transRes.data as Transaction[];
      const ordered = [...all].sort(
        (a, b) =>
          new Date(b.transactionDate).getTime() -
          new Date(a.transactionDate).getTime()
      );
      setRecentTransactions(ordered.slice(0, 5));
    } catch (err) {
      console.error("Erro ao carregar dados do dashboard:", err);
      setError("Não foi possível carregar os dados do dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const totalIncomes = recentTransactions
    .filter((t) => t.type === 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = recentTransactions
    .filter((t) => t.type === 1)
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div
      style={{
        padding: "28px 20px",
        maxWidth: "1100px",
        margin: "0 auto",
        color: "#e5e7eb",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 26 }}>Dashboard</h1>
          <p style={{ marginTop: 6, color: "#9ca3af", fontSize: 14 }}>
            Bem-vindo, {user?.fullName}! Aqui está um resumo das suas finanças.
          </p>
        </div>

        <button
          onClick={handleLogout}
          style={{
            padding: "8px 18px",
            background: "#dc2626",
            color: "#f9fafb",
            border: "none",
            borderRadius: 999,
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          Logout
        </button>
      </div>

      {error && (
        <div
          style={{
            background: "#451a1a",
            border: "1px solid #fecaca",
            color: "#fecaca",
            padding: "10px 14px",
            borderRadius: 10,
            marginBottom: 16,
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      {/* Cards de resumo */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {/* Saldo */}
        <div
          style={{
            background:
              "radial-gradient(circle at top, #0ea5e9 0%, #020617 55%, #020617 100%)",
            color: "#f9fafb",
            borderRadius: 16,
            padding: 20,
            boxShadow: "0 14px 40px rgba(15,23,42,0.9)",
            border: "1px solid rgba(148,163,184,0.4)",
          }}
        >
          <h3 style={{ margin: 0, marginBottom: 6, fontSize: 14 }}>Saldo Atual</h3>
          <p
            style={{
              fontSize: 28,
              fontWeight: 700,
              margin: 0,
              color: saldo >= 0 ? "#22c55e" : "#ef4444",
            }}
          >
            R$ {saldo.toFixed(2)}
          </p>
          <p
            style={{
              marginTop: 8,
              fontSize: 12,
              color: "#e5e7eb",
              opacity: 0.9,
            }}
          >
            Total de receitas menos despesas.
          </p>
        </div>

        {/* Receitas */}
        <div
          style={{
            background: "#020617",
            borderRadius: 16,
            padding: 18,
            border: "1px solid rgba(55,65,81,0.9)",
            boxShadow: "0 10px 28px rgba(15,23,42,0.9)",
          }}
        >
          <h4
            style={{
              margin: 0,
              marginBottom: 4,
              fontSize: 13,
              color: "#9ca3af",
              textTransform: "uppercase",
              letterSpacing: 0.6,
            }}
          >
            Receitas recentes
          </h4>
          <p
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 600,
              color: "#22c55e",
            }}
          >
            R$ {totalIncomes.toFixed(2)}
          </p>
          <p
            style={{
              marginTop: 6,
              fontSize: 12,
              color: "#6b7280",
            }}
          >
            Soma das últimas entradas cadastradas.
          </p>
        </div>

        {/* Despesas */}
        <div
          style={{
            background: "#020617",
            borderRadius: 16,
            padding: 18,
            border: "1px solid rgba(55,65,81,0.9)",
            boxShadow: "0 10px 28px rgba(15,23,42,0.9)",
          }}
        >
          <h4
            style={{
              margin: 0,
              marginBottom: 4,
              fontSize: 13,
              color: "#9ca3af",
              textTransform: "uppercase",
              letterSpacing: 0.6,
            }}
          >
            Despesas recentes
          </h4>
          <p
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 600,
              color: "#ef4444",
            }}
          >
            R$ {totalExpenses.toFixed(2)}
          </p>
          <p
            style={{
              marginTop: 6,
              fontSize: 12,
              color: "#6b7280",
            }}
          >
            Soma das últimas saídas cadastradas.
          </p>
        </div>
      </div>

      {/* Ações rápidas */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          marginBottom: 22,
        }}
      >
        <button
          onClick={() => navigate("/transactions")}
          style={{
            padding: "9px 18px",
            background: "#0ea5e9",
            color: "#020617",
            border: "none",
            borderRadius: 999,
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          + Nova Transação
        </button>
        <button
          onClick={() => navigate("/history")}
          style={{
            padding: "9px 18px",
            background: "#020617",
            color: "#e5e7eb",
            border: "1px solid rgba(55,65,81,0.9)",
            borderRadius: 999,
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          Ver todas as transações
        </button>
      </div>

      {/* Tabela de últimas transações */}
      <div
        style={{
          background: "#020617",
          borderRadius: 16,
          padding: 20,
          border: "1px solid rgba(55,65,81,0.9)",
          boxShadow: "0 10px 26px rgba(15,23,42,0.85)",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: 10, fontSize: 16 }}>
          Últimas transações
        </h3>
        {loading && <p style={{ fontSize: 14, color: "#9ca3af" }}>Carregando...</p>}
        {!loading && recentTransactions.length === 0 && (
          <p style={{ fontSize: 14, color: "#9ca3af" }}>
            Você ainda não possui transações cadastradas.
          </p>
        )}
        {!loading && recentTransactions.length > 0 && (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 13,
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    textAlign: "left",
                    padding: 8,
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
                    padding: 8,
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
                    padding: 8,
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
                    padding: 8,
                    borderBottom: "1px solid rgba(31,41,55,0.9)",
                    color: "#9ca3af",
                    fontWeight: 500,
                  }}
                >
                  Valor (R$)
                </th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((t) => {
                const isIncome = t.type === 0;
                const sinal = isIncome ? "+" : "-";
                const cor = isIncome ? "#22c55e" : "#ef4444";

                return (
                  <tr key={t.id}>
                    <td style={{ padding: 8, color: "#e5e7eb" }}>
                      {new Date(t.transactionDate).toLocaleDateString()}
                    </td>
                    <td style={{ padding: 8, color: "#e5e7eb" }}>
                      {t.description}
                    </td>
                    <td style={{ padding: 8, color: "#e5e7eb" }}>
                      {isIncome ? "Receita" : "Despesa"}
                    </td>
                    <td
                      style={{
                        padding: 8,
                        textAlign: "right",
                        color: cor,
                        fontWeight: 600,
                      }}
                    >
                      {sinal} R$ {t.amount.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

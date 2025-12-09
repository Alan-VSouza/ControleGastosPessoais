import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5148";

interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: number; 
  transactionDate: string;
}

const AnalyticsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState<string>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0]
  );
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const load = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");
      const res = await axios.get(`${API_BASE_URL}/api/transaction`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions(res.data);
    } catch (err) {
      console.error("Erro ao carregar transações:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredTransactions = transactions.filter((t) => {
    const tDate = new Date(t.transactionDate).toISOString().split("T")[0];
    return tDate >= startDate && tDate <= endDate;
  });

  const totalIncomes = filteredTransactions
    .filter((t) => t.type === 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter((t) => t.type === 1)
    .reduce((sum, t) => sum + t.amount, 0);

  const saldo = totalIncomes - totalExpenses;

  // Calcular altura das barras (máximo 200px)
  const maxAmount = Math.max(totalIncomes, totalExpenses, 1);
  const incomeHeight = (totalIncomes / maxAmount) * 200;
  const expenseHeight = (totalExpenses / maxAmount) * 200;

  return (
    <div
      style={{
        padding: "28px 20px",
        maxWidth: "1100px",
        margin: "0 auto",
        color: "#e5e7eb",
      }}
    >
      <h1 style={{ marginBottom: 8 }}>Análise de Período</h1>
      <p style={{ marginBottom: 20, color: "#9ca3af" }}>
        Visualize receitas, despesas e saldo em um período específico.
      </p>

      {/* Filtro de datas */}
      <div
        style={{
          background: "#020617",
          borderRadius: 16,
          padding: 18,
          border: "1px solid rgba(55,65,81,0.9)",
          marginBottom: 24,
        }}
      >
        <h3 style={{ margin: "0 0 16px 0", fontSize: 14 }}>Selecione o Período</h3>
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: 150 }}>
            <label
              style={{
                display: "block",
                fontSize: 12,
                marginBottom: 4,
                color: "#9ca3af",
                fontWeight: 500,
              }}
            >
              Data Inicial
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 10px",
                background: "#020617",
                border: "1px solid rgba(55,65,81,0.9)",
                borderRadius: 8,
                color: "#e5e7eb",
                fontSize: 13,
              }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 150 }}>
            <label
              style={{
                display: "block",
                fontSize: 12,
                marginBottom: 4,
                color: "#9ca3af",
                fontWeight: 500,
              }}
            >
              Data Final
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 10px",
                background: "#020617",
                border: "1px solid rgba(55,65,81,0.9)",
                borderRadius: 8,
                color: "#e5e7eb",
                fontSize: 13,
              }}
            />
          </div>
        </div>
      </div>

      {/* Cards de resumo */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            background: "#020617",
            borderRadius: 16,
            padding: 16,
            border: "1px solid rgba(55,65,81,0.9)",
          }}
        >
          <p style={{ margin: "0 0 6px 0", fontSize: 12, color: "#9ca3af" }}>
            RECEITAS
          </p>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#22c55e" }}>
            R$ {totalIncomes.toFixed(2)}
          </p>
        </div>

        <div
          style={{
            background: "#020617",
            borderRadius: 16,
            padding: 16,
            border: "1px solid rgba(55,65,81,0.9)",
          }}
        >
          <p style={{ margin: "0 0 6px 0", fontSize: 12, color: "#9ca3af" }}>
            DESPESAS
          </p>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#ef4444" }}>
            R$ {totalExpenses.toFixed(2)}
          </p>
        </div>

        <div
          style={{
            background:
              "radial-gradient(circle at top, #0ea5e9 0%, #020617 55%)",
            borderRadius: 16,
            padding: 16,
            border: "1px solid rgba(148,163,184,0.4)",
          }}
        >
          <p style={{ margin: "0 0 6px 0", fontSize: 12, color: "#9ca3af" }}>
            SALDO
          </p>
          <p
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 700,
              color: saldo >= 0 ? "#22c55e" : "#ef4444",
            }}
          >
            R$ {saldo.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Gráfico simples */}
      <div
        style={{
          background: "#020617",
          borderRadius: 16,
          padding: 24,
          border: "1px solid rgba(55,65,81,0.9)",
          marginBottom: 24,
        }}
      >
        <h3 style={{ margin: "0 0 20px 0", fontSize: 14 }}>Visualização</h3>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            gap: 32,
            height: 260,
          }}
        >
          {/* Barra Receitas */}
          <div
            style={{
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 60,
                height: incomeHeight,
                background: "linear-gradient(to top, #22c55e, #16a34a)",
                borderRadius: "8px 8px 0 0",
                marginBottom: 12,
              }}
            />
            <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>Receitas</p>
            <p style={{ margin: "4px 0 0 0", fontSize: 14, color: "#22c55e", fontWeight: 600 }}>
              R$ {totalIncomes.toFixed(2)}
            </p>
          </div>

          {/* Barra Despesas */}
          <div
            style={{
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 60,
                height: expenseHeight,
                background: "linear-gradient(to top, #ef4444, #dc2626)",
                borderRadius: "8px 8px 0 0",
                marginBottom: 12,
              }}
            />
            <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>Despesas</p>
            <p style={{ margin: "4px 0 0 0", fontSize: 14, color: "#ef4444", fontWeight: 600 }}>
              R$ {totalExpenses.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Transações filtradas */}
      <div
        style={{
          background: "#020617",
          borderRadius: 16,
          padding: 20,
          border: "1px solid rgba(55,65,81,0.9)",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: 12, fontSize: 14 }}>
          Transações do período ({filteredTransactions.length})
        </h3>
        {loading && <p style={{ color: "#9ca3af" }}>Carregando...</p>}
        {!loading && filteredTransactions.length === 0 && (
          <p style={{ color: "#9ca3af" }}>Nenhuma transação neste período.</p>
        )}
        {!loading && filteredTransactions.length > 0 && (
          <div
            style={{
              maxHeight: 300,
              overflowY: "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 12,
              }}
            >
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid rgba(31,41,55,0.9)" }}>
                    Data
                  </th>
                  <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid rgba(31,41,55,0.9)" }}>
                    Descrição
                  </th>
                  <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid rgba(31,41,55,0.9)" }}>
                    Tipo
                  </th>
                  <th style={{ textAlign: "right", padding: 8, borderBottom: "1px solid rgba(31,41,55,0.9)" }}>
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((t) => {
                  const isIncome = t.type === 0;
                  return (
                    <tr key={t.id}>
                      <td style={{ padding: 8 }}>
                        {new Date(t.transactionDate).toLocaleDateString()}
                      </td>
                      <td style={{ padding: 8 }}>{t.description}</td>
                      <td style={{ padding: 8 }}>
                        {isIncome ? "Receita" : "Despesa"}
                      </td>
                      <td
                        style={{
                          padding: 8,
                          textAlign: "right",
                          color: isIncome ? "#22c55e" : "#ef4444",
                          fontWeight: 600,
                        }}
                      >
                        {isIncome ? "+ " : "- "}R$ {t.amount.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;

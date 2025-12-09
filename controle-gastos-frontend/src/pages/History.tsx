import React from "react";
import TransactionList from "../components/TransactionList";

const HistoryPage: React.FC = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ marginBottom: 8 }}>Histórico de Transações</h1>
      <p style={{ marginBottom: 16, color: "#9ca3af", fontSize: 14 }}>
        Veja todas as suas receitas e despesas em ordem cronológica.
      </p>
      <TransactionList />
    </div>
  );
};

export default HistoryPage;

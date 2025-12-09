import React from "react";
import TransactionForm from "../components/TransactionForm";

const TransactionsPage: React.FC = () => {
  const handleChanged = () => {
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Cadastro de Receitas e Despesas</h2>
      <TransactionForm onTransactionAdded={handleChanged} />
    </div>
  );
};

export default TransactionsPage;

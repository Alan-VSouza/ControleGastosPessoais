import React from "react";
import TransactionForm from "../components/TransactionForm";

const userId = 1; 

const TransactionsPage: React.FC = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h2>Cadastro de Receitas e Despesas</h2>
      <TransactionForm userId={userId} onTransactionAdded={() => alert("Transação adicionada com sucesso!")} />
    </div>
  );
};

export default TransactionsPage;

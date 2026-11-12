import React from "react";
import TransactionForm from "../components/TransactionForm";
import PageLayout from "../components/PageLayout";

const TransactionsPage: React.FC = () => (
  <PageLayout title="Nova transação" subtitle="Registre uma receita ou despesa e acompanhe o saldo atualizado.">
    <TransactionForm onTransactionAdded={() => undefined} />
  </PageLayout>
);

export default TransactionsPage;

import React from "react";
import TransactionList from "../components/TransactionList";
import PageLayout from "../components/PageLayout";

const HistoryPage: React.FC = () => (
  <PageLayout title="Histórico de transações" subtitle="Veja todas as suas receitas e despesas em ordem cronológica.">
    <TransactionList />
  </PageLayout>
);

export default HistoryPage;

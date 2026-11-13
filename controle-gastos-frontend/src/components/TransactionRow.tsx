import React from "react";
import { Transaction } from "../hooks/useTransactions";
import { formatCurrency, formatShortDate } from "../utils/format";
import { ArrowDownLeftIcon, ArrowUpRightIcon } from "./Icons";

interface Props {
  transaction: Transaction;
  showDate?: boolean;
  actions?: React.ReactNode;
}

/** One income/expense line: direction icon, description, date and signed amount. */
const TransactionRow: React.FC<Props> = ({ transaction: t, showDate = true, actions }) => {
  const isIncome = t.type === 0;
  return (
    <div className="tx-row">
      <span className={`icon-badge ${isIncome ? "income" : "expense"}`}>
        {isIncome ? <ArrowDownLeftIcon /> : <ArrowUpRightIcon />}
      </span>
      <div className="tx-main">
        <div className="tx-title">{t.description}</div>
        <div className="tx-meta">
          {isIncome ? "Receita" : "Despesa"}
          {showDate && ` · ${formatShortDate(t.transactionDate)}`}
        </div>
      </div>
      <span className={`tx-amount ${isIncome ? "text-income" : ""}`}>
        {isIncome ? "+ " : "− "}
        {formatCurrency(t.amount)}
      </span>
      {actions}
    </div>
  );
};

export default TransactionRow;

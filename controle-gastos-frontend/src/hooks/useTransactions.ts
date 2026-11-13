import { useCallback, useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5148";

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: number; // 0 = Income, 1 = Expense
  transactionDate: string;
}

export const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("auth_token")}` });

/** Loads the signed-in user's transactions (newest first) and exposes a reload function. */
export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    try {
      setError("");
      const res = await axios.get<Transaction[]>(`${API_BASE_URL}/api/transaction`, { headers: authHeaders() });
      const ordered = [...res.data].sort(
        (a, b) => b.transactionDate.localeCompare(a.transactionDate) || b.id - a.id
      );
      setTransactions(ordered);
    } catch (err) {
      console.error("Erro ao carregar transações:", err);
      setError("Não foi possível carregar suas transações.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { transactions, loading, error, reload };
};

export { API_BASE_URL };

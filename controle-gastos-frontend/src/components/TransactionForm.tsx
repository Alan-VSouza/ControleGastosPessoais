import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import styles from "./TransactionForm.module.css";

interface TransactionFormProps {
  onTransactionAdded: () => void;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5148";

const TransactionForm: React.FC<TransactionFormProps> = ({ onTransactionAdded }) => {
  const [transactionType, setTransactionType] = useState<string>("Income");
  const [description, setDescription] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [transactionDate, setTransactionDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [saldo, setSaldo] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  useEffect(() => {
    fetchSaldo();
  }, []);

  const fetchSaldo = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await axios.get(`${API_BASE_URL}/api/transaction/saldo`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSaldo(response.data);
    } catch {
      setSaldo(0);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        Type: transactionType,
        Description: description,
        Amount: parseFloat(amount),
        TransactionDate: transactionDate,
      };

      const token = localStorage.getItem("auth_token");
      await axios.post(`${API_BASE_URL}/api/transaction`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess("✓ Transação adicionada com sucesso!");
      onTransactionAdded();

      await fetchSaldo();

      setDescription("");
      setAmount("");
      setTransactionType("Income");
      setTransactionDate(new Date().toISOString().slice(0, 10));

      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError("✗ Erro ao adicionar transação. Tente novamente.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (e: ChangeEvent<HTMLSelectElement>) =>
    setTransactionType(e.target.value);
  const handleDescriptionChange = (e: ChangeEvent<HTMLInputElement>) =>
    setDescription(e.target.value);
  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) =>
    setAmount(e.target.value);
  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) =>
    setTransactionDate(e.target.value);

  const isReceita = transactionType === "Income";

  return (
    <div className={styles.container}>
      <div className={styles.saldoCard}>
        <div className={styles.saldoLabel}>Saldo Atual</div>
        <div
          className={`${styles.saldoAmount} ${
            isReceita ? styles.positive : styles.negative
          }`}
        >
          R$ {saldo.toFixed(2)}
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <h2 className={styles.formTitle}>Adicionar Transação</h2>

        {error && <div className={styles.errorMessage}>{error}</div>}
        {success && <div className={styles.successMessage}>{success}</div>}

        <div className={styles.formGroup}>
          <label htmlFor="type" className={styles.label}>
            Tipo de Transação
          </label>
          <select
            id="type"
            value={transactionType}
            onChange={handleTypeChange}
            className={styles.select}
          >
            <option value="Income">💰 Receita</option>
            <option value="Expense">💸 Despesa</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description" className={styles.label}>
            Descrição
          </label>
          <input
            id="description"
            type="text"
            value={description}
            onChange={handleDescriptionChange}
            placeholder="Ex: Salário, Compras..."
            className={styles.input}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="amount" className={styles.label}>
            Valor (R$)
          </label>
          <input
            id="amount"
            type="number"
            step="0.01"
            value={amount}
            onChange={handleAmountChange}
            placeholder="0.00"
            className={styles.input}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="date" className={styles.label}>
            Data
          </label>
          <input
            id="date"
            type="date"
            value={transactionDate}
            onChange={handleDateChange}
            className={styles.input}
            required
          />
        </div>

        <button type="submit" className={styles.submitButton} disabled={loading}>
          {loading ? "Adicionando..." : "➕ Adicionar Transação"}
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;

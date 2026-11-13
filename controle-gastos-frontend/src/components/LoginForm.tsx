import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import styles from "./AuthForm.module.css";
import { CloseIcon, EyeIcon, WalletIcon } from "./Icons";

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const justRegistered = Boolean((useLocation().state as { registered?: boolean } | null)?.registered);
  const { login, isLoading, error, clearError, isAuthenticated } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!email) {
      errors.email = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Email inválido";
    }

    if (!password) {
      errors.password = "Senha é obrigatória";
    } else if (password.length < 6) {
      errors.password = "Senha deve ter no mínimo 6 caracteres";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    clearError();
    const success = await login(email, password);

    if (success) {
      navigate("/dashboard");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <Link to="/" className={styles.brand}>
          <span className={styles.brandMark}>
            <WalletIcon size={17} />
          </span>
          Controle de Gastos
        </Link>
        <div className={styles.header}>
          <h1>Bem-vindo de volta</h1>
          <p>Entre para ver seu saldo e suas transações.</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {justRegistered && !error && (
            <div className="alert alert-success">Conta criada! Agora é só entrar.</div>
          )}
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearError();
              }}
              className={validationErrors.email ? styles.inputError : ""}
              disabled={isLoading}
              autoComplete="off"
            />
            {validationErrors.email && (
              <span className={styles.error}>{validationErrors.email}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Senha</label>
            <div className={styles.passwordWrapper}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Sua senha"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearError();
                }}
                className={validationErrors.password ? styles.inputError : ""}
                disabled={isLoading}
                autoComplete="off"
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                <EyeIcon off={showPassword} />
              </button>
            </div>
            {validationErrors.password && (
              <span className={styles.error}>{validationErrors.password}</span>
            )}
          </div>

          {error && (
            <div className={styles.serverError}>
              <span>{error}</span>
              <button
                type="button"
                className={styles.closeError}
                onClick={clearError}
              >
                <CloseIcon size={16} />
              </button>
            </div>
          )}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? "Autenticando..." : "Entrar"}
          </button>
        </form>

        <div className={styles.footer}>
          <p>
            Não tem uma conta? <Link to="/register">Criar conta</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;

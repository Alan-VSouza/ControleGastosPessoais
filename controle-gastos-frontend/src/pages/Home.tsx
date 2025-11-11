import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import styles from "./Home.module.css";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.logo}>💰 Controle de Gastos</h1>
          <nav className={styles.nav}>
            {isAuthenticated ? (
              <>
                <span className={styles.userInfo}>Olá, {user?.fullName}!</span>
                <button
                  onClick={() => navigate("/dashboard")}
                  className={styles.navButton}
                >
                  Dashboard
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className={styles.navButton}
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className={`${styles.navButton} ${styles.primary}`}
                >
                  Registrar
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h2>Gerencie suas Finanças Pessoais</h2>
          <p>Controle de gastos simples, prático e eficiente</p>

          {!isAuthenticated && (
            <div className={styles.heroButtons}>
              <button
                onClick={() => navigate("/register")}
                className={styles.buttonPrimary}
              >
                Começar Agora
              </button>
              <button
                onClick={() => navigate("/login")}
                className={styles.buttonSecondary}
              >
                Já Tenho Conta
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className={styles.features}>
        <h3>Recursos</h3>
        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📊</div>
            <h4>Gráficos</h4>
            <p>Visualize seus gastos com gráficos intuitivos</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📅</div>
            <h4>Relatórios</h4>
            <p>Organize seus gastos por período</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>💳</div>
            <h4>Transações</h4>
            <p>Registre receitas e despesas facilmente</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🔒</div>
            <h4>Seguro</h4>
            <p>Seus dados estão sempre protegidos</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>
          &copy; 2025 Controle de Gastos Pessoais. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
};

export default HomePage;

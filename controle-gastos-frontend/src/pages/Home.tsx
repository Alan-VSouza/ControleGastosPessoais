import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  CalendarIcon,
  ChartIcon,
  ListIcon,
  ShieldIcon,
  WalletIcon,
} from "../components/Icons";
import styles from "./Home.module.css";

const features = [
  {
    icon: <ChartIcon />,
    title: "Saldo em tempo real",
    text: "Veja quanto entrou, quanto saiu e como o saldo evoluiu nos últimos 30 dias.",
  },
  {
    icon: <CalendarIcon />,
    title: "Análise por período",
    text: "Compare receitas e despesas da semana, do mês ou do ano com um clique.",
  },
  {
    icon: <ListIcon />,
    title: "Histórico organizado",
    text: "Lançamentos agrupados por dia, com busca, filtros e edição rápida.",
  },
  {
    icon: <ShieldIcon />,
    title: "Conta protegida",
    text: "Login com JWT e senhas guardadas com hash. Cada usuário vê só os próprios dados.",
  },
];

const previewRows = [
  { title: "Salário", meta: "Receita · 02 de nov.", value: "+ R$ 5.200,00", income: true },
  { title: "Aluguel", meta: "Despesa · 04 de nov.", value: "− R$ 1.600,00", income: false },
  { title: "Mercado", meta: "Despesa · 07 de nov.", value: "− R$ 712,30", income: false },
];

/** Static product preview for the landing page (illustrative values). */
const ProductPreview: React.FC = () => (
  <div className={styles.preview} aria-hidden>
    <div className={styles.previewBalance}>
      <span>Saldo atual</span>
      <strong>R$ 6.505,40</strong>
      <svg viewBox="0 0 300 70" className={styles.previewChart}>
        <defs>
          <linearGradient id="hp" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b7cf6" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#8b7cf6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M0,55 L40,50 L80,52 L120,30 L160,34 L200,22 L240,26 L300,8 L300,70 L0,70 Z" fill="url(#hp)" />
        <path d="M0,55 L40,50 L80,52 L120,30 L160,34 L200,22 L240,26 L300,8" fill="none" stroke="#a99cff" strokeWidth="3" />
      </svg>
    </div>
    <div className={styles.previewStats}>
      <div>
        <span className="icon-badge income">
          <ArrowDownLeftIcon size={16} />
        </span>
        <small>Receitas</small>
        <b className="text-income">R$ 5.200</b>
      </div>
      <div>
        <span className="icon-badge expense">
          <ArrowUpRightIcon size={16} />
        </span>
        <small>Despesas</small>
        <b className="text-expense">R$ 2.455</b>
      </div>
    </div>
    <div className={styles.previewList}>
      {previewRows.map((row) => (
        <div key={row.title} className={styles.previewRow}>
          <span className={`icon-badge ${row.income ? "income" : "expense"}`}>
            {row.income ? <ArrowDownLeftIcon size={16} /> : <ArrowUpRightIcon size={16} />}
          </span>
          <div>
            <b>{row.title}</b>
            <small>{row.meta}</small>
          </div>
          <span className={row.income ? "text-income" : ""}>{row.value}</span>
        </div>
      ))}
    </div>
  </div>
);

const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link to="/" className={styles.logo}>
            <span className={styles.logoMark}>
              <WalletIcon size={18} />
            </span>
            Controle de Gastos
          </Link>
          <nav className={styles.nav}>
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-primary">
                Abrir painel de {user?.fullName?.split(" ")[0]}
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost">
                  Entrar
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Criar conta
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroText}>
          <span className={styles.eyebrow}>Finanças pessoais sem planilha</span>
          <h1>
            Saiba para onde vai <span>cada real</span> do seu mês.
          </h1>
          <p>
            Registre receitas e despesas em segundos, acompanhe o saldo e descubra quanto você consegue guardar todo
            mês.
          </p>
          <div className={styles.heroButtons}>
            <Link to={isAuthenticated ? "/dashboard" : "/register"} className="btn btn-primary btn-lg">
              {isAuthenticated ? "Ir para o painel" : "Começar grátis"}
            </Link>
            {!isAuthenticated && (
              <Link to="/login" className="btn btn-ghost btn-lg">
                Já tenho conta
              </Link>
            )}
          </div>
        </div>
        <ProductPreview />
      </section>

      <section className={styles.features}>
        {features.map((f) => (
          <div key={f.title} className={styles.featureCard}>
            <span className="icon-badge accent">{f.icon}</span>
            <h3>{f.title}</h3>
            <p>{f.text}</p>
          </div>
        ))}
      </section>

      <footer className={styles.footer}>
        © {new Date().getFullYear()} Controle de Gastos Pessoais · Projeto open source em React e .NET
      </footer>
    </div>
  );
};

export default HomePage;

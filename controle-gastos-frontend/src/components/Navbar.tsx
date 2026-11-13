import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { LogoutIcon, WalletIcon } from "./Icons";
import styles from "./Navbar.module.css";

const links = [
  { to: "/dashboard", label: "Visão geral", short: "Início" },
  { to: "/transactions", label: "Nova transação", short: "Nova" },
  { to: "/history", label: "Histórico", short: "Histórico" },
  { to: "/analytics", label: "Análise", short: "Análise" },
];

const initialsOf = (name?: string) =>
  (name ?? "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "?";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <button className={styles.logo} onClick={() => navigate("/dashboard")}>
          <span className={styles.logoMark}>
            <WalletIcon size={18} />
          </span>
          Controle de Gastos
        </button>

        <div className={styles.links}>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ""}`}
            >
              <span className={styles.full}>{link.label}</span>
              <span className={styles.short}>{link.short}</span>
            </NavLink>
          ))}
        </div>

        <div className={styles.spacer} />

        <div className={styles.user}>
          <span className={styles.avatar}>{initialsOf(user?.fullName)}</span>
          <span className={styles.userName}>{user?.fullName}</span>
          <button className={styles.logout} onClick={handleLogout} title="Sair" aria-label="Sair">
            <LogoutIcon size={17} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

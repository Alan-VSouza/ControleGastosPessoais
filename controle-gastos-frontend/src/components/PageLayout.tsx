import React from "react";

interface PageLayoutProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

/** Shared page shell so every logged-in page has the same width, spacing and header. */
const PageLayout: React.FC<PageLayoutProps> = ({ title, subtitle, actions, children }) => (
  <main className="page">
    <div className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actions}
    </div>
    {children}
  </main>
);

export default PageLayout;

import React from "react";

interface PageLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

/** Shared page shell so every logged-in page has the same width, spacing and header. */
const PageLayout: React.FC<PageLayoutProps> = ({ title, subtitle, children }) => (
  <div style={{ padding: "28px 20px", maxWidth: "1100px", margin: "0 auto", color: "#e5e7eb" }}>
    <div style={{ marginBottom: 24 }}>
      <h1 style={{ margin: 0, fontSize: 26 }}>{title}</h1>
      {subtitle && <p style={{ marginTop: 6, color: "#9ca3af", fontSize: 14 }}>{subtitle}</p>}
    </div>
    {children}
  </div>
);

export default PageLayout;

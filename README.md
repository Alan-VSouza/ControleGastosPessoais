# 💰 Personal Finance Tracker

A full-stack personal finance app to track income and expenses, see your balance in real time and analyze transactions with charts.

![Status](https://img.shields.io/badge/Status-In_Development-yellow)
![.NET](https://img.shields.io/badge/.NET-8.0-purple)
![React](https://img.shields.io/badge/React-TypeScript-blue)

## 🚀 Features

**Authentication:** user registration and login with JWT (JSON Web Tokens).

**Interactive dashboard:** current balance, recent income and expense totals, a table with the last 5 transactions and green/red indicators for income and expenses.

**Transaction management:** add income or expenses, edit and delete transactions, and browse the full chronological history.

**Analytics:** filter by date range, compare income and expenses in a bar chart and see the balance for the selected period.

**Interface:** modern responsive design, native dark mode on every screen and protected routes (only signed-in users can access the app).

---

## 🛠️ Tech stack

**Back-end (API):** C# / .NET 8, Entity Framework Core, SQLite, JWT Bearer authentication and Swagger.

**Front-end:** React, TypeScript, Axios, React Router and CSS Modules (scoped styles and dark theme).

---

## 🔧 Getting started

**Requirements:** [.NET SDK 8.0](https://dotnet.microsoft.com/download), [Node.js](https://nodejs.org/) 18+ and Git.

**1. Clone the repository**

```bash
git clone https://github.com/Alan-VSouza/ControleGastosPessoais.git
cd ControleGastosPessoais
```

**2. Run the API**

Make sure the `DefaultConnection` string in `appsettings.json` points to a valid SQLite file (by default it creates a local one), then:

```bash
cd ControleGastosPessoais.Api
dotnet ef database update
dotnet run
```

The API runs at `http://localhost:5148` (or the port configured in your launch settings).

**3. Run the front-end** (in another terminal)

```bash
cd controle-gastos-frontend
npm install
npm start
```

The app runs at `http://localhost:3000`. If your API uses a different address, set `REACT_APP_API_URL` in the front-end `.env` file.

---

## 📂 Project structure

```text
ControleGastosPessoais/
├── ControleGastosPessoais.Api/     # .NET back-end
│   ├── Controllers/                # API endpoints
│   ├── Models/                     # Entities and DTOs
│   ├── Services/                   # Business rules
│   └── Data/                       # EF Core context
└── controle-gastos-frontend/       # React front-end
    └── src/
        ├── components/             # Reusable components (forms, lists)
        ├── contexts/               # AuthContext (global state)
        ├── pages/                  # Screens (Dashboard, History, Analytics)
        └── services/               # Axios configuration
```

---

## 🛣️ Roadmap

- [ ] Expense categories (food, transport, leisure)
- [ ] Report export (PDF/Excel)
- [ ] Pie charts by category
- [ ] User profile (change password/photo)

---

## 🤝 Contributing

Contributions are welcome. Fork the project, create a feature branch, commit your changes and open a pull request.

## 📝 License

This project is licensed under the MIT License.

---

Built by **Alan V. Souza**, **Pedro Cândido** and **Matheus Carvalho**.

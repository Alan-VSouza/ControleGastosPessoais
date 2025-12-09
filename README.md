# 💰 Controle de Gastos Pessoais

Aplicação Full Stack para gestão financeira pessoal, permitindo o controle de receitas e despesas, visualização de saldo em tempo real e análise gráfica de transações.

![Badge Status](https://img.shields.io/badge/Status-Em_Desenvolvimento-yellow)
![Badge .NET](https://img.shields.io/badge/.NET-8.0-purple)
![Badge React](https://img.shields.io/badge/React-TypeScript-blue)

## 🚀 Funcionalidades

- **Autenticação Segura**: Login e Cadastro de usuários com JWT (JSON Web Tokens).
- **Dashboard Interativo**:
  - Resumo de Saldo Atual.
  - Total de Receitas e Despesas recentes.
  - Tabela com as últimas 5 transações.
  - Indicadores visuais de Receita (Verde) e Despesa (Vermelho).
- **Gestão de Transações**:
  - Adicionar novas receitas ou despesas.
  - **Editar** transações existentes.
  - Excluir transações.
  - Histórico completo cronológico.
- **Analytics (Análise)**:
  - Filtro por período (Data Inicial e Final).
  - Gráfico de barras comparativo (Receitas vs Despesas).
  - Cálculo de saldo do período selecionado.
- **Interface**:
  - Design moderno e responsivo.
  - **Dark Mode** nativo em todas as telas.
  - Proteção de rotas (apenas usuários logados acessam o sistema).

---

## 🛠️ Tecnologias Utilizadas

### Backend (API)
- **C# .NET 8**
- **Entity Framework Core** (ORM)
- **SQLite** (Banco de dados)
- **JWT Bearer** (Autenticação)
- **Swagger** (Documentação da API)

### Frontend
- **React** (Vite/CRA)
- **TypeScript**
- **Axios** (Requisições HTTP)
- **React Router Dom** (Navegação)
- **CSS Modules** (Estilização escopada e Dark Theme)

---

## 🔧 Como Rodar o Projeto

### Pré-requisitos
- [.NET SDK 8.0](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) (v18 ou superior)
- Git

### 1. Clonar o repositório

```

git clone https://github.com/Alan-VSouza/ControleGastosPessoais.git
cd ControleGastosPessoais

```

### 2. Configurar e Rodar o Backend

1. Entre na pasta da API:
```

cd ControleGastosPessoais.Api

```

2. Configure o banco de dados (SQLite):
Certifique-se de que a `ConnectionString` no `appsettings.json` está apontando para um local válido (por padrão, cria um arquivo local).

3. Aplique as Migrations (cria o banco):
```

dotnet ef database update

```

4. Rode a API:
```

dotnet run

```
> A API rodará em `http://localhost:5148` (ou porta similar configurada).

### 3. Configurar e Rodar o Frontend

1. Entre na pasta do Frontend (em outro terminal):
```

cd ../controle-gastos-frontend

```

2. Instale as dependências:
```

npm install

```

3. Configure a URL da API (se necessário):
Verifique se o arquivo `.env` (ou `API_BASE_URL` no código) aponta para `http://localhost:5148`.

4. Rode o projeto:
```

npm start

```
> O front rodará em `http://localhost:3000`.

---

## 📂 Estrutura do Projeto

```

ControleGastosPessoais/
├── ControleGastosPessoais.Api/      \# Backend .NET
│   ├── Controllers/                 \# Endpoints da API
│   ├── Models/                      \# Entidades do Banco e DTOs
│   ├── Services/                    \# Regras de Negócio
│   └── Data/                        \# Contexto do EF Core
│
└── controle-gastos-frontend/        \# Frontend React
├── src/
│   ├── components/              \# Componentes Reutilizáveis (Forms, Lists)
│   ├── contexts/                \# AuthContext (Gestão de Estado Global)
│   ├── pages/                   \# Telas (Dashboard, History, Analytics)
│   └── services/                \# Configuração do Axios

```

---

## 🛣️ Roadmap e Melhorias Futuras

- [ ] Categorização de gastos (Alimentação, Transporte, Lazer).
- [ ] Exportação de relatórios (PDF/Excel).
- [ ] Gráficos de pizza por categoria.
- [ ] Perfil de usuário (alterar senha/foto).

---

## 🤝 Contribuição

Contribuições são bem-vindas!
1. Faça um Fork do projeto.
2. Crie uma Branch para sua Feature (`git checkout -b feature/MinhaFeature`).
3. Faça o Commit (`git commit -m 'feat: Adicionando nova feature'`).
4. Faça o Push (`git push origin feature/MinhaFeature`).
5. Abra um Pull Request.

---

## 📝 Licença

Este projeto está sob a licença MIT.

---

Desenvolvido por **Alan V. Souza** , **Pedro Cândido** e **Matheus Carvalho**.

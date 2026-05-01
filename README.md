# ERP Project - Sistema de Gestão Financeira

Este é um projeto Fullstack de um sistema ERP (Enterprise Resource Planning) focado em gestão financeira, composto por um backend em Spring Boot e um frontend em React com Vite.

## 🚀 Tecnologias Utilizadas

### Backend
- **Java 17+**
- **Spring Boot 3.x**
- **Spring Data JPA**
- **Maven**
- **PostgreSQL**

### Frontend
- **Node.js 18+**
- **React**
- **Vite**
- **Tailwind CSS**
- **TypeScript**

---

## 📁 Estrutura do Projeto

```text
erp-project/
├── backend/    # API RESTful (Spring Boot)
├── frontend/   # Interface do Usuário (React + Vite)
├── README.md   # Documentação do projeto
└── .gitignore  # Arquivos ignorados pelo Git
```

---

## 📋 Pré-requisitos

Antes de começar, você vai precisar ter instalado em sua máquina:
- [Java 17](https://www.oracle.com/java/technologies/downloads/) ou superior.
- [Node.js 18](https://nodejs.org/) ou superior.
- [PostgreSQL](https://www.postgresql.org/download/) rodando localmente.
- [Maven](https://maven.apache.org/download.cgi) (opcional, pode usar o wrapper do projeto).

---

## ⚙️ Configuração do Banco de Dados

1. Abra o seu terminal do PostgreSQL (psql) ou utilize uma ferramenta como pgAdmin/DBeaver.
2. Crie um novo banco de dados chamado `financeiro`:
   ```sql
   CREATE DATABASE financeiro;
   ```
3. O projeto está configurado para conectar ao PostgreSQL com as seguintes credenciais padrão (ajuste em `backend/src/main/resources/application.properties` se necessário):
   - **URL:** `jdbc:postgresql://localhost:5432/financeiro`
   - **Username:** `postgres`
   - **Password:** `admin` (ou sua senha local)

---

## 🏃‍♂️ Como Rodar o Projeto

### 1. Backend (API)
Abra um terminal na pasta raiz e execute:
```bash
cd backend
mvn spring-boot:run
```
O servidor iniciará na porta **8080**.
Acesse: `http://localhost:8080`

### 2. Frontend (Interface)
Abra outro terminal na pasta raiz e execute:
```bash
cd frontend
npm install
npm run dev
```
O servidor iniciará na porta **5173**.
Acesse: [http://localhost:5173](http://localhost:5173)

---

## 🔗 URLs de Acesso
- **Frontend:** `http://localhost:5173`
- **Backend API:** `http://localhost:8080`

---

## 🛠️ Problemas Comuns e Soluções

- **Erro de conexão com banco de dados:** Verifique se o serviço do PostgreSQL está rodando e se as credenciais no arquivo `application.properties` coincidem com as do seu banco.
- **Porta 8080 ou 5173 já em uso:** Certifique-se de que não há outras instâncias do projeto (ou outros apps) rodando nessas portas.
- **Node_modules não encontrado:** Certifique-se de rodar `npm install` dentro da pasta `frontend` antes de `npm run dev`.

---

Desenvolvido por [Borkaart](https://github.com/Borkaart).

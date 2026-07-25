<img width="1536" height="1024" alt="ChatGPT Image 26 Jul 2026, 03 09 54" src="https://github.com/user-attachments/assets/b1ea49b7-fe40-4ad3-a569-eea6de278bf3" />

# 📦 Inventara

A modern warehouse inventory management system built with **Laravel 12**, **React 19**, and **MySQL**.

Inventara is designed to simulate a real-world warehouse management system by implementing enterprise-level features such as role-based access control, approval workflows, audit logging, inventory analytics, and RESTful API architecture.

The project focuses on building **clean, maintainable, scalable, and well-documented code** while following modern software development best practices.

![Status](https://img.shields.io/badge/status-active-success)
![Laravel](https://img.shields.io/badge/Laravel-12-red)
![React](https://img.shields.io/badge/React-19-61DAFB)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38BDF8)
![License](https://img.shields.io/badge/License-MIT-green)

---

# 🚀 Features

## 🔐 Authentication & Authorization

- Secure authentication using Laravel Sanctum
- Role-Based Access Control (RBAC) with Spatie Permission
- Three user roles:
  - Administrator
  - Manager
  - Staff

---

## 📊 Dashboard & Analytics

- Interactive dashboard
- Inventory movement statistics
- Low stock indicators
- Recent activities
- Monthly inventory overview

---

## 📦 Inventory Management

Manage all warehouse inventory efficiently.

Features include:

- Product Management
- Category Management
- Supplier Management
- Stock In
- Stock Out
- Search & Filtering

---

## ✅ Approval Workflow

Implements a multi-level approval process for outgoing inventory.

Workflow:

1. Staff creates a stock request
2. Manager reviews the request
3. Manager approves or rejects the request
4. Inventory is updated automatically
5. All activities are recorded in the audit log

---

## 📄 Reports

Generate reports in multiple formats.

Supported exports:

- PDF
- Excel

Filter reports by:

- Date
- Category
- Approval Status

---

## 🕒 Audit Trail

Every important action performed inside the application is recorded.

Audit information includes:

- User
- Timestamp
- Previous Value
- Updated Value
- Activity Description

---

# 📸 Application Preview

## Login

> Coming Soon

---

## Dashboard

> Coming Soon

---

## Inventory Management

> Coming Soon

---

## Reports

> Coming Soon

---

# 🛠 Tech Stack

| Layer | Technology |
|--------|------------|
| Backend | Laravel 12 (PHP 8.2+) |
| Frontend | React 19 + Vite |
| Database | MySQL |
| Styling | Tailwind CSS 4 |
| Authentication | Laravel Sanctum |
| Authorization | Spatie Permission |
| Export | Laravel Excel |
| API | RESTful API |

---

# 📂 Project Structure

```
inventara/
│
├── app/
│   ├── Http/
│   ├── Models/
│   ├── Policies/
│   └── Services/
│
├── database/
│   ├── migrations/
│   ├── seeders/
│   └── factories/
│
├── resources/
│   └── js/
│       ├── components/
│       ├── pages/
│       ├── layouts/
│       └── services/
│
├── routes/
├── public/
├── tests/
└── README.md
```

---

# ⚙️ Getting Started

## Requirements

- PHP 8.2 or higher
- Composer
- Node.js 18+
- npm
- MySQL
- Git

---

## Installation

Clone the repository

```bash
git clone https://github.com/MFahmiHafidzullah/Inventara.git
```

Move into the project directory

```bash
cd Inventara
```

Install backend dependencies

```bash
composer install
```

Install frontend dependencies

```bash
npm install
```

Copy environment file

```bash
cp .env.example .env
```

Generate application key

```bash
php artisan key:generate
```

---

# 🗄 Database Configuration

Configure your `.env` file.

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=inventara
DB_USERNAME=root
DB_PASSWORD=
```

---

# 🧱 Database Migration

Run migration and seed the database.

```bash
php artisan migrate --seed
```

---

# ▶️ Run the Application

Start Laravel server

```bash
php artisan serve
```

Start React (Vite)

```bash
npm run dev
```

Open your browser

```
http://localhost:8000
```

---

# 👤 Demo Accounts

| Role | Email | Password |
|------|--------|----------|
| Administrator | admin@inventara.com | password123 |
| Manager | manager@inventara.com | password123 |
| Staff | staff@inventara.com | password123 |

---

# 🧪 Running Tests

```bash
composer run test
```

---

# 🎯 Technical Highlights

This project demonstrates practical implementation of:

- RESTful API Development
- Role-Based Access Control (RBAC)
- Approval Workflow System
- Single Page Application (SPA)
- Inventory Management System
- Audit Logging
- Responsive Dashboard
- Database Normalization
- Authentication & Authorization
- Feature Testing
- Clean Code Architecture

---

# 💡 Why I Built This Project

Inventara was developed as a portfolio project to simulate a real-world warehouse management system commonly used in businesses.

Instead of focusing only on CRUD operations, this application implements enterprise-oriented concepts including authentication, approval workflows, audit logging, reporting, and scalable architecture.

The objective of this project is to strengthen practical skills in full-stack web development using Laravel and React while following modern software engineering practices.

---

# 🚀 Future Improvements

Planned features include:

- Barcode Scanner
- QR Code Support
- Email Notifications
- Real-time Updates
- Forecasting Module
- Docker Support
- CI/CD Pipeline
- Multi-Warehouse Management
- Dark Mode

---

# 📄 License

This project is licensed under the **MIT License**.

---

# 👨‍💻 Author

**Muhammad Fahmi Hafidzullah**

🎓 Informatics Engineering Student

📍 Bekasi, Indonesia

📧 fahmihafidzullah@gmail.com

💼 LinkedIn

https://www.linkedin.com/in/muhammad-fahmi-hafidzullah/

🌐 Portfolio

Coming Soon...

⭐ If you like this project, don't forget to leave a star!

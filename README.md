**Disclaimer** - **Status: Paused**  
This project is currently on hold. It requires continuous logins/authentication to function properly, which is currently unmaintained. All code and history are available, but active development is paused.

# 🔗 URL Shortener – Full Stack Web Application

A production-ready URL Shortener web application built using **Node.js, Express, Drizzle ORM, MySQL, and EJS**, featuring authentication, OAuth login, profile management, and secure route handling.

Live at: - https://url-shortener-v1-q265.onrender.com/


## 🚀 Overview

This application allows users to:

- Register & Login securely
- Authenticate using Google OAuth
- Create shortened URLs
- Manage created URLs
- Update profile details
- Reset / Change password
- Verify email
- Delete links securely
- Access protected dashboard

The project follows a **modular MVC architecture** with clean folder separation.

---

# 🏗 Architecture

- **Backend:** Node.js + Express
- **Database:** MySQL (Supabase) via Drizzle ORM
- **Authentication:** JWT + Sessions + OAuth
- **Frontend:** EJS Templates + Custom Responsive CSS
- **Deployment:** Render

---

# 📂 Project Structure

```
Url_shortener/
│
├── config/
├── Controller/
│   ├── auth.Controller.js
│   └── control.js
│
├── data/
├── DrizzleORM/
├── emails/
├── lib/
│
├── Middleware/
│   └── auth.middleware.js
│
├── Model/
│   ├── codeFetch.js
│   └── model.js
│
├── mongodb/
├── public/
│   ├── uploads/
│   ├── favicon.png
│   └── index.css
│
├── Routess/
│   ├── auth.routes.js
│   └── Routes.js
│
├── services/
│
├── views/
│   ├── auth/
│   │   ├── change-password.ejs
│   │   ├── forgot-password-change.ejs
│   │   ├── login.ejs
│   │   ├── register.ejs
│   │   ├── reset-password.ejs
│   │   ├── set-password.ejs
│   │   └── verifyEmail.ejs
│   │
│   ├── partials/
│   ├── edit-profile.ejs
│   ├── edit.ejs
│   ├── index.ejs
│   ├── profile.ejs
│   └── view.js
│
├── .env
├── .gitignore
├── app.js
└── package.json
```

---

# 🔐 Features

## ✅ Authentication
- Email & Password registration
- Secure password hashing
- JWT-based authentication
- Session handling
- Protected routes middleware

## ✅ OAuth Integration
- Google Login
- Secure callback handling
- OAuth user account linking

## ✅ URL Shortening
- Generate unique short codes
- Store original & shortened URLs
- Fetch and redirect logic
- Delete links

## ✅ Profile Management
- Update user details
- Email verification
- Change password
- Reset password via email

## ✅ Security
- Middleware-based route protection
- Environment variable configuration
- Secure token validation
- Form validation

---

# ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000

DATABASE_URL=your_mysql_supabase_connection_string

JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

BASE_URL=http://localhost:3000
```

---

# 🧩 Installation

### 1️⃣ Clone Repository

```bash
git clone https://github.com/YASH36638/Url_Shortener_v1.git
cd url-shortener
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Setup Environment Variables

Create `.env` as shown above.

### 4️⃣ Run Drizzle ORM Migration

```bash
npx drizzle-kit push
```

### 5️⃣ Start Server

```bash
npm run dev
```

or

```bash
npm start
```

Application runs at:

```
http://localhost:3000
```

---

# 🔄 Authentication Flow

1. User registers
2. Password hashed and stored
3. JWT issued
4. Protected routes validated using `auth.middleware.js`
5. OAuth users handled separately
6. Password reset via secure email token

---

# 📱 Responsive UI

- Custom CSS (no frameworks)
- Card-based layout
- Mobile-friendly forms
- Clean profile interface

---

# 🧠 Key Concepts Implemented

- MVC Pattern
- Middleware Architecture
- OAuth 2.0 Flow
- JWT Authentication
- Email Token Verification
- Drizzle ORM Query Handling
- RESTful Routing
- Secure Environment Configuration 

---

# Suggestions & Issues

If you find a bug or want to suggest an improvement:

- Open an Issue
- Clearly describe the problem
- Provide reproduction steps if applicable

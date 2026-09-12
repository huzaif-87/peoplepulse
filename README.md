# PeoplePulse — Intelligent Employee Management Platform

PeoplePulse is a modern, enterprise-grade Employee Management & HR Analytics platform. Built with a React + Vite frontend, a Node.js + Express backend, MongoDB Atlas, and integrated with Google Gemini AI for natural language workforce querying.

---

## 🏗️ System Architecture & Data Flow

```
User (Natural Language Query)
  ↓
React Frontend (Vite + TailwindCSS)
  ↓
Express REST API (JWT Protected)
  ↓
Gemini AI Service (Structured Filter Extraction Only)
  ↓
Validated & Sanitized Query Filters (MongoDB Operator Injection Defense)
  ↓
Employee Service Layer
  ↓
MongoDB Atlas / Local Database
```

> **IMPORTANT ARCHITECTURAL GUARANTEE:**
> Google Gemini AI is strictly isolated server-side and acts **only as a natural-language intent parser**. It **never** receives direct database access, and it **never** generates raw database queries or code. All AI output is strictly schema-validated, sanitized, and passed to the backend service layer before querying MongoDB.

---

## ✨ Key Features

1. **AI Smart Search**: Convert complex natural language prompts (e.g., *"active react developers in Chennai"*, *"contract employees who joined in 2025"*) into precise, multi-criteria workforce filters.
2. **Comprehensive Employee Directory**: Full lifecycle management with paginated listing, multi-field search, status management, and soft deletion.
3. **Executive HR Analytics**: Real-time dashboard with headcount distribution, 12-month hiring trends, attendance & leave metrics, performance review ratings (1.0–5.0), payroll cost analysis, and turnover/retention analytics.
4. **360-Degree Employee Profiles**: In-depth view detailing personal info, skills, employment history, compensation, and performance scores.
5. **Enterprise Security & RBAC**: JWT authentication, `bcrypt` password hashing, role authorization (`ADMIN`, `HR`, `EMPLOYEE`), Helmet HTTP protection, CORS policy, rate limiting, and regex injection prevention.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, TailwindCSS v4, Lucide Icons, Recharts, React Router v7 |
| **Backend** | Node.js, Express.js, Mongoose, JWT (`jsonwebtoken`), `bcryptjs`, Helmet, Express Rate Limit |
| **Database** | MongoDB Atlas / Local MongoDB (with automatic local fallback) |
| **AI Integration** | Google Generative AI SDK (`@google/generative-ai` - Gemini 1.5 Flash) |

---

## 🔒 Security Architecture & Best Practices

- **Zero Client-Side Secret Exposure**: `GEMINI_API_KEY`, `MONGO_URI`, and `JWT_SECRET` are kept strictly on the Node.js server. `.env` files are ignored by Git.
- **Strict Query Sanitization**: AI filter outputs are stripped of dangerous MongoDB operators (`$where`, `$regex`, `$gt`, etc.) and validated against strict allowlists before query execution.
- **Regex Safety**: All user input text queries are escaped using `escapeRegex` to prevent ReDoS attacks.
- **Session Security**: JWT tokens are validated on every private endpoint with token expiration and role authorization middleware.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- MongoDB (Local instance or MongoDB Atlas URI)

### 1. Environment Configuration

Create a `.env` file inside the `server/` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=30m
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash
```

*(Refer to `server/.env.example` for templates).*

---

### 2. Installation & Running Locally

#### Backend Setup:
```bash
cd server
npm install
npm run seed:employees   # Seed initial employee dataset
npm run seed:hr          # Seed supporting HR analytics dataset
npm run dev              # Starts Express API at http://localhost:5000
```

#### Frontend Setup:
```bash
cd client
npm install
npm run dev              # Starts Vite App at http://localhost:5173
```

---

## 🧪 Testing & Verification

Run the automated backend test suites:

```bash
cd server
node scratch/test_employee_api.js    # Core Employee CRUD test suite
node scratch/test_milestone4_api.js  # Search, Filter & Sort test suite
node scratch/test_analytics_api.js   # HR Analytics & Metrics test suite
node scratch/test_auth_api.js        # JWT Auth & Role-Based Access test suite
node scratch/test_ai_search_api.js   # AI Smart Search test suite (36/36 tests)
```

To build the frontend production distribution:
```bash
cd client
npm run build
```

---

## 📡 API Overview

| Endpoint | Method | Access | Description |
|---|---|---|---|
| `/api/auth/register` | POST | Public | User registration |
| `/api/auth/login` | POST | Public | User login & JWT issuance |
| `/api/auth/me` | GET | Protected | Get current user profile |
| `/api/employees` | GET | Protected | Paginated directory listing with filters & search |
| `/api/employees/:id` | GET | Protected | Fetch single employee profile by ID |
| `/api/employees` | POST | HR/Admin | Create new employee |
| `/api/employees/:id` | PUT | HR/Admin | Update employee details |
| `/api/employees/:id/status` | PATCH | HR/Admin | Update employee status |
| `/api/employees/:id` | DELETE | HR/Admin | Soft delete / deactivate employee |
| `/api/analytics/dashboard` | GET | Protected | Consolidated HR analytics metrics |
| `/api/ai/employee-search` | POST | Protected | AI-assisted natural language search |

---

## 💡 Differentiators & Unique Approach

1. **Deterministic Fallback Engine**: If the Gemini API key is missing or offline, PeoplePulse automatically falls back to an in-memory heuristic parser without breaking search functionality.
2. **Robust Role/Skill Separation**: Intelligently separates technical skills (`"react"`) from job roles (`"Developer"`), allowing queries like *"react developers"* to seamlessly match employees with `"Frontend Developer"` or `"Full Stack Developer"` designations who possess `"React"` in their skills array.
3. **Zero Hardcoded Analytics**: All analytics charts, headcount figures, attendance stats, and retention figures are dynamically computed from MongoDB database records.

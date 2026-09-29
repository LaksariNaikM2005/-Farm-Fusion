# 🌾 Farm Fusion

> **Empowering the Future of Agriculture** — A full-stack digital ecosystem connecting farmers, agricultural experts, and government resources through AI, e-commerce, and real-time communication.

[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?logo=node.js)](https://nodejs.org/)
[![FastAPI](https://img.shields.io/badge/AI%20Service-FastAPI%20%2B%20YOLOv8-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📖 Overview

**Farm Fusion** is a premium, all-in-one platform built for the modern agricultural ecosystem. It bridges the gap between farmers, certified experts, and government bodies by combining:

- 🤖 **AI-Powered Crop Disease Detection** using YOLOv8 (YOLO computer vision model)
- 🛒 **A Dynamic Marketplace** for seeds, fertilizers, tools, and organic products
- 💬 **Real-time Expert Consultations** with integrated Socket.IO chat
- 📋 **Government Scheme Listings** for subsidies, loans, and support programs
- 🌐 **Community Forum** for knowledge sharing across the farming community

---

## ✨ Key Features

### 👨‍🌾 For Farmers
| Feature | Description |
|:---|:---|
| **AI Crop Diagnosis** | Upload a photo to instantly detect crop diseases via YOLOv8 |
| **Marketplace** | Browse & purchase agricultural products with Stripe payments |
| **Expert Bookings** | Schedule and manage appointments with certified agronomists |
| **Live Chat** | Real-time messaging with experts powered by Socket.IO |
| **Govt. Schemes** | Explore the latest subsidies, loans, and government programs |
| **Weather & News** | Live weather updates and agricultural news via OpenWeatherMap & News API |

### 👨‍🔬 For Experts
| Feature | Description |
|:---|:---|
| **Appointment Management** | View, accept, and track consultation requests |
| **Consultation History** | Full record of past interactions with farmers |
| **Real-time Chat** | Communicate directly with farmers via integrated messaging |

### 🛡️ For Administrators
| Feature | Description |
|:---|:---|
| **Platform Dashboard** | Monitor all user activity and platform health |
| **User Management** | Manage farmer and expert accounts |
| **Inventory Control** | Add, update, and remove marketplace products |
| **Scheme Management** | Publish and update government scheme listings |

---

## 🛠️ Technology Stack

| Layer | Technology |
|:---|:---|
| **Frontend** | React 18, Vite, Redux Toolkit, React Router v6, Vanilla CSS |
| **Backend** | Node.js, Express.js, MongoDB (Mongoose), JWT Auth, Socket.IO |
| **AI Service** | Python 3.10+, FastAPI, YOLOv8 (Ultralytics), PyTorch |
| **Payments** | Stripe |
| **Media Storage** | Cloudinary |
| **Weather / News** | OpenWeatherMap API, News API |
| **Infrastructure** | Docker, Docker Compose |

---

## 📁 Project Structure

```
FARM FUSION/
├── frontend/              # React + Vite SPA
│   ├── src/
│   │   ├── api/           # Axios API clients
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Route-level page components
│   │   ├── store/         # Redux Toolkit slices & store
│   │   └── App.jsx        # Root app with routing
│   └── package.json
│
├── backend/               # Express.js REST API + Socket.IO
│   ├── config/            # DB connection & config
│   ├── controllers/       # Route handler logic
│   ├── middlewares/       # Auth, error handling
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API route definitions
│   ├── utils/             # Helper utilities
│   └── server.js          # Entry point
│
├── ai-service/            # FastAPI Python microservice
│   ├── models/            # YOLOv8 .pt model files
│   ├── main.py            # FastAPI app & prediction endpoint
│   └── requirements.txt
│
├── docker-compose.yml     # Full-stack container orchestration
├── run_project.bat        # Windows one-click startup script
└── requirements.txt       # Root Python dependencies
```

---

## ⚙️ Local Setup

### Prerequisites

Ensure the following are installed on your machine:

- [Node.js](https://nodejs.org/) v18+
- [Python](https://www.python.org/) v3.10+
- [MongoDB](https://www.mongodb.com/) (local instance or Atlas URI)

---

### Step 1 — Clone & Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd "FARM FUSION"

# Install backend dependencies
npm install --prefix backend

# Install frontend dependencies
npm install --prefix frontend

# Create & activate Python virtual environment (from project root)
python -m venv .venv
.\.venv\Scripts\activate

# Install AI service Python dependencies
pip install -r ai-service/requirements.txt
```

---

### Step 2 — Configure Environment Variables

Create `.env` files in the `backend/` directory using `.env.example` as a template.

```bash
copy backend\.env.example backend\.env
```

**Key backend variables to set:**

| Variable | Description |
|:---|:---|
| `MONGO_URI` | MongoDB connection string (local or Atlas) |
| `JWT_SECRET` | Secret key for JWT token signing |
| `STRIPE_SECRET_KEY` | Stripe secret key for payment processing |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name for image uploads |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `OPENWEATHER_API_KEY` | OpenWeatherMap API key |
| `NEWS_API_KEY` | News API key |

---

### Step 3 — Run the Application

You need **3 separate terminals** to run all services simultaneously.

#### 🖥️ Terminal 1 — Backend API (Port 5000)

```bash
npm run dev --prefix backend
# API running at: http://localhost:5000
```

#### 🤖 Terminal 2 — AI Microservice (Port 8000)

```bash
# Activate the virtual environment first
.\.venv\Scripts\activate

# Run from the project ROOT directory
python ai-service/main.py
# AI Service running at: http://localhost:8000
```

> ⚠️ **Important:** Always run the AI service from the **project root**, not from inside `ai-service/`. Running `uvicorn app.main:app` from inside `backend/` will fail with `ModuleNotFoundError`.

#### 🌐 Terminal 3 — Frontend (Port 5173)

```bash
npm run dev --prefix frontend
# App running at: http://localhost:5173
```

#### ⚡ One-Click Start (Windows)

Alternatively, use the provided batch script to start all services at once:

```bash
run_project.bat
```

---

## 🧪 Demo Credentials

Use these credentials to explore the platform without registration:

| Role | Email | Password |
|:---|:---|:---|
| 👨‍🌾 **Farmer** | farmer@demo.com | `password123` |
| 👨‍🔬 **Expert** | expert@demo.com | `password123` |
| 🛡️ **Admin** | admin@demo.com | `password123` |

---

## 🐳 Docker Setup (Optional)

To run the entire stack with Docker:

```bash
docker-compose up --build
```

This will spin up the frontend, backend, and AI service as isolated containers.

---

## 🛡️ Troubleshooting

| Issue | Solution |
|:---|:---|
| `ModuleNotFoundError: No module named 'app'` | Run `python ai-service/main.py` from the **project root**, not from `backend/` |
| `EADDRINUSE :::5000` | Another process is using port 5000. Run `netstat -ano \| findstr :5000` and kill it |
| Port conflicts (5000, 5173, 8000) | Ensure all three ports are free before starting services |
| AI model not loading | Confirm `.pt` model files exist inside `ai-service/models/` |
| MongoDB connection error | Verify your `MONGO_URI` in `backend/.env` is correct and DB is running |
| Cloudinary upload failing | Double-check `CLOUDINARY_CLOUD_NAME`, `API_KEY`, and `API_SECRET` in `.env` |

---

## 📜 License

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for more information.

---

<div align="center">
  Developed with ❤️ by the <strong>Farm Fusion Team</strong>
</div>

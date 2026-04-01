# Hospital Queue Management System 🏥

Production-ready real-time system with AI wait time prediction.

## Tech Stack
- **Frontend**: React + Tailwind + Socket.io + Vite
- **Backend**: Node/Express + Socket.io + MongoDB/Mongoose
- **AI**: Python/FastAPI + Simple prediction model

## 🚀 Quick Start (Production-Ready MVP)

### 1. Prerequisites
```bash
# MongoDB (local or MongoDB Atlas)
# Node.js 18+, Python 3.10+
```

### 2. Clone & Install
```bash
git clone <repo>
cd hc-01--main
```

### 3. Backend (server/)
```bash
cd server
npm install
cp .env.example .env  # Set MONGO_URI, AI_URL=http://localhost:8001
npm run dev
```
Port: 5000

### 4. AI Service (ai/)
```bash
cd ai
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

### 5. Frontend (client/)
```bash
cd client
npm install
npm run dev
```
Port: 3000

### 6. Access Panels
- Reception: http://localhost:3000/reception
- Doctor: http://localhost:3000/doctor
- Display: http://localhost:3000/display

## 📊 Features
- Real-time token generation & queue updates
- Doctor queue management (call next, complete)
- Live display board with estimated wait times
- AI-powered wait time prediction

## 🗄️ MongoDB Schema
Tokens: `{ tokenNumber, status, createdAt, calledAt, completedAt }`

## Scripts
```bash
# Backend prod
npm run start  # PM2 or similar

# Client build
npm run build
npm run preview
```

## .env Variables
```
MONGO_URI=mongodb://localhost:27017/hospital-queue
AI_URL=http://localhost:8001
PORT=5000
```

Built by BLACKBOXAI 🖤

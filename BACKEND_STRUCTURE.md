# Hospital Queue Backend Structure & Integration Guide 🖥️

This document provides the complete backend structure, available features, frontend/database connections, and anti-spam measures. Use this as a **prompt context** for AI agents.

## 🏗️ Project Structure
```
server/
├── server.js (or server.ts)          # Express entrypoint
├── socketHandler.js                  # Socket.IO real-time
├── config/
│   └── database.js                   # MongoDB connection
├── middleware/
│   ├── errorHandler.js              # Global errors
│   ├── rateLimiter.js               # Anti-spam (60/min, 10/min tokens)
│   └── validate.js                  # Input validation
├── models/                           # Mongoose schemas
│   ├── Token.js
│   ├── DoctorSession.js
│   ├── QueueState.js
│   ├── EmergencyCase.js
│   └── DailySummary.js
├── routes/                           # REST API
│   ├── tokenRoutes.js
│   ├── doctorRoutes.js
│   ├── emergencyRoutes.js
│   └── summaryRoutes.js
└── services/                         # Business logic
    ├── queueService.js
    ├── aiService.js (proxies to Python AI)
    └── summaryService.js
```

## 🔌 Frontend Integration
- **Proxy**: client/vite.config.js proxies `/api` & `/socket.io` to `http://localhost:5000`
- **API Client**: client/src/services/api.js (axios with interceptors)
- **Socket Client**: client/src/services/socket.js → real-time queue updates
- **URLs**:
  ```
  Production: VITE_API_URL = https://hospital-queue-api.onrender.com/api
  Local: http://localhost:5000/api
  ```

## 🗄️ Database (MongoDB)
- **Connection**: server/config/database.js → MongoDB Atlas/local
- **.env**:
  ```
  MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/hospital-queue
  PORT=5000
  AI_URL=http://localhost:8001
  CORS_ORIGIN=http://localhost:3000
  ```
- **Models** (5 schemas, full relations):

| Model | Fields | Purpose |
|-------|--------|---------|
| **Token** | tokenNumber, patientName, priority, status ('waiting','called','completed','cancelled'), timestamps | Core queue tokens |
| **DoctorSession** | doctorId, startTime, endTime, tokensHandled | Doctor login/tracking |
| **QueueState** | currentServing, patientsAhead, estimatedWait | Live queue snapshot |
| **EmergencyCase** | caseId, patientName, condition, selectedHospital, lat/lng, timestamp | Emergency logs |
| **DailySummary** | date, totalTokens, avgWaitTime, peakHours | Analytics |

## 🚀 Available Features / Routes

### 1. **Token Management** (`/api/tokens`)
| Method | Endpoint | Features | Rate Limit |
|--------|----------|----------|------------|
| POST | `/` | Create token (name, priority) | **10/min** anti-spam |
| GET | `/` | Live queue list | - |
| GET | `/:id` | Token details | - |
| PATCH | `/:id/call` | Doctor calls next | Auth required |
| PATCH | `/:id/complete` | Complete consultation | Auth |
| PATCH | `/:id/cancel` | Cancel token | Creator only |

### 2. **Doctor** (`/api/doctor`)
| POST | `/session/start` | Doctor login |
| POST | `/call-next` | Call next patient |
| POST | `/complete/:tokenNumber` | Mark complete |
| GET | `/session` | Current session |

### 3. **Emergency** (`/api/emergency`)
| POST | `/redirect` | AI hospital recs (condition, lat/lng) |
| POST | `/select` | Log hospital selection |
| GET | `/nearby?lat=&lng=` | Nearby hospitals |

### 4. **Analytics** (`/api/summary`)
| GET | `/` | Live stats |
| GET | `/daily` | Daily summaries |
| GET | `/:date` | Date-specific |

### 5. **Real-time Sockets** (Socket.IO)
- `join 'queue-room'`: Live token updates (Display/Reception)
- `join 'doctor-room'`: Call notifications
- Events: `token:created`, `token:called`, `token:completed`, `queue:updated`

## 🛡️ Anti-Spam & Production Ready
- **Rate Limiting**: `middleware/rateLimiter.js`
  - Global: 60 req/min
  - Token creation: **10/min** (prevents spam)
  - Per-IP tracking
- **Input Validation**: Joi-like in `validate.js`
- **Error Handling**: Centralized `errorHandler.js`
- **CORS**: Configured for frontend origins

## 🏃‍♂️ Setup & Run
```bash
cd server
npm install
# Copy .env.example → .env (set MONGO_URI)
npm run dev  # Nodemon on port 5000
```

## 🔗 Full Stack Flow
```
Frontend (3000) → Proxy /api → Backend (5000) → MongoDB + AI (8001)
                    ↓ Real-time
Socket.IO ← Queue updates → All panels live sync
```

**Copy this entire document into your frontend prompt for seamless integration!** 

Built with production middleware. No spam possible.


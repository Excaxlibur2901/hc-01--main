# HC-01 Hospital OPD Digital Queue & Wait Time Estimator
## Product Requirements Document (PRD) + 24-Hour Hackathon Execution Plan

---

# 1. Product Overview

## Product Name
Hospital OPD Digital Queue & Wait Time Estimator

## Goal
Build a browser-based real-time queue management system for hospital OPD departments that:
- Generates patient tokens
- Tracks patient status
- Shows live queue updates
- Predicts waiting time dynamically
- Displays current token and next token on a public screen
- Requires no installation and works on any monitor or browser

The project should solve the real problem of long waiting times and confusion in government hospital OPDs.

---

# 2. Problem Statement

Most hospitals still use manual OPD queue handling:
- Patients do not know their expected waiting time
- Staff repeatedly answer the same questions
- Doctors lose time calling patients manually
- There is no visibility into queue status
- Delays create crowding and frustration

The system must reduce confusion, improve transparency, and help both patients and staff.

---

# 3. Core Users

## 1. Receptionist
Responsibilities:
- Register patient
- Issue token
- Assign department/doctor
- Mark patient status
- Handle skipped or emergency patients

## 2. Doctor
Responsibilities:
- View current queue
- Call next patient
- Mark consultation started/completed
- Pause or resume queue

## 3. Patient / Waiting Area Display
Responsibilities:
- View live token number
- View estimated waiting time
- Know which patient is being served
- Hear/see alert when token is called

## 4. Admin (Optional Advanced Role)
Responsibilities:
- View all doctors and queues
- Reset queue
- Export reports
- Manage OPD departments

---

# 4. Success Criteria

The demo is successful only if:
- Reception generates a token
- Doctor screen instantly receives it
- Public display updates live in under 1 second
- Wait time changes dynamically as queue changes
- Doctor calls next patient and patient display changes immediately
- Demo works reliably without page refresh

---

# 5. Product Scope

## Must-Have Scope (Hackathon MVP)

### Reception Panel
- Create patient
- Generate token number automatically
- Select doctor/department
- Add patient name, age, mobile number
- Mark status:
  - Waiting
  - Called
  - In Consultation
  - Completed
  - Skipped
- Emergency priority checkbox
- Search token or patient

### Doctor Panel
- See live queue for assigned doctor
- Current token
- Next 3 waiting patients
- Call next patient
- Mark consultation complete
- Skip patient
- Pause queue
- Show average consultation time

### Patient Display Panel
- Large current token display
- Doctor name / Room number
- Estimated wait time
- “Up Next” tokens
- Auto-refresh via WebSocket
- Sound alert when token changes
- Full-screen TV-friendly layout

### Backend Requirements
- WebSocket-based live updates
- Token history storage
- Wait time estimation logic
- Daily summary endpoint

---

# 6. Extra Features That Actually Matter

Most hackathon teams will stop at token generation. That is weak and predictable. If you only build that, you will look like every other team.

To stand out, add features that solve real hospital chaos.

## Priority Feature 1: Dynamic Wait Time Prediction
Instead of fixed average wait time, calculate:

Estimated Wait Time =
(Number of waiting patients before current token × average consultation time)
+ current consultation delay

Improve further by:
- Separate average for each doctor
- Separate average by patient type (new / revisit)
- Auto-adjust when doctor is delayed

## Priority Feature 2: Emergency Queue Override
- Emergency patients can jump queue
- Emergency token appears highlighted in red
- Existing patients are automatically shifted down

## Priority Feature 3: Missed Token Recovery
If patient misses token:
- Mark as “Skipped”
- Keep in secondary queue
- Reception can reinsert patient later

## Priority Feature 4: SMS / WhatsApp Ready Architecture
Even if you do not implement actual SMS, keep a backend event ready:
- “Your token is 12. Approx wait: 20 min”
- “Your turn is next”

This gives future scalability in presentation.

## Priority Feature 5: Analytics Dashboard
Mini dashboard for judges:
- Total patients today
- Average wait time
- Average consultation time
- Number skipped
- Busiest doctor
- Peak hour graph

## Priority Feature 6: Department-Based Queue
Example:
- General OPD
- Skin
- Dental
- Pediatrics

Each doctor gets a separate live queue.

## Priority Feature 7: Multi-Screen Display
- One screen per doctor
- One hospital-wide display
- Doctor-specific URL like:
  - /display/general
  - /display/dental

## Priority Feature 8: Voice Announcement
When token changes:
“Token 24, please proceed to Room 3”

Can be implemented using browser SpeechSynthesis.

## Priority Feature 9: Dark Mode + Accessibility
- Large fonts
- Color coding
- Voice support
- High contrast mode

Judges notice polished usability immediately.

---

# 7. Non-Functional Requirements

- Response time below 1 second
- Works on laptop + TV screen
- Browser only, no installation
- Supports at least 500 patients/day
- Handles multiple doctors simultaneously
- Works even if one browser refreshes
- Mobile responsive for receptionist

---

# 8. Suggested Tech Stack

The fastest stack for a 24-hour hackathon is:

## Frontend
- React + Vite
- Tailwind CSS
- React Router
- Socket.io Client
- Recharts (for analytics)

## Backend
- Node.js + Express
- Socket.io
- MongoDB Atlas

## Deployment
- Frontend: Vercel / Netlify
- Backend: Render / Railway
- Database: MongoDB Atlas

Do not waste time building complex auth, microservices, Docker, Kubernetes, or perfect architecture. That is ego, not strategy. You have 24 hours.

---

# 9. High-Level System Architecture

```text
Reception Panel ─┐
                 ├── Backend API + Socket.io ─── MongoDB
Doctor Panel ────┤
                 └── Patient Display Panel
```

Data flow:
1. Reception creates token
2. Backend stores token
3. Socket event emitted
4. Doctor panel receives new patient instantly
5. Display panel updates immediately
6. Doctor changes status
7. Display changes again in real time

---

# 10. Data Model

## Patient Collection

```json
{
  "_id": "",
  "tokenNumber": 12,
  "patientName": "Rahul Patil",
  "age": 42,
  "gender": "Male",
  "mobile": "9876543210",
  "doctorId": "doctor_1",
  "department": "General",
  "priority": "normal",
  "status": "waiting",
  "createdAt": "",
  "calledAt": "",
  "consultationStart": "",
  "consultationEnd": "",
  "estimatedWait": 18
}
```

## Doctor Collection

```json
{
  "_id": "doctor_1",
  "name": "Dr. Mehta",
  "department": "General",
  "room": "Room 2",
  "avgConsultationTime": 6,
  "isAvailable": true
}
```

---

# 11. API Requirements

## Reception APIs

### Create Patient Token
`POST /api/patients`

Body:
```json
{
  "patientName": "Rahul",
  "age": 35,
  "doctorId": "doctor_1",
  "priority": "normal"
}
```

### Get Queue
`GET /api/queue/:doctorId`

### Update Patient Status
`PATCH /api/patients/:id/status`

### Reinsert Skipped Token
`PATCH /api/patients/:id/rejoin`

---

## Doctor APIs

### Call Next Patient
`POST /api/doctors/:doctorId/next`

### Complete Consultation
`POST /api/patients/:id/complete`

### Pause Queue
`PATCH /api/doctors/:doctorId/pause`

---

## Analytics APIs

### Daily Summary
`GET /api/analytics/today`

Response:
```json
{
  "totalPatients": 123,
  "avgWait": 18,
  "avgConsultation": 7,
  "skipped": 12
}
```

---

# 12. Socket Events

```text
queue_updated
patient_called
patient_completed
patient_skipped
doctor_paused
wait_time_changed
```

Example:

```javascript
socket.emit("queue_updated", updatedQueue)
```

---

# 13. UI Requirements

## Reception Panel Layout

Left Side:
- Patient registration form

Right Side:
- Queue table
- Token number
- Status color

Color Codes:
- Waiting = Blue
- Called = Orange
- In Consultation = Purple
- Completed = Green
- Emergency = Red

---

## Doctor Panel Layout

Top:
- Doctor name
- Current token
- Average consultation time

Center:
- Next patient queue list

Bottom:
- Buttons:
  - Call Next
  - Skip
  - Complete
  - Pause Queue

---

## Patient Display Layout

Large center token:
- Current token number
- Room number

Bottom section:
- Next 3 tokens
- Estimated waiting time

Full-screen optimized.

---

# 14. Suggested Folder Structure

```text
project/
├── client/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   ├── socket/
│   │   └── routes/
│
├── server/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── services/
│   ├── sockets/
│   ├── utils/
│   └── config/
```

---

# 15. 24-Hour Execution Plan

You already lost 6 hours. If you continue discussing instead of building, you will fail. Stop optimizing imaginary future architecture.

## Hour 0–1
- Finalize features
- Create GitHub repo
- Create Figma rough wireframe
- Split work between team

## Hour 1–4
Backend person:
- Setup Express + MongoDB + Socket.io
- Build patient APIs
- Build doctor APIs

Frontend person 1:
- Reception Panel

Frontend person 2:
- Doctor Panel + Patient Display

## Hour 4–7
- Connect frontend with backend
- Add live socket updates
- Implement queue flow

## Hour 7–10
- Build wait time estimator
- Add emergency + skip feature
- Add analytics dashboard

## Hour 10–14
- Fix bugs
- Polish UI
- Add full-screen display
- Add voice announcement

## Hour 14–18
- Deploy frontend + backend
- Test on multiple tabs/devices

## Hour 18–22
- Create README
- Add screenshots
- Record demo video

## Hour 22–24
- Final testing
- Prepare pitch
- Practice 30-second live demo

---

# 16. Demo Script for Judges

1. Reception creates Patient A
2. Token instantly appears on doctor screen
3. Doctor clicks “Call Next”
4. Patient display updates immediately
5. Estimated wait time changes automatically
6. Add emergency patient
7. Emergency token jumps to top
8. Show analytics dashboard
9. Show that all panels work in real time without refresh

The live update is your strongest moment. Spend most effort making that flawless.

---

# 17. Biggest Mistakes To Avoid

- Trying to build login/auth first
- Overengineering database design
- Spending hours on UI animations
- Building mobile app instead of web app
- Making wait time static
- Forgetting live socket updates
- Not preparing demo script
- Leaving deployment for the end

---

# 18. Final Recommended MVP + Stretch Features

## Final MVP
- Reception Panel
- Doctor Panel
- Patient Display Panel
- Live Socket Update
- Dynamic Wait Time
- Emergency Token

## Stretch Features
- Voice announcement
- Analytics dashboard
- Rejoin skipped token
- Department-wise queue
- WhatsApp-ready notifications
- Dark mode

If time becomes short, cut fancy things immediately and protect the core live queue flow. A simple system that works in real time will beat an ambitious system that breaks during demo.


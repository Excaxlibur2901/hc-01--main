# Backend Use Cases

This file defines the backend use cases implemented in the current server codebase (`server/routes/*`, `server/services/*`).

## UC-01: Register Patient Token
- Actor: Receptionist
- Endpoint: `POST /api/tokens`
- Purpose: Create a new OPD token for a patient.
- Request body:
  - `patientName` (required, string)
  - `age` (optional, number)
  - `condition` (optional, string)
  - `priority` (optional: `general | senior | emergency`)
  - `department` (optional, string)
- Validation rules:
  - `patientName` is required and max 100 chars.
  - `age` must be between 0 and 150.
  - `priority` must be valid if provided.
- Business behavior:
  - Generates next daily token number atomically.
  - Stores token in MongoDB with `status=waiting`.
  - Computes initial estimated wait.
  - Emits socket updates (`token_created`, `queue_updated`).
- Success response: `{ success: true, data: <token> }`.

## UC-02: View Live Queue
- Actor: Receptionist, Doctor, Display Board
- Endpoint: `GET /api/tokens`
- Purpose: Fetch all active tokens for today.
- Business behavior:
  - Includes tokens with statuses `waiting`, `in-progress`, `done`.
  - Priority-aware sorting (`emergency` first, then `senior`, then `general`).
  - Dynamically recalculates waiting position and wait time.
- Success response: `{ success: true, data: <token[]> }`.

## UC-03: Get Token Details
- Actor: Receptionist/Doctor
- Endpoint: `GET /api/tokens/:id`
- Purpose: View one token by MongoDB id.
- Success response: `{ success: true, data: <token|null> }`.

## UC-04: Cancel Token
- Actor: Receptionist
- Endpoint: `PATCH /api/tokens/:id/cancel`
- Purpose: Mark a token as cancelled.
- Business behavior:
  - Sets `status=cancelled`, stores `cancelledAt`.
  - Updates queue-state counters.
  - Emits queue updates.
- Success response: `{ success: true, data: <token> }`.

## UC-05: Start Doctor Session
- Actor: Doctor
- Endpoint: `POST /api/doctor/session/start`
- Purpose: Start active doctor shift/session.
- Request body:
  - `doctorName` (required)
  - `department` (optional)
- Business behavior:
  - Ends any existing active session.
  - Creates new active session.
- Success response: `{ success: true, data: <doctorSession> }`.

## UC-06: Get Active Doctor Session
- Actor: Doctor Panel
- Endpoint: `GET /api/doctor/session`
- Purpose: Fetch current active doctor session.
- Success response: `{ success: true, data: <doctorSession|null> }`.

## UC-07: End Doctor Session
- Actor: Doctor
- Endpoint: `POST /api/doctor/session/end`
- Purpose: Stop the active doctor session.
- Success response: `{ success: true, data: <doctorSession> }`.

## UC-08: Call Next Patient
- Actor: Doctor
- Endpoint: `POST /api/doctor/call-next`
- Purpose: Move next waiting token to consultation.
- Business behavior:
  - Picks next token by priority order (`emergency`, `senior`, `general`) and FIFO within priority.
  - Sets token `status=in-progress`, sets `calledAt`.
  - Emits socket updates (`patient_called`, `queue_updated`).
- Success response: `{ success: true, data: <token> }`.

## UC-09: Complete Consultation
- Actor: Doctor
- Endpoint: `POST /api/doctor/complete/:tokenNumber`
- Purpose: Mark in-progress token as completed.
- Business behavior:
  - Sets `status=done`, sets `completedAt`.
  - Computes `consultationDuration` in minutes.
  - Updates queue-state and session analytics.
  - Emits socket updates (`consultation_complete`, `queue_updated`).
- Success response: `{ success: true, data: <token> }`.

## UC-10: Live Summary Stats
- Actor: Reception, Doctor, Admin, Display
- Endpoint: `GET /api/summary`
- Purpose: Get today live metrics.
- Metrics include:
  - `totalTokens`, `waiting`, `inProgress`, `completed`, `emergencies`, `avgConsultTime`, `avgWaitTime`.
- Success response: `{ success: true, data: <stats> }`.

## UC-11: Daily Summary Snapshot
- Actor: Admin/Analytics
- Endpoint: `GET /api/summary/daily`
- Purpose: Generate and read today analytics snapshot.
- Success response: `{ success: true, data: <dailySummary> }`.

## UC-12: Date-based Summary
- Actor: Admin/Analytics
- Endpoint: `GET /api/summary/:date`
- Purpose: Read summary for date (`YYYY-MM-DD`).
- Success response: `{ success: true, data: <dailySummary> }`.

## UC-13: Emergency AI Redirect
- Actor: Emergency Desk
- Endpoint: `POST /api/emergency/redirect`
- Purpose: Suggest best nearby hospitals by condition + location.
- Request body:
  - `patientName` (required)
  - `condition` (required)
  - `lat`, `lng` (optional)
- Business behavior:
  - Ranks hospitals by distance, specialization fit, and availability.
  - Stores emergency case record.
- Success response: `{ success: true, data: { caseId, bestHospital, allSuggestions, detectedSpecialization } }`.

## UC-14: List Nearby Hospitals
- Actor: Emergency Desk
- Endpoint: `GET /api/emergency/nearby?lat=&lng=`
- Purpose: Fetch nearby hospital list by coordinates.
- Success response: `{ success: true, data: <hospital[]> }`.

## UC-15: Confirm Redirected Hospital
- Actor: Emergency Desk
- Endpoint: `POST /api/emergency/select`
- Purpose: Save selected hospital for a case.
- Request body:
  - `caseId`, `hospitalName`, `hospitalDistance`, `hospitalAddress`
- Success response: `{ success: true, data: <emergencyCase> }`.

## Socket Use Cases

### S-01: Subscribe to Queue Room
- Transport: Socket.IO
- Room: `queue-room`
- Client action: emit `join_room` with room name.

### S-02: Receive Real-time Queue Events
- Events emitted by backend:
  - `token_created`
  - `patient_called`
  - `consultation_complete`
  - `queue_updated`
  - `wait_time_updated`
- Purpose: Keep Reception, Doctor, and Display screens in sync without manual refresh.

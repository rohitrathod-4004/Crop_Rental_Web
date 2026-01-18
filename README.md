# Agricultural Equipment Rental Platform

A MERN stack platform connecting farmers with equipment owners through transparent, digital rental and service booking.

## Project Structure

```
PCCOE_hackathon/
├── backend/          # Node.js + Express backend
└── frontend/         # React + Vite frontend
```

## Features

- **Role-based Authentication** (Farmer, Owner, Admin)
- **Equipment Rental** (Slot-based booking)
- **Service Booking** (Time-based with operator)
- **Owner Verification** (Admin-approved)
- **Payment Integration** (Razorpay test mode)
- **Evidence-based Tracking** (Photos, GPS, meter readings)
- **Dispute Resolution** (Admin-mediated)
- **Ratings & Reviews**

## Tech Stack

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Cloudinary (Image uploads)
- Razorpay (Payments)

### Frontend
- React.js (Vite)
- React Router
- Axios
- Context API

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your API URL
npm run dev
```

## Environment Variables

See `.env.example` files in both backend and frontend directories.

## Documentation

- Architecture: See planning documents in `.gemini/antigravity/brain/` folder
- API Endpoints: Documented in architecture.md
- Database Schema: Documented in architecture.md

## License

ISC

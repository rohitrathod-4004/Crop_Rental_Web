# Agricultural Equipment Rental Platform

[![Deployed on Render](https://render.com/images/server-anchor-url.svg)](https://render.com)

A MERN stack platform connecting farmers with equipment owners through transparent, digital rental and service booking.

## Project Structure

```
PCCOE_hackathon/
├── backend/          # Node.js + Express backend
├── frontend/         # React + Vite frontend
└── render.yaml       # Render Infrastructure as Code (IaC)
```

## Features

- **Role-based Authentication** (Farmer, Owner, Admin)
- **Equipment Rental** (Slot-based booking)
- **Service Booking** (Time-based with operator)
- **Real-time Availability**
- **Owner Verification** (Admin-approved)
- **Secure Payments** (Razorpay integration)
- **Dispute Resolution System**
- **Responsive Design**

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Auth**: JWT & bcrypt
- **Storage**: Cloudinary
- **Payments**: Razorpay

### Frontend
- **Framework**: React.js (Vite)
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB connection string
- Cloudinary account
- Razorpay test account

### Local Development

1.  **Clone the repository**
    ```bash
    git clone <your-repo-url>
    cd PCCOE_hackathon
    ```

2.  **Backend Setup**
    ```bash
    cd backend
    npm install
    cp .env.example .env
    # Update .env with your credentials
    npm run dev
    ```

3.  **Frontend Setup**
    ```bash
    cd frontend
    npm install
    # Update .env with VITE_API_BASE_URL=http://localhost:5000/api
    npm run dev
    ```

## Deployment

This project is configured for seamless deployment on **Render**.

See [deployment_guide.md](./deployment_guide.md) for detailed instructions.

### Quick Deploy
1. Push your code to GitHub.
2. Link your repo to Render.
3. Use the `render.yaml` Blueprint.

## License

ISC

# DAY SPIRE - Local Tourist Day Visit Planner for Akkaraipattu
**ITE2953 Programming Group Project (University of Moratuwa)**
**Developer:** MF.Suatha (E2410059)

---

## 📁 Clean Folder Structure

```text
DAY SPIRE/
├── backend/                       # Node.js + Express + MongoDB Backend (JavaScript)
│   ├── config/
│   │   └── db.js                  # Mongoose Connection to MongoDB Atlas
│   ├── models/
│   │   ├── Place.js               # Place Schema (SRS Table 6.1, DR-03 min: 0)
│   │   ├── Itinerary.js           # Itinerary Schema (FR-032)
│   │   └── Category.js            # Category Schema (FR-008)
│   ├── .env.example               # MongoDB Connection URI template
│   ├── package.json               # Backend npm dependencies (express, mongoose, cors)
│   └── server.js                  # Clean REST API Endpoints (GET, POST, PUT, DELETE)
│
├── src/                           # Frontend React Application
│   ├── components/                # Modular UI Components (Navbar, Explore, Planner, Admin, Map, etc.)
│   ├── context/
│   │   └── PlannerContext.tsx     # Central State & REST API Integration (/api/places, /api/itineraries)
│   ├── data/
│   │   └── initialPlaces.ts       # 10 Verified Places within 25km (Proposal Table 3)
│   ├── utils/
│   │   ├── navigation.ts          # Google Maps Multi-stop routing helper
│   │   └── pdfExport.ts           # jsPDF Itinerary generator
│   ├── App.tsx                    # Main View Routing & Shell
│   ├── main.tsx                   # React DOM Entry
│   └── index.css                  # Global Tailwind CSS styles
│
├── index.html                     # Frontend HTML Entry
├── vite.config.ts                 # Vite Frontend Build Configuration
├── tsconfig.json                  # TypeScript Compiler Configuration
└── package.json                   # Root Fullstack dependencies & scripts
```

---

## 🚀 How to Run in VS Code

### Option 1: Full-Stack Mode (Single Terminal - Recommended)
1. Open the project root in VS Code terminal:
   ```bash
   npm install
   npm run dev
   ```
2. Open `http://localhost:3000` in your browser. (Both React frontend and Express REST API run seamlessly together).

---

### Option 2: Dedicated Backend & Frontend Terminals

#### Step 1: Start Backend (Terminal 1)
```bash
cd backend
npm install
node server.js
```
*(Runs backend REST API on `http://localhost:5000` with MongoDB Atlas)*

#### Step 2: Start Frontend (Terminal 2)
```bash
npm install
npm run dev
```
*(Runs frontend on `http://localhost:3000`)*


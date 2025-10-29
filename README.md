#🌱 footprint-logger-ui

A full-stack web application that helps users track, analyze, and reduce their daily carbon emissions.
Built for a local environmental initiative to encourage sustainable habits through data-driven insights, weekly goals, and real-time feedback.

#🚀 Features
#🧾 Activity Tracking

Log daily activities (e.g., car travel, meat consumption, electricity use)

Automatically assigns estimated CO₂ emission values

Filter by category: Food, Transport, Energy

Persistent user sessions via localStorage and backend API

#💡 Insight Engine

Analyzes user activity logs on login or weekly

Identifies your highest-emission category

Tracks weekly reduction goals

#📊 Visualization

Displays emissions data via bar or pie charts (using Chart.js)

“Weekly Goal” section updates dynamically as user logs new activities

#🧩 Tech Stack
Layer	Technology
Frontend	HTML, CSS, JavaScript, Webpack
Backend	Node.js, Express.js
Real-time	Socket.io (WebSockets)
Database	Lightweight file-based or JSON (via /models/db.js)
Charts	Chart.js
Auth	Basic login/register with JWT or session cookies
Dev Tools	concurrently, npm-run-all
Deployment	Render (Free Tier)

#🗂️ Project Structure
project-root/
│
├── frontend/
│   ├── static/
│   │   ├── js/
│   │   │   ├── auth.js
│   │   │   └── script.js
│   │   └── css/
│   │       ├── login.css
│   │       ├── register.css
│   │       └── script.css
│   ├── public/
│   │   ├── login.html
│   │   ├── register.html
│   │   ├── index.html
│   │   └── home.html
│   ├── dist/                    # Webpack output
│   ├── webpack.config.js
│   ├── .env
│   └── package.json
│
├── backend/
│   ├── app.js                   # Express + Socket.io entry point
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── activityRoutes.js
│   ├── models/
│   │   └── db.js                # Local DB or data handler
│   ├── .env
│   └── package.json
│
├── package.json                 # Root runner (uses concurrently + npm-run-all)
└── README.md

#⚙️ Installation & Local Development
### Clone the repository
git clone https://github.com/your-username/carbon-tracker.git
cd carbon-tracker

### Install all dependencies

At the project root (not inside frontend/backend):

npm install

This will install dependencies in both frontend/ and backend/ via npm-run-all.

### Environment Setup

Create .env files in both folders:

frontend/.env
BACKEND_URL=http://localhost:5000

backend/.env
PORT=5000
JWT_SECRET=your-secret-key

### Run the app locally
npm start


This will:

Run the frontend build via Webpack

Start both the frontend and backend concurrently

Default ports:

Frontend → http://localhost:3000

Backend → http://localhost:5000

#🧠 Insight Engine Logic

The backend (backend/app.js) handles:

User authentication (register/login)

Activity logging via activityRoutes.js

Emission analysis (sum by category)

Weekly insight generation and real-time updates via Socket.io

When a user logs in:

The backend identifies their highest emission source

Generates a personalized goal or tip

Sends it via WebSocket to update the frontend dashboard

### Build Command:

npm install && npm run build


### Start Command:

npm start

### Environment → Add Environment Variable:

Key	Example Value
PORT	5000
BACKEND_URL http://localhost:5000
JWT_SECRET	your-secret-key

#👨‍💻 Author

Developed by GEE-MM94 for a local environmental organization 🌿
Helping individuals make data-driven, sustainable choices.

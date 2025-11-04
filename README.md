# 🌱 Footprint Logger UI

A full-stack web application that helps users **track, analyze, and reduce their daily carbon emissions**.  
Built for a local environmental initiative to encourage sustainable habits through **data-driven insights**, **weekly goals**, and **real-time feedback**.

---

## 🚀 Features

### 🧾 Activity Tracking

- Log daily activities (e.g., car travel, meat consumption, electricity use)
- Automatically assigns estimated CO₂ emission values
- Filter by category: **Food**, **Transport**, **Energy**
- Persistent user sessions via **localStorage** and backend **API**

### 💡 Insight Engine

- Analyzes user activity logs on login or weekly
- Identifies your **highest-emission category**
- Tracks **weekly reduction goals**

### 📊 Visualization

- Displays emissions data using **bar** or **pie charts** (powered by Chart.js)
- “Weekly Goal” section updates dynamically as users log new activities

---

## 🧩 Tech Stack

| Layer          | Technology                                           |
| -------------- | ---------------------------------------------------- |
| **Frontend**   | HTML, CSS, JavaScript, Webpack                       |
| **Backend**    | Node.js, Express.js                                  |
| **Real-time**  | Socket.io (WebSockets)                               |
| **Database**   | Lightweight JSON or file-based (via `/models/db.js`) |
| **Charts**     | Chart.js                                             |
| **Auth**       | Basic login/register with JWT or session cookies     |
| **Dev Tools**  | concurrently, npm-run-all                            |
| **Deployment** | Render (Free Tier)                                   |

---

## ⚙️ Installation & Local Development

### 1. Clone the repository

```bash
git clone https://github.com/GEE-MM94/footprint-logger-ui.git
cd footprint-logger-ui
```

### 3. Environment Setup

Create two .env files — one for the frontend and one for the backend.

#### frontend/.env

```
BACKEND_URL=http://localhost:5000
```

#### backend/.env

```
MONGO_URI=""
DB_NAME=""
PORT=5000
JWT_SECRET=secret-key
```

### Build Command:

```
npm install && npm run build
```

### Start Command:

```
npm start
```

#👨‍💻 Author

Developed by GEE-MM94 for a local environmental organization 🌿
Helping individuals make data-driven, sustainable choices.

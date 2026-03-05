# 🚀 Valorous 2K26 — TechFest Website

**Official TechFest of Marri Laxman Reddy Institute of Technology and Management, Hyderabad**

---

## 📁 Project Structure

```
valorous2k26/
├── index.html          ← Landing Page (Home)
├── events.html         ← Events Page (all 27+ events, search & filter)
├── admin.html          ← Admin Dashboard (login: admin / valorous2k26)
│
└── backend/
    ├── server.js       ← Express.js REST API
    ├── package.json
    └── .env.example    ← Copy to .env and configure
```

---

## 🌐 Frontend Pages

### 1. `index.html` — Landing Page
- Animated hero with live countdown timer to April 15, 2026
- Dark neon theme with grid background and glow orbs
- Sections: About College · About Fest · Departments · Highlights
- Smooth scroll reveal animations
- Fully responsive (mobile/tablet/desktop)

### 2. `events.html` — Events Page
- 27 events across 9 departments (CSE, IT, CSD, CSM, CSC, ECE, EEE, MECH, CIVIL)
- Live search bar — search by event name, department, or description
- Department filter buttons
- Event detail modal with full info (rules, coordinator, venue, prize)
- Registration form (saves locally; connects to MongoDB via backend)

### 3. `admin.html` — Admin Dashboard
- Login: **admin** / **valorous2k26**
- Add / Edit / Delete events
- View all registrations
- Analytics charts (events per dept, registrations chart)
- Stats: total events, registrations, departments, prize pool

---

## ⚙️ Backend Setup (Node.js + MongoDB)

### Prerequisites
- Node.js v18+
- MongoDB (local) or MongoDB Atlas (cloud)

### Installation

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env and set your MONGO_URI and JWT_SECRET
```

### Running the Server

```bash
# Production
npm start

# Development (auto-restart)
npm run dev
```

Server runs on: `http://localhost:5000`

---

## 🔌 API Endpoints

### Events
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/events` | Get all events |
| GET | `/api/events?dept=CSE` | Filter by department |
| GET | `/api/events/:id` | Get single event |
| POST | `/api/events` | Add event *(Admin only)* |
| PUT | `/api/events/:id` | Update event *(Admin only)* |
| DELETE | `/api/events/:id` | Delete event *(Admin only)* |

### Registrations
| Method | URL | Description |
|--------|-----|-------------|
| POST | `/api/register` | Register for event |
| GET | `/api/registrations` | All registrations *(Admin only)* |

### Admin
| Method | URL | Description |
|--------|-----|-------------|
| POST | `/api/admin/login` | Admin login → returns JWT |
| GET | `/api/admin/analytics` | Dashboard analytics *(Admin only)* |

**Admin Authentication:** Include JWT token in headers:
```
Authorization: Bearer <your_token>
```

---

## 🗄️ MongoDB Collections

### Events Collection
```json
{
  "eventName": "Code Clash",
  "department": "CSE",
  "shortDescription": "Competitive programming challenge",
  "fullDescription": "Full event description...",
  "rules": ["Rule 1", "Rule 2"],
  "date": "April 15, 2026",
  "venue": "Lab Block 3, Room 305",
  "image": "/uploads/filename.jpg",
  "emoji": "💻",
  "coordinator": "Dr. Priya Sharma",
  "contact": "+91 98765 43210",
  "prize": "₹10,000"
}
```

### Registrations Collection
```json
{
  "name": "Rahul Kumar",
  "email": "rahul@college.edu",
  "phone": "9876543210",
  "college": "MLRITM",
  "department": "CSE",
  "year": "3rd Year",
  "eventId": "<ObjectId>",
  "eventName": "Code Clash"
}
```

---

## 🎨 Design Features

- **Dark TechFest Theme** — near-black backgrounds with neon accents
- **Neon Colors** — Cyan `#00f5ff` · Magenta `#ff00aa` · Gold `#ffd700`
- **Glassmorphism Cards** with hover glow effects
- **CSS Grid** background overlay
- **Orbitron** display font + **Rajdhani** body font
- **Animated countdown timer**
- **Scroll reveal** animations
- **Clip-path** geometric button shapes

---

## 🚀 Deployment

### Frontend — Netlify / Vercel
1. Upload `index.html`, `events.html`, `admin.html` to Netlify Drop
2. Or connect your GitHub repo

### Backend — Render
1. Push `backend/` to GitHub
2. Create new Web Service on [render.com](https://render.com)
3. Set build command: `npm install`
4. Set start command: `node server.js`
5. Add environment variables from `.env`

### Database — MongoDB Atlas
1. Create free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Get connection string and set `MONGO_URI` in Render env vars

---

## 📝 Customization

| What to change | Where |
|---|---|
| Fest date (countdown) | `index.html` line with `targetDate` |
| Event data | `events.html` → `const events = [...]` |
| Admin password | `admin.html` → `ADMIN_CREDS` + `server.js` |
| College details | `index.html` → footer section |
| Prize pool | Event data in `events.html` |

---

*Built for Valorous 2K26 — MLRITM TechFest 🏆*

# StaffSync - Modern Human Resource Management Solution 🚀

**StaffSync** is an enterprise-grade web-based Human Resource Management (HRM) application built on the **MERN Stack** (MongoDB, Express.js, React.js, and Node.js). It streamlines and automates core HR processes, featuring distinct access levels, real-time punch clock attendance, multi-tier leave approval workflows, employee directory management, company announcement broadcasts, and team training & upskilling programs.

---

## 🌟 Key Features & Role-Based Workflows

### 1. 🛡️ HR Personnel
* **Employee Directory Management**: Complete CRUD operations for employee records, contact info, job title, department, salary tiers, and emergency contacts.
* **Organization-Wide Leave Approvals**: Review all pending leave applications across departments, approve or reject with personalized feedback notes, and monitor balance deductions.
* **Attendance Tracking & Punctuality**: Real-time monitoring of daily clock-in/clock-out timestamps, late arrival flags (>9:15 AM), working hour totals, and departmental attendance percentages.
* **Company Bulletins & Announcements**: Broadcast organization announcements, pin urgent policy notices to top of dashboards, and track staff acknowledgements.

### 2. 👥 Managers
* **Team Leave Request Oversight**: Review and decide on direct report time-off requests with real-time leave quota tracking and feedback.
* **Team Attendance Monitoring**: Instant visibility into which team members are present on-time, late, remote, or on leave.
* **Training & Development Programs**: Launch curated skill-building programs (Technical, Leadership, Compliance, Soft Skills), assign team members, and track completion progress percentages.

### 3. 💼 Employees
* **Punch Station (Attendance)**: Single-click daily Clock In and Clock Out with live shift duration calculation and status logging.
* **Leave Application & Quota Tracker**: Check live balances (Casual, Sick, Annual, Maternity/Paternity), apply for time-off with date pickers and reason handovers, and track review status.
* **Personal Records & Profile**: View and update contact details, residential address, emergency contacts, reporting line, and salary records.
* **Interactive Learning & Skills**: Access assigned courses, slide module progress bars (0-100%), and earn completion certificates.
* **Company Bulletins**: Read organizational updates, policy changes, and town hall announcements with read-acknowledgement logging.

---

## 🛠️ Technology Stack

* **Frontend**:
  * **React 18** with **Vite**
  * Modern Vanilla CSS design system with custom CSS variables, dark-slate glassmorphism (`backdrop-filter`), glowing neon accents, and smooth animations
  * **Lucide React** modern icons
  * **Plus Jakarta Sans** & **Inter** typography
* **Backend**:
  * **Node.js** & **Express.js** RESTful API
  * **JWT (JSON Web Tokens)** for stateless authentication
  * **Bcrypt.js** password hashing
  * **CORS** middleware
  * **Dual-Persistence Engine**: Standard MongoDB connection via **Mongoose** (`mongodb://localhost:27017/staffsync` or `MONGODB_URI`) with seamless automatic fallback to a persistent JSON/in-memory database store if MongoDB is not installed locally.

---

## 🔑 Pre-Configured Demo Credentials

For testing and pair-programming evaluation, you can use the **1-Click Demo Role Switcher** in the top navigation bar or log in with these credentials:

| Role | Name | Email | Password |
|---|---|---|---|
| **HR Administrator** | Sarah Jenkins | `hr@staffsync.com` | `admin123` |
| **Manager** | Alex Rivera | `manager@staffsync.com` | `manager123` |
| **Employee** | Elena Rostova | `employee@staffsync.com` | `employee123` |

---

## Running Locally

### Requirements

- Node.js 20.19+ or 22.12+ and npm (required by Vite 8)
- MongoDB is optional; the backend uses its local JSON store if MongoDB is unavailable

### Install and configure

Run from the project root:

```powershell
npm install
if (!(Test-Path backend\.env)) { Copy-Item backend\.env.example backend\.env }
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the generated value into `backend\.env` as `JWT_SECRET=<generated-value>`. Keep this value private. The example config uses port 5000 and a local MongoDB URI; change `MONGODB_URI` if you use a hosted database.

### Start the app

Open two terminals in the project root:

```powershell
npm run dev:backend
```

```powershell
npm run dev:frontend
```

Open **http://localhost:5173**. The API health check is at **http://localhost:5000/api/health**. To create a production frontend build, run `npm run build`.

## Uploading to GitHub

The root `.gitignore` excludes `node_modules`, build output, `.env` files, and the local JSON data store. From the project root, initialize and commit the project, then connect your GitHub repository:

```powershell
git init
git add .
git status
git commit -m "Prepare StaffSync project"
git branch -M main
git remote add origin https://github.com/<your-account>/<your-repository>.git
git push -u origin main
```

Check `git status` before committing and do not force-add `backend\.env` or `backend\data\store.json`.

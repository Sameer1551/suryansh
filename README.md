# DOP Workspace — Cinematographer CRM & Industry Management Suite

An enterprise-grade, desktop-first CRM and business management workspace purpose-built for **Directors of Photography (DOPs)**, Cinematographers, and Film/Commercial Production Teams. 

The application pairs a high-performance **React + TypeScript + Tailwind CSS** frontend with a live **Express + Python (`openpyxl`)** bidirectional bridge that reads from and writes directly to an industry-standard master Excel database (`.xlsx`).

---

## 📽️ System Overview

In professional cinematography, managing client relationships, pitching for commercial and feature projects, keeping track of directors, producers, agencies, and scheduling timely follow-ups is critical. **DOP Workspace** brings the structure of specialized production workflows to your desktop, backed by an accessible, audit-friendly Excel workbook.

```
┌─────────────────────────────────────────────────────────────┐
│                 DOP Workspace Web UI (Vite)                 │
│         Overview • Contacts • Outreach • Opportunities      │
└──────────────────────────────┬──────────────────────────────┘
                               │  REST API (JSON)
┌──────────────────────────────▼──────────────────────────────┐
│              Local Node.js Express Server (:3001)           │
│                 Child Process Bridge Runner                 │
└──────────────────────────────┬──────────────────────────────┘
                               │  CLI / Stdin JSON Pipe
┌──────────────────────────────▼──────────────────────────────┐
│               Python Excel Bridge (`openpyxl`)              │
│       Lock Detection • Schema Mapping • Formula Preserving  │
└──────────────────────────────┬──────────────────────────────┘
                               │  Read / Write
┌──────────────────────────────▼──────────────────────────────┐
│       Master Excel: `DOP_Master_Industry_Database...xlsx`    │
│            9 Normalized Sheets • Lookups • Dropdowns        │
└─────────────────────────────────────────────────────────────┘
```

---

## ✨ Key Features & Modules

### 1. 📊 Executive Overview & Dashboard
- **KPI Metrics**: Real-time snapshot of active contacts, open production opportunities, pending follow-ups, and win rates.
- **Urgent Action Alerts**: Instant indicators for overdue follow-ups, due-today outreach tasks, and high-priority leads.
- **Activity Feed**: Chronological log of communications, inquiries, and status transitions.

### 2. 🏢 Organisations (Sheet `02 ORGANISATIONS`)
- Comprehensive 25-column directory of **Production Houses, Film Studios, Advertising Agencies, Creative Agencies, Brands, OTT Platforms**, and Post-production houses.
- Categorization by subcategory, city, tier/priority (`A`, `B`, `C`), office address, key portfolio work, and linked contact rosters.

### 3. 👥 Contacts (Sheet `03 CONTACTS`)
- Granular 48-column CRM for **Directors, Executive Producers, Agency Creative Directors, Line Producers, and DPs**.
- Tracks professional emails, WhatsApp, IMDB, Instagram, experience levels, past collaborations, portfolio submission status, and relationship temperature (`Cold`, `Warm`, `Existing`).
- Dynamic Excel formula evaluation for follow-up alerts (`OVERDUE`, `DUE TODAY`, `UPCOMING`).

### 4. 📤 Outreach Campaign Tracker (Sheet `04 OUTREACH`)
- Systematic logging of pitches, portfolio links, showreels, and introduction notes across multiple channels (Email, WhatsApp, Phone, LinkedIn, In-Person).
- Response tracking with sentiment tagging (`Positive`, `Neutral`, `Negative`) and automated next steps.

### 5. ⏰ Follow-up Engine (Sheet `05 FOLLOW-UPS`)
- Scheduling cadence and reminders to prevent promising leads from going cold.
- Automated status flags and communication history linking back to individual contacts and parent organizations.

### 6. 🎯 Opportunities & Deal Pipeline (Sheet `06 OPPORTUNITIES`)
- Track potential shoots across narrative feature films, commercial ads, OTT series, documentaries, and music videos.
- Logs director/producer attachments, shoot dates, duration, locations, estimated budgets, currency, availability, and deal stages (`Enquiry` → `Discussion` → `Brief Received` → `Negotiation` → `Confirmed` / `Lost`).

### 7. 🌐 Network & Referrals (Sheet `07 NETWORK & REFERRALS`)
- Mapping secondary and tertiary industry connections, referral chains, and mentor/collaborator influence.
- Tracks referral history, connection strength, and scheduled maintenance check-ins.

### 8. 🔬 Research Queue (Sheet `08 RESEARCH QUEUE`)
- Intake buffer for prospective agencies, upcoming productions, or emerging brands before promoting them into the primary database.

### 9. 🎬 Portfolio Showcase
- Visual gallery categorized by format (Feature Films, Commercials, Music Videos, Documentaries, Stills & Showreels).
- Quick links to video streams, equipment profiles, and visual references.

### 10. 📈 Reports & Analytics
- Data analytics on outreach efficiency, conversion rates, channel efficacy, and monthly commercial trajectory.

### 11. ⚙️ Settings & Excel Bridge Controls
- Live status monitor for the Excel bridge.
- Excel file path configuration and lock detection (notifies if the spreadsheet is open in Microsoft Excel).
- One-click demo seed utility to populate fresh test workbooks.

---

## 📁 Repository Structure

```
d:/suryansh/
├── README.md                                                  # Workspace overview & quickstart
├── START_PROJECT.bat                                          # One-click launch script
├── HOW_TO_OPEN.txt                                            # Quick guide
└── project-bolt-sb1-mjzmxyfn/
    └── project/                                               # Main application folder
        ├── DOP_Master_Industry_Database_Final_Fixed_Dropdowns.xlsx   # Master industry Excel database (9 sheets)
        ├── cinematography_reference_database_verified.xlsx    # Verified camera gear, glossary & reference data
        ├── START_PROJECT.bat                                  # Direct project launch batch script
        ├── Start DOP Workspace.lnk                            # Application shortcut
        ├── app_icon.ico                                       # Application icon
        ├── scripts/
        │   └── launcher.ps1                                   # Environment check & automated runner
        ├── index.html                                         # HTML entry point (DOP WORKSPACE)
        ├── package.json                                       # Node dependencies & npm scripts
        ├── tsconfig.json                                      # TypeScript configuration
        ├── vite.config.ts                                     # Vite bundler configuration
        ├── tailwind.config.js                                 # Tailwind CSS theme & tokens
        ├── server/                                            # Local Node + Python sync server
        │   ├── index.js                                       # Express REST API (:3001)
        │   └── excel_bridge.py                                # Python script interacting with openpyxl
        └── src/                                               # Frontend application (React 18 + TS)
            ├── main.tsx                                       # React DOM mount
            ├── App.tsx                                        # Main layout, router & navigation shell
            ├── index.css                                      # Design system tokens & typography
            ├── components/                                    # UI library (Sidebar, Modal, Buttons, Forms)
            ├── data/                                          # Fallback offline & demo seed dataset
            ├── lib/                                           # HTTP client API & Excel bridge connectors
            ├── store/                                         # React Context state management (DataContext)
            ├── types/                                         # TypeScript interfaces matching Excel schema
            ├── utils/                                         # Formatting helpers, dates, badges
            └── views/                                         # Module pages (Overview, Contacts, Outreach, etc.)
```

---

## 🛠️ Prerequisites

Ensure you have the following installed on your system:

1. **Node.js**: v18.0.0 or later ([Download Node.js](https://nodejs.org/))
2. **Python**: v3.8 or later ([Download Python](https://www.python.org/))
   - Required Python package: `openpyxl`
3. **npm** (included with Node.js)

---

## 🚀 Getting Started

### ⚡ Option A: One-Click Startup (Recommended for Everyone & Non-Developers)

Simply double-click the startup icon inside the folder:

👉 **`Start DOP Workspace`** (or **`START_PROJECT.bat`**)

This automatically:
1. **Opens Antigravity IDE** with this project folder loaded.
2. Checks prerequisites and sets up `openpyxl` / dependencies if needed.
3. **Starts the project's backend server and frontend**.
4. **Opens the web application in your default browser** at `http://localhost:5173`.
5. Automatically places a **`DOP Workspace`** shortcut on your Windows Desktop for future 1-click access!

---

### 💻 Option B: Manual Developer Setup

#### 1. Install Python Dependencies
The database bridge relies on `openpyxl` to parse and edit `.xlsx` files without requiring Microsoft Office installed:

```powershell
pip install openpyxl
```

### 2. Install Project Dependencies
Navigate to the web application directory and install npm packages:

```powershell
cd d:\suryansh\project-bolt-sb1-mjzmxyfn\project
npm install
```

### 3. Launch the Application
Start both the Express API server and the Vite development server with a single command:

```powershell
npm run dev
```

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- **Excel API Server**: [http://localhost:3001](http://localhost:3001)

---

## 📜 Available NPM Scripts

From `d:\suryansh\project-bolt-sb1-mjzmxyfn\project`:

| Command | Description |
| :--- | :--- |
| `npm run dev` | Runs both backend bridge (`server/index.js`) and Vite client concurrently |
| `npm run client` | Starts only the Vite frontend dev server |
| `npm run server` | Starts only the Express backend bridge server |
| `npm run build` | Builds production-ready frontend bundle into `/dist` |
| `npm run preview` | Previews the production build locally |
| `npm run typecheck` | Validates TypeScript types across the project (`tsc --noEmit`) |
| `npm run lint` | Runs ESLint to check code quality and formatting |

---

## 🗄️ Excel Database Configuration

By default, the backend expects the master Excel file inside the project directory:
```
d:\suryansh\project-bolt-sb1-mjzmxyfn\project\DOP_Master_Industry_Database_Final_Fixed_Dropdowns.xlsx
```

### Custom Excel Location
You can customize the target Excel workbook path by setting the `EXCEL_PATH` environment variable:

```powershell
$env:EXCEL_PATH = "C:\Path\To\Your_Custom_DOP_Database.xlsx"
npm run dev
```

### Windows File Lock Behavior
When you open an `.xlsx` file in Microsoft Excel on Windows, Excel acquires an exclusive file lock.
- If the file is locked, the bridge detects this state and returns a `FILE_LOCKED` error (`HTTP 423`).
- The frontend UI displays a non-destructive warning badge alerting you that the file is open in Excel.
- Simply close the file or save it in Excel, and synchronization will resume seamlessly.

---

## 🛡️ Architecture & Design Philosophy

- **Zero Data Loss & Safe Writes**: When updating rows or appending new records, `server/excel_bridge.py` recalculates dynamic Excel formulas (e.g. `VLOOKUP`, `IF(..., TODAY())`) and preserves Excel sheet formatting.
- **Offline / Standalone Resilience**: If the backend server or Python bridge is not running, the application gracefully degrades to local memory state, allowing uninterrupted viewing and testing.
- **Cinematography Domain Specificity**: Unlike generic CRMs (HubSpot, Salesforce), every column, dropdown choice, and stage is calibrated to film and commercial production industry jargon (reels, DOP requirements, pitch decks, equipment specs).

---

## 📄 License

Internal tool and database suite developed for cinematography production management. All rights reserved.

# Final Destination 🚆
### Indian Railways Prepared Chart Vacancy Analyzer & Alternative Route Finder

**Final Destination** is a specialized web application designed to help Indian Railways passengers find confirmed berths on charted trains. When full-journey tickets are unavailable, it analyzes live prepared charts from Indian Railways (`irctc.co.in` & `railchart.in`), identifying direct vacancies, intermediate split vacancies across all coaches, and alternative boarding/destination stops.

---

## 🌟 Key Features

- **Live Prepared Chart Vacancy Search:**
  - Directly queries authentic Indian Railways coach and chart APIs.
  - Inspects all coaches (not just single-ticket quotas) in safe concurrent batches.
- **Multi-Berth Split Journey Routing:**
  - Uses BFS graph routing across stations and vacant berth intervals.
  - Calculates optimal seat/berth combinations with minimal coach changes.
- **Station Timing, Dates & Run Durations:**
  - Full route schedule integration showing exact arrival/departure times, train run days, and duration per segment.
- **Booking Channel Guidance (Online / Counter / TTE):**
  - **IRCTC Online (Current Booking):** Direct links and instructions for booking under `CURR_AVBL` quota.
  - **Station PRS Counter:** Timings, procedures, and rules for booking at the station up to 30 mins before departure.
  - **On-Board TTE (Handheld Terminal - HHT):** Step-by-step guidance for boarding with unreserved/valid ticket and obtaining an official Excess Fare Ticket (EFT).
- **Interactive Coach Berth Layout:**
  - Cabin-by-cabin berth layout map with color-coded vacant berth indicators and coach switcher tabs.
- **Smart Chart Date Selector:**
  - Constrains date selection to valid chart preparation windows (Today - 2 days to Tomorrow).

---

## 🛠️ Technology Stack

- **Frontend:** React 19, Vite
- **Styling:** Tailwind CSS v4, FontAwesome Icons, Lucide Icons
- **HTTP Client:** Axios with Vite API Reverse Proxy (CORS and header handling)
- **Routing Engine:** Graph BFS Path Search & Interval Vacancy Parser

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Dinesh7571/final-destination.git

# Navigate into project directory
cd final-destination

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📄 License
MIT License.

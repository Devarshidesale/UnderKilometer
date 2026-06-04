# UnderKilometer

A platform for college students to find verified accommodations — hostels, PGs, and flats — near their institution, with authentic student reviews and ratings.

---

## Project Structure

```
UnderKilometer/
│
├── app.py                 # Flask API backend
├── database.py            # SQLAlchemy database connection
├── requirements.txt       # Python dependencies
│
├── frontend/              # React (Vite) frontend
│   ├── public/
│   │   └── underkilometer-frames/   # Hero animation frames (126 JPGs)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── HeroSection.jsx
│   │   │   ├── AccommodationFilters.jsx
│   │   │   ├── AccommodationDisplay.jsx
│   │   │   └── AccommodationDetails.jsx
│   │   ├── assets/              # Static images
│   │   ├── styles/
│   │   │   └── global.css       # All application styles
│   │   ├── App.jsx              # Router & page layout
│   │   └── main.jsx             # Entry point
│   ├── index.html
│   ├── vite.config.js           # Dev proxy to Flask
│   └── package.json
│
├── LICENSE
└── README.md
```

---

## Prerequisites

- **Python 3.9+**
- **Node.js 18+** and **npm**
- A MySQL database with the `UnderKilometer_database` table
- The `DATABASE_URL_STRING` environment variable set to your DB connection string

---

## How to Run

### 1. Backend (Flask API) — Port 5000

```bash
cd UnderKilometer

# Create a virtual environment (recommended)
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS / Linux

# Install Python dependencies
pip install -r requirements.txt

# Set your database connection string
set DATABASE_URL_STRING=mysql+pymysql://user:password@host/dbname   # Windows
# export DATABASE_URL_STRING=mysql+pymysql://user:password@host/dbname  # macOS / Linux

# Start the Flask server
python app.py
```

Flask will start on **http://localhost:5000**.

### 2. Frontend (React + Vite) — Port 5173

```bash
cd UnderKilometer/frontend

# Install Node dependencies (first time only)
npm install

# Start the development server
npm run dev
```

Vite will start on **http://localhost:5173**.
The dev server automatically proxies `/api/*` requests to Flask on port 5000.

### 3. Open in Browser

Go to **http://localhost:5173** — you'll see the full application.

---

## API Endpoints

| Method | Route                       | Description                          |
|--------|-----------------------------|--------------------------------------|
| GET    | `/api/accommodations`       | List all accommodations              |
| POST   | `/api/accommodations`       | Filter accommodations (JSON body)    |
| GET    | `/api/accommodations/<id>`  | Get details for one accommodation    |

---

## Production Build

```bash
cd UnderKilometer/frontend
npm run build
```

This outputs optimized static files to `frontend/dist/` which can be served by any static host or integrated with Flask's `static` serving.

Markdown
# 📚 Personal Book Tracker & Bookshelf

A sleek, full-stack web application built to discover, catalog, and track your personal reading journey. Users can browse an extensive library index, manage reading statuses, rate books with interactive star metrics, and curate a dedicated favorites collection.

---

## ✨ Features

* **📦 Live Catalog & Search:** Pre-populates the dashboard with books directly from your database, featuring ultra-fast client-side search filtering.
* **🚦 Reading Status Tracking:** Seamlessly toggle individual titles between `In Progress` and `Read` states via interactive drop-down panels.
* **⭐ Interactive Star Ratings:** Score your favorite reads with a responsive 1-5 star module.
* **💖 Curated Favorites:** Instantly bookmark specific records to a standalone, filtered favorites dashboard grid.
* **🎨 Modern UI/UX:** Styled with clean Tailwind CSS, custom Lucide React iconography, and premium modal animations powered by **SweetAlert2**.

---

## 🛠️ Tech Stack

### Backend
* **Python 3.14+**
* **Flask** & **Flask-SQLAlchemy** (ORM)
* **PostgreSQL** (Database relational storage)
* **Psycopg2** (Database adapter framework)

### Frontend
* **React** (Vite development pipeline)
* **Tailwind CSS** (Utility-first styling grid)
* **SweetAlert2** (Popups, warnings, and success toast indicators)
* **Lucide React** (Vector icons)

---

## 🚀 Getting Started

### 🖥️ Backend Installation & Setup

1. **Navigate to the backend directory and activate your virtual environment:**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate
Install required Python packages:

Bash
pip install -r requirements.txt
Seed the database (Clears cached tables, builds fresh schemas, and pushes 100 mock items):

Bash
python3 seed.py
Launch the local API server:

Bash
python3 app.py
The API server will initialize on http://localhost:5555.

💻 Frontend Installation & Setup
Navigate to the root frontend workspace directory:

Bash
cd ../
Install Node modules:

Bash
npm install
Boot up the Vite development server:

Bash
npm run dev
Open your browser and navigate to http://localhost:5173 to browse the platform.

📂 Project Architecture Highlights
models.py - Dictates PostgreSQL relational configurations for Book and Comment tables with cascading foreign key properties.

seed.py - Automated catalog generation engine utilizing safe transactional sequences (db.drop_all(), db.create_all()).

App.jsx - Serves as the central state routing matrix managing database updates (PATCH, POST, DELETE) alongside custom SweetAlert UI workflows.

Bookshelf.jsx & BookCard.jsx - Reusable UI wrapper nodes structured to scale context-fluid layouts across variable views.
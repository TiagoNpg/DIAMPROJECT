# CarMeets

A car meets event platform with a Django REST API backend and React/Vite frontend.

## Project Structure

```
carmeets/
├── backend/        Django REST API
└── frontend/       React + Vite SPA
```

## Backend Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

API runs at `http://localhost:8000`

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`

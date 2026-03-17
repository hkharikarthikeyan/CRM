# Python Backend for Time Tracker

## Setup

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Run the server:
```bash
python main.py
```

Or use the batch file on Windows:
```bash
start.bat
```

## API Endpoints

- `POST /auth/login` - Admin login (username: hari001, password: hari19)
- `GET /auth/me` - Get current user info
- `GET /` - Health check

## Admin Credentials
- Username: `hari001`
- Password: `hari19`

Server runs on: http://localhost:8000
# Install Supabase client
npm install @supabase/supabase-js
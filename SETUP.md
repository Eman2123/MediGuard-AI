# MediGuard AI - Setup Instructions

## ⚡ Quick Start (5 minutes)

### Step 1: Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (macOS/Linux)
source venv/bin/activate

# Activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
```

**Edit `backend/.env`:**
```
FORTYGUARD_API_KEY=your_api_key_from_dashboard
ANTHROPIC_API_KEY=your_claude_api_key
```

**Run backend:**
```bash
uvicorn app.main:app --reload
```

✅ Server runs on `http://localhost:8000`

---

### Step 2: Frontend Setup

**In another terminal:**

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Run dev server
npm run dev
```

✅ Frontend runs on `http://localhost:5173`

---

## 🧪 Test It

Open your browser to `http://localhost:5173` and try:

```
"Ship insulin from Phoenix to Houston tomorrow 6am"
```

Or:
```
"Blood shipment Boston to Miami next Monday 8am"
```

---

## 📋 Checklist

Before deploying/submitting:

- [ ] Backend runs without errors
- [ ] Frontend loads
- [ ] API health check passes: `curl http://localhost:8000/api/health`
- [ ] Test shipment assessment works
- [ ] `.env` files are NOT committed (check `.gitignore`)
- [ ] All dependencies listed in requirements.txt and package.json

---

## 🔑 Getting API Keys

### FortyGuard API Key
1. Go to `https://dashboard.fortyguard.com`
2. Sign in / Create account
3. Go to Profile → API Keys
4. Generate new key
5. Copy to `.env` as `FORTYGUARD_API_KEY`

### Anthropic (Claude) API Key
1. Go to `https://console.anthropic.com`
2. Sign in / Create account
3. Go to API Keys
4. Create new key
5. Copy to `.env` as `ANTHROPIC_API_KEY`

---

## 🚀 Deployment

### Deploy to Render + Vercel

**Backend (Render):**
1. Push code to GitHub
2. Connect GitHub to render.com
3. Create new Web Service from `backend` folder
4. Set environment variables (FORTYGUARD_API_KEY, ANTHROPIC_API_KEY)
5. Deploy

**Frontend (Vercel):**
1. Push code to GitHub
2. Import repo on vercel.com
3. Set root directory to `frontend`
4. Add env var: `VITE_API_URL=https://your-render-url.onrender.com/api`
5. Deploy

---

## ❓ Troubleshooting

**"Port 8000 already in use"**
```bash
lsof -i :8000
kill -9 <PID>
```

**"Module not found" (Python)**
```bash
pip install -r requirements.txt
```

**"npm ERR"**
```bash
rm -rf node_modules package-lock.json
npm install
```

**"API returns 401"**
- Check FortyGuard API key is correct
- Verify key hasn't expired

**"Claude parsing fails"**
- Check Anthropic API key
- Verify user input is clear

---

## 📞 Support

Issues? Check:
1. Backend logs: `http://localhost:8000/docs`
2. Frontend console (F12 → Console)
3. `.env` files are correct
4. API keys are valid

---

**Ready to build?** Start with `cd backend && source venv/bin/activate && uvicorn app.main:app --reload` 🚀

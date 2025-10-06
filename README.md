# 🚀 SpaceApps Computronic

This project was developed for the **NASA Space Apps Challenge**.  
The goal is to create an **AI-powered interactive dashboard** that allows users to explore, summarize, and visualize scientific publications related to biological experiments conducted in space.

---

## 🧩 Project Structure
``` bash
SPACEAPPS_COMPUTRONIC/
├── .venv/                    # Python virtual environment
├── node_modules/             # Node.js dependencies
├── tu-proyecto/
│   └── backend/
│       ├── __pycache__/      # Python cache
│       ├── .venv/            # Virtual environment (backend)
│       ├── data/
│       │   └── SB_publication_PMC.csv  # Data source (NASA/PMC publications)
│       ├── .env              # Environment variables (API keys, configs)
│       ├── requirements.txt  # Backend dependencies (FastAPI, OpenAI, etc.)
│       ├── server.py         # Main server (FastAPI)
│       └── summary.py        # Module for generating AI summaries
├── src/
│   ├── api/                  # Backend communication logic
│   ├── components/           # Main frontend components
│   │   ├── ArticlePage.tsx
│   │   ├── SummaryPage.tsx
│   │   ├── WelcomePageES.tsx
│   │   ├── WelcomePageFormal.tsx
│   │   └── WelcomeScreen.tsx
│   ├── App.tsx               # Root React component
│   ├── index.css             # Global styles
│   └── main.tsx              # Frontend entry point
├── eslint.config.js          # ESLint configuration
├── index.html                # Main HTML file
├── package.json              # Node.js dependencies
├── pnpm-lock.yaml            # PNPM version lock
├── postcss.config.js         # PostCSS configuration
├── tailwind.config.js        # TailwindCSS configuration
├── tsconfig.*.json           # TypeScript configurations
├── vite.config.ts            # Vite environment setup
└── README.md                 # Project documentation
```
---

## ⚙️ Installation and Setup

### 1️⃣ Clone the repository
``` bash
git clone https://github.com/your-username/spaceapps_computronic.git
cd spaceapps_computronic
```
### 2️⃣ Set up the virtual environment (Backend)
``` bash
cd tu-proyecto/backend
python -m venv .venv
```
For Windows (CMD):
``` bash
.venv\Scripts\activate
``` 
For Linux / Mac:
``` bash
.venv\Scripts\activate.bat
```
### 3️⃣ Install backend dependencies
``` bash
pip install -r requirements.txt
``` 
### 4️⃣ Configure environment variables

Create a file named .env inside the backend/ folder with the following content:
``` bash
API_KEY=your_openai_api_key
```
⚠️ **IMPORTANT**: Replace your_openai_api_key with your actual OpenAI key, or your OpenRouter key if you’re using that service.

### 5️⃣ Run the backend (FastAPI)
``` bash
uvicorn server:app --reload --port 8000
```
The backend will run at:
👉 http://127.0.0.1:8000

### 6️⃣ Install frontend dependencies
From the project root:
``` bash
npm install
```
### 7️⃣ Run the frontend application
``` bash
npm run dev
```

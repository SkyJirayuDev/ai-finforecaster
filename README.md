# 📊 AI FinForecaster  
**Web based financial forecasting dashboard built with Next.js, FastAPI, and Prophet**

![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.x-3776AB?logo=python&logoColor=white)
![Prophet](https://img.shields.io/badge/Forecasting-Prophet-4B8BBE)
![Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?logo=vercel&logoColor=white)
![Railway](https://img.shields.io/badge/Backend-Railway-0B0D0E?logo=railway&logoColor=white)

---

## 🧩 Overview  
**AI FinForecaster** is a web based dashboard that helps small businesses quickly explore their future cash flow.  
Users upload a CSV file with historical financial data, the system validates and cleans the data, then sends it to a **FastAPI + Prophet** backend that generates a time series forecast.  

The results are visualised as an interactive chart so business owners can see expected trends, possible risks, and short term patterns without touching Python code or Jupyter notebooks.  
This project is part of a Master level research project on AI powered financial tools for SMEs.

---

## 🌐 Live Preview  
You can try the frontend here:

- **Frontend (Vercel):** https://ai-finforecaster.vercel.app  

> Note: The FastAPI backend is hosted on Railway. After a period of inactivity, the first request may take a few seconds while the service starts.

---

## 📸 Interface Preview  

![Upload CSV Screen](/public/ai-finforecaster.png)

---

## ⚡ Core Features  

- **CSV Upload for Financial Data**  
  - Upload historical transactions or daily totals as CSV  
  - Supports date and amount columns, with optional fields such as category or promotion flags  
  - Client side validation with clear error messages before sending data to the backend  

- **FastAPI Forecasting Service with Prophet**  
  - Cleans and aggregates time series data from the uploaded CSV  
  - Fits a Prophet model to capture trend and seasonality  
  - Generates forward forecasts for the next period, for example the next 30 days  

- **Forecast Quality and Metrics**  
  - Calculates basic metrics such as MAPE on the backend  
  - Handles stable and more seasonal datasets with robust preprocessing  

- **Interactive Forecast Dashboard**  
  - Built with Next.js App Router and TypeScript  
  - Chart that overlays historical values, forecast values, and confidence intervals  
  - Responsive layout suitable for laptop and desktop screens  

- **Cloud Ready Architecture**  
  - Next.js frontend deployed to Vercel  
  - Python FastAPI forecasting service deployed to Railway  
  - JSON based API contract so the forecasting service can be reused by other clients later  

- **Planned Enhancements**  
  - Key metrics cards for forecast accuracy, risk level, and confidence  
  - Export forecast results to CSV or PDF  
  - AI generated text insights that explain the forecast in simple language  

---

## 🧠 Technology Stack  

### **Frontend**
- **Next.js 14 (App Router)** for the main web application  
- **React 18 + TypeScript** for strongly typed UI components  
- **Modern CSS / Tailwind or utility classes** for responsive design  
- **Fetch or Axios** for HTTP requests to the FastAPI backend  

### **Backend and Forecasting**
- **Python 3.x** runtime  
- **FastAPI** for high performance HTTP APIs  
- **Prophet** for time series forecasting  
- **Pydantic** for request and response validation  
- **Uvicorn** as the ASGI server for local development  

### **Infrastructure**
- **Vercel** for frontend deployment  
- **Railway** for backend deployment  
- **Environment variables** to configure API base URLs and secrets  

---

## 🚀 Getting Started  

### **1. Clone the Repository**
```bash
git clone https://github.com/SkyJirayuDev/ai-finforecaster.git
cd ai-finforecaster
```

### **2. Run the Frontend (Next.js)**
From the project root:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Create your local environment file:

```bash
cp .env.example .env.local
```

Update the API base URL in `.env.local` so the frontend can call your FastAPI backend:

```env
NEXT_PUBLIC_FORECAST_API_URL=http://localhost:8000
```

Start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open http://localhost:3000 in your browser.

### **3. Run the Backend (FastAPI + Prophet)**  

From the backend folder (for example `forecast-api`):

```bash
cd forecast-api

# optional virtual environment
python -m venv .venv

# Windows
.venv\Scriptsctivate

# macOS / Linux
source .venv/bin/activate

# install dependencies
pip install -r requirements.txt

# start FastAPI with uvicorn
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The frontend will now call the FastAPI endpoint using the URL defined in `NEXT_PUBLIC_FORECAST_API_URL`.

---

## 📡 API Modules  

| Module      | Endpoint             | Description |
|------------|----------------------|-------------|
| **Frontend API Route** | `POST /api/forecast` | Next.js route that receives CSV data from the UI and forwards parsed JSON to the backend service |
| **Backend Forecast**   | `POST /forecast`     | FastAPI endpoint that validates data, runs Prophet, and returns forecast values, confidence intervals, and metrics |

The exact endpoint paths can be updated in code without changing the overall architecture.

---

## 🏗️ Architecture Highlights  

- **Clear separation of concerns**  
  - Frontend handles upload, CSV parsing, validation, and chart rendering  
  - Backend handles data cleaning, forecasting logic, and metric calculation  

- **Time Series Forecasting with Prophet**  
  - Supports trend and seasonality out of the box  
  - Can be extended with holidays or additional regressors in future versions  

- **JSON Based Data Contract**  
  - CSV is parsed into structured JSON on the frontend  
  - Backend accepts a clean array of `{ date, amount, ... }` objects rather than raw files  

- **Ready for Extension**  
  - Can power additional dashboards, admin tools, or mobile clients using the same API  
  - Easy to add new endpoints for metrics, exports, or AI generated explanations  

---

## 🎯 Learning Outcomes  

Through building **AI FinForecaster**, I improved my skills in:

- Designing and implementing a full stack financial forecasting system  
- Integrating a Python Prophet model with a modern Next.js and TypeScript frontend  
- Handling CSV parsing, validation, and error feedback in a user friendly way  
- Deploying a split architecture using Vercel and Railway  
- Thinking about how to present forecasting results so that small business owners can make quick decisions  

---

## 👨‍💻 About the Developer  

Developed by **Sky Jirayu Saisuwan (@SkyJirayuDev)**  

- 🌐 [LinkedIn](https://www.linkedin.com/in/skyjirayu)  
- 💻 [GitHub](https://github.com/SkyJirayuDev)  

This project is part of my Master research on AI assisted financial tools and also a portfolio example of a real world full stack system.

---

## 🪪 License  

This repository is currently shared for learning and portfolio purposes.  
If you want to use AI FinForecaster in a commercial product or in a new research project, please contact me on LinkedIn or by email to discuss licensing and collaboration.

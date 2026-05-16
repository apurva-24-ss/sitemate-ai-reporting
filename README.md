# SiteMate AI

SiteMate AI is an AI-powered construction daily reporting system built using React, FastAPI, and MongoDB.

## Features

- User Login and Registration
- Project Management
- Daily Construction Reports
- Labor Tracking
- Material Tracking
- Site Photo Upload
- PDF Report Generation with Site Photos
- Dashboard with Real-Time Counts

## Tech Stack

### Frontend
- React.js
- Vite
- Axios
- React Router

### Backend
- FastAPI
- MongoDB Atlas
- Motor
- ReportLab
- Python Multipart

### Database
- MongoDB Atlas

## Project Structure

```text
sitemate-ai-reporting/
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── utils/
│   │   ├── main.py
│   │   ├── database.py
│   │   └── config.py
│   ├── uploads/
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── index.css
│   ├── package.json
│   └── .env.example
│
├── .gitignore
└── README.md
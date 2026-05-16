import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.routes import (
    auth_routes,
    project_routes,
    report_routes,
    labor_routes,
    material_routes,
    pdf_routes,
    photo_routes,
)

os.makedirs("uploads/site_photos", exist_ok=True)

app = FastAPI(title="SiteMate AI Reporting API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth_routes.router)
app.include_router(project_routes.router)
app.include_router(report_routes.router)
app.include_router(labor_routes.router)
app.include_router(material_routes.router)
app.include_router(pdf_routes.router)
app.include_router(photo_routes.router)


@app.get("/")
def home():
    return {"message": "SiteMate AI backend running"}


@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Backend is healthy"}

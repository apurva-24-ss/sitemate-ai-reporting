from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from bson import ObjectId
from datetime import datetime
from pathlib import Path
from typing import Optional
import uuid
import os

from app.database import photos_collection, reports_collection

router = APIRouter(prefix="/photos", tags=["Site Photos"])

UPLOAD_DIR = Path("uploads/site_photos")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def photo_serializer(photo) -> dict:
    return {
        "id": str(photo["_id"]),
        "reportId": photo.get("reportId"),
        "caption": photo.get("caption"),
        "filename": photo.get("filename"),
        "photoUrl": photo.get("photoUrl"),
        "createdAt": photo.get("createdAt"),
    }


@router.post("/")
async def upload_site_photo(
    reportId: str = Form(...),
    caption: Optional[str] = Form(None),
    file: UploadFile = File(...),
):
    if not ObjectId.is_valid(reportId):
        raise HTTPException(status_code=400, detail="Invalid report ID")

    report = await reports_collection.find_one({"_id": ObjectId(reportId)})

    if not report:
        raise HTTPException(status_code=404, detail="Daily report not found")

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed")

    file_extension = Path(file.filename).suffix

    if file_extension == "":
        file_extension = ".jpg"

    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = UPLOAD_DIR / unique_filename

    file_content = await file.read()

    with open(file_path, "wb") as saved_file:
        saved_file.write(file_content)

    photo_data = {
        "reportId": reportId,
        "caption": caption,
        "filename": unique_filename,
        "photoUrl": f"/uploads/site_photos/{unique_filename}",
        "createdAt": datetime.utcnow().isoformat(),
    }

    result = await photos_collection.insert_one(photo_data)

    created_photo = await photos_collection.find_one({"_id": result.inserted_id})

    return {
        "message": "Site photo uploaded successfully",
        "photo": photo_serializer(created_photo),
    }


@router.get("/")
async def get_all_photos():
    photos = []

    cursor = photos_collection.find()

    async for photo in cursor:
        photos.append(photo_serializer(photo))

    return {
        "count": len(photos),
        "photos": photos,
    }


@router.get("/report/{report_id}")
async def get_photos_by_report(report_id: str):
    if not ObjectId.is_valid(report_id):
        raise HTTPException(status_code=400, detail="Invalid report ID")

    photos = []

    cursor = photos_collection.find({"reportId": report_id})

    async for photo in cursor:
        photos.append(photo_serializer(photo))

    return {
        "count": len(photos),
        "photos": photos,
    }


@router.delete("/{photo_id}")
async def delete_photo(photo_id: str):
    if not ObjectId.is_valid(photo_id):
        raise HTTPException(status_code=400, detail="Invalid photo ID")

    photo = await photos_collection.find_one({"_id": ObjectId(photo_id)})

    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")

    filename = photo.get("filename")

    if filename:
        file_path = UPLOAD_DIR / filename

        if os.path.exists(file_path):
            os.remove(file_path)

    await photos_collection.delete_one({"_id": ObjectId(photo_id)})

    return {
        "message": "Photo deleted successfully"
    }
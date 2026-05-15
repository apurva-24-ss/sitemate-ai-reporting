from fastapi import APIRouter, HTTPException
from bson import ObjectId
from datetime import datetime
from app.models.labor_model import LaborCreate, LaborUpdate
from app.database import labor_collection, reports_collection

router = APIRouter(prefix="/labor", tags=["Labor"])


def labor_serializer(labor) -> dict:
    return {
        "id": str(labor["_id"]),
        "reportId": labor.get("reportId"),
        "laborType": labor.get("laborType"),
        "count": labor.get("count"),
        "workingHours": labor.get("workingHours"),
        "workAssigned": labor.get("workAssigned"),
        "overtime": labor.get("overtime"),
        "createdAt": labor.get("createdAt")
    }


@router.post("/")
async def create_labor(labor: LaborCreate):
    if not ObjectId.is_valid(labor.reportId):
        raise HTTPException(status_code=400, detail="Invalid report ID")

    report = await reports_collection.find_one({"_id": ObjectId(labor.reportId)})

    if not report:
        raise HTTPException(status_code=404, detail="Daily report not found")

    labor_data = labor.model_dump()
    labor_data["createdAt"] = datetime.utcnow().isoformat()

    result = await labor_collection.insert_one(labor_data)

    created_labor = await labor_collection.find_one({"_id": result.inserted_id})

    return {
        "message": "Labor entry created successfully",
        "labor": labor_serializer(created_labor)
    }


@router.get("/")
async def get_all_labor():
    labor_entries = []

    cursor = labor_collection.find()

    async for labor in cursor:
        labor_entries.append(labor_serializer(labor))

    return {
        "count": len(labor_entries),
        "labor": labor_entries
    }


@router.get("/report/{report_id}")
async def get_labor_by_report(report_id: str):
    if not ObjectId.is_valid(report_id):
        raise HTTPException(status_code=400, detail="Invalid report ID")

    labor_entries = []

    cursor = labor_collection.find({"reportId": report_id})

    async for labor in cursor:
        labor_entries.append(labor_serializer(labor))

    return {
        "count": len(labor_entries),
        "labor": labor_entries
    }


@router.put("/{labor_id}")
async def update_labor(labor_id: str, labor: LaborUpdate):
    if not ObjectId.is_valid(labor_id):
        raise HTTPException(status_code=400, detail="Invalid labor ID")

    update_data = labor.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(status_code=400, detail="No data provided for update")

    result = await labor_collection.update_one(
        {"_id": ObjectId(labor_id)},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Labor entry not found")

    updated_labor = await labor_collection.find_one({"_id": ObjectId(labor_id)})

    return {
        "message": "Labor entry updated successfully",
        "labor": labor_serializer(updated_labor)
    }


@router.delete("/{labor_id}")
async def delete_labor(labor_id: str):
    if not ObjectId.is_valid(labor_id):
        raise HTTPException(status_code=400, detail="Invalid labor ID")

    result = await labor_collection.delete_one({"_id": ObjectId(labor_id)})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Labor entry not found")

    return {
        "message": "Labor entry deleted successfully"
    }
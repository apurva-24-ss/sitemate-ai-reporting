from fastapi import APIRouter, HTTPException
from bson import ObjectId
from datetime import datetime
from app.models.report_model import ReportCreate, ReportUpdate
from app.database import reports_collection, projects_collection

router = APIRouter(prefix="/reports", tags=["Daily Reports"])


def report_serializer(report) -> dict:
    return {
        "id": str(report["_id"]),
        "projectId": report.get("projectId"),
        "date": report.get("date"),
        "weather": report.get("weather"),
        "workCompleted": report.get("workCompleted"),
        "workPlannedTomorrow": report.get("workPlannedTomorrow"),
        "delayReason": report.get("delayReason"),
        "siteIssues": report.get("siteIssues"),
        "remarks": report.get("remarks"),
        "createdBy": report.get("createdBy"),
        "createdAt": report.get("createdAt")
    }


@router.post("/")
async def create_report(report: ReportCreate):
    if not ObjectId.is_valid(report.projectId):
        raise HTTPException(status_code=400, detail="Invalid project ID")

    project = await projects_collection.find_one({"_id": ObjectId(report.projectId)})

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    report_data = report.model_dump()
    report_data["createdAt"] = datetime.utcnow().isoformat()

    result = await reports_collection.insert_one(report_data)

    created_report = await reports_collection.find_one({"_id": result.inserted_id})

    return {
        "message": "Daily report created successfully",
        "report": report_serializer(created_report)
    }


@router.get("/")
async def get_reports():
    reports = []

    cursor = reports_collection.find()

    async for report in cursor:
        reports.append(report_serializer(report))

    return {
        "count": len(reports),
        "reports": reports
    }


@router.get("/project/{project_id}")
async def get_reports_by_project(project_id: str):
    if not ObjectId.is_valid(project_id):
        raise HTTPException(status_code=400, detail="Invalid project ID")

    reports = []

    cursor = reports_collection.find({"projectId": project_id})

    async for report in cursor:
        reports.append(report_serializer(report))

    return {
        "count": len(reports),
        "reports": reports
    }


@router.get("/{report_id}")
async def get_report(report_id: str):
    if not ObjectId.is_valid(report_id):
        raise HTTPException(status_code=400, detail="Invalid report ID")

    report = await reports_collection.find_one({"_id": ObjectId(report_id)})

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    return {
        "report": report_serializer(report)
    }


@router.put("/{report_id}")
async def update_report(report_id: str, report: ReportUpdate):
    if not ObjectId.is_valid(report_id):
        raise HTTPException(status_code=400, detail="Invalid report ID")

    update_data = report.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(status_code=400, detail="No data provided for update")

    result = await reports_collection.update_one(
        {"_id": ObjectId(report_id)},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Report not found")

    updated_report = await reports_collection.find_one({"_id": ObjectId(report_id)})

    return {
        "message": "Daily report updated successfully",
        "report": report_serializer(updated_report)
    }


@router.delete("/{report_id}")
async def delete_report(report_id: str):
    if not ObjectId.is_valid(report_id):
        raise HTTPException(status_code=400, detail="Invalid report ID")

    result = await reports_collection.delete_one({"_id": ObjectId(report_id)})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Report not found")

    return {
        "message": "Daily report deleted successfully"
    }
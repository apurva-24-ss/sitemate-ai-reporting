from fastapi import APIRouter, HTTPException
from bson import ObjectId
from datetime import datetime
from app.models.project_model import ProjectCreate, ProjectUpdate
from app.database import projects_collection

router = APIRouter(prefix="/projects", tags=["Projects"])


def project_serializer(project) -> dict:
    return {
        "id": str(project["_id"]),
        "projectName": project.get("projectName"),
        "location": project.get("location"),
        "clientName": project.get("clientName"),
        "contractorName": project.get("contractorName"),
        "startDate": project.get("startDate"),
        "endDate": project.get("endDate"),
        "projectType": project.get("projectType"),
        "status": project.get("status"),
        "createdAt": project.get("createdAt")
    }


@router.post("/")
async def create_project(project: ProjectCreate):
    project_data = project.model_dump()
    project_data["createdAt"] = datetime.utcnow().isoformat()

    result = await projects_collection.insert_one(project_data)

    created_project = await projects_collection.find_one({"_id": result.inserted_id})

    return {
        "message": "Project created successfully",
        "project": project_serializer(created_project)
    }


@router.get("/")
async def get_projects():
    projects = []

    cursor = projects_collection.find()

    async for project in cursor:
        projects.append(project_serializer(project))

    return {
        "count": len(projects),
        "projects": projects
    }


@router.get("/{project_id}")
async def get_project(project_id: str):
    if not ObjectId.is_valid(project_id):
        raise HTTPException(status_code=400, detail="Invalid project ID")

    project = await projects_collection.find_one({"_id": ObjectId(project_id)})

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    return {
        "project": project_serializer(project)
    }


@router.put("/{project_id}")
async def update_project(project_id: str, project: ProjectUpdate):
    if not ObjectId.is_valid(project_id):
        raise HTTPException(status_code=400, detail="Invalid project ID")

    update_data = project.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(status_code=400, detail="No data provided for update")

    result = await projects_collection.update_one(
        {"_id": ObjectId(project_id)},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")

    updated_project = await projects_collection.find_one({"_id": ObjectId(project_id)})

    return {
        "message": "Project updated successfully",
        "project": project_serializer(updated_project)
    }


@router.delete("/{project_id}")
async def delete_project(project_id: str):
    if not ObjectId.is_valid(project_id):
        raise HTTPException(status_code=400, detail="Invalid project ID")

    result = await projects_collection.delete_one({"_id": ObjectId(project_id)})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")

    return {
        "message": "Project deleted successfully"
    }
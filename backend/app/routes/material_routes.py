from fastapi import APIRouter, HTTPException
from bson import ObjectId
from datetime import datetime
from app.models.material_model import MaterialCreate, MaterialUpdate
from app.database import materials_collection, reports_collection

router = APIRouter(prefix="/materials", tags=["Materials"])


def material_serializer(material) -> dict:
    return {
        "id": str(material["_id"]),
        "reportId": material.get("reportId"),
        "materialName": material.get("materialName"),
        "unit": material.get("unit"),
        "openingStock": material.get("openingStock"),
        "receivedToday": material.get("receivedToday"),
        "quantityUsed": material.get("quantityUsed"),
        "closingStock": material.get("closingStock"),
        "remarks": material.get("remarks"),
        "createdAt": material.get("createdAt")
    }


@router.post("/")
async def create_material(material: MaterialCreate):
    if not ObjectId.is_valid(material.reportId):
        raise HTTPException(status_code=400, detail="Invalid report ID")

    report = await reports_collection.find_one({"_id": ObjectId(material.reportId)})

    if not report:
        raise HTTPException(status_code=404, detail="Daily report not found")

    material_data = material.model_dump()
    material_data["createdAt"] = datetime.utcnow().isoformat()

    result = await materials_collection.insert_one(material_data)

    created_material = await materials_collection.find_one({"_id": result.inserted_id})

    return {
        "message": "Material entry created successfully",
        "material": material_serializer(created_material)
    }


@router.get("/")
async def get_all_materials():
    materials = []

    cursor = materials_collection.find()

    async for material in cursor:
        materials.append(material_serializer(material))

    return {
        "count": len(materials),
        "materials": materials
    }


@router.get("/report/{report_id}")
async def get_materials_by_report(report_id: str):
    if not ObjectId.is_valid(report_id):
        raise HTTPException(status_code=400, detail="Invalid report ID")

    materials = []

    cursor = materials_collection.find({"reportId": report_id})

    async for material in cursor:
        materials.append(material_serializer(material))

    return {
        "count": len(materials),
        "materials": materials
    }


@router.put("/{material_id}")
async def update_material(material_id: str, material: MaterialUpdate):
    if not ObjectId.is_valid(material_id):
        raise HTTPException(status_code=400, detail="Invalid material ID")

    update_data = material.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(status_code=400, detail="No data provided for update")

    result = await materials_collection.update_one(
        {"_id": ObjectId(material_id)},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Material entry not found")

    updated_material = await materials_collection.find_one({"_id": ObjectId(material_id)})

    return {
        "message": "Material entry updated successfully",
        "material": material_serializer(updated_material)
    }


@router.delete("/{material_id}")
async def delete_material(material_id: str):
    if not ObjectId.is_valid(material_id):
        raise HTTPException(status_code=400, detail="Invalid material ID")

    result = await materials_collection.delete_one({"_id": ObjectId(material_id)})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Material entry not found")

    return {
        "message": "Material entry deleted successfully"
    }
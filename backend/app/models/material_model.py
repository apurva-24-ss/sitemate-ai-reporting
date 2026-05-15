from pydantic import BaseModel
from typing import Optional


class MaterialCreate(BaseModel):
    reportId: str
    materialName: str
    unit: str
    openingStock: float
    receivedToday: float
    quantityUsed: float
    closingStock: float
    remarks: Optional[str] = None


class MaterialUpdate(BaseModel):
    materialName: Optional[str] = None
    unit: Optional[str] = None
    openingStock: Optional[float] = None
    receivedToday: Optional[float] = None
    quantityUsed: Optional[float] = None
    closingStock: Optional[float] = None
    remarks: Optional[str] = None
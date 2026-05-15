from pydantic import BaseModel
from typing import Optional


class LaborCreate(BaseModel):
    reportId: str
    laborType: str
    count: int
    workingHours: float
    workAssigned: str
    overtime: Optional[float] = 0


class LaborUpdate(BaseModel):
    laborType: Optional[str] = None
    count: Optional[int] = None
    workingHours: Optional[float] = None
    workAssigned: Optional[str] = None
    overtime: Optional[float] = None
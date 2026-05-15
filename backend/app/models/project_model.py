from pydantic import BaseModel
from typing import Optional


class ProjectCreate(BaseModel):
    projectName: str
    location: str
    clientName: str
    contractorName: str
    startDate: str
    endDate: str
    projectType: str
    status: str = "In Progress"


class ProjectUpdate(BaseModel):
    projectName: Optional[str] = None
    location: Optional[str] = None
    clientName: Optional[str] = None
    contractorName: Optional[str] = None
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    projectType: Optional[str] = None
    status: Optional[str] = None
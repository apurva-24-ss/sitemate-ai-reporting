from pydantic import BaseModel
from typing import Optional


class ReportCreate(BaseModel):
    projectId: str
    date: str
    weather: str
    workCompleted: str
    workPlannedTomorrow: str
    delayReason: Optional[str] = None
    siteIssues: Optional[str] = None
    remarks: Optional[str] = None
    createdBy: Optional[str] = None


class ReportUpdate(BaseModel):
    date: Optional[str] = None
    weather: Optional[str] = None
    workCompleted: Optional[str] = None
    workPlannedTomorrow: Optional[str] = None
    delayReason: Optional[str] = None
    siteIssues: Optional[str] = None
    remarks: Optional[str] = None
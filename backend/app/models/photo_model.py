from pydantic import BaseModel
from typing import Optional


class PhotoResponse(BaseModel):
    id: str
    reportId: str
    caption: Optional[str] = None
    filename: str
    photoUrl: str
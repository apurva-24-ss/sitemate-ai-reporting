from motor.motor_asyncio import AsyncIOMotorClient
from app.config import MONGO_URI

client = AsyncIOMotorClient(MONGO_URI)
database = client["sitemate_ai"]

users_collection = database["users"]
projects_collection = database["projects"]
reports_collection = database["daily_reports"]
labor_collection = database["labor"]
materials_collection = database["materials"]
photos_collection = database["photos"]
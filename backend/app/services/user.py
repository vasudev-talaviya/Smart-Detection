from app.database import get_database
from app.models.user import UserCreate
from typing import List

async def create_user(user: UserCreate) -> dict:
    db = get_database()
    user_dict = user.model_dump()
    result = await db.users.insert_one(user_dict)
    user_dict["id"] = str(result.inserted_id)
    return user_dict

async def get_users(skip: int = 0, limit: int = 10) -> tuple[List[dict], int]:
    db = get_database()
    users = []
    
    # Get total count
    total_count = await db.users.count_documents({})
    
    # Fetch paginated users
    cursor = db.users.find({}).skip(skip).limit(limit)
    async for document in cursor:
        document["id"] = str(document.pop("_id"))
        users.append(document)
        
    return users, total_count

from bson import ObjectId

async def update_user(user_id: str, updates: dict) -> dict:
    db = get_database()
    if updates:
        await db.users.update_one({"_id": ObjectId(user_id)}, {"$set": updates})
    # Fetch updated user
    updated_user = await db.users.find_one({"_id": ObjectId(user_id)})
    if updated_user:
        updated_user["id"] = str(updated_user.pop("_id"))
        return updated_user
    return None

async def delete_user(user_id: str) -> bool:
    db = get_database()
    result = await db.users.delete_one({"_id": ObjectId(user_id)})
    return result.deleted_count > 0

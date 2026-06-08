from pydantic import BaseModel, Field
from typing import List

class UserCreate(BaseModel):
    name: str = Field(..., description="Name of the user")
    imageembedding: List[float] = Field(..., description="Image embedding array")
    voiceembedding: List[float] = Field(..., description="Voice embedding array")

class UserInDB(UserCreate):
    id: str = Field(..., alias="_id")

class UserResponse(UserCreate):
    id: str

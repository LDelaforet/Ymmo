from pydantic import BaseModel
from typing import Optional

class UserBase(BaseModel):
    first_name: str
    last_name: str
    email: str

    class Config:
        from_attributes = True

class UserCreate(UserBase):
    password: str = ""
    role: str = "client"

class LoginRequest(BaseModel):
    email: str
    password: str

class AuthUser(UserBase):
    id: int
    role: str

    class Config:
        from_attributes = True

class AgentSchema(BaseModel):
    agent_id: int
    specialty: str
    user: UserBase  # <--- This "nests" the user data inside the agent JSON!

    class Config:
        from_attributes = True

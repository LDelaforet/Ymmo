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

class PropertyCreate(BaseModel):
    title: str
    description: str
    price: float
    location: str
    status: str = "available"
    bedrooms: int = 1
    surface: int = 45
    property_type: str = "apartment"
    photo_url: str = ""
    agency_id: int
    agent_id: int

class PropertyUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    location: Optional[str] = None
    status: Optional[str] = None
    bedrooms: Optional[int] = None
    surface: Optional[int] = None
    property_type: Optional[str] = None
    photo_url: Optional[str] = None
    agency_id: Optional[int] = None
    agent_id: Optional[int] = None

class VisitRequestCreate(BaseModel):
    user_id: Optional[int] = None
    name: str
    email: str
    message: str = ""

class VisitStatusUpdate(BaseModel):
    status: str

class ForgotPasswordRequest(BaseModel):
    email: str

class TransactionCreate(BaseModel):
    client_id: int
    property_id: Optional[int] = None
    agent_id: Optional[int] = None
    agency_id: Optional[int] = None
    transaction_type: str = "purchase"
    status: str = "new"
    budget: Optional[float] = None
    notes: str = ""

class TransactionUpdate(BaseModel):
    property_id: Optional[int] = None
    agent_id: Optional[int] = None
    agency_id: Optional[int] = None
    transaction_type: Optional[str] = None
    status: Optional[str] = None
    budget: Optional[float] = None
    notes: Optional[str] = None

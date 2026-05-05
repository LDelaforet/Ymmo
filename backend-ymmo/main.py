from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from database import engine, get_db
import models
from schemas import AgentSchema, AuthUser, LoginRequest, UserBase, UserCreate

app = FastAPI(
    title="Ymmo API",
    description="A real estate management API for managing properties, agents, agencies, and users.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables if they don't exist
models.Base.metadata.create_all(bind=engine)

@app.get("/", tags=["Home"])
def home():
    """Welcome endpoint - Confirms the API is running."""
    return {"message": "Ymmo API is running. Visit /docs for the interactive UI."}

# ===== AUTH =====
@app.post("/auth/login", tags=["Auth"], summary="Log in with email and password")
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    """Return the matching user for the frontend session."""
    user = db.query(models.User).filter(models.User.email == credentials.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    legacy_password = user.password in (None, "")
    password_matches = user.password == credentials.password
    legacy_dev_login = legacy_password and credentials.password in ("", "password")

    if not password_matches and not legacy_dev_login:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "role": user.role,
    }

# ===== USERS =====
@app.get("/users", tags=["Users"], summary="Get all users")
def get_users(db: Session = Depends(get_db)):
    """Retrieve all users from the system."""
    users = db.query(models.User).all()
    return users

@app.get("/users/{user_id}", tags=["Users"], summary="Get user by ID")
def get_user(user_id: int, db: Session = Depends(get_db)):
    """Retrieve a specific user by their ID."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.post("/users", tags=["Users"], summary="Create a new user")
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """Create a new user in the system."""
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=409, detail="Email already exists")

    role = user.role if user.role in ("client", "agent", "admin") else "client"
    db_user = models.User(
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        password=user.password,
        role=role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# ===== AGENTS =====
@app.get("/agents", tags=["Agents"], summary="Get all agents")
def get_agents(db: Session = Depends(get_db)):
    """Retrieve all real estate agents."""
    agents = db.query(models.Agent).all()
    return agents

@app.get("/agents/{agent_id}", tags=["Agents"], summary="Get agent by ID")
def get_agent(agent_id: int, db: Session = Depends(get_db)):
    """Retrieve a specific agent by their ID."""
    agent = db.query(models.Agent).filter(models.Agent.agent_id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent

# ===== PROPERTIES =====
@app.get("/properties", tags=["Properties"], summary="Get all properties")
def get_properties(db: Session = Depends(get_db)):
    """Retrieve all property listings."""
    properties = db.query(models.Property).all()
    return properties

@app.get("/properties/{property_id}", tags=["Properties"], summary="Get property by ID")
def get_property(property_id: int, db: Session = Depends(get_db)):
    """Retrieve a specific property by its ID."""
    prop = db.query(models.Property).filter(models.Property.property_id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    return prop

@app.get("/properties/agency/{agency_id}", tags=["Properties"], summary="Get properties by agency")
def get_properties_by_agency(agency_id: int, db: Session = Depends(get_db)):
    """Retrieve all properties managed by a specific agency."""
    properties = db.query(models.Property).filter(models.Property.agency_id == agency_id).all()
    return properties

# ===== AGENCIES =====
@app.get("/agencies", tags=["Agencies"], summary="Get all agencies")
def get_agencies(db: Session = Depends(get_db)):
    """Retrieve all real estate agencies."""
    return db.query(models.Agency).all()

@app.get("/agencies/{agency_id}", tags=["Agencies"], summary="Get agency by ID")
def get_agency(agency_id: int, db: Session = Depends(get_db)):
    """Retrieve a specific agency by its ID."""
    agency = db.query(models.Agency).filter(models.Agency.agency_id == agency_id).first()
    if not agency:
        raise HTTPException(status_code=404, detail="Agency not found")
    return agency

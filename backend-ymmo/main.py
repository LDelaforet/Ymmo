from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text
from sqlalchemy.orm import Session
from database import engine, get_db
import models
from schemas import (
    ForgotPasswordRequest,
    LoginRequest,
    PropertyCreate,
    PropertyUpdate,
    UserCreate,
    VisitRequestCreate,
    VisitStatusUpdate,
)

from fastapi.staticfiles import StaticFiles

app = FastAPI(
    title="Ymmo API",
    description="A real estate management API for managing properties, agents, agencies, and users.",
    version="1.0.0"
)

app.mount("/backend-ymmo/assets", StaticFiles(directory="assets"), name="assets")

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

models.Base.metadata.create_all(bind=engine)

def ensure_property_columns():
    inspector = inspect(engine)
    if "properties" not in inspector.get_table_names():
        return

    existing_columns = {
        column["name"] for column in inspector.get_columns("properties")
    }
    column_statements = {
        "bedrooms": "ALTER TABLE properties ADD COLUMN bedrooms INTEGER DEFAULT 1",
        "surface": "ALTER TABLE properties ADD COLUMN surface INTEGER DEFAULT 45",
        "property_type": "ALTER TABLE properties ADD COLUMN property_type VARCHAR(50) DEFAULT 'apartment'",
        "photo_url": "ALTER TABLE properties ADD COLUMN photo_url VARCHAR(1000) DEFAULT ''",
        "created_at": "ALTER TABLE properties ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP",
    }

    with engine.begin() as connection:
        for column_name, statement in column_statements.items():
            if column_name not in existing_columns:
                connection.execute(text(statement))

ensure_property_columns()

@app.get("/", tags=["Home"])
def home():
    """Welcome endpoint - Confirms the API is running."""
    return {"message": "Ymmo API is running. Visit /docs for the interactive UI."}

# ===== AUTH =====
@app.post("/auth/login", tags=["Auth"], summary="Log in with email and password")
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    """Return the matching user for the frontend session."""
    user = db.query(models.User).filter_by(email=credentials.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    legacy_password = user.password in (None, "")
    password_matches = user.password == credentials.password
    legacy_dev_login = legacy_password and credentials.password in ("", "password")

    if not password_matches and not legacy_dev_login:  # type: ignore
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "role": user.role,
    }

@app.post("/auth/forgot-password", tags=["Auth"], summary="Start password recovery")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Return a neutral recovery response so account existence is not leaked."""
    db.query(models.User).filter(models.User.email == payload.email).first()
    return {
        "message": "If an account exists for this email, password reset instructions have been sent."
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

@app.get("/users/{user_id}/saved-properties", tags=["Users"], summary="Get saved property IDs")
def get_saved_properties(user_id: int, db: Session = Depends(get_db)):
    saved_rows = db.query(models.SavedProperty).filter(
        models.SavedProperty.user_id == user_id
    ).all()
    return [row.property_id for row in saved_rows]

@app.post("/users/{user_id}/saved-properties/{property_id}", tags=["Users"], summary="Save a property")
def save_property(user_id: int, property_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    prop = db.query(models.Property).filter(models.Property.property_id == property_id).first()
    if not user or not prop:
        raise HTTPException(status_code=404, detail="User or property not found")

    existing = db.query(models.SavedProperty).filter(
        models.SavedProperty.user_id == user_id,
        models.SavedProperty.property_id == property_id,
    ).first()
    if existing:
        return existing

    saved = models.SavedProperty(user_id=user_id, property_id=property_id)
    db.add(saved)
    db.commit()
    db.refresh(saved)
    return saved

@app.delete("/users/{user_id}/saved-properties/{property_id}", tags=["Users"], summary="Remove a saved property")
def remove_saved_property(user_id: int, property_id: int, db: Session = Depends(get_db)):
    saved = db.query(models.SavedProperty).filter(
        models.SavedProperty.user_id == user_id,
        models.SavedProperty.property_id == property_id,
    ).first()
    if not saved:
        return {"removed": False}

    db.delete(saved)
    db.commit()
    return {"removed": True}

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

@app.get("/properties/agency/{agency_id}", tags=["Properties"], summary="Get properties by agency")
def get_properties_by_agency(agency_id: int, db: Session = Depends(get_db)):
    """Retrieve all properties managed by a specific agency."""
    properties = db.query(models.Property).filter(models.Property.agency_id == agency_id).all()
    return properties

@app.post("/properties", tags=["Properties"], summary="Create a property")
def create_property(property_data: PropertyCreate, db: Session = Depends(get_db)):
    prop = models.Property(**property_data.dict())
    db.add(prop)
    db.commit()
    db.refresh(prop)
    return prop

@app.get("/properties/{property_id}", tags=["Properties"], summary="Get property by ID")
def get_property(property_id: int, db: Session = Depends(get_db)):
    """Retrieve a specific property by its ID."""
    prop = db.query(models.Property).filter(models.Property.property_id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    return prop

@app.patch("/properties/{property_id}", tags=["Properties"], summary="Update a property")
def update_property(property_id: int, property_data: PropertyUpdate, db: Session = Depends(get_db)):
    prop = db.query(models.Property).filter(models.Property.property_id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")

    for field, value in property_data.dict(exclude_unset=True).items():
        setattr(prop, field, value)

    db.commit()
    db.refresh(prop)
    return prop

@app.post("/properties/{property_id}/visit-requests", tags=["Properties"], summary="Request a visit")
def create_visit_request(property_id: int, visit: VisitRequestCreate, db: Session = Depends(get_db)):
    prop = db.query(models.Property).filter(models.Property.property_id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")

    request = models.VisitRequest(property_id=property_id, **visit.dict())
    db.add(request)
    db.commit()
    db.refresh(request)
    return request

@app.get("/visit-requests", tags=["Visits"], summary="Get visit requests")
def get_visit_requests(db: Session = Depends(get_db)):
    return db.query(models.VisitRequest).order_by(models.VisitRequest.created_at.desc()).all()

@app.patch("/visit-requests/{visit_id}", tags=["Visits"], summary="Update a visit request")
def update_visit_request(visit_id: int, payload: VisitStatusUpdate, db: Session = Depends(get_db)):
    request = db.query(models.VisitRequest).filter(models.VisitRequest.visit_id == visit_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Visit request not found")

    request.status = payload.status  # type: ignore
    db.commit()
    db.refresh(request)
    return request

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

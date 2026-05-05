from sqlalchemy.orm import Session
import models

# --- AGENCY CRUD ---
def get_agencies(db: Session):
    return db.query(models.Agency).all()

# --- USER CRUD ---
def get_users(db: Session):
    return db.query(models.User).all()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

# --- AGENT CRUD ---
def get_agents(db: Session):

    return db.query(models.Agent).all()

# --- PROPERTY CRUD ---
def get_properties(db: Session):
    return db.query(models.Property).all()

def get_property(db: Session, property_id: int):
    return db.query(models.Property).filter(models.Property.property_id == property_id).first()
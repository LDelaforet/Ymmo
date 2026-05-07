from sqlalchemy import Column, Integer, String, ForeignKey, Numeric, Boolean, Enum, DateTime
from sqlalchemy.sql import func
from database import Base
from sqlalchemy.orm import relationship

class Agency(Base):
    __tablename__ = "agencies"
    agency_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    city = Column(String(100))
    is_hq = Column(Boolean, default=False)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100))
    last_name = Column(String(100))
    email = Column(String(100), unique=True, index=True)
    password = Column(String(255))
    role = Column(String(20)) # admin, agent, client

class Property(Base):
    __tablename__ = "properties"
    property_id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255))
    description = Column(String(1000))
    price = Column(Numeric(15, 2))
    location = Column(String(255))
    status = Column(String(50), default="available")
    bedrooms = Column(Integer, default=1)
    surface = Column(Integer, default=45)
    property_type = Column(String(50), default="apartment")
    photo_url = Column(String(1000), default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    agency_id = Column(Integer, ForeignKey("agencies.agency_id"))
    agent_id = Column(Integer, ForeignKey("agents.agent_id"))

class Agent(Base):
    __tablename__ = "agents"
    agent_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id")) 
    agency_id = Column(Integer, ForeignKey("agencies.agency_id"))
    specialty = Column(String(255)) 
    is_active = Column(Boolean, default=True)
    user = relationship("User") 
    agency = relationship("Agency")

class VisitRequest(Base):
    __tablename__ = "visit_requests"
    visit_id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.property_id"))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    name = Column(String(200))
    email = Column(String(200))
    message = Column(String(1000), default="")
    status = Column(String(50), default="new")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class SavedProperty(Base):
    __tablename__ = "saved_properties"
    saved_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    property_id = Column(Integer, ForeignKey("properties.property_id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Transaction(Base):
    __tablename__ = "transactions"
    transaction_id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    property_id = Column(Integer, ForeignKey("properties.property_id"), nullable=True, index=True)
    agent_id = Column(Integer, ForeignKey("agents.agent_id"), nullable=True, index=True)
    agency_id = Column(Integer, ForeignKey("agencies.agency_id"), nullable=True, index=True)
    transaction_type = Column(String(20), default="purchase")  # purchase, sale
    status = Column(String(50), default="new")  # new, in_review, offer, signed, completed, cancelled
    budget = Column(Numeric(15, 2), nullable=True)
    notes = Column(String(1000), default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

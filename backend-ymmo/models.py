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
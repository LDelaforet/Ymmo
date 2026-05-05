# Ymmo - Real Estate Management API

A FastAPI-based backend application for managing real estate properties, agents, agencies, and users. Built with SQLAlchemy ORM and PostgreSQL.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Running the Project](#running-the-project)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Environment Variables](#environment-variables)

## ✨ Features

- **User Management**: Admin, agent, and client user roles
- **Agency Management**: Manage multiple real estate agencies with headquarters tracking
- **Agent Management**: Track real estate agents with specialties and agency associations
- **Property Listings**: Full CRUD operations for property listings
- **RESTful API**: Interactive documentation available at `/docs`
- **Database ORM**: SQLAlchemy for type-safe database operations

## 🛠️ Tech Stack

- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- **Database**: PostgreSQL with [SQLAlchemy](https://www.sqlalchemy.org/) ORM
- **Python**: 3.8+
- **API Documentation**: Swagger UI (built-in with FastAPI)

## 📁 Project Structure

```
backend-ymmo/
├── main.py          # FastAPI application and route handlers
├── models.py        # SQLAlchemy ORM models (User, Agent, Agency, Property)
├── schemas.py       # Pydantic schemas for request/response validation
├── database.py      # Database connection and session management
└── crud.py          # CRUD operations
```

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Ymmo
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install fastapi sqlalchemy psycopg2-binary python-dotenv uvicorn
   ```

4. **Set up environment variables**
   Create a `.env` file in the `backend-ymmo/` directory:
   ```
   DATABASE_URL=postgresql://user:password@localhost/ymmo_db
   ```

## ▶️ Running the Project

1. **Ensure XAMPP is running**
   - Start the Apache and MySQL services in XAMPP Control Panel

2. **Start the development server**
   ```bash
   cd backend-ymmo
   python -m uvicorn main:app --reload
   ```

3. **Access the API**
   - API: http://localhost:8000
   - Interactive Docs: http://localhost:8000/docs
   - Alternative Docs: http://localhost:8000/redoc

## 📡 API Endpoints

### Home
- `GET /` - Welcome message and API status

### Users
- `GET /users` - Get all users

### Agents
- `GET /agents` - Get all agents

### Properties
- `GET /properties` - Get all properties

### Agencies
- `GET /agencies` - Get all agencies

## 🗄️ Database Schema

### Agencies Table
- `agency_id` (Primary Key)
- `name` - Agency name
- `city` - Location
- `is_hq` - Headquarters flag

### Users Table
- `id` (Primary Key)
- `first_name`, `last_name`
- `email` (Unique)
- `password`
- `role` - 'admin', 'agent', or 'client'

### Agents Table
- `agent_id` (Primary Key)
- `user_id` (Foreign Key to Users)
- `agency_id` (Foreign Key to Agencies)
- `specialty` - Area of expertise
- `is_active` - Active status

### Properties Table
- `property_id` (Primary Key)
- `title`, `description`
- `price`
- `location`
- `status` - 'available', 'sold', etc.
- `agency_id`, `agent_id` (Foreign Keys)

## 🔧 Environment Variables

Required environment variables in `.env`:
- `DATABASE_URL` - PostgreSQL connection string

## 📝 License

This project is part of the Ynov curriculum.
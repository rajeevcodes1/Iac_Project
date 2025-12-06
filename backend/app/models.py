from sqlalchemy import (
    Column, Integer, String, Float, Boolean,
    ForeignKey, DateTime
)
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="admin")
    is_active = Column(Boolean, default=True)


class Building(Base):
    __tablename__ = "buildings"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)  # school, college, office, residential
    latitude = Column(Float)
    longitude = Column(Float)
    city_zone = Column(String)

    sensors = relationship("Sensor", back_populates="building")
    institutions = relationship("Institution", back_populates="building")


class Sensor(Base):
    __tablename__ = "sensors"

    id = Column(Integer, primary_key=True, index=True)
    building_id = Column(Integer, ForeignKey("buildings.id", ondelete="CASCADE"))
    sensor_type = Column(String, default="energy_meter")
    unit = Column(String, default="kWh")
    is_active = Column(Boolean, default=True)

    building = relationship("Building", back_populates="sensors")
    readings = relationship("EnergyReading", back_populates="sensor")


class EnergyReading(Base):
    __tablename__ = "energy_readings"

    id = Column(Integer, primary_key=True, index=True)
    sensor_id = Column(Integer, ForeignKey("sensors.id", ondelete="CASCADE"))
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    value = Column(Float, nullable=False)

    sensor = relationship("Sensor", back_populates="readings")


class Institution(Base):
    __tablename__ = "institutions"

    id = Column(Integer, primary_key=True, index=True)
    building_id = Column(Integer, ForeignKey("buildings.id", ondelete="SET NULL"))
    name = Column(String, nullable=False)
    level = Column(String)  # school, college
    student_count = Column(Integer, default=0)

    building = relationship("Building", back_populates="institutions")
    students = relationship("Student", back_populates="institution")


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    institution_id = Column(Integer, ForeignKey("institutions.id", ondelete="CASCADE"))
    name = Column(String, nullable=False)
    grade_level = Column(String)
    risk_score = Column(Float, default=0.0)

    institution = relationship("Institution", back_populates="students")
    performances = relationship("StudentPerformance", back_populates="student")


class StudentPerformance(Base):
    __tablename__ = "student_performances"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"))
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    score = Column(Float, nullable=False)
    attendance = Column(Float, default=1.0)  # 0-1

    student = relationship("Student", back_populates="performances")


class EnergyForecast(Base):
    __tablename__ = "energy_forecasts"

    id = Column(Integer, primary_key=True, index=True)
    building_id = Column(Integer, ForeignKey("buildings.id", ondelete="CASCADE"))
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    horizon_hours = Column(Integer)
    predicted_value = Column(Float)


class EducationForecast(Base):
    __tablename__ = "education_forecasts"

    id = Column(Integer, primary_key=True, index=True)
    institution_id = Column(Integer, ForeignKey("institutions.id", ondelete="CASCADE"))
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    risk_level = Column(Float)
    notes = Column(String)

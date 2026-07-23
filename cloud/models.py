"""Modelos de base de datos para el Monitor Cloud TUSTOCK."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime, Text, JSON
from sqlalchemy.orm import declarative_base, sessionmaker

from config import DATABASE_URL

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()


class Business(Base):
    __tablename__ = "businesses"

    id = Column(Integer, primary_key=True)
    name = Column(String(200), nullable=False)
    email = Column(String(200), unique=True, nullable=False)
    password_hash = Column(String(200), nullable=False)
    api_key = Column(String(64), unique=True, nullable=False, default=lambda: uuid.uuid4().hex)
    is_active = Column(Boolean, default=True)
    terms_accepted = Column(Boolean, default=False)
    terms_accepted_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class MetricsPush(Base):
    __tablename__ = "metrics_pushes"

    id = Column(Integer, primary_key=True)
    business_id = Column(Integer, nullable=False, index=True)
    payload = Column(JSON, nullable=False)
    pushed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True)
    license_key = Column(String(50), nullable=False, index=True)
    plan = Column(String(30), nullable=False)
    price = Column(Float, nullable=False)
    preference_id = Column(String(50))
    init_point = Column(String(500))
    payment_id = Column(String(50))
    status = Column(String(30), default="pending")
    customer_email = Column(String(200), default="")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    paid_at = Column(DateTime)


class AuthorizedKey(Base):
    __tablename__ = "authorized_keys"

    id = Column(Integer, primary_key=True)
    license_key = Column(String(50), unique=True, nullable=False, index=True)
    plan = Column(String(30), nullable=False)
    customer_name = Column(String(200), default="")
    is_active = Column(Boolean, default=True)
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class KeyActivation(Base):
    __tablename__ = "key_activations"

    id = Column(Integer, primary_key=True)
    license_key = Column(String(50), nullable=False, index=True)
    machine_id = Column(String(100), nullable=False)
    hostname = Column(String(200), default="")
    activated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True)
    license_key = Column(String(50), nullable=False, index=True)
    preapproval_id = Column(String(50), unique=True)
    plan = Column(String(30), nullable=False)
    price = Column(Float, nullable=False)
    status = Column(String(30), default="pending")
    init_point = Column(String(500))
    customer_email = Column(String(200), default="")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    paid_at = Column(DateTime)
    last_payment_id = Column(String(50))
    last_payment_status = Column(String(30), default="")
    grace_period_end = Column(DateTime, nullable=True)


def init_db():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

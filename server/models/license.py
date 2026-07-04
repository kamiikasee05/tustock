from sqlalchemy import Column, Integer, String, Boolean, Date, DateTime, func
from database import Base


class License(Base):
    __tablename__ = "licenses"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(64), unique=True, nullable=False, index=True)
    plan = Column(String(20), nullable=False, default="trial")
    active = Column(Boolean, default=True)
    customer_name = Column(String(200), default="")
    customer_email = Column(String(200), default="")
    max_products = Column(Integer, default=50)
    reports_enabled = Column(Boolean, default=False)
    export_enabled = Column(Boolean, default=False)
    monitor_enabled = Column(Boolean, default=False)
    backup_enabled = Column(Boolean, default=False)
    expires_at = Column(Date, nullable=True)
    last_validated_at = Column(DateTime, nullable=True)
    subscription_grace_days_left = Column(Integer, nullable=True)
    subscription_suspended = Column(Boolean, default=False)
    eula_accepted = Column(Boolean, default=False)
    eula_accepted_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

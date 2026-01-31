from datetime import datetime
from sqlalchemy.orm import Session

from models import AttendanceSession


def close_expired_sessions(db: Session):
    """
    Marks all expired attendance sessions as inactive
    """
    db.query(AttendanceSession).filter(
        AttendanceSession.is_active == True,
        AttendanceSession.expires_at < datetime.utcnow()
    ).update(
        {AttendanceSession.is_active: False},
        synchronize_session=False
    )
    db.commit()

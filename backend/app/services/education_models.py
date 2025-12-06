from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from .. import models


def update_student_risk_scores(db: Session, institution_id: int):
    one_month_ago = datetime.utcnow() - timedelta(days=30)
    students = (
        db.query(models.Student)
        .filter(models.Student.institution_id == institution_id)
        .all()
    )
    for student in students:
        performances = (
            db.query(models.StudentPerformance)
            .filter(
                models.StudentPerformance.student_id == student.id,
                models.StudentPerformance.timestamp >= one_month_ago,
            )
            .all()
        )
        if not performances:
            student.risk_score = 0.2
            continue

        avg_score = sum(p.score for p in performances) / len(performances)
        avg_attendance = sum(p.attendance for p in performances) / len(performances)

        score_component = max(0.0, (70 - avg_score) / 70)
        attendance_component = max(0.0, (0.9 - avg_attendance) / 0.9)

        risk = 0.5 * score_component + 0.5 * attendance_component
        risk = max(0.0, min(1.0, risk))
        student.risk_score = risk

    db.commit()


def compute_institution_risk(db: Session, institution_id: int) -> models.EducationForecast:
    update_student_risk_scores(db, institution_id)
    students = (
        db.query(models.Student)
        .filter(models.Student.institution_id == institution_id)
        .all()
    )
    if not students:
        avg_risk = 0.0
    else:
        avg_risk = sum(s.risk_score for s in students) / len(students)

    forecast = models.EducationForecast(
        institution_id=institution_id,
        risk_level=avg_risk,
        notes="Higher value indicates higher dropout/underperformance risk.",
    )
    db.add(forecast)
    db.commit()
    db.refresh(forecast)
    return forecast

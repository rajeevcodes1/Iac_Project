from datetime import datetime, timedelta
from random import uniform
from .database import SessionLocal, engine, Base
from . import models


def reset_db():
    print("Dropping & recreating tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def seed_users(db):
    print("Seeding users...")
    user = models.User(
        email="admin@smartedcity.in",
        hashed_password="dummy-hash",
        role="city_admin",
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def seed_buildings(db):
    print("Seeding buildings...")
    buildings_data = [
        {
            "name": "Govt High School, Whitefield",
            "type": "school",
            "latitude": 12.9698,
            "longitude": 77.7500,
            "city_zone": "Whitefield",
        },
        {
            "name": "Indiranagar PU College",
            "type": "college",
            "latitude": 12.9784,
            "longitude": 77.6408,
            "city_zone": "Indiranagar",
        },
        {
            "name": "Manyata Tech Park, Nagawara",
            "type": "office",
            "latitude": 13.0517,
            "longitude": 77.6200,
            "city_zone": "Nagawara",
        },
        {
            "name": "Brigade Lakefront Apartments, EPIP",
            "type": "residential",
            "latitude": 12.9820,
            "longitude": 77.7270,
            "city_zone": "EPIP Zone",
        },
        {
            "name": "BESCOM Substation, Whitefield",
            "type": "office",
            "latitude": 12.9690,
            "longitude": 77.7440,
            "city_zone": "Whitefield",
        },
    ]
    buildings = []
    for b in buildings_data:
        building = models.Building(**b)
        db.add(building)
        db.commit()
        db.refresh(building)
        buildings.append(building)
    return buildings


def seed_sensors(db, buildings):
    print("Seeding sensors...")
    sensors = []
    for b in buildings:
        main = models.Sensor(
            building_id=b.id,
            sensor_type="energy_meter",
            unit="kWh",
            is_active=True,
        )
        db.add(main)
        db.commit()
        db.refresh(main)
        sensors.append(main)

        if b.type in ["office", "college"]:
            hvac = models.Sensor(
                building_id=b.id,
                sensor_type="hvac_meter",
                unit="kWh",
                is_active=True,
            )
            db.add(hvac)
            db.commit()
            db.refresh(hvac)
            sensors.append(hvac)
    return sensors


def seed_institutions(db, buildings):
    print("Seeding institutions...")
    school_building = buildings[0]
    college_building = buildings[1]

    school = models.Institution(
        building_id=school_building.id,
        name="Govt High School Whitefield",
        level="school",
        student_count=600,
    )
    college = models.Institution(
        building_id=college_building.id,
        name="Indiranagar PU College",
        level="college",
        student_count=800,
    )
    db.add(school)
    db.add(college)
    db.commit()
    db.refresh(school)
    db.refresh(college)
    return school, college


def seed_students(db, school, college):
    print("Seeding students...")
    school_students_data = [
        {"name": "Aarav R", "grade_level": "9"},
        {"name": "Meera S", "grade_level": "10"},
        {"name": "Rohan K", "grade_level": "10"},
        {"name": "Lakshmi P", "grade_level": "8"},
    ]
    college_students_data = [
        {"name": "Ananya N", "grade_level": "PU2"},
        {"name": "Siddharth B", "grade_level": "PU1"},
        {"name": "Karthik V", "grade_level": "PU2"},
        {"name": "Priya C", "grade_level": "PU1"},
    ]
    school_students = []
    college_students = []

    for s in school_students_data:
        stu = models.Student(
            institution_id=school.id,
            name=s["name"],
            grade_level=s["grade_level"],
            risk_score=0.0,
        )
        db.add(stu)
        db.commit()
        db.refresh(stu)
        school_students.append(stu)

    for s in college_students_data:
        stu = models.Student(
            institution_id=college.id,
            name=s["name"],
            grade_level=s["grade_level"],
            risk_score=0.0,
        )
        db.add(stu)
        db.commit()
        db.refresh(stu)
        college_students.append(stu)

    return school_students, college_students


def seed_student_performance(db, students, base_score, score_spread, low_attendance=False):
    print(f"Seeding performances for {len(students)} students...")
    today = datetime.utcnow().date()
    start_date = today - timedelta(days=30)

    for stu in students:
        current = start_date
        while current <= today:
            if current.weekday() < 5:
                score = base_score + uniform(-score_spread, score_spread)
                score = max(0.0, min(100.0, score))
                if low_attendance:
                    attendance = uniform(0.3, 0.8)
                else:
                    attendance = uniform(0.85, 1.0)

                perf = models.StudentPerformance(
                    student_id=stu.id,
                    timestamp=datetime(current.year, current.month, current.day, 8, 30),
                    score=score,
                    attendance=attendance,
                )
                db.add(perf)
            current += timedelta(days=1)

    db.commit()


def seed_energy_readings(db, sensors):
    print("Seeding energy readings (last 2 days, hourly)...")
    end_time = datetime.utcnow().replace(minute=0, second=0, microsecond=0)
    start_time = end_time - timedelta(days=2)
    current = start_time

    while current <= end_time:
        hour = current.hour
        for sensor in sensors:
            btype = sensor.building.type
            if btype == "school":
                base = 15 if 8 <= hour <= 15 else 3
            elif btype == "college":
                base = 35 if 8 <= hour <= 18 else 5
            elif btype == "office":
                base = 50 if 9 <= hour <= 19 else 10
            elif btype == "residential":
                base = 25 if (6 <= hour <= 9 or 18 <= hour <= 23) else 8
            else:
                base = 10

            if sensor.sensor_type == "hvac_meter":
                if 9 <= hour <= 18:
                    base = base * 0.4
                else:
                    base = 0.5

            value = base + uniform(-0.1 * base, 0.1 * base)
            value = max(0.5, value)

            reading = models.EnergyReading(
                sensor_id=sensor.id,
                timestamp=current,
                value=value,
            )
            db.add(reading)
        current += timedelta(hours=1)

    db.commit()


def main():
    reset_db()
    db = SessionLocal()
    try:
        user = seed_users(db)
        buildings = seed_buildings(db)
        sensors = seed_sensors(db, buildings)
        school, college = seed_institutions(db, buildings)
        school_students, college_students = seed_students(db, school, college)

        seed_student_performance(db, [school_students[0], school_students[1]], base_score=78, score_spread=8)
        seed_student_performance(db, [school_students[2], school_students[3]], base_score=55, score_spread=15, low_attendance=True)
        seed_student_performance(db, [college_students[0], college_students[1]], base_score=82, score_spread=6)
        seed_student_performance(db, [college_students[2], college_students[3]], base_score=60, score_spread=12, low_attendance=True)

        seed_energy_readings(db, sensors)

        print("✅ Seeding completed successfully.")
    finally:
        db.close()


if __name__ == "__main__":
    main()

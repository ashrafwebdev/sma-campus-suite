"""Seed baseline roles, permissions and the first admin user.

Run with: python -m app.seed
"""
from app.core.config import settings
from app.core.database import Base, SessionLocal, engine
from app.core.security import hash_password
from app.models.role import Permission, Role
from app.models.user import User

PERMISSIONS = [
    ("user.index", "User View", "User"),
    ("user.store", "User Create", "User"),
    ("user.show", "User View", "User"),
    ("user.update", "User Edit", "User"),
    ("user.destroy", "User Delete", "User"),
    ("role.index", "Role View", "Role"),
    ("role.store", "Role Create", "Role"),
    ("role.update", "Role Edit", "Role"),
    ("role.destroy", "Role Delete", "Role"),
    ("academic.class", "Class View", "Academic"),
    ("academic.class_store", "Class Create", "Academic"),
    ("academic.class_update", "Class Edit", "Academic"),
    ("academic.class_destroy", "Class Delete", "Academic"),
    ("academic.section", "Section View", "Academic"),
    ("academic.section_store", "Section Create", "Academic"),
    ("academic.section_update", "Section Edit", "Academic"),
    ("academic.section_destroy", "Section Delete", "Academic"),
    ("academic.subject", "Subject View", "Academic"),
    ("academic.subject_store", "Subject Create", "Academic"),
    ("academic.subject_update", "Subject Edit", "Academic"),
    ("academic.subject_destroy", "Subject Delete", "Academic"),
    ("student.index", "Student View", "Academic"),
    ("student.store", "Student Create", "Academic"),
    ("student.show", "Student View", "Academic"),
    ("student.update", "Student Edit", "Academic"),
    ("student.destroy", "Student Delete", "Academic"),
    ("admission.enquiry", "Admission Enquiry View", "Admission"),
    ("admission.enquiry_store", "Admission Enquiry Create", "Admission"),
    ("admission.enquiry_update", "Admission Enquiry Edit", "Admission"),
    ("admission.enquiry_destroy", "Admission Enquiry Delete", "Admission"),
    ("admission.enquiry_convert", "Admission Enquiry Convert To Student", "Admission"),
    ("hostel.index", "Hostel View", "Hostel"),
    ("hostel.store", "Hostel Create", "Hostel"),
    ("hostel.update", "Hostel Edit", "Hostel"),
    ("hostel.destroy", "Hostel Delete", "Hostel"),
    ("hostel.room", "Hostel Room View", "Hostel"),
    ("hostel.room_store", "Hostel Room Create", "Hostel"),
    ("hostel.room_update", "Hostel Room Edit", "Hostel"),
    ("hostel.room_destroy", "Hostel Room Delete", "Hostel"),
    ("hostel.allocation", "Hostel Allocation View", "Hostel"),
    ("hostel.allocation_store", "Hostel Allocation Create", "Hostel"),
    ("hostel.allocation_vacate", "Hostel Allocation Vacate", "Hostel"),
    ("fee.head", "Fee Head View", "Fee"),
    ("fee.head_store", "Fee Head Create", "Fee"),
    ("fee.head_update", "Fee Head Edit", "Fee"),
    ("fee.head_destroy", "Fee Head Delete", "Fee"),
    ("fee.invoice", "Invoice View", "Fee"),
    ("fee.invoice_store", "Invoice Create", "Fee"),
    ("fee.invoice_cancel", "Invoice Cancel", "Fee"),
    ("fee.payment", "Payment View", "Fee"),
    ("fee.payment_store", "Payment Record", "Fee"),
    ("library.book", "Book View", "Library"),
    ("library.book_store", "Book Create", "Library"),
    ("library.book_update", "Book Edit", "Library"),
    ("library.book_destroy", "Book Delete", "Library"),
    ("library.issue", "Book Issue View", "Library"),
    ("library.issue_store", "Book Issue", "Library"),
    ("library.issue_return", "Book Return", "Library"),
    ("library.issue_lost", "Book Mark Lost", "Library"),
    ("transport.vehicle", "Vehicle View", "Transport"),
    ("transport.vehicle_store", "Vehicle Create", "Transport"),
    ("transport.vehicle_update", "Vehicle Edit", "Transport"),
    ("transport.vehicle_destroy", "Vehicle Delete", "Transport"),
    ("transport.route", "Route View", "Transport"),
    ("transport.route_store", "Route Create", "Transport"),
    ("transport.route_update", "Route Edit", "Transport"),
    ("transport.route_destroy", "Route Delete", "Transport"),
    ("transport.allocation", "Transport Allocation View", "Transport"),
    ("transport.allocation_store", "Transport Allocation Create", "Transport"),
    ("transport.allocation_end", "Transport Allocation End", "Transport"),
    ("exam.index", "Exam View", "Exam"),
    ("exam.store", "Exam Create", "Exam"),
    ("exam.update", "Exam Edit", "Exam"),
    ("exam.destroy", "Exam Delete", "Exam"),
    ("exam.grade", "Grade Scale View", "Exam"),
    ("exam.grade_store", "Grade Scale Create", "Exam"),
    ("exam.grade_update", "Grade Scale Edit", "Exam"),
    ("exam.grade_destroy", "Grade Scale Delete", "Exam"),
    ("exam.rule", "Exam Rule View", "Exam"),
    ("exam.rule_store", "Exam Rule Create", "Exam"),
    ("exam.rule_update", "Exam Rule Edit", "Exam"),
    ("exam.rule_destroy", "Exam Rule Delete", "Exam"),
    ("exam.mark", "Mark View", "Exam"),
    ("exam.mark_store", "Mark Record", "Exam"),
    ("exam.result", "Result View", "Exam"),
    ("exam.result_generate", "Result Generate", "Exam"),
    ("exam.result_destroy", "Result Delete", "Exam"),
    ("certificate.type", "Certificate Type View", "Certificate"),
    ("certificate.type_store", "Certificate Type Create", "Certificate"),
    ("certificate.type_update", "Certificate Type Edit", "Certificate"),
    ("certificate.type_destroy", "Certificate Type Delete", "Certificate"),
    ("certificate.index", "Certificate View", "Certificate"),
    ("certificate.store", "Certificate Issue", "Certificate"),
    ("certificate.revoke", "Certificate Revoke", "Certificate"),
    ("hr.employee", "Employee View", "HR"),
    ("hr.employee_store", "Employee Create", "HR"),
    ("hr.employee_update", "Employee Edit", "HR"),
    ("hr.employee_destroy", "Employee Delete", "HR"),
    ("hr.leave", "Leave Request View", "HR"),
    ("hr.leave_store", "Leave Request Create", "HR"),
    ("hr.leave_decide", "Leave Request Approve/Reject", "HR"),
    ("hr.payroll", "Payroll View", "HR"),
    ("hr.payroll_generate", "Payroll Generate", "HR"),
    ("hr.payroll_pay", "Payroll Mark Paid", "HR"),
    ("site_content.update", "Public Site Content Edit", "Site Content"),
    ("attendance.index", "Attendance View", "Attendance"),
    ("attendance.mark", "Attendance Mark", "Attendance"),
    ("demo_data.manage", "Install/Remove Sample Data", "Demo Data"),
    ("data_import.manage", "Bulk Import Data from Excel", "Data Import"),
]


def seed() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        existing = {p.slug: p for p in db.query(Permission).all()}
        for slug, name, group in PERMISSIONS:
            if slug not in existing:
                existing[slug] = Permission(slug=slug, name=name, group=group)
                db.add(existing[slug])
        db.commit()

        admin_role = db.query(Role).filter(Role.name == "admin").first()
        if not admin_role:
            admin_role = Role(name="admin", deletable=False)
            db.add(admin_role)
            db.commit()
            db.refresh(admin_role)
        admin_role.permissions = list(existing.values())
        db.commit()

        admin_user = db.query(User).filter(User.email == settings.first_admin_email).first()
        if not admin_user:
            admin_user = User(
                name="Administrator",
                email=settings.first_admin_email,
                hashed_password=hash_password(settings.first_admin_password),
                role_id=admin_role.id,
                is_active=True,
            )
            db.add(admin_user)
            db.commit()
            print(f"Created first admin user: {settings.first_admin_email}")
        else:
            print("Admin user already exists, skipped.")

        print(f"Seeded {len(existing)} permissions and role '{admin_role.name}'.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()

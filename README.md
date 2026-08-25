# SMA Campus Suite

A modular school/college/university management backend covering the full
institutional pipeline — admissions, academics, exams, fees, hostel,
transport, library, certificates, and HR/payroll — built with **FastAPI** +
**SQLAlchemy** + **Alembic**.

## Live

- Frontend: https://sma-campus-suite.netlify.app/
- Backend API: https://campus-suite-api.onrender.com/ (`/docs` for the
  interactive API reference)

The public campus page (`/`) needs no login. The staff dashboard
does — no public login is published here, since this is a live deployment
with real data behind it. Contact the maintainer for access.

## Stack

- FastAPI (REST API, OpenAPI docs at `/docs`)
- SQLAlchemy 2.0 (ORM)
- Alembic (migrations)
- JWT auth (`python-jose`) + `bcrypt` password hashing
- SQLite by default, Postgres-ready via `DATABASE_URL`

## Modules so far

- **Auth & RBAC**: users, roles, permissions (`role.permissions` many-to-many;
  a user with role `admin` bypasses permission checks)
- **Academic structure**: classes, sections, subjects
- **Students**: profile, class/section assignment, `residency_type`
  (day scholar / hosteller) and hostel room number
- **Admission Enquiry (CRM)**: leads captured from advertisement / website /
  referral / walk-in / social media, tracked New → Contacted → Follow Up →
  Admitted/Rejected, with a `convert` action that creates the enrolled
  `Student` record from the enquiry's details
- **Hostel management**: hostels, rooms (with capacity), and allocations.
  Allocating a student enforces one active allocation per student and
  capacity per room, and flips the student's `residency_type` to hosteller
  (setting `hostel_room_no`); vacating reverts both.
- **Fees & finance**: fee heads (categories), invoices, and payments.
  Invoice balance is `amount + fine - discount - paid`, always computed
  from the sum of payments (never a stored running total, so it can't drift
  out of sync). Recording a payment rejects amounts over the remaining
  balance and flips invoice status Unpaid → Partial → Paid; an invoice can
  only be cancelled if it has no payments yet. Amounts use `Numeric(10,2)`
  end to end, not float, so balances never drift by a cent.
- **Library**: books (with `total_copies`) and issue/return/lost tracking.
  `available_copies` is always computed live from outstanding issues
  (Issued + Lost both count against it — a lost copy stays unavailable
  permanently, unlike a return), never a stored counter. Issuing checks
  availability and blocks a student from double-borrowing the same book;
  returning after the due date charges a per-day fine automatically.
- **Transport**: vehicles (with seat capacity), routes (fare + an assigned
  vehicle), ordered route stops, and student allocations. A route's
  effective capacity comes from its assigned vehicle, so allocating
  enforces one active allocation per student, seat capacity per route, a
  vehicle actually assigned to the route, and that a chosen stop belongs to
  the route being booked. Ending an allocation frees the seat.
- **Exams & results**: exams, grade scales (percentage bands → letter grade
  + GPA point), exam rules (total/pass marks per exam+class+subject), marks
  (upserted per student+exam+subject), and generated results. Recording a
  mark is validated against the matching exam rule (range-checked against
  `total_marks`); generating a result requires every configured subject to
  have a mark recorded first, and fails the student overall (grade `F`) if
  *any* single subject is below its own pass mark or the student was marked
  absent — even when the combined percentage would otherwise land in a
  passing band. Regenerating a result upserts in place rather than creating
  a duplicate row.
- **Certificates & course completion**: certificate types (e.g. Course
  Completion, Transfer, Character), each optionally flagged
  `requires_graduation`, and issued certificates per student. A type
  flagged `requires_graduation` can only be issued to a student whose
  `status` is Graduated (closing the admission → enrollment → exams →
  course-completion pipeline end to end); issuing also blocks a second
  *active* certificate of the same type for the same student, but revoking
  one frees that type up for reissue.
- **HR & payroll**: employees (optionally linked one-to-one to a login
  `User`), leave requests, and monthly payroll. A leave request can only be
  decided (approved/rejected) once — deciding an already-decided request is
  rejected, not silently overwritten. Payroll generation is deduplicated
  per employee+month+year, computes `net_salary = basic_salary + allowances
  - deductions`, blocks a negative net salary, and only pays employees who
  are still Active; marking paid is a one-way transition (can't un-pay or
  double-pay).
- **Daily attendance**: roster-based attendance per class per day
  (Present/Absent/Late/Excused, with an optional note), upserted per
  student+date so re-marking a day updates the existing record instead of
  duplicating it, with history filterable by class, student, and date
  range.
- **Public site content**: a single admin-editable record (institution
  name, hero copy, stats, departments, facilities, faculty strength,
  achievements, career guidance & placement stats, contact info) that
  powers the public `/` page on the frontend — `GET` is public
  (no login), `PUT` is admin-only.
- **Bulk import**: a downloadable multi-sheet `.xlsx` template
  (`GET /import/template`) and a matching `POST /import` that reads it back
  through the same crud functions the UI uses — Classes, Sections,
  Subjects, Students, and Employees, in that dependency order, resolving
  Class/Section references by name. Each row is independent: a bad row is
  recorded as an error and skipped rather than failing the whole file.
- **Sample/demo data**: `POST /demo-data/install` populates every module
  with fictional but realistic data for trying the app out, tracking every
  row it creates in a small ledger table so `POST /demo-data/remove`
  deletes exactly those rows and nothing a real user entered.

This covers the full pipeline the project set out to build: **advertisement
→ admission enquiry → enrolled student → academics/exams → fees → hostel/
transport/library services → course completion certificate**, plus the HR
side (staff, leave, payroll) running alongside it. Every module above
follows the same pattern — SQLAlchemy model → Pydantic schemas → CRUD →
router, registered in `app/api/v1/router.py` — so extending the system
(a new fee type, a new certificate rule, a whole new module) means adding
to that same stack rather than learning a new one.

## Getting started

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt   # includes test deps

cp .env.example .env                  # adjust as needed

alembic upgrade head                  # create the schema
python -m app.seed                    # seed permissions, admin role, first admin user

uvicorn app.main:app --reload
```

Open `http://127.0.0.1:8000/docs` for interactive API docs.

Default admin login (from `.env.example`, change before deploying):
`admin@example.com` / `changeme123`

## Frontend

`frontend/` is a React + TypeScript + Vite app that talks to this API, with
a working UI for every module above: Admissions, Students, Academic
structure, Attendance, Hostel, Fees & Finance, Library, Transport, Exams &
Results, Certificates, and HR & Payroll — each with list/create/action
flows, and a Print button plus CSV/Excel export on every list. It also
includes:

- An unauthenticated public campus page at `/` (departments,
  facilities, faculty, achievements, career guidance, contact), editable
  by an admin from **Public Site Content** in the sidebar — no code change
  needed to update it.
- **Staff Logins** and **Roles & Permissions** pages to manage who can log
  in and what each role can do, on top of the auth/RBAC the backend already
  had.
- **Import Data**: download a single Excel workbook (one sheet per record
  type — Classes, Sections, Subjects, Students, Employees — with a Read Me
  sheet), fill it in, upload it back. Rows reference classes/sections by
  name, not id, and a bad row is skipped and reported rather than failing
  the whole file.
- **Sample Data**: one click fills every module with realistic fictional
  data for testing/demos, and one click removes exactly what it created —
  useful for trying the app out before entering real data.
- Mobile-responsive layout (collapsible sidebar, stacking forms) down to
  phone-sized viewports.

See `frontend/README.md` to run it. It needs this backend running with its
origin allowed in `CORS_ORIGINS` (`http://localhost:5173` is already the
default for local dev).

## Deployment

### Free path: Render + Neon (no credit card)

1. **Database** — create a free Postgres project at [neon.tech](https://neon.tech)
   (sign up with email or GitHub, no card required). Copy the connection
   string it gives you (starts `postgresql://...`, already includes
   `?sslmode=require`) — you'll paste it into Render in step 3.
2. **Push this repo to GitHub** if it isn't already (Render deploys from a
   GitHub repo).
3. On [render.com](https://render.com) (same: email/GitHub signup, no card
   for the free plan), choose **New → Blueprint**, point it at this repo.
   Render reads `render.yaml` at the repo root and provisions the web
   service automatically — it builds `Dockerfile` and sets `SECRET_KEY` for
   you (`generateValue: true`). When prompted for the two `sync: false`
   vars:
   - `DATABASE_URL` → the Neon connection string from step 1
   - `FIRST_ADMIN_PASSWORD` → a real password, not the `.env.example` one
4. Deploy. Render builds the image, the container runs `alembic upgrade
   head` then seeds the admin user on first boot
   (`RUN_SEED_ON_START=true`), and the service comes up at the `.onrender.com`
   URL Render assigns — `/docs` for the interactive API.

**The tradeoff**: Render's free web service spins down after 15 minutes of
no traffic, so the first request after a quiet spell takes ~30-50s to wake
back up. Fine for a low-traffic school app; not fine if you need it always
warm — that needs a paid plan or a host you keep running yourself (see
below).

### Self-hosted (Docker, any VPS)

If you have or later get a machine to run Docker on, `docker-compose.yml`
runs the API and Postgres together — no Render/Neon accounts needed.

```bash
export SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_hex(32))')
export FIRST_ADMIN_PASSWORD='pick-a-real-password'
# optionally: POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, FIRST_ADMIN_EMAIL, APP_PORT

docker compose up -d --build
```

This builds the API image, starts Postgres, waits for it to be healthy, runs
`alembic upgrade head` automatically on container start (via
`docker-entrypoint.sh`), seeds baseline permissions/role/admin user on first
boot (`RUN_SEED_ON_START=true` in `docker-compose.yml`), then serves the app
with Gunicorn + Uvicorn workers on `:8000` (`APP_PORT` to change the host
port). The API container runs as a non-root user.

**Required in production:**
- `SECRET_KEY` — a real random secret; the compose file refuses to start
  without one (no insecure default committed).
- `FIRST_ADMIN_PASSWORD` — same; change it (or disable/rotate the account)
  after first login.
- `DATABASE_URL` should point at Postgres in any real deployment — SQLite
  (the default in `.env.example`) is fine for local dev but not for
  concurrent production traffic.
- Put a TLS-terminating reverse proxy (Caddy, nginx, or your host's built-in
  one) in front of the container; the app itself serves plain HTTP.

Without Docker: install `requirements.txt`, set `DATABASE_URL` to Postgres,
run `alembic upgrade head`, then serve with Gunicorn directly:

```bash
gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

I don't have a Render/Neon account or any cloud credentials in this
environment, so I can't click through the actual signup/deploy flow for
you — `render.yaml` and the Docker setup are the handoff point: they do
the configuration work, you do the (free, no-card) account creation and
button-clicking on Render's and Neon's sites.

## Running tests

```bash
python -m pytest
```

Tests run against an isolated in-memory SQLite database, independent of your
local `school.db`.

## Project layout

```
app/
  core/        settings, database session, security (hashing/JWT)
  models/      SQLAlchemy models
  schemas/     Pydantic request/response models
  crud/        data access functions
  api/v1/      routers, one module per file under endpoints/
  seed.py      baseline permissions + admin role + first admin user
alembic/       migrations
tests/         pytest suite (httpx TestClient, in-memory SQLite)
```

## Adding a new module

1. Add a SQLAlchemy model in `app/models/`, register it in `app/models/__init__.py`.
2. Add Pydantic `Create`/`Update`/`Read` schemas in `app/schemas/`.
3. Add CRUD functions in `app/crud/`.
4. Add a router in `app/api/v1/endpoints/`, gate each route with
   `Depends(require_permission("module.action"))`, and register it in
   `app/api/v1/router.py`.
5. Add the new permission slugs to `PERMISSIONS` in `app/seed.py`.
6. `alembic revision --autogenerate -m "add <module>"` then `alembic upgrade head`.
7. Write tests under `tests/`.

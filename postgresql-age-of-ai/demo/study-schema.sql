-- Run only in a disposable learning database:
--   createdb learning
--   psql -d learning -f demo/study-schema.sql
-- In every new psql session: SET search_path TO study, public;
CREATE SCHEMA IF NOT EXISTS study;
SET search_path TO study, public;

CREATE TABLE IF NOT EXISTS agencies (
  id bigint PRIMARY KEY,
  name text NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS donors (
  id bigint PRIMARY KEY,
  agency_id bigint NOT NULL REFERENCES agencies(id),
  name text NOT NULL,
  active boolean NOT NULL DEFAULT true
);
CREATE INDEX IF NOT EXISTS donors_agency_id_idx ON donors(agency_id);

CREATE TABLE IF NOT EXISTS users (
  id bigint PRIMARY KEY,
  tenant_id bigint NOT NULL,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  active boolean NOT NULL DEFAULT true,
  joined_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS accounts (
  id bigint PRIMARY KEY,
  balance numeric(12,2) NOT NULL CHECK (balance >= 0)
);
CREATE TABLE IF NOT EXISTS orders (
  id bigint PRIMARY KEY,
  agency_id bigint REFERENCES agencies(id),
  user_id bigint REFERENCES users(id),
  day date NOT NULL,
  amount numeric(12,2) NOT NULL CHECK (amount >= 0),
  status text NOT NULL CHECK (status IN ('new','paid','cancelled'))
);
CREATE TABLE IF NOT EXISTS donations (
  id bigint PRIMARY KEY,
  agency_id bigint NOT NULL REFERENCES agencies(id),
  amount numeric(12,2) NOT NULL CHECK (amount > 0)
);
CREATE TABLE IF NOT EXISTS events (
  id bigint PRIMARY KEY,
  created_at timestamptz NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE IF NOT EXISTS documents (
  id bigint PRIMARY KEY,
  tenant_id bigint NOT NULL,
  owner_id bigint NOT NULL,
  body text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE IF NOT EXISTS students (id bigint PRIMARY KEY, name text NOT NULL);
CREATE TABLE IF NOT EXISTS courses (id bigint PRIMARY KEY, title text NOT NULL);
CREATE TABLE IF NOT EXISTS enrollments (
  student_id bigint NOT NULL REFERENCES students(id),
  course_id bigint NOT NULL REFERENCES courses(id),
  PRIMARY KEY (student_id, course_id)
);

INSERT INTO agencies VALUES (1,'North'),(2,'South'),(3,'East') ON CONFLICT DO NOTHING;
INSERT INTO donors VALUES (1,1,'Asha',true),(2,1,'Atif',true),(3,2,'Mira',false) ON CONFLICT DO NOTHING;
INSERT INTO users(id,tenant_id,name,email,active) VALUES
  (1,1,'Atif','atif@example.com',true),
  (2,1,'Asha','asha@example.com',true),
  (3,2,'Mira','mira@example.com',false)
ON CONFLICT DO NOTHING;
INSERT INTO accounts VALUES (1,10000),(2,5000) ON CONFLICT DO NOTHING;
INSERT INTO orders VALUES
  (1,1,1,'2026-01-01',2000,'paid'),
  (2,1,2,'2026-01-02',900,'new'),
  (3,2,3,'2026-01-03',1200,'paid')
ON CONFLICT DO NOTHING;
INSERT INTO donations VALUES (1,1,500),(2,1,700),(3,2,300) ON CONFLICT DO NOTHING;
INSERT INTO events VALUES
  (1,'2026-01-01 10:00+00','{"kind":"signup"}'),
  (2,'2026-01-02 11:00+00','{"kind":"payment"}')
ON CONFLICT DO NOTHING;
INSERT INTO documents VALUES
  (1,1,1,'PostgreSQL uses MVCC for concurrent transactions','{"topic":"mvcc"}'),
  (2,2,3,'Indexes can reduce work for selective queries','{"topic":"indexes"}')
ON CONFLICT DO NOTHING;
INSERT INTO students VALUES (1,'Sam'),(2,'Lee') ON CONFLICT DO NOTHING;
INSERT INTO courses VALUES (1,'SQL'),(2,'Database Internals') ON CONFLICT DO NOTHING;
INSERT INTO enrollments VALUES (1,1),(1,2),(2,1) ON CONFLICT DO NOTHING;
ANALYZE;

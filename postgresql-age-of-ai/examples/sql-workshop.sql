-- Run only in a disposable database:
--   createdb learning
--   psql -v ON_ERROR_STOP=1 -d learning -f examples/sql-workshop.sql
-- This script owns only the workshop schema and can be rerun.

-- DDL: define the shape and the rules.
CREATE SCHEMA IF NOT EXISTS workshop;
CREATE TABLE IF NOT EXISTS workshop.customers (
  id bigint PRIMARY KEY,
  name text NOT NULL UNIQUE
);
ALTER TABLE workshop.customers ADD COLUMN IF NOT EXISTS city text;

CREATE TABLE IF NOT EXISTS workshop.orders (
  id bigint PRIMARY KEY,
  customer_id bigint NOT NULL REFERENCES workshop.customers(id),
  amount numeric(12,2) NOT NULL CHECK (amount >= 0),
  status text NOT NULL CHECK (status IN ('new','paid','cancelled')),
  placed_on date NOT NULL
);
CREATE INDEX IF NOT EXISTS orders_customer_idx ON workshop.orders(customer_id);

-- DML: add, change and remove rows. ON CONFLICT makes seeding rerunnable.
INSERT INTO workshop.customers(id,name,city) VALUES
  (1,'Atif','Delhi'),(2,'Mira','Pune'),(3,'Sam','Mumbai')
ON CONFLICT (id) DO NOTHING;
INSERT INTO workshop.orders(id,customer_id,amount,status,placed_on) VALUES
  (101,1,1200,'paid','2026-01-02'),
  (102,1,300,'new','2026-01-03'),
  (103,2,900,'paid','2026-01-04')
ON CONFLICT (id) DO NOTHING;

INSERT INTO workshop.orders VALUES (104,2,100,'new','2026-01-05')
ON CONFLICT (id) DO NOTHING;
UPDATE workshop.orders SET status='paid' WHERE id=104 RETURNING id,status;
DELETE FROM workshop.orders WHERE id=104 RETURNING id;

-- SELECT: choose columns and filter, sort and limit the result.
SELECT id,name FROM workshop.customers
WHERE city IN ('Delhi','Pune')
ORDER BY name ASC LIMIT 10;

-- JOIN: combine values from two tables. LEFT JOIN retains Sam with no orders.
SELECT c.name,o.id AS order_id,o.amount
FROM workshop.customers c LEFT JOIN workshop.orders o ON o.customer_id=c.id
ORDER BY c.id,o.id;

-- GROUP BY/HAVING: summarize matching rows.
SELECT c.name,count(o.id) AS orders,coalesce(sum(o.amount),0) AS total
FROM workshop.customers c LEFT JOIN workshop.orders o ON o.customer_id=c.id
GROUP BY c.id,c.name HAVING count(o.id) >= 1
ORDER BY total DESC;

-- Subquery: ask whether a related row exists.
SELECT c.name FROM workshop.customers c
WHERE EXISTS (SELECT 1 FROM workshop.orders o WHERE o.customer_id=c.id);

-- CTE and window: name a step, then rank results without losing rows.
WITH totals AS (
  SELECT customer_id,sum(amount) AS spent
  FROM workshop.orders GROUP BY customer_id
)
SELECT customer_id,spent,dense_rank() OVER (ORDER BY spent DESC) AS spending_rank
FROM totals;

-- Set operation: UNION ALL keeps every row from both compatible queries.
SELECT name AS label FROM workshop.customers WHERE city='Delhi'
UNION ALL
SELECT name AS label FROM workshop.customers WHERE city='Pune';

-- Views run a saved query. Materialized views store results until REFRESH.
CREATE OR REPLACE VIEW workshop.customer_totals AS
SELECT customer_id,sum(amount) AS spent FROM workshop.orders GROUP BY customer_id;
CREATE MATERIALIZED VIEW IF NOT EXISTS workshop.paid_totals AS
SELECT customer_id,sum(amount) AS spent FROM workshop.orders WHERE status='paid' GROUP BY customer_id;
REFRESH MATERIALIZED VIEW workshop.paid_totals;
SELECT * FROM workshop.customer_totals ORDER BY customer_id;
SELECT * FROM workshop.paid_totals ORDER BY customer_id;

-- Transaction control: the second edit is undone; the first is committed.
BEGIN;
UPDATE workshop.customers SET city='Mumbai' WHERE id=1;
SAVEPOINT before_second_edit;
UPDATE workshop.customers SET city='Chennai' WHERE id=1;
ROLLBACK TO SAVEPOINT before_second_edit;
COMMIT;
SELECT id,name,city FROM workshop.customers WHERE id=1;

-- Read a plan. On this tiny table, a Seq Scan may be the sensible choice.
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM workshop.orders WHERE customer_id=1;

-- Access control example: run only after creating a suitable role.
-- GRANT USAGE ON SCHEMA workshop TO app_reader;
-- GRANT SELECT ON ALL TABLES IN SCHEMA workshop TO app_reader;

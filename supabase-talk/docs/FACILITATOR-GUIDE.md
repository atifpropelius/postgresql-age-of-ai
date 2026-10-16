# Facilitator guide — Supabase as a Backend: What Runs Where

This is separate from the audience presentation. Reserve **10–12 minutes for the live quiz**, **5 minutes for Q&A**, and **2 minutes for the anonymous feedback link**. These minutes are outside the 38:00 technical talk; 3–5 minutes remain for transitions. Use Kahoot, Slido, or Google Forms quiz mode; show the answer and its explanation after each vote. The questions test concepts introduced in the main talk, not dashboard trivia.

## Live quiz: 10 questions

### 1. What is Supabase in this talk?

- A. A frontend framework
- B. A managed backend platform centered on PostgreSQL
- C. A replacement for every application server
- D. A file store with no database

**Answer: B.** A Supabase project combines a Postgres database with managed services such as Auth, Data API, Storage, Realtime, and Functions. [Architecture](https://supabase.com/docs/guides/getting-started/architecture)

### 2. Where does a task row get stored and processed?

- A. Inside the browser
- B. In Supabase Storage's file bucket
- C. In the project's managed PostgreSQL database
- D. In the Edge Function runtime by default

**Answer: C.** The project has a Postgres database; it processes SQL and stores the task row, while the surrounding services have separate jobs. [Database overview](https://supabase.com/docs/guides/database/overview)

### 3. What does the Supabase Data API do?

- A. It turns exposed database objects into HTTP endpoints
- B. It stores uploaded PDF bytes
- C. It replaces PostgreSQL permissions
- D. It deploys frontend code

**Answer: A.** PostgREST serves requests for exposed tables, views, and functions; grants and RLS still control access. [Architecture](https://supabase.com/docs/guides/getting-started/architecture), [Data API security](https://supabase.com/docs/guides/api/securing-your-api)

### 4. Atif is signed in. What decides whether he can read Asha's task row?

- A. Authentication alone
- B. The colour of the dashboard warning
- C. Grants and row-level security policies
- D. The PDF's filename

**Answer: C.** Authentication establishes identity; grants and RLS authorize access to database objects and rows. [Data API security](https://supabase.com/docs/guides/api/securing-your-api)

### 5. Where should the task's PDF bytes live?

- A. In a text column of `tasks` by default
- B. In object storage via the Storage API, with metadata in Postgres
- C. In the user's JWT
- D. In the migration history table

**Answer: B.** Storage keeps file metadata in Postgres and the actual object in an object storage provider; use its API for file operations. [Storage schema](https://supabase.com/docs/guides/storage/schema/design)

### 6. Which placement fits each operation best?

- A. SQL function for data-intensive transactional work; Edge Function for a webhook and external service call
- B. Edge Function for every insert; SQL function only for JavaScript
- C. Browser for server secrets; trigger for UI rendering
- D. Realtime for database schema migrations

**Answer: A.** Database functions run inside Postgres and can be invoked with `rpc()`; Edge Functions run TypeScript server-side and suit HTTP integrations. [Database functions](https://supabase.com/docs/guides/database/functions), [Edge Functions](https://supabase.com/docs/guides/functions)

### 7. Why commit a migration and test it on a preview branch?

- A. It lets the team review and validate a repeatable schema change before production
- B. It automatically copies all production data and secrets into every branch
- C. It removes the need to review SQL
- D. It makes the frontend independent of database schema

**Answer: A.** Migrations record schema changes; an isolated branch can test them, but its data and configuration still need deliberate setup. [Deployment and branching](https://supabase.com/docs/guides/deployment), [Working with branches](https://supabase.com/docs/guides/deployment/branching/working-with-branches)

### 8. What does egress measure on the Usage page?

- A. Number of rows in a table
- B. Network data sent out from Supabase services to clients
- C. CPU time spent in a SQL function
- D. Number of migration files

**Answer: B.** Egress is outgoing network transfer, including responses from database, Storage, Auth, Functions, and other services; cached egress is tracked separately. [Manage egress](https://supabase.com/docs/guides/platform/manage-your-usage/egress)

### 9. How should a team select a Supabase project region?

- A. Always choose the closest region to the developer's laptop
- B. Always choose the cheapest named region
- C. Weigh user latency, data residency, service availability, and business requirements
- D. Pick any region because changing it later is a settings toggle

**Answer: C.** The primary project data resides in the selected region; moving it later requires a new project and migration. [Available regions](https://supabase.com/docs/guides/platform/regions), [Change project region](https://supabase.com/docs/guides/troubleshooting/change-project-region-eWJo5Z)

### 10. When can a separate application backend still be useful?

- A. Never; Supabase removes all backend work
- B. When the app needs dedicated domain services, complex workflows, integrations, or infrastructure control
- C. Only when the app has no users
- D. Only to store PDF files

**Answer: B.** Supabase supplies common backend building blocks; a dedicated service or worker can still own application logic and workflows that do not fit a direct API or short-lived function. The new Supabase Compute product aims to host longer-running code, but its private alpha is for internal evaluation only, not production. [Architecture](https://supabase.com/docs/guides/getting-started/architecture), [Edge Functions](https://supabase.com/docs/guides/functions), [Supabase Compute](https://supabase.com/compute)

## Five likely audience questions

1. **Is the database itself serverless? Does `rpc()` run on an EC2-style server?** Supabase manages a Postgres instance for each project. A function called through `rpc()` executes *inside that database* and consumes its database compute and connection capacity. It is separate from an Edge Function and the new Supabase Compute product for app code. The latter is currently a private alpha for internal evaluation, so it cannot yet be recommended as a production EC2 replacement. [Database functions](https://supabase.com/docs/guides/database/functions), [Billing FAQ](https://supabase.com/docs/guides/platform/billing-faq), [Supabase Compute](https://supabase.com/compute)
2. **Can the browser call the Data API directly?** Yes, for routes intentionally exposed to clients, with a publishable key, a user's token, suitable grants, and tested RLS policies. Never place a privileged server secret in the browser; use server-side code for operations that need one. [Data API security](https://supabase.com/docs/guides/api/securing-your-api), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
3. **Does a preview branch include production data and all external integrations?** Treat it as an isolated environment. Branching validates committed migrations and can seed sample data; verify its own URLs, credentials, settings, secrets, and integration callbacks before claiming parity with production. [Deployment and branching](https://supabase.com/docs/guides/deployment), [Working with branches](https://supabase.com/docs/guides/deployment/branching/working-with-branches)
4. **If a user in India reports slowness, should we immediately move the database to Mumbai?** First measure where time is spent. Mumbai is an available region and may reduce latency for Indian users, but residency obligations, service availability, and the actual traffic pattern also matter. A move needs a new project and migration. [Available regions](https://supabase.com/docs/guides/platform/regions), [Change project region](https://supabase.com/docs/guides/troubleshooting/change-project-region-eWJo5Z)
5. **What should we check if usage or cost unexpectedly rises?** Set the right time range and project in Usage, identify the growing metric, then inspect the relevant query, endpoint, Storage download, function, or log volume. Usage, plan allowance, and billable overage are different concepts; check current billing rules rather than assuming every metric costs the same. [Manage usage](https://supabase.com/docs/guides/platform/manage-your-usage), [Manage egress](https://supabase.com/docs/guides/platform/manage-your-usage/egress)

## Facilitation notes

- Do not add these questions to the slide deck. The host runs the quiz after the talk and Q&A.
- If a question turns into an architecture debate, give the practical answer and park the deeper discussion so the session stays on time.
- Recheck product limits and branch behavior before delivery; the linked sources are the authority for plan-specific details.

# Supabase dashboard: presenter field guide

Reviewed: 16 October 2026. This is the deeper study aid for **Supabase as a Backend: What Runs Where**. The audience deck gives each Studio menu area one short definition and task-app use; this guide explains its fields and cautions. Dashboard labels, menu placement, available charts, retention, controls and billing behavior can vary by product version, organization plan and project configuration. Check the project you will actually present before the session. Use a disposable or sanitized demo project; do not show customer records, tokens, keys or production URLs on screen.

## First mental model

**Organization** groups projects, members, a plan and billing. **Project** is one hosted Supabase backend with a dedicated Postgres instance and connected services. The dashboard is a management interface; it is not itself in the path of a normal app request. **Connect** helps retrieve connection details; never display passwords or secret keys in a talk. [Platform overview](https://supabase.com/docs/guides/platform), [billing model](https://supabase.com/docs/guides/platform/billing-on-supabase), [API keys](https://supabase.com/docs/guides/getting-started/api-keys).

### 1. Project Overview

- **What:** The project landing page, with links and status for the backend's services.
- **Why:** Gives a quick orientation before opening a specific service or report.
- **Use:** Confirm you are in the intended organization, project and environment before inspecting a task or changing settings.
- **Read:** Project name/ref, status, **Connect**, and shortcuts are identifiers/navigation; status is not a substitute for application monitoring. Exact cards change over time.
- **Example:** Open the demo project, verify its name, then go to Table Editor to find `public.tasks`.
- **Caution:** Two projects can have similar names. Verify the project and environment before running SQL or copying a connection string. [Platform overview](https://supabase.com/docs/guides/platform).

### 2. Table Editor

- **What:** A visual editor for Postgres tables, columns and rows.
- **Why:** Lets a developer inspect simple data and schema without writing SQL.
- **Use:** Show that one task is a row, `title` is a column, and `owner_id` links the task to a user.
- **Read:** Schema selector, table list, column names and types, row cells, **New table**, add/edit row and policy entry points; the precise controls depend on the current Studio UI.
- **Example:** Inspect a sanitized `public.tasks` table with `id`, `owner_id`, `title` and `done`.
- **Caution:** A dashboard edit changes the database; it does not automatically create a reviewed migration in Git. Avoid ad hoc production schema edits. [Tables and data](https://supabase.com/docs/guides/database/tables).

### 3. SQL Editor

- **What:** A place to run SQL statements against the project's Postgres database.
- **Why:** It supports queries and database changes that a visual editor cannot express clearly.
- **Use:** Run a read-only `select id, title from public.tasks limit 5;` in the demo project; save repeatable schema changes as migration files.
- **Read:** The editor text, selected query, run button, result grid and error text. Read the active project name again before running anything.
- **Example:** Check that the task row exists after an insert through the app.
- **Caution:** SQL Editor queries run with database privileges that may differ from an app user's RLS-limited request. A successful SQL Editor `SELECT` does **not** prove the client can access those rows. [Database overview](https://supabase.com/docs/guides/database/overview), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).

### 4. Database

- **What:** Management pages for the project's full Postgres database.
- **Why:** Schema, roles, extensions, connection methods, backups and related database controls need their own home.
- **Use:** Inspect tables, policies, functions, extensions or connection guidance before changing an app's data layer.
- **Read:** A **schema** groups database objects; an **extension** adds Postgres capabilities; a **connection** is a database session; **backups** help recovery but have plan and scope limits. Names of submenus may move.
- **Example:** Verify that `public.tasks` has RLS enabled and that its owner policy exists.
- **Caution:** A foreign key checks a relationship; it does not authorize a user to read the row. Database backups do not include Storage object bytes. [Database overview](https://supabase.com/docs/guides/database/overview), [connect to Postgres](https://supabase.com/docs/guides/database/connecting-to-postgres).

### 5. Authentication

- **What:** User identity management, sign-in providers and Auth configuration.
- **Why:** The app needs to establish **who** a user is before policies decide **which** data they may access.
- **Use:** Locate the sanitized demo user and its user ID; review configured sign-in methods and redirect URLs.
- **Read:** **Users** lists Auth identities; **Providers** configures sign-in methods; URL and email settings affect login flows. A JWT is a token carrying identity; it is not a row-access policy.
- **Example:** Atif signs in; `auth.uid()` in a task policy can match the `owner_id` of his tasks.
- **Caution:** `auth.users` is not exposed through the generated public Data API. Do not show emails or tokens from a real project. Signing in alone does not grant access to every table. [Auth overview](https://supabase.com/docs/guides/auth), [user management](https://supabase.com/docs/guides/auth/managing-user-data).

### 6. Storage

- **What:** Buckets and APIs for storing and serving files; object metadata is tracked in Postgres.
- **Why:** A PDF's bytes belong in object storage, not in a normal task row.
- **Use:** Show a private `task-files` bucket and explain that a task row can store the file path.
- **Read:** **Bucket** is a file container; **private/public** controls the access model; upload/list/download are operations; policies govern private access. Some buckets may also set size or MIME restrictions.
- **Example:** Upload `users/atif/brief.pdf`, then store its path on task 101.
- **Caution:** A public bucket exposes downloads to anyone with the URL. Do not alter `storage` metadata with direct SQL and expect underlying object bytes to move or disappear. [Storage quickstart](https://supabase.com/docs/guides/storage/quickstart), [bucket access](https://supabase.com/docs/guides/storage/buckets/fundamentals).

### 7. Edge Functions

- **What:** Separately deployed server-side TypeScript functions run by Supabase's edge runtime.
- **Why:** Trusted code can call third parties and use server-only secrets without shipping those secrets to the browser.
- **Use:** Inspect a demo function's deployment, invocations and logs when a task notification fails.
- **Read:** **Invocations** show request/response status and duration; **Logs** show platform events, exceptions and custom messages; **Secrets** supply environment values. Dashboard placement varies.
- **Example:** A function sends a task-assignment email through an external mail API.
- **Caution:** Never print secrets or personal data in logs. A deployed function is separate from a Postgres function or trigger. Long, retry-heavy work may fit a queue/worker better. [Edge Functions](https://supabase.com/docs/guides/functions), [function logging](https://supabase.com/docs/guides/functions/logging).

### 8. Compute

- **What:** The project's database machine resources, including CPU, RAM and disk capability.
- **Why:** Postgres workload capacity and direct connection limits depend in part on the compute size.
- **Use:** Compare CPU, memory, disk I/O and connection pressure before deciding whether a compute change is warranted.
- **Read:** **Compute size** selects capacity; **CPU** measures processing use; **memory** is working RAM; **IOPS/throughput** measure disk operations/bandwidth; **disk size** is capacity. Displayed charts and upgrade controls vary.
- **Example:** If task requests slow while database CPU is sustained high, investigate expensive queries and then size compute from measured demand.
- **Caution:** Scaling compute can change costs and may involve a restart or downtime. More compute does not repair a missing policy, a bad query or a blocked transaction. [Compute and disk](https://supabase.com/docs/guides/platform/compute-and-disk), [compute usage](https://supabase.com/docs/guides/platform/manage-your-usage/compute).

### 9. Realtime

- **What:** A WebSocket service for Broadcast, Presence and selected Postgres change events.
- **Why:** Connected app screens can receive changes without repeatedly polling.
- **Use:** Check connected clients, delivered events or errors if a second taskboard screen does not update.
- **Read:** **Broadcast** is an app message; **Presence** is shared online state; **Postgres Changes** delivers selected row changes. A **channel** groups subscribers. Reports and limits vary by plan/configuration.
- **Example:** A task update is delivered to the subscriber on another screen after the relevant channel/publication is configured.
- **Caution:** A database write does not automatically reach every client. Channel authorization and event volume matter. [Realtime overview](https://supabase.com/docs/guides/realtime/getting_started), [Realtime reports](https://supabase.com/docs/guides/realtime/reports).

### 10. Advisors

- **What:** Security and performance findings generated from database checks.
- **Why:** They surface likely configuration and query problems for review.
- **Use:** Review a warning about an exposed table, policy, duplicate index or inefficient database setting.
- **Read:** Severity, affected object, explanation and suggested remediation are a starting point. An advisor finding is a recommendation, not proof that a specific user request failed.
- **Example:** An advisor flags a table without appropriate RLS; inspect grants and policies before making it available to clients.
- **Caution:** Do not apply every suggested index or policy change blindly; validate the workload and test in staging. [Observability](https://supabase.com/docs/guides/observability), [Supabase advisor announcement](https://supabase.com/blog/security-performance-advisor).

### 11. Observability

- **What:** Reports about requests, database activity, service health and resource use.
- **Why:** It helps answer where a problem occurs before changing code or capacity.
- **Use:** Start with Overview, then choose Query Performance, Database Connections, API Gateway, Data API, Auth, Storage, Edge Functions or Realtime as the symptom suggests.
- **Read:** Set the **time range** and, where offered, source/project before interpreting a chart. **Slow queries** are grouped database statements; **connections** are sessions, not browser tabs; **blocked** means waiting for a lock. Some views are live snapshots, some are aggregated reports.
- **Example:** A task save stalls: inspect API errors, then active or blocked database sessions, then the grouped query report.
- **Caution:** A blank graph can mean no events, a different time range or reporting delay. Report history and some charts depend on plan; Cloud reports are not guaranteed in self-hosted Supabase. The detailed, field-by-field explanation is in [OBSERVABILITY-GUIDE.md](OBSERVABILITY-GUIDE.md). [Reports](https://supabase.com/docs/guides/observability/reports).

### 12. Logs

- **What:** Timestamped service events and errors.
- **Why:** Logs can show the concrete failure behind a dashboard trend.
- **Use:** Filter by time window and log type (for example API Gateway, Postgres, Auth, Storage, Edge Function or Realtime), then inspect an event's status and message.
- **Read:** **Time range** limits the search; **log type** identifies the service; **status/level** separates success, warning and error; **path/method** help match an HTTP request.
- **Example:** For a 500 from a task-notification function, filter Edge Function events and inspect the matching invocation and exception.
- **Caution:** Log retention, capture limits and search availability vary. Do not log tokens, connection strings or personal records; an absence of matching logs is not by itself proof that no request occurred. [Logs in Studio](https://supabase.com/docs/guides/observability/logs), [function logging](https://supabase.com/docs/guides/functions/logging).

### 13. Integrations

- **What:** Ways to connect Supabase to third-party tools and extensions.
- **Why:** Applications often need providers for deployment, payments, mail, monitoring or specialized database behavior.
- **Use:** Check the provider's scope and setup steps before connecting a demo project to a service.
- **Read:** An integration tile typically identifies the provider and setup/connection state; extensions, wrappers and partner integrations have different permission models.
- **Example:** Add a monitoring integration so a team can inspect Supabase signals alongside app logs.
- **Caution:** A partner integration can have its own charges and data access. Check requested permissions, credentials and data transfer before enabling it. [Integrations](https://supabase.com/docs/guides/integrations).

### 14. Project Settings

- **What:** Configuration for a single project, such as API keys, connection settings and service-specific options.
- **Why:** The backend needs project-specific endpoints and behavior.
- **Use:** Find the project URL and publishable key for a demo app, then configure redirect URLs or function secrets in the appropriate section.
- **Read:** **Project URL** identifies the API host; **publishable key** identifies client access and can appear in app code **only when** grants and RLS protect data; **secret key** belongs only on a trusted server. **Region** identifies the project's primary data location and cannot be treated as a harmless switch.
- **Example:** Configure a staging app's redirect URL and use its staging project key, not production credentials.
- **Caution:** Never paste secret keys or database passwords into slides, screenshots, issue tickets or client bundles. Changing project settings can affect all clients. [API keys](https://supabase.com/docs/guides/getting-started/api-keys), [regions](https://supabase.com/docs/guides/platform/regions).

### 15. Organization Usage and Billing

- **What:** Organization-level usage, plan, invoice and cost controls; a project filter may narrow the usage view.
- **Why:** The plan and bill cover the organization, while project workloads drive many usage quantities.
- **Use:** Check egress, storage, MAU, Edge Function invocations, Realtime messages, peak connections, logs, disk and compute before changing a plan or size.
- **Read:** **Used** is measured activity; **allowance/quota** is plan-specific; **overage** is usage beyond an included quota when applicable; **compute hours** are running database compute time. The bill can include project compute and add-ons beyond the base subscription. **Upcoming Invoice** estimates current-cycle cost; **Billing → Cost Control** holds the Pro Spend Cap setting. Check the [official usage definitions](https://supabase.com/docs/guides/platform/manage-your-usage) and the dedicated usage reference supplied with this talk.
- **Example:** A spike in PDF downloads raises egress; compare request volume and cached versus uncached transfer before changing the plan.
- **Caution:** The Pro Spend Cap starts on by default. Turning it off allows billable overages for covered usage; leaving it on may result in restrictions after quota and grace-period rules apply. It does not cover compute or branching compute, and branch usage is not covered. Review Usage and Upcoming Invoice before changing it. The usage page can include projects active earlier in the cycle. [Manage usage](https://supabase.com/docs/guides/platform/manage-your-usage), [billing FAQ](https://supabase.com/docs/guides/platform/billing-faq), [spend cap](https://supabase.com/docs/guides/platform/cost-control), [branching usage](https://supabase.com/docs/guides/platform/manage-your-usage/branching).

## A practical troubleshooting path

If Atif says “my task did not save,” ask **what time, which environment, which request and which user**. Check the browser/app error, then API Gateway or Data API status, Auth identity, grants/RLS, and Postgres or function logs. If it is slow rather than rejected, inspect Query Performance and Database Connections. If an attachment fails, inspect Storage bucket policy and Storage logs. If the second screen is stale, inspect the Realtime subscription and its report. Make one change at a time, then repeat the same request. [Observability overview](https://supabase.com/docs/guides/observability).

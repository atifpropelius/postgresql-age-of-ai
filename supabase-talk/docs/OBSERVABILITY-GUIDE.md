# Supabase Observability: presenter guide

Reviewed: 2026-10-15. Audience: people seeing a backend dashboard for the first time. The deck reconstructs the views in the presenter's screenshots as **illustrative diagrams**. It does not show live measurements from that project. Open a disposable Supabase project for the optional demonstration in [OBSERVABILITY-DEMO.md](OBSERVABILITY-DEMO.md).

## Start with the question

**Observability** means using evidence from a running system to understand what it is doing. A useful opening: “Atif says his task did not save. Was the request rejected, was the API slow, was the database waiting, or did an Edge Function fail?”

| Signal | In simple words | Example question |
| --- | --- | --- |
| Metric | A number tracked over time. | Did requests or CPU rise? |
| Log | A record of a specific event. | Which error occurred for this request? |
| Live session | A current database connection and its state. | Which query is running or waiting now? |

On a conventional self-managed backend, a team must collect API and database metrics, centralize logs, build charts and alerts, retain data, and control access to those tools. Supabase Cloud supplies hosted product reports and a live Database Connections view. Your own application code still needs its own logs, useful error messages, and monitoring. Always choose a **time range** before comparing charts. Reports can refresh later than the live session view. “No data to show” can mean no events in that range or delayed reporting; it is not proof of zero activity.

## 1. Overview: where to investigate

Dashboard path: **Observability → Overview**. This is a starting map, not a diagnosis.

| Card | Meaning | Next place to look |
| --- | --- | --- |
| Slow Queries | Statements flagged as slow by the dashboard. It does not name them here. | Query Performance, then logs and a measured query plan. |
| Peak Connections | Highest simultaneous database session count in the range, compared with the project limit. | Database Connections and connection configuration. |
| Disk Usage | Portion of allocated disk capacity occupied. | Database/storage growth and retention. |
| Disk I/O | Reads and writes being performed. This is activity, not space occupied. | Database resource chart and query workload. |
| Memory | RAM use on the database compute. | Memory chart, cache, swap and query load. |
| CPU | Database compute activity. | CPU chart, Query Performance and traffic. |
| Service Health | Request volume or warning signals for API Gateway, Database, PostgREST, Auth, Edge Functions, Storage and Realtime. | The corresponding product report or logs. |

**Say:** “This card points us to a room. It does not tell us the exact faulty line of code.” A single percentage from the supplied screenshot is a snapshot, not a recommended target.

## 2. Query Performance: which SQL deserves attention?

Dashboard path: **Observability → Query Performance**. It groups database statements so you can compare how often they run and how long they consume. The presenter screenshot includes these columns:

| Column / summary | Plain explanation | How to use it |
| --- | --- | --- |
| Query | SQL statement or a shortened/normalized form. | Open the row to identify the operation and where it comes from. |
| Time consumed | Total execution time attributed to the statement; the percentage is its share of tracked time. | High total can result from many modest calls. |
| Calls | How many times it ran in the tracked statistics. | Separate a frequent query from a rare slow one. |
| Max time | Slowest recorded call. | A spike may affect a user even when the mean is low. |
| Mean time | Average time per call. | Compare typical cost per execution. |
| Min time | Fastest recorded call. | Shows that latency varies. |
| Rows processed | Rows returned or affected across calls. | Interpret alongside calls and query type; it is not “rows scanned.” |
| Cache hit rate | Share of data block accesses served from cache. | A high value can coexist with a slow query. |
| Role | PostgreSQL role under which the statement ran. | It is usually not the individual signed-in application user. |
| Application | Client-reported `application_name`, if set. | Helps distinguish a worker, dashboard, API or SQL client. |
| Slow Queries | Dashboard count of statements that meet its slow-query criteria. | A prompt to inspect rows, not a universal performance grade. |
| Average rows per call | Rows processed divided by calls. | Useful context for a query returning too much data. |

**Say:** “One query takes a long time once; another is quick but runs thousands of times. We read *calls × time per call*, then consider user impact.” The underlying `pg_stat_statements` statistics are cumulative since their reset. A filtered report window and a live request are different measurements. Timed-out statements may be absent from Query Performance; inspect logs for those. A query plan is needed before claiming a specific bottleneck.

## 3. Database Connections: who is doing what now?

Dashboard path: **Observability → Database Connections**. A **connection** is a PostgreSQL session opened by a database client or service. One browser tab is not necessarily one database connection: a browser can call an API gateway, whose service may reuse pooled database sessions. The dashboard itself can open a monitoring session.

| Summary card | Plain explanation | Is it always a problem? |
| --- | --- | --- |
| Connections | Open sessions versus the connection limit, for example `13 / 60`. | No. Idle pool sessions can be normal. Investigate sustained pressure near the limit. |
| Active Queries | Sessions currently executing SQL. | No. This is normal during work. Look at duration and user impact. |
| Idle in Transaction | A transaction is open but its session is not executing a statement now. | Often worth checking: it can hold locks and delay cleanup. |
| Blocked Queries | Sessions waiting for a conflicting lock to be released. | A brief wait may be normal; a growing queue or long user wait needs action. |
| Top Blocker | Session identified as causing the most blocking in the live view. | Inspect the full blocking chain and transaction before acting. |
| Longest Running | Oldest running work visible in the current snapshot. | Long duration is context, not proof of a fault. |

| Session list field / filter | Meaning |
| --- | --- |
| State | `active`, `idle`, `idle in transaction`, or a waiting state. An `active` query may itself be waiting on a lock. |
| Query · Session | Current or most recent SQL, plus identifying session details. The displayed text may be truncated. |
| PID | PostgreSQL process/session identifier. Use it to correlate with a blocker. |
| Role | Database role used by the session. |
| Application | Client-reported application name, if available. |
| Duration | How long the shown state, statement or transaction has lasted according to that view. Check the label before interpreting. |
| Blocked By | PID of a session the current query is waiting for. A chain can have more than one hop. |
| Root blockers | Filter for sessions at the start of a blocking chain. |
| State / Roles / Application | Filters to narrow the session list. |

**Live explanation:** Session A begins a transaction, updates one row and pauses. Its query has finished, but its transaction remains open and holds that row lock. Session B tries to update the same row and waits. The dashboard can show **idle in transaction**, a **blocked query**, and a **top blocker**. `ROLLBACK` in A releases the lock; B can continue. See the exact runbook. Never demonstrate this on a production table.

## 4. Database resources: what is the machine doing?

Dashboard path: **Observability → Database**.

| Metric | Plain explanation |
| --- | --- |
| Memory Used | RAM currently used by processes. |
| Cache + Buffers | RAM used to cache data; it is useful and may be reclaimable. |
| Free | RAM currently unused. |
| Swap | Disk used as overflow for memory pages; sustained use can indicate pressure. |
| Memory Commitment | Memory promised to processes. It is not identical to RAM physically in use. |
| Commit Limit | Limit compared with committed memory. |
| CPU User | CPU time spent running application/database code. |
| CPU System | CPU time spent in operating-system work. |
| CPU IOWait | Time waiting for I/O completion. |
| CPU IRQs | Time handling hardware/software interrupts. |
| CPU Idle | CPU time with no work to run. |
| Disk Usage | Space occupied out of provisioned capacity. |
| Disk I/O / IOPS | Read/write activity or operations per second. It is not capacity. |

**Say:** “A database uses CPU to execute work, RAM to cache and work, and disk to store durable data. An API server has its own CPU and RAM; it sends requests to these database resources.” One spike is a clue. Compare it with requests, sessions and user latency before resizing compute.

## 5. API Gateway, Data API and Auth

| Report | Visible field | Meaning |
| --- | --- | --- |
| API Gateway | Requests by Geography | Approximate origin of incoming requests. |
| API Gateway | Total Requests | Count of requests in the chosen time range. |
| API Gateway | Response Errors | Failed HTTP responses; inspect status, route and logs. |
| API Gateway | Response Speed | HTTP response time, including service work beyond SQL. |
| API Gateway | Network Traffic | Ingress is bytes received; egress is bytes sent. |
| Data API | Request / endpoint | Generated REST route such as `/rest/v1/tasks`; shows which routes are used. |
| Data API | Count | Calls to that route in the range. |
| Data API | Errors / status | HTTP outcome for requests; 4xx and 5xx need different investigation. |
| Data API | Response Speed / Avg | Time to serve a route. A slow route may require API and SQL checks. |
| Data API | Network Traffic | Bytes moving through the Data API. |
| Auth | Auth Activity | Authentication actions in the selected range. |
| Auth | Sign In Attempts by Type | Attempts grouped by provider or method. |
| Auth | Sign Ups | New registration events. |
| Auth | Password Reset Requests | Requests to start password recovery. |
| Auth | API Gateway Auth Errors / Auth Errors by Code | Authentication failures grouped by HTTP or Auth error code. |
| Auth | Sign In Processing Time / Percentiles | Time to complete sign-in; percentiles show tail latency beyond the average. |

**Say:** “First follow the request to the service that handled it.” A `403 Forbidden` can be a permission decision. It does not alone prove the database is down. A single HTTP request is not equal to a single PostgreSQL connection.

## 6. Edge Functions, Storage and Realtime

| Report | Visible field | Meaning |
| --- | --- | --- |
| Edge Functions | Total Invocations | Number of times function code was invoked. |
| Edge Functions | Status Codes | HTTP outcomes such as 200 and 403. Inspect route, auth and logs. |
| Edge Functions | Execution Time | Time function code spent handling a request. |
| Edge Functions | Invocations by Region | Where function requests executed. |
| Storage | Total Requests | File-service requests in the range. |
| Storage | Response Speed | Time to serve a file request. |
| Storage | Network Traffic / Billable Egress | Bytes received or sent; billable egress is a billing-related measure. |
| Storage | Request Caching | Cache behavior for file requests. |
| Realtime | Connected Clients | WebSocket clients connected to Realtime, not Postgres sessions. |
| Realtime | Broadcast Events | Messages sent over a channel. |
| Realtime | Presence Events | Online-state join/update/leave events. |
| Realtime | Postgres Changes Events | Database row-change events delivered through subscriptions. |
| Realtime | Rate of Channel Joins | How often clients join channels. |
| Realtime | Message Payload Size | Size of event messages. |
| Realtime | Broadcast From Database Replication Lag | Delay between database commit and Realtime broadcast. |
| Realtime | Private Channel Subscription RLS Execution Time | Time for access-policy checks when joining private channels; read and write paths can be shown separately. |

**Say:** “Which service owns this feature?” A Realtime chart can be blank because the feature is unused in the selected range or because reporting is delayed. Do not call it broken from that chart alone.

## Teaching route within 45 minutes

The first 12 screens build the application story. Seven Observability screens take about 15 minutes: definition → Overview → Query Performance → Connections → database machine → request services → file/live/function services. Spend the longest on the Connections demo. The final recap keeps the complete talk around 43 minutes. The company Q&A and quiz remain separate.

## Official references

- [Supabase Observability Reports](https://supabase.com/docs/guides/observability/reports)
- [Database connection management](https://supabase.com/docs/guides/database/connection-management)
- [Inspect database activity](https://supabase.com/docs/guides/observability/inspect)
- [pg_stat_statements](https://supabase.com/docs/guides/database/extensions/pg_stat_statements)
- [Database timeouts](https://supabase.com/docs/guides/database/postgres/timeouts)
- [Realtime Reports](https://supabase.com/docs/guides/realtime/reports)

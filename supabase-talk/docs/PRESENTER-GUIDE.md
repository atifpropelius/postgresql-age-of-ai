# Presenter guide — Supabase as a Backend: What Runs Where

Reviewed **16 October 2026**. This is the private study route; the audience sees only the 13-slide deck. The company session is 60 minutes: **38:00 talk**, **5:00 Q&A**, **10–12:00 live quiz**, **2:00 feedback**, leaving 3–5 minutes for transitions. The host's talk hard stop is 45 minutes. Quiz and Q&A are in [FACILITATOR-GUIDE.md](FACILITATOR-GUIDE.md).

## Timing and talk track

| Slide | Time | Cumulative | Say or show |
| --- | ---: | ---: | --- |
| 1. Title and objectives | 1:00 | 1:00 | Promise a map of execution and a practical task-app story. |
| 2. What and why | 2:30 | 3:30 | Define BaaS. Compare Supabase with an owned NestJS backend without claiming it replaces application design. |
| 3. Adoption context | 1:15 | 4:45 | Attribute the dated developer figure and funding terms. Udio is one published customer story, not proof that all its systems use Supabase. |
| 4. Components | 3:15 | 8:00 | Give one-line jobs. Postgres stores rows; separate services expose API, identity, files, live events and code. Queues/Cron build on Postgres extensions. |
| 5. What runs where | 3:45 | 11:45 | Trace Atif's sign-in, row, PDF and notification. Contrast row bytes, object bytes and worker execution. |
| 6. One request | 3:15 | 15:00 | The user's token identifies the caller. The API serves the request; Postgres evaluates grants, policies and constraints. Realtime needs configuration. |
| 7. Logic placement | 2:45 | 17:45 | SQL function/RPC and triggers run in Postgres; Edge Functions run separately; workers handle asynchronous work. Explain why a mail secret stays server-side. |
| 8. Schema workflow | 3:30 | 21:15 | Define migration/history/drift. Show local → reviewed SQL → staging → production. Do not run a remote write on stage. |
| 9. Branching | 2:15 | 23:30 | Preview versus persistent; branches are isolated and data-less by default. A short-lived preview may save compute compared with an always-on test project, but it is billed for usage. |
| 10. Region | 2:00 | 25:30 | Weigh user latency with residency and requirements. A later move needs a new project and migration. |
| 11. Usage | 5:30 | 31:00 | Read example counters as used/allowance, then define all eleven metrics. Explain Pro Spend Cap ON versus OFF and its exclusions; check Usage and Upcoming Invoice. |
| 12. Task-app demo | 5:00 | 36:00 | Use the [demo runbook](DEMO-RUNBOOK.md) for six timed stops; the prepared slide sequence is the offline fallback. |
| 13. Wrap | 2:00 | **38:00** | Repeat where work runs, how changes are reviewed and where to investigate. |

**Rehearsal rule:** if behind time, shorten slides 3 and 11 and use the prepared five-minute demo sequence. Preserve the architecture explanation on slide 5 and the production workflow on slide 8. The remaining seven minutes before the 45-minute hard stop are a buffer, not planned content.

## The one example and its boundaries

Atif signs in, creates a private task, uploads a PDF and sees an update on another screen. A task row belongs in `public.tasks`; the PDF's **bytes** belong in object storage, with metadata in Postgres and optionally a path in the task row. Auth establishes his identity. Grants and RLS decide task-row access. A Realtime subscriber gets a change only when that flow is configured. An Edge Function can call an external mail provider with a server-only credential. A database function invoked by `rpc()` executes **inside Postgres** and uses its database compute and connection capacity; it is not an Edge Function.

**Data API:** PostgREST exposes allowed database tables, views and functions as HTTP routes. **OpenAPI:** a machine-readable description of the exposed API; it documents routes but does not execute them. A direct client call is suitable only when grants and tested RLS policies protect the object. Use trusted server code for privileged operations, external secrets and appropriate custom workflows.

**Free versus Pro:** Free is useful for learning and low-stakes prototypes; a production service needs an availability, backup, support and capacity decision. Current plan terms and add-on costs change. Use the [pricing page](https://supabase.com/pricing), [billing guide](https://supabase.com/docs/guides/platform/billing-on-supabase) and [Usage guide](USAGE-GUIDE.md) instead of quoting a fixed bill on stage. If the app needs a dedicated backend, Supabase can still be its database/Auth/Storage layer.

**Spend Cap talk track:** On Pro, the Spend Cap starts enabled by default. With it on, covered usage over the plan quota can bring notification, a grace period and service restrictions; it is not a promise that the entire invoice cannot rise. Turning it off allows covered usage to continue past allowances with billable overages. Database compute and branching compute are outside the Spend Cap, and Supabase says branch usage is not covered. Before changing it, check the organization's Usage page, Upcoming Invoice and expected traffic. The control is in the organization's **Billing → Cost Control** area, not an individual project setting. [Billing FAQ](https://supabase.com/docs/guides/platform/billing-faq), [Cost Control](https://supabase.com/docs/guides/platform/cost-control), [branching usage](https://supabase.com/docs/guides/platform/manage-your-usage/branching).

## Where to study before presenting

- [Dashboard guide](DASHBOARD-GUIDE.md): every major dashboard area, what fields mean, one example and one caution.
- [Usage guide](USAGE-GUIDE.md): units, calculation, quotas, billing distinctions and the supplied illustrative Pro snapshot.
- [CLI reference](CLI-REFERENCE.md): essential commands, targets, migration workflow and remote-write warnings.
- [Demo runbook](DEMO-RUNBOOK.md): 4–5 minute live sequence and [standalone six-frame screenshot fallback](../assets/demo-fallback/index.html).
- [Task-app code examples](PRACTICAL-EXAMPLES.md): the useful SQL, SDK and service examples retained from the longer deck.
- [Observability guide](OBSERVABILITY-GUIDE.md): detailed query, connection and service vocabulary for questions after the talk.
- [Facilitator guide](FACILITATOR-GUIDE.md): quiz and likely Q&A, separate from the deck.
- [Research notes](RESEARCH-NOTES.md): dated company facts and the optional Cloudflare rate-limit extension.

## Accuracy notes for questions

- A Supabase project contains managed PostgreSQL compute. The platform manages its infrastructure; `rpc()` runs SQL in that database. An Edge Function runs in a separate regional runtime. [Database functions](https://supabase.com/docs/guides/database/functions), [Edge Functions](https://supabase.com/docs/guides/functions).
- A temporary Supabase branch is an isolated preview environment, normally without production rows or Storage objects. Secrets and third-party callbacks need deliberate setup. For a brief test, a preview branch can reduce cost compared with keeping a separate test project active all month. It has no fixed branch fee, but Supabase charges for its compute and other usage; branching compute credits do not apply. A persistent branch stays active and is not automatically cheaper than a separate project. Compare compute size, active hours and other usage before making the cost claim for your own setup. Preview branches are normally deleted when their pull request closes; delete unused branches created through other workflows. Availability depends on the plan. [Branching](https://supabase.com/docs/guides/deployment/branching), [branching usage](https://supabase.com/docs/guides/platform/manage-your-usage/branching), [compute usage](https://supabase.com/docs/guides/platform/manage-your-usage/compute).
- The region controls primary project data location. “Nearest” does not settle contractual compliance. Changing the region requires a new project and migration. [Regions](https://supabase.com/docs/guides/platform/regions), [region change](https://supabase.com/docs/guides/troubleshooting/change-project-region-eWJo5Z).
- Usage charts and Observability serve different questions. Usage describes accumulated consumption and allowances; Observability and Logs help diagnose a specific incident. A chart may update after the event, so check its time window. [Usage](https://supabase.com/docs/guides/platform/manage-your-usage), [Observability](https://supabase.com/docs/guides/observability).
- A browser tab is not necessarily a PostgreSQL session. Realtime WebSocket clients, API requests and database connections are different measures. [Realtime peak connections](https://supabase.com/docs/guides/platform/manage-your-usage/realtime-peak-connections), [connection management](https://supabase.com/docs/guides/database/connection-management).

## Primary references

Official Supabase documentation is the source for product and CLI behavior: [architecture](https://supabase.com/docs/guides/getting-started/architecture), [Data API](https://supabase.com/docs/guides/api), [Auth](https://supabase.com/docs/guides/auth), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Storage](https://supabase.com/docs/guides/storage), [Realtime](https://supabase.com/docs/guides/realtime), [Edge Functions](https://supabase.com/docs/guides/functions), [Queues](https://supabase.com/docs/guides/queues), [Cron](https://supabase.com/docs/guides/cron), [local development](https://supabase.com/docs/guides/local-development/cli-workflows), [branching](https://supabase.com/docs/guides/deployment/branching), [regions](https://supabase.com/docs/guides/platform/regions), [usage](https://supabase.com/docs/guides/platform/manage-your-usage). The [Series F announcement](https://supabase.com/blog/series-f) and [Udio customer story](https://supabase.com/customers/udio) support the dated context slide.

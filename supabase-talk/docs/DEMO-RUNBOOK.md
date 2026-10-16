# Four-minute taskboard walkthrough

This is the **4–5 minute practical example inside the 35–40 minute talk**. The six stops use one task story: Atif signs in, creates a task, attaches a PDF and investigates a failure. The presentation's prepared sequence is a **conceptual, offline fallback**, not a connected Supabase project or measured result. Say that aloud if you use it.

Use an existing, disposable or sanitized demo project for a live walkthrough. Do not create a production project during the talk. Keep credentials, connection strings, customer data and secret keys out of screen share and screenshots. Rehearse with the exact dashboard account and project first; menus and report availability can differ by plan and product version.

## Before the session

1. Confirm the task demo has a small `public.tasks` table with `id`, `owner_id`, `title` and `done`, a synthetic Auth user named **Atif**, a **private** `task-files` bucket, and a reviewed migration file in the demo repository. These are example requirements, not instructions to alter production.
2. If you plan a live Data API request, sign in through the demo application as Atif beforehand. Check that the returned task belongs to that demo identity. The SQL Editor runs with different privileges and cannot prove a browser user's RLS behavior.
3. Prepare a sanitized Edge Function error or an intentionally failing disposable-demo invocation, and know where to find its **Invocations** and **Logs**. Do not trigger a failure in a shared project.
4. Open the presentation slide and the demo dashboard in separate tabs. Zoom so one line of data and each location label is readable from the back of the room. Close tabs with credentials, real messages or customer data.
5. Test the [standalone fallback viewer](../assets/demo-fallback/index.html) without network access. It contains six sanitized screenshots of the deck's prepared illustration and works when opened as a local file. It must still communicate all six locations below.

## Six stops, 4:30 total

| Time | Stop | Show or say | What the audience should learn |
| --- | --- | --- | --- |
| 0:00–0:40 | **Table** | In Table Editor, point to `public.tasks`: one row is one task; `owner_id` references its user. In fallback, use the prepared task row in the deck. | Application rows are stored in PostgreSQL. |
| 0:40–1:20 | **Identity** | In Authentication → Users, point only to a synthetic user's ID; never show a real email. Explain that Auth supplies identity and the task policy decides row access. | Authentication answers who; authorization answers which rows. |
| 1:20–2:05 | **Data API** | Show the demo app's permitted `tasks` response or the generated Data API route, `GET /rest/v1/tasks`. Trace client → API → RLS → Postgres → response. | The Data API serves database requests; it is not a second data store. |
| 2:05–2:45 | **Migration** | Show a reviewed file such as `supabase/migrations/<timestamp>_create_tasks.sql`; point to `create table` and `alter table ... enable row level security`. | Schema changes should travel with code and be reviewed. |
| 2:45–3:25 | **PDF** | In Storage, point to private bucket `task-files` and a synthetic `users/atif/brief.pdf` object or its prepared diagram. | Storage keeps file bytes; the task row can keep a path. |
| 3:25–4:30 | **Investigate** | Open a sanitized function's Invocations/Logs, or point to Usage for invocation count. Explain status, duration and error message, then where a usage spike appears. | A production developer needs a place to diagnose failure and watch consumption. |

**Transition back to the deck:** “We now know where each part runs, where a schema change belongs, and where we would look when an operation fails.”

### Optional example migration fragment

Keep this fragment in a prepared file. Do not type it into a live production SQL Editor during the session. A complete task feature also needs operation-specific RLS policies, appropriate grants and testing.

```sql
create table public.tasks (
  id bigint generated always as identity primary key,
  owner_id uuid not null references auth.users(id),
  title text not null,
  done boolean not null default false
);

alter table public.tasks enable row level security;
```

## Fallback if the dashboard or network fails

Stay in the deck and advance its prepared six-step sequence in this order: **table → identity → Data API → migration → Storage → function logs/Usage**. If the local slide server also fails, open [assets/demo-fallback/index.html](../assets/demo-fallback/index.html) directly in the browser and use its six PNG frames. Say “This is a prepared illustration of the request path, not a live project.” Do not narrate an illustrative status code, user count or chart as live telemetry. The supplied production screenshots are not part of this fallback.

At each step, speak the one-line definition before moving on. Rehearse once with the network disabled and a 4:30 timer. If a live dashboard page takes more than about 10 seconds to load, switch to the prepared sequence immediately. The screenshot viewer needs neither a web server nor Docker, database credentials or an active Supabase project.

For a separate, more advanced database lock demonstration, see [OBSERVABILITY-DEMO.md](OBSERVABILITY-DEMO.md); it is **outside this timed walkthrough** and must only run in a disposable project. For deeper dashboard vocabulary, see [DASHBOARD-GUIDE.md](DASHBOARD-GUIDE.md) and [OBSERVABILITY-GUIDE.md](OBSERVABILITY-GUIDE.md).

## References

- [Supabase database and Table Editor](https://supabase.com/docs/guides/database/overview)
- [Supabase Auth and user identity](https://supabase.com/docs/guides/auth)
- [Data API](https://supabase.com/docs/guides/api)
- [Local development and migrations](https://supabase.com/docs/guides/local-development/cli-workflows)
- [Storage quickstart](https://supabase.com/docs/guides/storage/quickstart)
- [Edge Function logging](https://supabase.com/docs/guides/functions/logging)
- [Organization usage](https://supabase.com/docs/guides/platform/manage-your-usage)

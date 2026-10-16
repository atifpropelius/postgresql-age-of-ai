# Task-app examples retained from the longer deck

Presenter reference only. These snippets are a learning sequence, **not** a migration that has been applied to a live project. Run them in a disposable local or staging project, review grants and policies, and use the current [Supabase local workflow](https://supabase.com/docs/guides/local-development/cli-workflows) before any remote deployment.

## 1. A task is a database row

```sql
create table public.tasks (
  id bigint generated always as identity primary key,
  owner_id uuid not null references auth.users(id),
  title text not null,
  done boolean not null default false
);
```

A **table** groups records of the same shape; a **column** is a named typed field; a **row** is one task. The foreign key checks that `owner_id` refers to an Auth user, but it does **not** decide whether the current caller may read that task. [Database overview](https://supabase.com/docs/guides/database/overview), [user management](https://supabase.com/docs/guides/auth/managing-user-data).

## 2. Auth supplies identity; RLS restricts rows

```sql
alter table public.tasks enable row level security;

create policy "read own tasks" on public.tasks
for select to authenticated
using ((select auth.uid()) = owner_id);

create policy "insert own tasks" on public.tasks
for insert to authenticated
with check ((select auth.uid()) = owner_id);
```

Atif can read or create rows whose `owner_id` matches his authenticated user ID. Test the policy through an actual user session; SQL Editor privileges can differ from client access. Review the exposed schema and table grants as well as RLS. A production task app would add appropriate update/delete policies and tests. [RLS guide](https://supabase.com/docs/guides/database/postgres/row-level-security), [Data API security](https://supabase.com/docs/guides/api/securing-your-api).

## 3. The Data API serves rows; OpenAPI describes routes

```js
const { data, error } = await supabase
  .from('tasks')
  .select('id, title, done')
  .order('id', { ascending: false });
```

`supabase-js` calls the generated Data API. PostgREST handles the request; PostgreSQL returns rows according to privileges and policies. An OpenAPI specification describes the exposed REST surface. It does not execute the query. [Data API](https://supabase.com/docs/guides/api), [generated API docs](https://supabase.com/docs/guides/api/rest/auto-generated-docs).

## 4. Store PDF bytes in Storage

```js
const { data, error } = await supabase.storage
  .from('task-files')
  .upload('users/atif/brief.pdf', file);
```

This assumes a configured **private** bucket and suitable Storage policies. The path is a synthetic teaching example; real paths and policies should be designed around authenticated identities. Storage keeps object metadata in Postgres and file bytes in an object provider. A task row may store the returned path. [Storage](https://supabase.com/docs/guides/storage), [Storage schema](https://supabase.com/docs/guides/storage/schema/design).

## 5. Work later versus work on a schedule

- **Queue:** `pgmq` holds a message in Postgres until a consumer reads and processes it. Sending a message does not send the email by itself. The consumer needs a retry and acknowledgement plan. [Queues](https://supabase.com/docs/guides/queues).
- **Cron:** `pg_cron` invokes SQL, HTTP or other supported work on a schedule. It does not replace a queue consumer. [Cron](https://supabase.com/docs/guides/cron).
- **Edge Function:** a separate runtime can call a mail provider with a server-side secret. Keep the secret out of the browser and logs. [Edge Functions](https://supabase.com/docs/guides/functions).
- **Database function / RPC:** SQL executes inside Postgres and uses database compute. It is suited to transactional row work, rather than slow external network calls. [Database functions](https://supabase.com/docs/guides/database/functions).

The previous deck's longer Observability explanations remain in [OBSERVABILITY-GUIDE.md](OBSERVABILITY-GUIDE.md). The new audience route keeps these examples short to fit the session clock.

## 6. Keep Edge Function code readable to your team

Supabase Edge Functions run TypeScript in a Deno-compatible runtime. Start with a small request handler when it has one job. For several routes, Supabase also documents familiar **Express, Oak and Hono** routing styles. Choose a consistent structure your team understands; a routing framework is optional. Validate the caller and input, return useful HTTP errors, and log failures without exposing secrets. Test with `supabase functions serve`, then inspect **Invocations** and **Logs** after deployment. Familiar syntax helps maintainability, while tests and evidence reveal the actual error. [Routing in Functions](https://supabase.com/docs/guides/functions/routing), [error handling](https://supabase.com/docs/guides/functions/error-handling), [logging](https://supabase.com/docs/guides/functions/logging).

# Supabase CLI: presenter command reference

Reviewed **16 October 2026** against the [current Supabase CLI reference](https://supabase.com/docs/reference/cli/supabase-init) and [local development workflow](https://supabase.com/docs/guides/local-development/cli-workflows). This is for presenter preparation, not an audience slide. Run `supabase --version` and `supabase <command> --help` before a live demo: CLI flags and default diff engines can change. If the CLI is installed in a project, use `npx supabase ...` in place of `supabase ...`. Local stack commands need Docker or a compatible running container engine.

For a personal project-start checklist, keep [Atif's Supabase setup and command notes](https://docs.google.com/document/d/1BuuqS7D1_e4EBkRsocbWcxqVBCOK2_jKl3bIAOkuTyw/edit?tab=t.0#heading=h.93vq90vfy6sb) alongside this guide. The document's contents were not accessible for review here; use the [official Supabase Developer Docs](https://supabase.com/docs) and [CLI reference](https://supabase.com/docs/reference/cli/introduction) as the source of truth for current commands.

## The safe mental model

- **Local project** is a repository with `supabase/config.toml`, migrations, and optional functions. **Local stack** is the set of containers started on your laptop.
- **Linked project** is a specific hosted Supabase project. `supabase link` selects it for commands that use `--linked` or default to the linked target. Verify its project ref and environment before any write.
- **Migration** is a versioned SQL file in `supabase/migrations/`. Its timestamp is tracked in the database's migration history. Review the SQL and commit it with the app change.
- **Read-only commands** can still write generated local files; **remote-changing commands** can affect real users. Never treat a linked production project as a sandbox.

### A repeatable feature workflow

1. Run `supabase init` once, then `supabase start` for local development.
2. Run `supabase migration new add_tasks`, edit the generated SQL, then run `supabase db reset` against the disposable **local** stack to replay and test it. Alternatively, make a local schema edit and capture it with `supabase db diff -f add_tasks`; inspect the generated SQL.
3. Run `supabase migration list` to compare history after linking a **staging** project. Commit migration files, review them, and validate in staging.
4. Run `supabase db push --dry-run` while linked to staging; only after review, apply `supabase db push` to staging. Promote the same reviewed migration through the team's deployment process to production.
5. Generate application types from the intended schema and commit them if the repository tracks generated types.

Supabase recommends avoiding direct schema edits on a remote project once migration files are the source of truth. Such edits bypass history and can cause drift or `db push` synchronization errors. See [database migrations](https://supabase.com/docs/guides/deployment/database-migrations).

## Commands

Run these from the **repository root**, except `login`, which can be run from any directory. Replace all uppercase placeholders; they are deliberately not valid project identifiers. “Local” below means your files/containers, not a hosted project.

| Command | What and when | Target and footprint | Safe example | Important warning |
|---|---|---|---|---|
| `supabase init` | Creates the local Supabase configuration for a new repository. | Local files: creates `supabase/config.toml`. | `supabase init` | `--force` overwrites an existing config; review it first. |
| `supabase start` | Starts the local Supabase services for app and migration testing. | Local Docker containers and volumes; no hosted change. | `supabase start` | Needs a running container engine and enough memory; local service keys printed during setup should not enter shared logs. |
| `supabase stop` | Stops the local stack after work. | Local containers; data volumes persist by default. | `supabase stop` | `--no-backup` deletes local volumes; `--all` affects all local Supabase projects. |
| `supabase status` | Shows local service URLs and health after `start`. Useful before the demo. | Reads local stack; no hosted change. | `supabase status` | Output can include local keys, including a service-role key; avoid displaying it on a shared screen. |
| `supabase login` | Authenticates the CLI to the Supabase platform. | Stores a personal access token locally; no database schema change. | `supabase login` | Do not put tokens in source control or command history; the CLI may use a plaintext token file if native credential storage is unavailable. |
| `supabase link` | Selects an existing hosted project for later CLI operations. | Local link metadata; reads remote config; no migration applied. | `supabase link --project-ref YOUR_STAGING_PROJECT_REF` | Confirm the project ref. Later `db push`, `db pull`, and deploy commands may use this link. |
| `supabase migration new` | Creates an empty, timestamped SQL migration when you know the change you want. | Local migration file. | `supabase migration new add_tasks` | It does **not** execute the SQL; edit, review, and test the file. |
| `supabase migration list` | Compares local migration timestamps with the linked remote history. Use before a remote push. | Reads local files and remote history; no schema change. | `supabase migration list` | Differences can mean missing files or drift. Do not “repair” history without understanding the actual schema. |
| `supabase migration up` | Applies pending migrations to an explicitly selected database. Useful for local incremental testing. | Local with `--local`; remote with `--linked` or `--db-url`. | `supabase migration up --local` | This is a write operation. Make the target explicit; `--linked` can change a hosted database. |
| `supabase db diff` | Compares a live schema with a shadow database built from migrations; captures local editor changes. | Reads local database by default; `-f` writes a local migration. `--linked` reads remote schema. | `supabase db diff -f add_tasks` | Review generated SQL. The diff engine depends on `config.toml` (`pg-delta` or legacy `migra`); legacy `migra` may miss some object types. |
| `supabase db reset` | Recreates and reseeds the local database to prove migrations replay cleanly. | **Destroys local database data** by default, then reapplies migrations and seed. | `supabase db reset` | Never add `--linked` or `--db-url` casually: those flags reset a remote database and drop user-created objects. Use only with an explicitly disposable target and recovery plan. |
| `supabase db push` | Applies pending local migration files to the linked hosted database. Use at a reviewed release point. | **Remote schema/data can change.** `--dry-run` lists migrations without applying them. | `supabase db push --dry-run` | Verify the linked project, inspect every migration, validate in staging, and coordinate so one deployment runs at a time. `--include-seed` also pushes seed data. |
| `supabase db pull` | Captures a hosted database's schema changes into a local migration, usually when adopting an existing project or resolving drift. | Reads remote schema and writes a local migration; its prompt can also update **remote migration history**. | `supabase db pull` on a staging-linked repository | Does not copy row data. Inspect the generated SQL and the history-update prompt before answering. Requires Docker for the diff. |
| `supabase functions new` | Scaffolds a new Edge Function for an HTTP endpoint or integration. | Local `supabase/functions/<name>/` files. | `supabase functions new task-webhook` | Scaffolding alone does not deploy or protect the function; add authorization and tests. |
| `supabase functions serve` | Runs Edge Functions locally for development. | Local runtime; no hosted deployment. | `supabase functions serve task-webhook` | Use a local environment file for secrets when needed; never commit it. Do not use `--no-verify-jwt` as a production security shortcut. |
| `supabase functions deploy` | Publishes a reviewed Edge Function to a hosted project. | **Remote function code changes.** | `supabase functions deploy task-webhook --project-ref YOUR_STAGING_PROJECT_REF` | Deploy to staging first. Avoid `--prune` unless you intend to delete remote functions absent locally; protect server-side credentials. |
| `supabase gen types` | Reads a schema and prints generated types for application code. | Read-only database access; shell redirection may write a local file. | `supabase gen types --lang typescript --local --schema public > src/database.types.ts` | `--local`, `--linked`, and `--project-id` select different schemas. Do not generate against one environment and assume it matches another. |

The requested list contains 16 commands; `supabase status` is included as a useful seventeenth command for a live local demo.

## Flags worth remembering

| Flag or choice | Meaning |
|---|---|
| `--local` | Explicitly target the local development database where the command supports it. |
| `--linked` | Target the linked hosted project; verify the project ref first. |
| `--project-ref` | Select a particular hosted project for commands such as `link` or function deployment. |
| `--db-url` | Target a database connection string directly. Treat it as sensitive and use carefully; shell history can expose it. |
| `--dry-run` on `db push` | Show pending migration files without applying them. |
| `-f` on `db diff` | Write the generated diff as a new local migration file. |

**Version detail:** The current [CLI reference](https://supabase.com/docs/reference/cli/supabase-db-diff) says recent `supabase init` projects default to the `pg-delta` diff engine, while older projects may still use `migra`. The engine is set in `supabase/config.toml`. Check the local CLI version and configuration rather than assuming a fixed engine or flag set.

## Official references

- [Supabase CLI reference](https://supabase.com/docs/reference/cli/supabase-init)
- [Local development workflow](https://supabase.com/docs/guides/local-development/cli-workflows)
- [Database migrations](https://supabase.com/docs/guides/deployment/database-migrations)
- [Generating TypeScript types](https://supabase.com/docs/guides/api/rest/generating-types)
- [Edge Functions quickstart](https://supabase.com/docs/guides/functions/quickstart)

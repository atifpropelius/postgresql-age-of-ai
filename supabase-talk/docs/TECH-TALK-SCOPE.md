# Tech talk program and FS-03 scope

Source: topic list and boundaries supplied by the presenter on 2026-10-15. [Original Tech Talk Topics link supplied by the presenter](https://app.notion.com/Tech-Talk-Topics-3f1014f947c680e1ac95e2c871274fd7?pvs=21). The tables below preserve the supplied topic titles and status fields; blank cells remain blank. “Not available” is a supplied value, not an inferred scheduling decision.

## This presentation: FS-03

**Supabase as a backend: what runs where** is a Tier 1 overview. Explain what a Supabase project is and how an application reaches Postgres through the surrounding services. Cover what each service does, which parts run in Postgres, which are separate services, and how they cooperate in one realistic app.

Included at introductory depth:

- PostgreSQL database, schema/tables, keys, a small SQL migration, and why Postgres is the data core.
- **Data API**: PostgREST serves REST requests over exposed tables, views, and functions; database permissions and RLS still govern access.
- **OpenAPI**: machine-readable description of the generated REST API. It documents the surface; it does not execute requests and is not the separate OpenAPI foreign data wrapper.
- Auth, identity, JWT and the **purpose** of RLS, with one simple two-user policy example.
- Storage, Realtime, Edge Functions, **Queues**, and **Cron**. Distinguish queue/worker from schedule/trigger. Queues are built on `pgmq`; Cron is built on `pg_cron`.
- Local CLI/migrations, deployment workflow, operational checks and when Supabase fits.
- The optional Vector product may be named as part of the platform, but embedding search and RAG mechanics are reserved for AG-04.

Keep this talk compact. The current main route has 14 screens; presenter notes and technical details carry extra depth. Avoid turning FS-03 into a PostgreSQL internals, RLS, Auth, queue architecture, or RAG deep dive. Do not add Q&A or quiz questions to the deck; those are prepared separately under [SESSION-FORMAT.md](SESSION-FORMAT.md).

## Boundaries with other talks

| Other session | What FS-03 may say | What belongs in that session |
| --- | --- | --- |
| FS-04 API design | Show the generated Data API and OpenAPI description. | REST vs PostgREST vs tRPC, design tradeoffs and webhooks. |
| AG-04 RAG that works | Mention Vector as an optional Supabase capability. | Embeddings, pgvector, hybrid search and RAG architecture. |
| AU-03 Webhooks, queues and event-driven design | Show that Queues hold work for a consumer and Cron schedules work. | Delivery semantics, consumers, retries and event architecture in depth. |
| SEC-01 Supabase RLS from zero to production | Show why one user sees only their own rows. | Policy design, performance and production hardening. |
| SEC-02 Auth deep dive | Show sign-in and identity handoff. | Sessions, JWT, OAuth, MFA and RBAC in depth. |
| SEC-04 Postgres internals for app developers | State that Postgres is the database core. | MVCC, WAL, planner, storage, VACUUM and internals. |
| SEC-05 Data modelling for SaaS | Show one small task table and migration. | Multi-tenancy, audit logs and migration strategy in depth. |
| SEC-08 Backups, disaster recovery and data migrations | Mention restore planning as a production check. | Recovery procedures and migration execution in depth. |

## Full supplied topic list

### Full stack (FS)

| ID | Topic | Tier | Availability | Date |
| --- | --- | --- | --- | --- |
| FS-01 | Next.js App Router in production: RSC, Server Actions, caching | 2 | | |
| FS-02 | TypeScript that actually prevents bugs | 1 | | |
| FS-03 | Supabase as a backend: what runs where | 1 | Not available | October |
| FS-04 | API design: REST, PostgREST, tRPC and webhooks | 2 | | |
| FS-05 | React Native & Expo in production | 2 | | |
| FS-06 | Client data & state: TanStack Query, forms, optimistic UI | 2 | | |
| FS-07 | Testing strategy that fits a 30-day MVP | 2 | | |
| FS-08 | CI/CD, environments and deployments | 2 | | |
| FS-09 | Performance & observability | 2 | | |
| FS-10 | Payments & subscriptions done right | 2 | | |
| FS-11 | Git, code review and working in small pods | 1 | | |

### AI and agents (AG)

| ID | Topic | Tier | Presenter | Date |
| --- | --- | --- | --- | --- |
| AG-01 | LLM fundamentals for engineers | 1 | | |
| AG-02 | Prompt engineering & evals: from vibes to measurement | 2 | | |
| AG-03 | Tool use, the agent loop and MCP | 2 | | |
| AG-04 | RAG that works: embeddings, pgvector, hybrid search | 2 | | |
| AG-05 | Orchestration: workflows, multi-agent patterns and durable execution | 3 | | |
| AG-06 | Agent memory, context management and long-running sessions | 3 | | |
| AG-07 | Shipping AI features: UX, streaming, guardrails and cost control | 2 | | |
| AG-08 | Coding with AI agents without shipping garbage | 1 | | |

### Automation (AU)

| ID | Topic | Tier | Presenter | Date |
| --- | --- | --- | --- | --- |
| AU-01 | The automation landscape: Zapier vs Make vs n8n vs code | 1 | | |
| AU-02 | n8n in production | 2 | | |
| AU-03 | Webhooks, queues and event-driven design | 2 | | |
| AU-04 | Integrating with business systems: CRMs, Slack, Google Workspace, WhatsApp | 2 | | |
| AU-05 | Document & data extraction with AI | 2 | | |
| AU-06 | Sales, HR & ops automation playbooks | 1 | | |
| AU-07 | Reliability, monitoring and handing automations to clients | 2 | | |
| AU-08 | Browser automation, scraping and computer-use agents | 3 | | |

### Security, data and operations (SEC)

| ID | Topic | Tier | Presenter | Date |
| --- | --- | --- | --- | --- |
| SEC-01 | Supabase RLS from zero to production | 2 | Not available | November |
| SEC-02 | Auth deep dive: sessions, JWT, OAuth, MFA, RBAC | 2 | | |
| SEC-03 | OWASP Top 10 for Next.js + Supabase apps | 2 | | |
| SEC-04 | Postgres internals for app developers | 2 | | |
| SEC-05 | Data modelling for SaaS: multi-tenancy, audit logs, migrations | 2 | | |
| SEC-06 | Secrets, keys and infrastructure hygiene | 1 | | |
| SEC-07 | Compliance-lite: GDPR, India's DPDP Act, SOC 2 basics, PII | 2 | | |
| SEC-08 | Backups, disaster recovery and data migrations | 2 | | |
| SEC-09 | Security for AI features: prompt injection, leakage, tool permissions | 3 | | |

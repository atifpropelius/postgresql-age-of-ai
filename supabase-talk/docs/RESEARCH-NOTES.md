# Research notes for the Supabase talk

Reviewed **16 October 2026**. This file records claims that change over time. Use only the short, qualified versions in the main deck; keep the fuller context here. Recheck linked primary sources before presenting.

## Adoption, valuation, and named integrations

| Claim suitable for a short context slide | Scope and qualification | Primary source |
| --- | --- | --- |
| “Supabase reported nearly 10 million developers building on its platform in June 2026.” | This is Supabase's reported **developer** adoption figure, not monthly active application users, paying customers, or project count. | [Supabase Series F announcement, 4 June 2026](https://supabase.com/blog/series-f) |
| “Supabase announced a $500 million Series F at a $10 billion pre-money valuation.” | State the funding terms exactly. $10.5 billion is the simple post-financing arithmetic, not the valuation wording in the company announcement; avoid presenting it as a current market price. | [Supabase Series F announcement](https://supabase.com/blog/series-f) |
| “Supabase powers many Lovable apps; Figma Make integrates with it. Mozilla and 1Password are also named customers.” | Supabase documents a Lovable customer use case and a Figma Make product integration; these are different relationships. Its April 2024 General Availability announcement names Mozilla and 1Password as enterprise customers. Do not imply that all Figma products or Figma's internal infrastructure use Supabase, or that every company shown is a paying customer today. | [Lovable customer story](https://supabase.com/customers/lovable), [Figma Make integration, 15 July 2025](https://supabase.com/blog/figma-make-support-for-supabase), [General Availability announcement, 15 April 2024](https://supabase.com/ga) |

The adoption and valuation claims are time-sensitive company statements. Present neither as audited counts nor as a comparison with MAU. Keep the company examples to one short line; the platform architecture should remain the focus of the talk.

## Production-practice source checks

The 21-slide talk includes a compact best-practices slide after Usage. These are practical operational lessons, with source limits:

| Practice | Verified point and qualification | Official source |
| --- | --- | --- |
| Back up dashboard MFA | Supabase account MFA uses TOTP, provides no recovery codes and recommends a backup factor in a separate app/device. Supabase says it cannot restore a non-SSO account if all factors are lost. Another organization owner helps project continuity but does not recover an individual's account. | [Account MFA](https://supabase.com/docs/guides/platform/multi-factor-authentication), [lost MFA device](https://supabase.com/docs/guides/troubleshooting/lost-accessforgot-the-mfa-device-nAPT-7), [organization access](https://supabase.com/docs/guides/platform/access-control) |
| Migrate remote schema | Supabase's migration guide says to make remote schema changes through migration files; remote Table/SQL Editor edits bypass migration history. Local Dashboard edits can be captured with `supabase db diff`. | [Database migrations](https://supabase.com/docs/guides/deployment/database-migrations) |
| Review advisor findings | Security Advisor reports error/warning findings; triage the affected object and decide whether it reflects intended policy before changing permissions. A finding alone does not prove exploitation. | [Advisors](https://supabase.com/docs/guides/observability/advisors) |
| Monitor regularly | Observability combines reports, database statistics, advisors and logs; use trends for detection and timed events for diagnosis. Availability and history depend on project configuration and plan. | [Observability](https://supabase.com/docs/guides/observability), [Logs in Studio](https://supabase.com/docs/guides/observability/logs) |
| Use official docs first | The [Supabase Developer Docs](https://supabase.com/docs) are the primary source for current commands and product behavior. Dashboard screenshots and third-party guides may be stale. | [Supabase Developer Docs](https://supabase.com/docs) |
| Use familiar HTTP routing where useful | Edge Functions use TypeScript on a Deno runtime. Supabase documents optional Express, Oak and Hono routing inside a function; this is not a Node/EC2 deployment. | [Edge Functions quickstart](https://supabase.com/docs/guides/functions/quickstart), [routing](https://supabase.com/docs/guides/functions/routing) |

## The new Supabase Compute product versus database compute

Supabase's [October 2026 announcement](https://supabase.com/blog/select-2026-build-anything) describes a new Compute product for long-running web services, background jobs and agent sandboxes next to project data. It is different from **database compute**, the CPU/RAM/disk capability used by each project's Postgres instance and counted under [database compute usage](https://supabase.com/docs/guides/platform/manage-your-usage/compute). It is also different from Edge Functions, which run separately in a managed function runtime.

The [Compute product page](https://supabase.com/compute) explicitly names Node and Deno and supports static binaries or Dockerfiles for custom runtimes. It describes public HTTP services plus private services for queue jobs or agent sandboxes, a full Linux environment and no wall-clock execution limit. The same page says idle services can suspend and resume, so a deployed service does **not** guarantee one process remains alive with in-memory state. It does not establish a persistent local disk guarantee, a production SLA, a public price or a general-availability date. [Edge Function limits](https://supabase.com/docs/guides/functions/limits) still permit bounded background tasks during an Edge Function worker's lifetime; the distinction is long-running service hosting, not whether background work is categorically possible.

The [Compute product page](https://supabase.com/compute) labels this feature **Private Alpha** and offers a waitlist. Its terms say access is for **internal evaluation only**, not production workloads or end customers, and that the preview may change or be discontinued. At this review, only projects created in `us-west-2` can access the private alpha. The user's dashboard screenshot says the project has **no access yet**. Therefore, the audience talk can explain why a managed long-running service might eventually replace an external application server for some workloads, but it must not recommend a production migration or claim general availability.

## Slide 9: throttle requests before Supabase

Use this as a brief architecture example, not a Cloudflare deployment tutorial:

```text
Client → api.example.com → Cloudflare Worker rate check → Supabase Edge Function or protected API → Postgres
                                    └─ 429 when over limit
```

- **Cloudflare Worker:** a separate platform's edge-executed server-side code; it can inspect and reject a request before forwarding it to a Supabase endpoint. It is not a native Supabase component. [Cloudflare Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- **Cloudflare Worker Custom Domain:** maps an owned domain or subdomain such as `api.example.com` to a Worker in an **active Cloudflare zone**. This is a proxy entry point, not Supabase's own [paid Custom Domains add-on](https://supabase.com/docs/guides/platform/custom-domains). Cloudflare creates the needed DNS record and certificate for the Worker. It does not automatically rebrand all Supabase services, Auth callbacks, Storage URLs or WebSockets; test each route you proxy. [Worker Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
- **Workers KV:** Cloudflare's distributed key-value store for read-heavy, cache-friendly data. It is eventually consistent and lacks atomic read-modify-write transactions, so a KV counter is **not** a strict global rate limiter. [How KV works](https://developers.cloudflare.com/kv/concepts/how-kv-works/), [KV pricing](https://developers.cloudflare.com/kv/platform/pricing/)
- **Workers Rate Limiting binding:** a rate-check API called in Worker code. Its limits are per Cloudflare location and its counters are intentionally approximate and eventually consistent. Good for shedding abusive traffic; not exact billing or a strict global quota. Wrangler 4.36.0 or later is required by the current guide. [Rate Limiting binding](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)
- **Durable Object:** a Cloudflare coordination primitive to consider when the application needs a stronger per-key single coordinator than KV or an approximate edge counter. Validate its design and limits before using it for a global policy. [How KV works](https://developers.cloudflare.com/kv/concepts/how-kv-works/), [Durable Objects pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/)

As documented on 16 October 2026, Workers Free allows **100,000 Worker requests per day** and **10 ms CPU time per invocation**. Workers Paid has a **$5 USD per account per month minimum**, includes a larger request/CPU allotment and charges for usage beyond it; $5 is not a hard monthly cap. KV Free separately allows **100,000 reads and 1,000 writes per day**. These are Cloudflare plan limits with separate reset and failure rules, not unlimited free capacity or Supabase allowances. Recheck before quoting. [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/), [KV pricing](https://developers.cloudflare.com/kv/platform/pricing/)

For a real design, rate-limit by a server-verified identity or carefully chosen route/key, **not a client-supplied user ID**. Keep Supabase and third-party credentials on the server. The original Supabase URL can remain reachable; if a client can call it directly, they can bypass the Worker, so the gateway must not be described as complete origin protection without additional controls. Continue enforcing Supabase Auth, grants, and RLS inside the application and database. IP-only limits can affect unrelated users sharing an address. [Rate Limiting binding](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/), [Securing the Data API](https://supabase.com/docs/guides/api/securing-your-api)

**Decision for the main talk:** Show the route and one production caution on slide 9. Keep pricing, KV consistency, identity design and bypass details here and in the presenter guide; the talk remains 41:30.

# Research notes for the Supabase talk

Reviewed **16 October 2026**. This file records claims that change over time. Use only the short, qualified versions in the main deck; keep the fuller context here. Recheck linked primary sources before presenting.

## Adoption, valuation, and customer example

| Claim suitable for a short context slide | Scope and qualification | Primary source |
| --- | --- | --- |
| “Supabase reported nearly 10 million developers building on its platform in June 2026.” | This is Supabase's reported **developer** adoption figure, not monthly active application users, paying customers, or project count. | [Supabase Series F announcement, 4 June 2026](https://supabase.com/blog/series-f) |
| “Supabase announced a $500 million Series F at a $10 billion pre-money valuation.” | State the funding terms exactly. $10.5 billion is the simple post-financing arithmetic, not the valuation wording in the company announcement; avoid presenting it as a current market price. | [Supabase Series F announcement](https://supabase.com/blog/series-f) |
| “Udio says it launched on Supabase and uses its Database and Auth.” | This is a named, published customer case study. It describes Udio's reported use; it does not prove how every other service is used by Udio. | [Udio customer story](https://supabase.com/customers/udio) |

The adoption and valuation claims are time-sensitive company statements. Present neither as audited counts nor as a comparison with MAU. The Udio story can be reduced to a single line; the platform architecture should remain the focus of the talk.

## Optional engineering extension: throttle requests before Supabase

One optional presenter note, only if time remains:

```text
Client → Cloudflare Worker rate check → Supabase Edge Function or protected API → Postgres
             429 when over limit
```

- **Cloudflare Worker:** a separate platform's edge-executed server-side code; it can inspect and reject a request before forwarding it to a Supabase endpoint. [Cloudflare Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- **Workers KV:** Cloudflare's distributed key-value store for read-heavy, cache-friendly data. It is eventually consistent and lacks atomic read-modify-write transactions, so a KV counter is **not** a strict global rate limiter. [How KV works](https://developers.cloudflare.com/kv/concepts/how-kv-works/), [KV pricing](https://developers.cloudflare.com/kv/platform/pricing/)
- **Workers Rate Limiting binding:** a rate-check API called in Worker code. Its limits are per Cloudflare location and its counters are intentionally approximate and eventually consistent. Good for shedding abusive traffic; not exact billing or a strict global quota. Wrangler 4.36.0 or later is required by the current guide. [Rate Limiting binding](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)
- **Durable Object:** a Cloudflare coordination primitive to consider when the application needs a stronger per-key single coordinator than KV or an approximate edge counter. Validate its design and limits before using it for a global policy. [How KV works](https://developers.cloudflare.com/kv/concepts/how-kv-works/), [Durable Objects pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/)

As documented on 16 October 2026, Workers Free allows **100,000 Worker requests per day** and **10 ms CPU time per request**. KV Free separately allows **100,000 reads and 1,000 writes per day**. These are account/plan limits with separate reset and failure rules, not unlimited free capacity or Supabase allowances. Recheck before quoting. [Workers limits](https://developers.cloudflare.com/workers/platform/limits/), [KV pricing](https://developers.cloudflare.com/kv/platform/pricing/)

For a real design, rate-limit by a server-verified identity or carefully chosen route/key, **not a client-supplied user ID**. Keep Supabase and third-party credentials on the server. Make sure the target endpoint cannot be reached directly to bypass the Worker; otherwise the edge check protects only traffic that happens to use that route. Continue enforcing Supabase Auth, grants, and RLS inside the application and database. IP-only limits can affect unrelated users sharing an address. [Rate Limiting binding](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/), [Securing the Data API](https://supabase.com/docs/guides/api/securing-your-api)

**Decision for the main talk:** Keep this in presenter notes. It is a useful example of an external component but is outside the core “what runs where” flow and would displace higher-priority production concepts in a 38-minute presentation.

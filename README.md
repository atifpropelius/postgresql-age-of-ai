# Supabase — From Idea to Production

The active presentation is in [`supabase-talk/`](supabase-talk/). It is a concise, interactive Supabase talk built around one private taskboard app. The earlier PostgreSQL course remains in [`postgresql-age-of-ai/`](postgresql-age-of-ai/) as an archive and is no longer the Render target.

## Run locally

```bash
cd supabase-talk
npm run dev
```

Open <http://127.0.0.1:4173/>. The presentation needs no database, API key, Docker container, or `npm install`.

## Deploy on Render

[`render.yaml`](render.yaml) now points to `supabase-talk/`. If creating a new **Static Site** manually, select this repository and `main`, then set:

| Setting | Value |
| --- | --- |
| Root directory | `supabase-talk` |
| Build command | `npm run build` |
| Publish directory | `dist` |

Enable auto-deploy for pushes to `main`. An existing manually configured Static Site with root directory `postgresql-age-of-ai` and build command `npm run build` will also publish the Supabase talk through a compatibility build. You can change its root directory to `supabase-talk` later; `render.yaml` does not automatically change a manual service's settings.

This presentation uses clearly labeled interactive illustrations. It does not connect to a live Supabase project or display fabricated measurements.

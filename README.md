# PostgreSQL in the Age of AI

The interactive presentation is in [`postgresql-age-of-ai/`](postgresql-age-of-ai/). See its [README](postgresql-age-of-ai/README.md) for local setup, live demos, and content.

## Deploy on Render

This repository includes [`render.yaml`](render.yaml) for a static site. In the Render dashboard, choose **New → Blueprint**, connect this GitHub repository, select `main`, review the one static site, and click **Deploy Blueprint**. Render will build `postgresql-age-of-ai/dist` and give you an `onrender.com` URL. Future pushes to `main` redeploy automatically.

The published site runs the prepared presentation. Live PostgreSQL, pgvector, and RAG demos use a separate local demo controller and are not deployed by this Blueprint.

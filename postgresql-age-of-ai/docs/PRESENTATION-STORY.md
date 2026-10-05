# Presentation story

**Question:** What is PostgreSQL actually doing, from the first table to a production AI application?

The 35-screen main route takes 45 minutes. Its Study path contains 96 lessons and 20 exercises for the full zero-to-hero route. The seven added screens make the missing concepts visible without lengthening the talk: API versus database resources, create your own database, mathematical relation versus foreign key, two writers and a snapshot reader, hosting choices, views/materialized views, and extensions. The presenter advances key animated states during the short main talk; self-study visitors can open SQL, Study path and questions.

1. **Foundation:** Choose PostgreSQL for the workload; show the API and database as separate processes; build server → database → schema → table → row; explain column, tuple, relation, FK and SQL flow.
2. **Internals and performance:** Transfer money; watch T2 wait on T1 while a reader sees a committed version; explain MVCC. Grow the table, inspect EXPLAIN ANALYZE, then use the real benchmark lab. Show pages, VACUUM and WAL.
3. **Production:** Trace WAL to replicas; vary the pool queue; partition by time; compare partitions with shards; choose a hosting model from resource measurements. Explain roles, RLS, views, Supabase and extensions.
4. **AI:** Compare JSONB, text and vector retrieval; inspect embeddings, pgvector and retrieved RAG chunks before the answer.
5. **Replay:** Connect the complete system and hand off to 15-minute Q&A and 10–15-minute exercises.

The actual 1M-row dataset should be seeded before the talk. Plan timings are hardware and cache dependent. A prepared animation is explicitly marked as illustrative.

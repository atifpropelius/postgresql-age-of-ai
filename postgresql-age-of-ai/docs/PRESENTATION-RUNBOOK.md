# Presentation runbook

## One day before

- Rehearse the 45-minute route, 15-minute Q&A and 10–15-minute exercises.
- Confirm projector resolution and browser zoom at 100%; inspect slides 13, 18 and 26.
- Prepare 1M rows and verify a before/index/after sequence with actual plans.
- Check embedding, pgvector and LLM services if a LIVE RAG demo is planned.
- Export a backup PDF with the print icon.

## 30 minutes before

- Start PostgreSQL, demo API and static server; run `npm run preflight`.
- Confirm 1M dataset, index state and vector seed state.
- Open slide 1, test arrow keys, speaker notes (`N`), simple/deep toggles and mode label.
- Start rehearsal timer from speaker notes if useful.

## During the talk

- Follow the slide targets: foundation 8 minutes, internals 8, performance 9, production 10, AI 8 and recap 2. The slide minute labels total 45.
- Show SQL only when it adds clarity; use the step controls to reveal process rather than reading text aloud.
- At slide 17, run the prepared 1M benchmark. At slide 26, show retrieved chunks before the answer.
- If a service fails, switch to **PREPARED** and continue. State clearly that prepared diagrams are illustrative.
- After slide 35, open Q&A, then exercises.

## Key factual guardrails

- `EXPLAIN` costs are relative planner units, not elapsed milliseconds.
- `Actual Rows` is emitted rows per loop; it is not a generic count of all rows scanned.
- WAL flush and data-page flush are separate events.
- Normal VACUUM reuses eligible dead space; VACUUM FULL rewrites a table and takes a strong lock.
- The vector map is an illustrative 2D analogy.
- Pool size, vector index choice and scaling architecture depend on measured workload.

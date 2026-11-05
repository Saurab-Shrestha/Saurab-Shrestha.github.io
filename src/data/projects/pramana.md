---
name: "Pramana"
tag: "AI Research Systems"
year: "2025"
role: "Architect & Engineer"
desc: "An agentic RAG system that splits a question into parts, researches them in parallel, checks its answer for contradictions and cites every claim to the page and region it came from."
tech: ["LangGraph", "FastAPI", "Qdrant", "PostgreSQL", "Docling", "React"]
github: "https://github.com/Saurab-Shrestha/Pramana"
thumbnail: "svg:pramana"
---

# Pramana

Standard RAG answers questions. Pramana investigates them.

## Where it came from

Pramana grew out of QuickRef, a research project at QuickFox. Banks keep their rules, policies and monetary guidelines in a mix of structured and unstructured documents, and many of them are scans. Our job was to make that material answerable: parse every kind of document properly, with a parser or with OCR, and chunk it so retrieval found the right passage.

We compared document parsers, worked on OCR so scanned copies came out clean, and experimented with chunking. Everything had to run on local models, and in 2023 that ruled out the best models available. The answers weren't good enough.

I took two lessons from it. Parsing and chunking decide answer quality long before the model does, and a single retrieve-then-answer pass can't handle a question that spans several documents. Pramana is built around both.

## How it answers

Each question goes through a LangGraph graph rather than a single retrieval call:

1. **Rewrite and split.** The question is rewritten, and a comparison such as "X vs Y" becomes one sub-question per side, so neither side gets buried in a single search.
2. **Research in parallel.** Each sub-question gets its own worker, which searches, filters and expands the results, then records evidence claims in a shared **Evidence Graph** of hypotheses and the evidence for and against them.
3. **Surface conflicts.** After retrieval, a detector reads the top chunks from different documents and looks for conflicts between them. A conflict only reaches the answer if its quotes, numbers included, actually appear in the source text. Pramana doesn't pick a side: the answer gives both values with both citations.
4. **Check before answering.** A safety and hallucination check reviews the combined answer and retries once if it fails.

Every claim in the answer has a citation that points to a chunk, a page and a bounding box. Clicking it highlights the passage in the PDF.

## Retrieval

Search combines dense embeddings with SPLADE sparse vectors in Qdrant, weighted per call. The sparse side indexes each chunk with its section heading and file name in front, so a chunk that is about something ranks above documents that only mention it.

Names and codes that appear on only a few chunks, like a branch name or an IFSC code, are looked up exactly on a full-text index. Dense and sparse search both let common words like "bank" outweigh the rare term that actually identifies the answer.

The reranker sees each chunk under its document title and section. The question is also searched in the user's own wording alongside the rewrite, because a rewrite can lose direction ("salary to savings").

## Ingestion

This is where the QuickRef lessons went.

Docling handles layout, tables, figures and OCR, including Devanagari for Nepali. A fast Rust parser takes over for very large PDFs so they don't run out of memory, and both parsers produce the same metadata: page, bounding box and section.

Small chunks are embedded and searched, and the larger sections they belong to are fetched when the answer is written. Search stays precise and the answer still gets enough context. Section structure survives chunking, so retrieval can be limited to a chapter and a book is summarised section by section.

Figures are captioned by a vision model when the document is ingested, retrieved like text, and placed in the answer right after the paragraph they illustrate.

## Evaluation

Changes are checked against two harnesses. One is a golden-set regression run on the real agent. The other scores how the agent worked: which tools it chose, whether their arguments were correct, any unnecessary actions, and citation precision and recall.

| Set | Result | Run |
|---|---|---|
| Balanced set, 70 questions, 13 to 15 per company across five industries | **97.1%** pass (68/70) | Oct 2026 |
| Earlier set (67 of 70 questions from one bank), after five retrieval fixes | 92.9% pass (65/70) | Oct 2026 |
| Same earlier set, before those fixes | 78.6% pass | Aug 2026 |
| Agent tasks, 7 objectives | 100% task success | Sep 2026 |

The earlier set turned out to be almost entirely about one company, so its scores cover much less than five industries. The balanced set replaced it.

Conflict detection was measured on 100 real contradictions from WikiContradict. With both passages given, Pramana answered 85.3% fully correctly, against 63.3% for the benchmark's strongest prompt baseline on the same model.

The measurements also decide what stays off. A claim-verification step was A/B tested: it dropped citation precision from 1.000 to 0.667 and added 27% to p95 latency, so it's off by default. A quick path for simple questions cut LLM calls by 8.6% with no regressions, so it stays on.

## Running it

Every step of every answer is stored with its node, tool, tokens, latency and errors, so a bad answer is diagnosed by reading its trace instead of re-running it. Steps, tool calls, tokens and runtime have central limits, and hitting one returns the partial answer with its citations rather than an error.

Uploads, reindexes and embedding switches run on a job queue in Postgres, so a restart doesn't lose them. Each user's collections map to their own Qdrant collection, and ownership is checked before any tool touches the store.

The model can be Gemini, OpenAI, Ollama, LM Studio or any OpenAI-compatible endpoint, chosen per tenant, so Pramana can also run entirely on local models, the constraint QuickRef had. Collections are available to Claude, Cursor and VS Code through a read-only MCP server, and the agent can call outside MCP tools when a question needs live data.

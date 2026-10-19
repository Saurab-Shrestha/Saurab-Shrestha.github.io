---
name: "Pramana"
tag: "AI Research Systems"
year: "2025"
role: "Architect & Engineer"
desc: "An agentic RAG system built for deep technical investigation — stateful, hypothesis-driven, and designed to reach Saturation."
tech: ["LangGraph", "Python", "Qdrant", "FastAPI", "LlamaIndex"]
github: "https://github.com/Saurab-Shrestha/Pramana"
thumbnail: "svg:pramana"
---

# Pramana

Standard RAG answers questions. Pramana investigates them.

## The Problem

I hit a wall with standard RAG while trying to find contradictions across 40 transformer architecture papers. A retrieval-augmented system returns the three most similar chunks to your query. It can't hold a hypothesis across 40 documents, track what contradicts what, or tell you when it's actually done looking.

The gap is fundamental: standard RAG is stateless. Every query starts from zero. There's no memory of what was already found, no model of what would count as a complete answer, no way to distinguish "I found nothing" from "nothing exists."

For a researcher asking "what do these papers disagree about?", that's not a limitation — it's a non-starter.

## The Approach

Pramana is built around a different abstraction: the **Investigation**.

An Investigation is a stateful, long-running session that groups multiple Queries under shared Hypotheses. When you start an Investigation, you define what you're trying to confirm or refute. The system then runs Queries, extracts Evidence from retrieved Chunks, and maps each piece of Evidence to your Hypotheses — either supporting or contradicting them.

The core inference engine is the **Evidence Graph**: a directed structure where nodes are Evidence claims and Hypotheses, and edges carry a polarity (supports / contradicts). As an Investigation runs, the graph grows. The agent uses it to decide what to query next — steering toward gaps, away from already-saturated areas.

An Investigation reaches **Saturation** when successive Queries yield no new Evidence for any active Hypothesis. That's the termination condition. Not a timeout, not a turn limit — epistemic completion.

## Key Components

**Investigation Sentry** — The security gateway that resolves research resources (Collections, Documents) while enforcing strict multi-tenant ownership. Every tool call goes through it before touching the vector store.

**Precision Filter** — Transforms raw retrieved Chunks into high-precision Evidence by handling deduplication, semantic reranking, and confidence thresholding. A chunk that's 70% similar to an existing Evidence claim doesn't produce a new node; it strengthens the existing one.

**Research Toolbelt** — A modular, registry-based assembly of the agent's research capabilities. Tools are first-class objects with defined input/output contracts, making the agent's reasoning auditable: you can inspect exactly which tool was called, with what arguments, and what Evidence it produced.

**Vector Silo** — An abstraction over Qdrant collections that captures collection context for simplified search and ingestion. Switching vector backends doesn't ripple through the agent logic.

## What's Different

The language is intentional. "Investigation" instead of "chat session" because the semantics are different: sessions are ephemeral, Investigations are stateful case files. "Saturation" instead of "done" because it's a specific epistemic state, not a timeout. "Evidence" instead of "result" because the unit of output is a verifiable claim, not a string.

The architecture enforces these distinctions. You can't accidentally skip the Precision Filter. The Evidence Graph is the source of truth, not the raw LLM output.

## Status

Active prototype. The LangGraph pipeline, Evidence Graph, and Precision Filter are implemented. The Research Toolbelt and Investigation Sentry are in progress. The goal is a system where a researcher can upload 40 papers, ask a question, and get back a structured Evidence Graph — not a summary, an argument.

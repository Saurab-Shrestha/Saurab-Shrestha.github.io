---
title: "What Moved Pramana's Eval, and What Happens When Sources Disagree"
date: "Nov 5, 2026"
tag: "RAG"
readTime: "10 min read"
excerpt: "Five retrieval fixes took Pramana from 78.6% to 92.9%, on a benchmark that turned out to be mostly one bank. Then I fixed the benchmark and taught the agent to say when its sources disagree."
---

# What Moved Pramana's Eval, and What Happens When Sources Disagree

In late August, Pramana passed 78.6% of a 70-question benchmark. Five weeks later it passed 92.9%. I didn't touch the model in between. Every change was to retrieval and to how evidence reaches the model.

Then I found out the benchmark was measuring much less than I thought. This post covers the fixes, what was wrong with the benchmark, and what I built next: a way for Pramana to say when two of its sources disagree.

## The Benchmark

I built the set to be hard to game. It draws on documents from five fictional companies in different industries (a bank, a university, an automaker, a cloud provider and a tech company), all ingested into one collection, so other companies' documents act as distractors. There are 70 questions, ten per query type.

Scoring is deterministic. The harness runs the real agent end to end, and a question passes only if every expected keyword appears in the answer and the expected source is cited. There's no LLM judge, so the score can't drift with a grader's mood.

Every run saves an artifact, and I compare runs question by question. The pass rate says whether things got better; the per-question diff says which questions got fixed and which broke.

## The Scoreboard

| Run | Pass rate | Retrieval hit | Fixed | Regressed |
|---|---|---|---|---|
| Aug 29: baseline | 78.6% (55/70) | | | |
| Oct 3: reranker padding fix, figure de-duplication | 90.0% (63/70) | 90.0% | 9 | 1 |
| Oct 4: rare-name lookup, titled reranking, user's own wording | 92.9% (65/70) | 92.9% | 2 | 0 |

## Run 1: Fixing the Reranker

The biggest jump, eleven points, came from a bug fix. The reranker, which reorders retrieved chunks by relevance before the model sees them, had a padding problem.

The same run de-duplicated figures. Pramana captions figures with a vision model and retrieves the captions like text, so a figure whose caption spanned several chunks could show up several times in one answer and push other evidence out. Now each figure appears once.

Those two changes fixed nine questions and broke one. A net gain of eight would have hidden that loss if I'd only looked at the pass rate, and the loss was worth reading.

A broken reranker doesn't throw errors. It hands the model worse evidence and the answers get a bit worse, which is why I now check that the existing pipeline works as designed before adding anything to it.

## Run 2: Three Retrieval Fixes

### Rare names go first

Questions about a specific branch name or an IFSC code kept missing. Both kinds of search, dense embeddings and SPLADE sparse vectors, gave more weight to common words like "bank" and "ATM" than to the one rare term that identified the answer.

The fix is an exact lookup. If a name or code in the question appears on only a few chunks, it's searched on a full-text index and those hits go to the top. Semantic search handles meaning well and identity badly, so identity now has its own path.

### The reranker sees where a chunk lives

"Fees are waived for the first year" means one thing in a credit card policy and another in a university handbook. The reranker now sees each chunk under its document title and section heading, the same context a person reading it would have.

The sparse index got the same change. Each chunk is indexed with its section heading and file name in front, so a chunk that is about a thing ranks above documents that only mention it.

### Search the question as it was asked

Pramana rewrites questions before searching. That usually helps, but a rewrite can lose direction: a question about moving money from salary to savings can come back as a question about salary and savings in no particular order. When a question is a single task, Pramana now searches the user's own wording alongside the rewrite.

These three changes fixed two questions and broke none. By this point each fix targeted one narrow failure pattern, and I only found those patterns by reading the failing questions one at a time.

## The Benchmark Was Mostly One Bank

In mid-October I checked which companies the 70 questions covered. 67 were about ZX Bank. The source spreadsheet groups questions by company, and the generator took the first ten of each query type, so nearly all of them came from the first company in the file. Three of the five companies weren't indexed at all.

The numbers above are real, but they're scores on one bank's documents. That's a much narrower claim than five industries, and Pramana is supposed to work on any kind of document.

The fix was small. The generator now takes companies in turn within each query type, which gives 13 to 15 questions per company, and all five companies are indexed. Since 92.9% can't be compared with anything measured on the new set, the balanced set got its own baseline:

| Set | Pass rate | Failures |
|---|---|---|
| Old, 67 of 70 from ZX Bank | 92.9% (65/70) | 5 |
| Balanced, 13 to 15 per company | 97.1% (68/70) | 2, both retrieval misses |

On the old set, the five remaining failures looked like labeling problems. Each question named one expected source, several documents answered it correctly, and the agent cited a different valid one. On the balanced set, both failures are plain retrieval misses. The jump to 97.1% doesn't mean the system improved. It's a fairer test that also happens to be easier in places.

A per-question diff only covers the questions you asked. To catch this I had to look at what the benchmark contained.

## When Sources Disagree

Letting a question accept several valid sources raises a harder problem: what should the agent do when those sources disagree? A RAG system can easily blend two conflicting passages into one confident answer, or pick one without saying so. For a system built around showing its evidence, both are failures.

Pramana already had an evidence graph with a contradiction loop. When I traced it, I found it never ran. It waited on hypotheses that nothing in the live pipeline created. I rebuilt it to run on every turn.

After retrieval, the detector reads the top eight chunks, as long as they come from at least two documents, and looks for conflicts between documents. Conflicts inside a single document are out of scope for now. It costs one model call per turn.

For each conflict, the model returns the two source indexes and a near-verbatim quote from each side. Code then drops any conflict whose sources are out of range or come from the same document, and any whose quotes don't appear in the source text, including every number in the quote. A conflict the model made up never reaches the answer.

Pramana doesn't try to settle a conflict. The answer gives both values with both citations, says which is more recent only when the documents say so, and doesn't choose between them. The UI shows the two sides next to each other.

## Measuring It on Real Conflicts

I didn't want to grade the detector on conflicts I'd planted myself, so I used [WikiContradict](https://arxiv.org/abs/2406.13805) (Hou et al., NeurIPS 2024). It's a set of real contradictions between Wikipedia passages, annotated by people. I sampled 100 questions: half where the conflict is stated outright (explicit) and half where you have to infer it (implicit).

An answer counts as correct only if it gives both answers, prefers neither, and says there's a conflict. That needs a judge, so I tested the judge first. A Gemini judge agreed with my own blind labels on 50 answers at Cohen's kappa 0.80. A Gemini model grading a Gemini model is a fair objection, so I also had Claude regrade 200 answers blind. Claude was stricter, and every conclusion below holds under both judges.

For a baseline I used WikiContradict's own prompts rather than Pramana with detection turned off. T4 asks the question over both passages. T5 adds one line telling the model to consider contradictory information. I ran both on the same model, questions and judge, three runs each.

With both passages given directly (3 runs × 100 questions, % fully correct):

| | T4 | T5 | Pramana, detection off | Pramana, surface |
|---|---|---|---|---|
| All | 12.0 | 63.3 | 49.3 | 85.3 |
| Explicit | 16.7 | 75.3 | 66.0 | 96.7 |
| Implicit | 7.3 | 51.3 | 32.7 | 74.0 |
| Model calls | 1 | 1 | 1 | 2 |

T5's one-line hint beats Pramana with detection off by 14 points. That surprised me, and it changes what I can claim. Measured against detection off, detection looks like a 36-point gain, but most of that gap is one prompt instruction. Measured against T5, detection adds 22 points for one extra model call, and that's the number I report.

End to end, where the agent has to find both passages itself (3 runs × 50 questions):

| | Detection off | Surface |
|---|---|---|
| Fully correct | 65.3% | 77.3% |
| Implicit, correct | 44.0% | 62.7% |
| Target conflict detected | | 71.3% |
| Median latency | 18.4 s | 18.6 s |

The gain is smaller here, and detection is why. Handed both passages, the detector finds the conflict 96% of the time. With up to eight retrieved sources, several from the same Wikipedia article and disagreeing with each other, it finds the target pair 71% of the time.

## What It Costs on Ordinary Questions

A detector that flags conflicts where there are none would make ordinary answers worse. I ran the balanced five-company set, which has no planted conflicts, with detection off and on:

| | Off | Surface |
|---|---|---|
| Pass rate | 97.1% | 97.1% |
| Model calls per question | 6.0 | 6.5 (+9%) |
| Questions with a flagged conflict | | 5 of 70 (7%) |

Nothing regressed; the same two questions fail either way. On a first read, though, all six flags are false alarms. Each one treats two statements about different things as one fact: a student discount and an armed-forces discount from different programmes, a catalogue year and a launch year, "plastic-free" and "recyclable" packaging.

Before that run, a 20-question sample had seven flags. Giving the detector the user's question and asking it to flag only conflicts relevant to it brought the sample down to two, at the cost of some recall on implicit conflicts. I'm treating the remaining 7% as a known limitation. Next I'd try a second check on each flagged conflict, tested on questions it wasn't tuned on.

## What I'd Tell Myself in August

- Measure before you build. A per-question diff shows what each change fixed and what it broke, and a pass rate hides both.
- Fix what's broken before adding something new. The run built around a bug fix gained a net eight questions; the run with three new retrieval features gained two.
- Read the failures one at a time. Rare names, missing context and flattened questions never showed up in the average.
- Audit the benchmark as well as the system. Mine was 96% one company, and diffing runs would never have shown it.
- Compare against the baseline a skeptic would choose. Against my own off switch, detection looked 14 points better than it is.
- Report full runs. At one point I re-ran only the failures and merged the results, and fully correct answers looked like 91%. Answers that fail partly by chance pass on a re-run. Three full runs said 85%.

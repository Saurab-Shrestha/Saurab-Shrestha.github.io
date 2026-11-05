---
name: "QuickXtract"
tag: "Compliance Automation"
year: "2023 — 2026"
role: "Software Engineer, QuickFox Consulting"
desc: "Compliance correspondence automation for banks: reads regulatory enforcement letters, screens named subjects against core banking records, and routes every action through maker-checker review."
tech: ["Django", "FastAPI", "Celery", "PostgreSQL", "Redis", "React", "Docker"]
github: ""
thumbnail: "svg:quickxtract"
---

# QuickXtract

Regulator letters in, bank actions out.

## The problem

Nepal Rastra Bank (NRB) and other regulators send banks enforcement letters. These are orders from the police, the courts and similar authorities to freeze accounts, block transactions or release them. One letter can carry several separate requests, and each one names people who may or may not bank there.

Done by hand, every letter means reading it, pulling out each name, searching the core banking system (CBS) for it, deciding whether a record is the same person, acting on the account and writing a reply to the regulator. Most of that is repetitive, but mistakes are expensive. Freezing the wrong account, or missing the right one, breaks KYC/AML rules.

## How it works

QuickXtract automates the whole path and still needs two people to sign off on every action.

1. **Extract.** Document intelligence reads each page against a versioned extraction template set per bank and returns structured data. Each enforcement request in the letter becomes a **Chalani**, the unit of compliance work, and each person named in it becomes an **Entity Ticket**.
2. **Screen.** A matching service ranks CBS records against every Entity Ticket. Officers look through the ranked candidates and confirm a match or mark none.
3. **Act.** A **Maker** sets up the action: a freeze, a block, or a report to the financial intelligence unit. A **Checker** approves or rejects it with comments. Nothing runs without both, and nobody can approve their own submission.
4. **Close.** Approved actions go to downstream systems or out as manual instructions, and officers write the reply letter to the regulator, which is versioned like everything else.

## Matching

A name in a letter rarely matches the bank's record character for character, so the matcher ranks candidates instead of looking for an exact hit.

The service keeps a synchronized shadow copy of CBS customer records in PostgreSQL. Trigram indexes (`pg_trgm`) cut the candidates down quickly, and `rapidfuzz` scores what's left with weighted fuzzy matching on name, date of birth, address, account number and customer ID.

Each bank's compliance officers set the field weights and thresholds. The matching service stores none of that itself. The backend sends the weights with every request, so any match result can be traced to the exact settings that produced it.

## Architecture

- Django and Django REST Framework own documents, the workflow, roles and the audit trail.
- FastAPI runs the matching engine as a separate service, so screening can change and scale without touching the workflow.
- Celery with Redis runs extraction and notifications in the background, so a large batch of letters doesn't hold up the officers reviewing them. Celery Beat runs the scheduled jobs.
- PostgreSQL holds the main data, and a second database holds the CBS shadow copy.
- React and TypeScript power the interface makers and checkers work in, with live notifications over WebSockets.
- Docker Compose and Nginx package and serve the stack.

## Controls

Each bank works in its own isolated workspace with separate data, templates and settings. Officers see only their own branch's documents unless head office grants wider access. Six roles, from branch makers and checkers up to head-office admins, are enforced in both the API and the interface, and banks with a directory service can sign in through it.

Every upload, status change, match decision and approval goes into an audit log that can't be edited, with who did it, when, and the record before and after. Only one officer can work on a document at a time, and the lock releases after a period of inactivity. Sensitive fields are encrypted at rest, and all traffic goes over TLS.

## What I learned

The automation narrows each case down to a decision for a person. It never makes that decision, and every action records who prepared it, who approved it and the evidence behind it.

Keeping the weights out of the matching service pays off when someone asks why a customer matched. The answer is the request that produced the score, with the weights in it.

Extraction and matching change often as models and weights improve, while the record of actions has to stay correct. Running them as separate services keeps the first from breaking the second.

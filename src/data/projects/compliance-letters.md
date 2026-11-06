---
name: "Compliance Letter Automation"
tag: "Compliance Automation"
year: "2023 — 2026"
role: "Software Engineer, QuickFox Consulting"
desc: "Automation for the enforcement letters regulators send banks: extract the people named, match them to customer records, and route every action through two-person review."
tech: ["Django", "FastAPI", "Celery", "PostgreSQL", "React"]
github: ""
thumbnail: "svg:compliance"
---

# Compliance letter automation

Regulator letters in, bank actions out.

## The problem

Nepal Rastra Bank and other regulators send banks enforcement letters. These are orders from the police, the courts and similar authorities to freeze accounts, block transactions or release them. One letter can carry several separate requests, and each one names people who may or may not bank there.

Done by hand, every letter means reading it, pulling out each name, searching the bank's customer records for it, deciding whether a record is the same person, acting on the account and replying to the regulator. Most of that is repetitive, but mistakes are expensive. Freezing the wrong account, or missing the right one, breaks KYC/AML rules.

## How it works

The system automates the path from letter to action and still needs two people to sign off on every action.

1. **Extract.** Document intelligence reads each letter and turns it into structured requests and the people named in them.
2. **Match.** Fuzzy name matching ranks customer records against each person, and an officer confirms the right one or marks no match.
3. **Act.** One officer prepares the action and a second approves or rejects it. Nothing runs without both.
4. **Reply.** Officers write the response to the regulator from the same case.

Everything is logged: who prepared each action, who approved it and what it was based on.

## What I learned

The automation narrows each case down to a decision for a person. It never makes that decision, and in a regulated workflow that is the point.

A name in a letter rarely matches a bank record character for character, so matching works as a ranked list for a person to confirm, not an automatic yes or no.

Every match should be explainable afterwards. If someone asks why a customer was matched, the answer should be the evidence and the person who confirmed it.

---
title: "Why We Went Back to EasyOCR for Nepali Cheques"
date: "Nov 5, 2026"
tag: "Document AI"
readTime: "5 min read"
excerpt: "Donut and Pix2Struct read English cheques at over 95%. On Nepali they stayed below 30%, so we went back to a per-field pipeline and fine-tuned EasyOCR."
---

# Why We Went Back to EasyOCR for Nepali Cheques

QuickCCA automates cheque clearing for banks in Nepal, and the first thing it has to do is read the cheque: bank name, date, payee, amount in figures, amount in words and signature. The layout is printed, but most of those fields are handwritten, in English or in Nepali.

We tried three approaches. The one we kept is the least impressive on paper.

## Detect, then read

The first version was the standard two-stage pipeline. A ResNet-based model found each field on the cheque, and each crop went to an OCR engine. We tested Tesseract, EasyOCR and PaddleOCR.

Finding the fields worked. Reading them didn't. All three engines did well enough on printed text and badly on handwriting, and on a cheque the handwritten fields are the ones that matter.

## End to end with Donut and Pix2Struct

Donut and Pix2Struct skip the separate OCR step. They take the whole image and output structured fields directly, which removes the detection stage and the errors it passes along.

We annotated our own set of cheque images, handwritten and printed, English and Nepali, and fine-tuned both models on it.

| Language | Accuracy |
|---|---|
| English | above 95% |
| Nepali | below 30% |

English was good enough to use. Nepali was nowhere near.

Neither model had seen Nepali documents in pretraining. We extended their tokenizers with Nepali tokens and trained further. That helped less than we needed. A model learning a new script needs a lot of examples, and a set of cheques we annotated by hand wasn't enough.

## Back to per-field, fine-tuned

We went back to the first design, detect, crop and read one field at a time, with one change: we fine-tuned EasyOCR on cheque crops like the ones it would see in production.

Dates and amounts improved the most and became reliable. Payee names didn't. A date or an amount has a fixed format the model can lean on. A payee can be any name, written in any hand.

## What I took from it

The end-to-end models were the better architecture, and in English they proved it, because their pretraining had already done most of the work. In Nepali, with little data, a smaller model fine-tuned on the exact crops it would read beat them.

The per-field design had a second advantage. Each field could be measured and fine-tuned on its own, so dates and amounts got better without waiting for payee names. It also makes the weak spot obvious: when payee names are the unreliable field, that's the field a person checks.

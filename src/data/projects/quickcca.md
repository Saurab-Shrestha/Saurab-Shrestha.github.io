---
name: "QuickCCA Cheque OCR"
tag: "Document Intelligence"
year: "2023 — 2026"
role: "Software Engineer, QuickFox Consulting"
desc: "Cheque OCR for printed and handwritten fields in English and Nepali, built on fine-tuned EasyOCR after Donut and Pix2Struct fell short on Nepali."
tech: ["PyTorch", "Transformers", "EasyOCR", "OpenCV", "Donut", "Pix2Struct"]
github: ""
thumbnail: "svg:quickcca"
---

# QuickCCA cheque OCR

Reading cheques that are printed or handwritten, in English or in Nepali.

## The problem

QuickCCA automates cheque clearing for banks, and the first step is reading the cheque. Each image has to become structured fields: bank name, date, payee, amount in figures, amount in words and signature.

The layout is printed, but the fields that matter are usually handwritten, and in Nepal they can be in English or Nepali. A clearing system can't guess an amount or a date, so every field has to be read correctly.

## First attempt: detect, then read

We started with the usual two-stage approach. A ResNet-based model found each region of the cheque (date, payee, amounts, signature, bank name and the rest), and each region went to an off-the-shelf OCR engine. We tested Tesseract, EasyOCR and PaddleOCR.

Detection worked. All three engines read printed text well enough but struggled with handwriting, and that's where most of a cheque's information is.

## Second attempt: end-to-end models

Next we tried Donut and Pix2Struct, document models that skip the OCR step and go straight from the image to structured fields. We fine-tuned both on cheque images we annotated ourselves, handwritten and printed, in English and Nepali.

| Language | Accuracy |
|---|---|
| English | above 95% |
| Nepali | below 30% |

Neither model had been pretrained on Nepali documents. We extended their tokenizers with Nepali tokens and trained them further, but we didn't have enough annotated samples for them to learn a new script, and Nepali accuracy stayed too low to use.

## Third attempt: per field again, fine-tuned

We went back to detecting, cropping and reading one field at a time. This time we fine-tuned EasyOCR on cheque crops like the ones it would see in production.

Dates and amounts improved the most and reached strong accuracy. Payee names are still the hard case. Dates and amounts follow fixed formats, and a payee can be any handwritten name.

## What I learned

On paper the end-to-end models were the better design, and in English they won because their pretraining already covered the language. For a new script with a small annotated set, a simpler model fine-tuned on the exact task did better.

Splitting the cheque into fields let us measure and fine-tune each one separately, so dates and amounts could improve without waiting on payee names.

Payee names are still unreliable, which makes them the field a person should check.

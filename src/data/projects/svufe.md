---
name: "Signature Verification System"
tag: "Computer Vision / AI"
year: "2023"
role: "ML Engineer — Final Year Project"
desc: "A CNN-based offline signature verification system that distinguishes genuine signatures from skilled forgeries."
tech: ["OpenCV", "Python", "TensorFlow"]
github: ""
thumbnail: "svg:svufe"
---

# Signature Verification System

Offline signature verification — deciding whether a scanned signature is genuine
or forged, with no access to the pen strokes that produced it.

## The Problem

Online verification systems get pressure, velocity, and stroke order from a
digitiser. Offline verification gets a photograph. Everything that makes a
signature hard to fake is gone, and what remains is shape — which is exactly what
a skilled forger reproduces.

The practical difficulty is that the useful signal is *intra-writer variation*.
Nobody signs their name identically twice, so a model that demands an exact match
rejects genuine signatures, while a model tolerant enough to accept natural
variation starts accepting forgeries too.

## The Approach

I built the system around a **convolutional feature extractor** trained to embed
signatures into a space where distance means authorship rather than pixel
similarity. Verification becomes a distance threshold between a questioned
signature and a set of known-genuine references.

### Preprocessing

Scanned signatures arrive with inconsistent lighting, skew, and stroke weight, so
the OpenCV pipeline normalises them before the model ever sees them:

- Grayscale conversion and adaptive thresholding to separate ink from paper
- Noise removal and morphological cleanup of broken strokes
- Bounding-box crop and centring, so position carries no signal
- Resampling to a fixed input size with aspect ratio preserved

## Key Implementation Details

- **CNN feature extractor** trained on genuine/forged signature pairs
- **Distance-threshold verification** against a per-writer reference set
- **Augmentation** — rotation, scaling, and stroke-thickness jitter — to model
  natural intra-writer variation rather than memorising individual samples
- **OpenCV preprocessing pipeline** handling real scanner artefacts

## Outcome

Presented at the university's annual tech showcase as my final year project.

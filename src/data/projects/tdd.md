---
name: "Tomato Disease Detection"
tag: "Computer Vision / AI"
year: "2023"
role: "ML Engineer"
desc: "An AI-powered app assisting farmers by detecting diseases in tomato plants."
tech: ["Python", "TensorFlow", "OpenCV", "Flask"]
github: ""
thumbnail: "img:assets/tomato.webp"
---

# Tomato Disease Detection

An AI-powered app assisting farmers by detecting diseases in tomato plants.

## The Problem
In rural Nepal, crop diseases often go undiagnosed until it's too late. Farmers lack immediate access to agricultural experts. The goal was to build a mobile-friendly tool that could accurately identify diseases from a single leaf photograph with minimal latency.

## The Solution
I developed a vision pipeline utilizing deep learning. The core is a **Convolutional Neural Network (CNN)** trained on the PlantVillage dataset augmented with local disease samples. 

## Key Implementation Details
- **Classification of 10 distinct tomato leaf status** (late blight, mold, etc.)
- **High-performance inference engine** optimized for CPU latency
- **Quantization-Aware Training** to compress model from 100MB+ to under 15MB
- **Local data caching** for intermittent network connectivity

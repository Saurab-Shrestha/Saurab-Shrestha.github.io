---
name: "Home Decor Ecommerce Store"
tag: "Full-Stack"
year: "2024"
role: "Full-Stack Engineer"
desc: "A headless Django + Stripe storefront with persistent anonymous carts, atomic inventory, and idempotent webhook handling."
tech: ["Django", "Stripe", "PostgreSQL", "React"]
github: ""
thumbnail: "img:assets/homedecor.webp"
---

# Home Decor Ecommerce Store

A scalable ecommerce application with seamless shopping experience for home decor products.

## The Problem
Traditional ecommerce platforms often suffer from slow perceived performance and rigid checkout flows. For a premium home decor brand, the challenge was to create an interface that felt as high-end as the products themselves while maintaining rock-solid payment security.

## The Solution
I built a custom 'headless' architecture using **Django** as the robust API core. The frontend features a reactive state management system for the cart that persists across sessions without requiring login. 

### Payment Integration
For payments, I moved away from simple redirects and implemented a fully integrated **Stripe Elements** flow with:
- Server-side validation
- Automated inventory adjustment
- Atomic database transactions

## Key Implementation Details
- **Server-side session persistence** for anonymous carts
- **Automated PDF invoice generation** via ReportLab
- **Idempotent Stripe Webhook handling**
- **Responsive grid-based UI** with fluid typography

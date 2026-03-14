# CTA Strategy

**Epic:** #211 — Site Design Refactor
**Issue:** #212 — Phase 0: User Persona Journeys, Content Strategy & CTA Mapping
**Last Updated:** 2026-03-14

---

## Principles

1. **Persona-aware CTAs** replace generic "Submit an expression of interest" copy.
2. **CTA hierarchy**: each page has one primary CTA and zero or more secondary CTAs.
3. **Contextual placement**: CTAs appear at natural decision points, not arbitrarily.
4. **Consistent conversion path**: all CTAs lead to the `/contact` EOI form with appropriate category pre-selected.

---

## Per-Page CTA Mapping

### Home (`/`)

| Section | Primary Audience | CTA Copy | CTA Type | Target |
|---------|-----------------|----------|----------|--------|
| Hero | All | "Learn more" | Secondary | Scroll to overview |
| Facilities Preview | Producers | "Explore all facilities" | Secondary | `/facilities` |
| Creative Preview | Creatives, Tech Partners | "Discover the creative ecosystem" | Secondary | `/creative` |
| Vision Teaser | Investors, Government | "Learn about our vision" | Secondary | `/vision` |
| EOI Section | All | "Register your interest" | Primary | `/contact` |

### Facilities (`/facilities`)

| Section | Primary Audience | CTA Copy | CTA Type | Target |
|---------|-----------------|----------|----------|--------|
| Stage specs | Producers | "Register your production interest" | Primary | `/contact?category=producer` |
| Ancillary spaces | Producers | "Discuss your requirements" | Secondary | `/contact?category=producer` |
| EOI Section | Producers | "Planning a Production?" | Primary | `/contact?category=producer` |

### Creative (`/creative`)

| Section | Primary Audience | CTA Copy | CTA Type | Target |
|---------|-----------------|----------|----------|--------|
| Ecosystem model | Tech Partners | "Explore partnership opportunities" | Secondary | `/contact?category=partner` |
| Service areas | Creatives | "Join the creative community" | Primary | `/contact?category=creative` |
| Case studies | Producers | "Register your production interest" | Secondary | `/contact?category=producer` |
| EOI Section | Creatives | "Join the Creative Community" | Primary | `/contact?category=creative` |

### Vision (`/vision`)

| Section | Primary Audience | CTA Copy | CTA Type | Target |
|---------|-----------------|----------|----------|--------|
| Global network | Investors | "Explore investment opportunities" | Primary | `/contact?category=investor` |
| Stakeholders | Government | "Discuss partnership opportunities" | Secondary | `/contact?category=partner` |
| Team | Investors | "Connect with the team" | Secondary | `/contact?category=investor` |
| EOI Section | Investors, Partners | "Explore Partnership Opportunities" | Primary | `/contact?category=investor` |

> **Note:** The `/vision` page should offer both "Investment" and "Partnership" CTA paths to serve both investors and government/policy visitors.

### Community (`/community`)

| Section | Primary Audience | CTA Copy | CTA Type | Target |
|---------|-----------------|----------|----------|--------|
| Education | Educational Institutions | "Partner with us on education" | Primary | `/contact?category=education` |
| Sustainability | Government, Investors | "Learn about our commitments" | Secondary | Scroll/anchor |
| Strategic alliances | Tech Partners | "Explore alliance opportunities" | Secondary | `/contact?category=partner` |
| Bridges - Producers | Producers | "Register your production interest" | Secondary | `/contact?category=producer` |
| Bridges - Government | Government | "Discuss partnership opportunities" | Secondary | `/contact?category=partner` |
| EOI Section | All | "Join the Community" | Primary | `/contact` |

### FAQ (`/faq`)

| Section | Primary Audience | CTA Copy | CTA Type | Target |
|---------|-----------------|----------|----------|--------|
| End of page | General Public | "Still have questions? Get in touch" | Primary | `/contact?category=general` |

### Contact (`/contact`)

| Section | Primary Audience | CTA Copy | CTA Type | Target |
|---------|-----------------|----------|----------|--------|
| EOI Form | All | Category-specific submit button | Primary | POST `/v1/eoi` |
| Contact Info | All | Direct email/phone | Secondary | mailto/tel links |

---

## CTA Copy Guidelines

### By Persona

| Persona | CTA Language Style | Example |
|---------|-------------------|---------|
| Producer | Direct, action-oriented | "Register your production interest" |
| Investor | Professional, opportunity-focused | "Explore investment opportunities" |
| Government | Formal, partnership-oriented | "Discuss partnership opportunities" |
| Tech Partner | Collaborative, technical | "Explore alliance opportunities" |
| Creative | Community, inclusive | "Join the creative community" |
| Education | Academic, collaborative | "Partner with us on education" |
| General | Simple, welcoming | "Register your interest" |
| Employee | Professional, aspirational | "Explore career opportunities" |

### Rules

1. Never use "Submit an expression of interest" as CTA copy.
2. Use active verbs: "Register", "Explore", "Join", "Discuss", "Partner".
3. Keep CTAs under 6 words where possible.
4. Primary CTAs use filled/solid button style. Secondary CTAs use outline/ghost style.
5. Mobile: all CTAs must be full-width on narrow viewports.

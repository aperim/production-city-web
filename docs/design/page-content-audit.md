# Per-Page Content Audit

**Epic:** #211 — Site Design Refactor
**Issue:** #212 — Phase 0: User Persona Journeys, Content Strategy & CTA Mapping
**Last Updated:** 2026-03-14

---

## Home (`/`)

### Primary Audiences
- General Public (first-time visitors)
- All personas (entry point)

### Secondary Audiences
- Producers (facilities preview)
- Investors (vision teaser)
- Creatives (creative preview)

### Content Blocks

| Block | Serves Persona | Content Tone | Notes |
|-------|---------------|-------------|-------|
| Hero / Key Claims | All | Accessible, clear | 4 key claims establish credibility. Must be substantiated. |
| Facilities Preview | Producers | Professional, spec-oriented | Link to `/facilities` for full details. |
| Creative Preview | Creatives, Tech Partners | Community-oriented | Ecosystem model summary. |
| Vision Teaser | Investors, Government | Strategic, measured | Global network hook. |
| Acknowledgement of Country | All | Respectful, formal | Cultural obligation. Non-negotiable positioning. |
| EOI Section | All | Welcoming, low-pressure | Generic registration for those not yet self-selected. |

### Navigation Flow
- Home serves as the router: each section directs personas to their optimal next page.
- All 8 persona journeys start here.

### Gaps Identified
- No employment/careers signal on Home page. Potential employees have no obvious entry point until they reach `/creative` or `/community`.
- Consider adding a subtle "Careers" or "Work with us" link in the footer.

---

## Facilities (`/facilities`)

### Primary Audiences
- Creative Producers

### Secondary Audiences
- Tech Partners (LED volume, VR/AR)
- Investors (facility scale = investment credibility)

### Content Blocks

| Block | Serves Persona | Content Tone | Notes |
|-------|---------------|-------------|-------|
| Overview | Producers | Professional | Portfolio of facilities with specification focus. |
| Screen Sound Stages | Producers | Specification-driven | Dimensions, height, soundproofing, LED configs. |
| Commercial Sound Stages | Producers | Specification-driven | Smaller stages, versatile configurations. |
| Broadcast Theatre | Producers | Specification-driven | Live performance + broadcast capability. |
| Broadcast Control Room | Producers, Tech Partners | Technical | Command-and-control for live production. |
| Ancillary Spaces | Producers | Comprehensive | Supporting spaces (recording, dressing, storage, etc.). |
| EOI Section | Producers | Action-oriented | "Planning a Production?" |
| Units Toggle (sqm/sqft) | International Producers | Practical | Metric/imperial toggle for global audience. |

### Navigation Flow
- Producers arrive from Home facilities preview.
- Natural exit: Creative (to see ecosystem services) or Contact (to register interest).

### Gaps Identified
- No cross-link to `/creative` from facilities page. Producers who want to understand the full ecosystem must navigate independently.

---

## Creative (`/creative`)

### Primary Audiences
- Creative Professionals
- Technology Partners

### Secondary Audiences
- Producers (case studies)
- Potential Employees (discipline overview = job categories)

### Content Blocks

| Block | Serves Persona | Content Tone | Notes |
|-------|---------------|-------------|-------|
| Ecosystem Model | Tech Partners, Creatives | Technical but accessible | Operational principles, integration model. |
| Service Areas (17 categories) | Creatives, Employees | Discipline-specific | 5 groups: Production, Post, Design, Technology, Business. |
| Case Studies | Producers | Narrative | Illustrative scenarios (feature film, live broadcast, theatre). |
| EOI Section | Creatives | Community-focused | "Join the Creative Community" |

### Navigation Flow
- Creatives arrive from Home creative preview.
- Natural exit: Community (education/growth) or Contact (register interest).
- Employees may arrive here to understand disciplines.

### Gaps Identified
- Case studies are illustrative (disclaimer noted) but effective for producers. Consider adding a tech-partner-focused case study.
- No explicit "careers" or "work with us" messaging despite this page being a natural employee entry point.

---

## Vision (`/vision`)

### Primary Audiences
- Investors
- Government / Policy

### Secondary Audiences
- Technology Partners (global network = scale)
- Producers (global network = location options)

### Content Blocks

| Block | Serves Persona | Content Tone | Notes |
|-------|---------------|-------------|-------|
| Mission & Vision | All | Strategic, aspirational | 7 mission themes. |
| Global Network | Investors, Government | Strategic | 5 planned campus locations. |
| Queensland Campus | Government, Investors | Economic impact | Local focus for regional stakeholders. |
| Why Integrated | Tech Partners, Producers | Analytical | 6 arguments for integration model. |
| Stakeholder Benefits | All (segmented) | Targeted per stakeholder | Creators, Industry, Investors, Governments. |
| Team | Investors | Credibility-building | Founder bio and team description. |
| EOI Section | Investors, Partners | Professional | "Explore Partnership Opportunities" |
| Forward-Looking Disclaimer | Investors | Legal | Required for investment-adjacent content. |

### Navigation Flow
- Investors arrive from Home vision teaser.
- Government arrives from Community (economic impact focus).
- Natural exit: Contact (register interest).

### Gaps Identified
- The Vision EOI section says "Partnership Opportunities" but should offer both "Investment" and "Partnership" paths.
- The `/contact` PersonaSelector should include a "Government / Policy" option mapping to `partner`.

---

## Community (`/community`)

### Primary Audiences
- Educational Institutions
- Government / Policy

### Secondary Audiences
- Creative Professionals (education/growth)
- Investors (sustainability = ESG alignment)
- Potential Employees (culture signals)

### Content Blocks

| Block | Serves Persona | Content Tone | Notes |
|-------|---------------|-------------|-------|
| Education & Innovation | Educators, Creatives | Academic-professional | 4 strategies for education partnerships. |
| Sustainability | Government, Investors | Environmental, measured | 5 sustainability commitments. |
| Strategic Alliances | Tech Partners, Producers | Professional | Alliance model (suppliers, tech, education, government). |
| Alliance Value | Investors, Partners | Analytical | 4 alliance values. |
| Building Bridges | Producers, Government | Segmented | Separate blocks for producers (4 points) and government (6 points). |
| EOI Section | All | Inclusive | "Join the Community" |
| Forward-Looking Disclaimer | All | Legal | Required. |

### Navigation Flow
- Educators arrive directly from Home or via nav.
- Government arrives from Home or after Vision.
- Employees may visit for culture signals.

### Gaps Identified
- No explicit employee/careers content despite community being a natural culture page.
- Education section could link more explicitly to specific institution partnership models.

---

## FAQ (`/faq`)

### Primary Audiences
- General Public

### Secondary Audiences
- All personas (clarification on specific topics)

### Content Blocks

| Block | Serves Persona | Content Tone | Notes |
|-------|---------------|-------------|-------|
| Search | All | Functional | Search across all FAQ categories. |
| Category Filters | All | Functional | Facilities, Services, Global, Community. |
| Q&A Items | All (by category) | Clear, informative | 20 questions across categories. |

### Navigation Flow
- General public arrives from Home.
- All personas may visit for specific clarification.
- Natural exit: Contact (still have questions).

### Gaps Identified
- No employment-related FAQ questions (e.g., "Are you hiring?", "How can I work at Production City?").

---

## Contact (`/contact`)

### Primary Audiences
- All personas (conversion endpoint)

### Secondary Audiences
- None (this is the destination, not a discovery page)

### Content Blocks

| Block | Serves Persona | Content Tone | Notes |
|-------|---------------|-------------|-------|
| Contact Information | All | Practical | Email, AU phone, US phone, website. |
| EOI Form | All | Functional, clear | Category selector, common fields, category-specific metadata. |
| Acknowledgement of Country | All | Respectful | Cultural obligation. |

### Navigation Flow
- All personas arrive here as the conversion endpoint.
- Category may be pre-selected via query parameter from persona-specific CTAs.

### Gaps Identified
- PersonaSelector does not include "Government / Policy" as an option (should map to `partner`).
- No "Potential Employee" / employment category option (to be added in this issue).
- `sourcePage` and `sourceCategory` are client-supplied and unvalidated (security fix required).

---

## Navigation Flow Validation

### All 8 Journeys Supported

| Persona | Journey | Nav Support | Cross-links Needed |
|---------|---------|-------------|-------------------|
| Producer | Home > Facilities > Creative > Contact | Direct nav links | Facilities > Creative cross-link |
| Investor | Home > Vision > Community > Contact | Direct nav links | Vision dual CTA (invest/partner) |
| Government | Home > Community > Vision > Contact | Direct nav links | PersonaSelector "Government" option |
| Tech Partner | Home > Creative > Vision > Contact | Direct nav links | None |
| Creative | Home > Creative > Community > Contact | Direct nav links | None |
| Education | Home > Community > Contact | Direct nav links | None |
| General | Home > FAQ > Contact | Direct nav links | None |
| Employee | Home > Creative > Community > Contact | Direct nav links | Employment EOI category needed |

### Mobile Navigation
- All 7 pages accessible via hamburger menu.
- All journeys work on mobile: sequential page visits via nav menu.
- EOI form must be fully functional on mobile viewports.
- CTAs must be full-width tap targets on narrow screens.

### Missing Cross-Links (Action Items)
1. `/facilities` should link to `/creative` for producers wanting full ecosystem view.
2. `/vision` EOI section should offer both investment and partnership paths.
3. `/contact` PersonaSelector should include "Government / Policy" mapping to `partner`.
4. Footer should include a "Careers" or "Work with us" link (new for employee persona).
5. `/faq` should include employment-related questions.

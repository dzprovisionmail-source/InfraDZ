---
name: Traffic Law DZ App
description: Expo mobile app for Algerian traffic law 09-26 — key decisions, data sources, and architecture.
---

## Key decisions

**Why:** Real data extracted from official Algerian Traffic Law PDF (قانون_المرور__1779756092407.pdf) — Official Gazette No. 36, dated 17 May 2026.

**Violation degrees (Article 121):**
- Degree 1 → 3,000 DZD
- Degree 2 → 4,000 DZD
- Degree 3 (cat 1) → 6,000 DZD
- Degree 4 → 10,000 DZD
- Criminal (Art 136, 139, 141, 124-126) → fines 25,000–800,000 DZD + prison

**Speed limits (Article 27):** Urban 50, suburban 80, national roads 100, expressway 120-130 km/h

**Alcohol limit:** 0.20 g/L blood or 0.10 mg/L exhaled air

**Stack:** Expo + AsyncStorage, no uuid (use Date.now()+Math.random()), RTL Arabic UI, red/black/white theme.

**How to apply:** Any new violations must cite the real article number from PDF. Article 121 sub-sections (أ، ب، ج، د) map to the 4 degrees.

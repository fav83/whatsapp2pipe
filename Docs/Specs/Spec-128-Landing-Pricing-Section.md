# Spec-128: Landing Pricing Section

**Feature:** Landing Page Pricing Section (Marketing)
**Date:** 2025-11-10
**Status:** 📝 Draft (Specification)
**Implementation Status:** ❌ Not Implemented
**Dependencies:** UI-Design-Specification, Landing-SEO-Architecture

---

**Related Docs:**
- [UI-Design-Specification.md](../Architecture/UI-Design-Specification.md)
- [Landing-SEO-Architecture.md](../Architecture/Landing-SEO-Architecture.md)
- [Spec-123-Landing-Legal-Pages.md](Spec-123-Landing-Legal-Pages.md)

---

## 1. Overview

Add a Pricing section to the Landing site that communicates: free during beta, paid plans coming soon. The section avoids collecting emails, running a waitlist, or publishing pricing numbers. It introduces two tiers (Free – Beta; Pro – Coming Soon) and provides a clear current-path CTA.

Why this matters: Sets expectations early for eventual paid plans while keeping flexibility and avoiding premature commitments. Builds clarity without committing to numbers or operational flows.

---

## 2. Objectives

- Communicate “Free during beta; paid plans coming soon.”
- Provide clear current CTA to start (sign in/start free).
- Avoid email capture, waitlists, pricing numbers/ranges, and FAQ blocks.
- Fit naturally into current Landing IA and styling.

---

## 3. Constraints

- No email capture anywhere in the Pricing section.
- No waitlist or “Join waitlist.”
- No pricing numbers or ranges (e.g., no “from $X–$Y”).
- No FAQ block in Pricing.

---

## 4. Placement & IA

- Insert the Pricing section on the Landing page immediately AFTER the section titled “Your CRM, without the context switching”.
- Target file: `Landing/src/pages/Home.tsx`
- New order in `<main>`:
  1) `DemoVideo`
  2) `Benefits` (contains the “Your CRM, without the context switching” heading)
  3) `Pricing` ← NEW (this spec)
  4) `HowItWorks`
  5) `FinalCTA`

Note: Keep section paddings and visual rhythm consistent with existing components.

---

## 4.1 Header Navigation (New Requirement)

- Add a “Pricing” link in the header navigation, positioned to the left of the “Sign in with Pipedrive” button.
- Behavior on Home route (`/`): clicking “Pricing” smoothly scrolls to the Pricing section.
- Behavior on other routes (e.g., `/privacy-policy`, `/terms-of-service`): clicking “Pricing” navigates to `/#pricing` and scrolls to the Pricing section after route change.
- The Pricing section MUST expose an anchor: `id="pricing"` on the section root element.
- Smooth-scroll is preferred where supported; fall back to instant jump where not supported.

Accessibility:
- Ensure link text is simply “Pricing”.
- Preserve visible focus styles. Do not disable pointer events during scroll.

Files to touch when implementing:
- `Landing/src/components/Header.tsx` (add link and smooth scroll handling)
- `Landing/src/components/Pricing.tsx` (ensure `id="pricing"` on root `<section>`)

---

## 5. Content & Copy

Section title and subhead:
- Title: “Pricing”
- Subhead: “Free during beta. Paid plans coming soon.”

Disclosure line (small text under subhead or in Free card fine print):
- “We’ll provide advance notice before any pricing changes.”

Tiers:
- Free (Beta)
  - Bullets: “Core WhatsApp → Pipedrive capture”, “Fair-use limits”, “No SLA”, “Features may change”
  - CTA: “Start free” (uses existing sign-in flow)
- Pro (Coming Soon)
  - Badge: “Coming Soon”
  - Bullets: “Higher/Unlimited limits”, “Priority support”, “Advanced automation”, “Team features”
  - CTA: Disabled button labeled “Coming soon” (no link)

Out-of-scope content (explicitly excluded):
- Price numbers or ranges
- Email capture or waitlist
- FAQ content

---

## 6. UX & Visual Design

- Two-card layout with equal visual weight; Free card slightly emphasized as the current path (e.g., subtle border or shadow highlight).
- Clear badges: “Beta” on the Free card (optional), “Coming Soon” on the Pro card.
- Pro CTA is disabled with `aria-disabled="true"` and visual disabled state; optional tooltip: “Available after beta”.
- Responsive layout: stacked on small screens; two-column grid on md+.
- Maintain typography, spacing, and colors consistent with existing Landing components.

---

## 7. Behavior

- Free (Beta) CTA triggers the existing sign-in/start flow used elsewhere on the Landing page (reuse `SignInButton`).
- Pro CTA is disabled (no navigation, no modal, no capture).
- No new forms or dialogs.

---

## 8. Accessibility

- Semantic markup: section with heading structure (`<h2>` for section title, `<h3>` for card titles).
- `aria-disabled` for disabled Pro CTA; ensure it is not focusable/interactive.
- Sufficient color contrast for badges and text.
- Keyboard focus order preserved; disabled elements skipped.

---

## 9. Analytics (Optional, Non-Blocking)

- Event: `pricing.view` when the section becomes visible (basic: on render; advanced: intersection observer).
- Event: `pricing.cta_start_free.click` when Free CTA clicked.
- Event: `pricing.pro_cta.hover` to gauge interest (optional; hover/focus tracking only).

No analytics blockers—ship without events if infra not present.

---

## 10. SEO

- Use meaningful heading text (“Pricing”).
- Anchor id `id="pricing"` REQUIRED for deep linking and header navigation.
- No separate route or indexable page; this is a section on home.

---

## 11. File Structure

New:
- `Landing/src/components/Pricing.tsx` — Pricing section component containing both cards.

Modified:
- `Landing/src/pages/Home.tsx` — Insert `<Pricing />` after `<Benefits />` and before `<HowItWorks />`.
- `Landing/src/components/Header.tsx` — Add “Pricing” link with scroll/navigation logic.

No other files are required by this spec.

---

## 12. Acceptance Criteria

- Placement: Pricing appears immediately after the “Your CRM, without the context switching” section on Home.
- Header link: A “Pricing” link appears in the header to the left of the sign-in button.
- Header link behavior: On Home, clicking scrolls to Pricing; on other routes, navigates to `/#pricing` and scrolls into view.
- Content: Two tiers (Free – Beta; Pro – Coming Soon) with specified bullets.
- Copy: Title “Pricing”; subhead “Free during beta. Paid plans coming soon.”; disclosure line present.
- Behavior: Free CTA starts existing sign-in; Pro CTA disabled with `aria-disabled` and no navigation.
- Constraints: No email capture, no waitlist, no price numbers/ranges, no FAQ.
- Responsive and accessible per guidelines; consistent with Landing styling.

---

## 13. Out of Scope

- Pricing numbers, ranges, discounts, trials, or grandfathering promises.
- Email capture, waitlists, or CRM integrations for interest collection.
- Dedicated FAQ or pricing comparison tables.

---

## 14. Risks & Comms

- Risk: Users may seek price clarity; mitigation: clear “coming soon” messaging and disclosure that notice will be provided before changes.
- Optional: Use the existing banner/config system (see Spec-125) to display “Currently free during beta. Paid plans coming soon.” site-wide when desired.

---

## 15. Open Questions

- Should the Free card include a small “Subject to change” note? (Default: yes.)
- Exact wording of Pro features (automation/team) to be finalized closer to launch.

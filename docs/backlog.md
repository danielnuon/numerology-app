# Backlog

Open work for Solini. Each story has a user story, acceptance criteria (ACs) and notes. Use `/story` to add or refine a story here and `/build` to implement one.

Check off ACs in the same commit that satisfies them. When every AC in a story is checked, move its title to **Done** and delete its body; git history keeps the detail.

The full story-by-story history up to October 2026 is in `docs/dev/product-roadmap.md` at commit `7ce1379`.

## Now

Viewport fixes and the design language pass are in progress in their own branches. Add stories here as they firm up.

## Next

### Verify Year Timeline Explorer

The timeline shipped in `dcb6aac` and `7ce1379` (`src/components/year-timeline.tsx`), but none of its ACs were checked off. Also add aria-labels to the year dots (left over from the Accessibility story). Go through each AC below, check off what the code already does, and file what's missing as fixes.

**Story:** As a visitor who has received their cycle reading, I want to scrub through a timeline of years and see my cycle number for each year, so that I can explore specific past or future years without counting manually.

**Priority:** Medium
**Effort:** M

**Acceptance Criteria:**
- [ ] A horizontal "thread of fate" timeline displays years from birth year through `currentYear + 30`
- [ ] The timeline is horizontally scrollable with a viewport showing at least 15 years at 1280px width
- [ ] Each year is represented by a dot on a connecting line, using the same 5-tier symbols as the cycle chart: ● (very strong, 10–11), ◕ (strong, 7–9), ◑ (moderate, 4–6), ◔ (weak, 1–3), ⊙ (zero, 0)
- [ ] The current year's dot has a gold border or ring — verify during verification that the gold indicator (#B8860B on the timeline background) meets WCAG SC 1.4.11 Non-text Contrast (3:1 minimum) using computed contrast ratio tools; if it fails, use `ring-ink-light` (#7A6F5F) instead, consistent with the Cycle 7 focus-ring fix. The gold indicator must not be the sole differentiator — the current year's label is also bold
- [ ] Selecting a year dot updates the cycle chart's selected pillar and the detail panel (shared state via parent component)
- [ ] Selecting a pillar in the cycle chart updates the timeline's selected year to the most recent calendar year for that pillar position (bidirectional sync)
- [ ] When the timeline drives the selection, the detail panel shows the specific selected calendar year's data (year, cycle number, tier, domain, guidance) — not the pillar's grouped "nearest years" list. When the cycle chart drives the selection, the detail panel shows the pillar's standard grouped-year display. The detail panel adapts its content based on which component initiated the selection.
- [ ] The current year is pre-selected and centered on load
- [ ] The 12-year repeat pattern is visually indicated with subtle vertical tick marks at cycle boundaries
- [ ] Zero years are visually distinct on the timeline (⊙ open marker, same as cycle chart)
- [ ] Timeline is keyboard navigable (arrow keys move selection left/right through years)
- [ ] Gradient fade indicators appear on left/right edges when more content is scrollable
- [ ] Before cycle data is available, the timeline is not rendered (no empty skeleton)

**Tasks:**
- [ ] Build horizontal timeline component with year labels and connecting line
- [ ] Implement 5-tier dot symbols matching the cycle chart (●, ◕, ◑, ◔, ⊙) — do NOT use a different symbol set
- [ ] Implement gold-highlighted dot for current year with bold label; include a fallback color (`ring-ink-light`) if gold fails WCAG SC 1.4.11 contrast check during verification
- [ ] Refactor CycleChart to accept an optional `selectedYear` prop from the parent component and reflect it as the active pillar; verify existing keyboard-nav tests and aria-label tests still pass after refactor — this is a modification of an existing component, not just new code
- [ ] Lift selected-year state to `page.tsx` (or shared context) with a `selectionSource` field (`'chart' | 'timeline'`) so the detail panel knows which display mode to use
- [ ] Implement detail panel dual mode: specific-year display (when timeline drives selection) vs. grouped-year display (when chart drives selection)
- [ ] Add current-year auto-centering with scroll-snap behavior
- [ ] Add 12-year cycle boundary tick marks
- [ ] Add gradient fade overflow indicators on left/right edges
- [ ] Implement keyboard navigation (arrow keys move selection through years)
- [ ] Assess timeline DOM size for users born before 1950 (100+ year spans, 100+ dots); if performance profiling shows jank, implement windowed rendering — otherwise document the decision that the DOM count is acceptable
- [ ] Test at 320px: verify no horizontal overflow of the outer page (timeline scrolls internally), dots remain tappable (44px touch targets), gradient fades visible. Test at 768px: verify at least 10 years visible. Test at 1280px: verify at least 15 years visible per AC.
- [ ] Test bidirectional sync: selecting year 2024 in timeline highlights the correct pillar in the chart; selecting a pillar in the chart moves the timeline selection to the most recent calendar year for that position

**Notes:** Depends on Numerology Calculation Core, Interpretation Engine, and Design Token Setup. The 5-tier symbol set (●, ◕, ◑, ◔, ⊙) must match the cycle chart — using different symbols for the same tiers would confuse users switching between the two views. The CycleChart refactor (lifting selection state) is the riskiest task — it touches an existing component with passing tests and must not break existing behavior.

### Update Notification Banner

**Story:** As a returning visitor who has previously used the app, I want to see a one-time popup banner notifying me about the lucky number timing correction, so that I understand why my displayed number may have changed.

**Priority:** Medium
**Effort:** S

**Acceptance Criteria:**
- [ ] A banner or modal appears on the first visit after the update is deployed, visible only to users who have previously entered birth data (localStorage key `khmer-numerology:birth` exists)
- [ ] The banner explains in plain language that the lucky number calculation has been corrected to account for birthday timing
- [ ] The banner includes a dismiss action (close button or "Got it" button)
- [ ] After dismissal, the banner never appears again for that user — tracked via a new localStorage key (e.g., `khmer-numerology:update-notice-dismissed`)
- [ ] First-time visitors (no stored birth data) never see the banner
- [ ] The banner is visually consistent with the existing design system (parchment background, ink text, Cormorant Garamond font)
- [ ] The banner does not block interaction with the form or cycle chart — it overlays or sits above the content without preventing scroll or input
- [ ] The banner is announced to screen readers via `aria-live="polite"` so assistive users are aware of it

**Tasks:**
- [ ] Design banner content with three concrete deliverables: (a) short headline, e.g., "Your Lucky Number Has Been Updated" (2–5 words); (b) body copy of 1–2 sentences explaining that the calculation now correctly waits until your birthday to show the new year's number; (c) dismiss button label (e.g., "Got it")
- [ ] Implement banner component with conditional rendering based on localStorage keys (has birth data AND has not dismissed)
- [ ] Implement dismiss handler that writes `khmer-numerology:update-2026-timing-fix-dismissed` to localStorage
- [ ] Style banner to match design system tokens (parchment background, ink text, Cormorant Garamond, gold close button)
- [ ] Write unit tests covering four named cases: (a) "banner shows when birth data exists and not dismissed"; (b) "banner hidden when no birth data"; (c) "banner hidden after dismissal"; (d) "banner hidden for first-time visitors" — each test asserting the correct component mount/unmount state

**Notes:** The localStorage key for dismissal should be specific to this update (e.g., `khmer-numerology:update-2026-timing-fix-dismissed`) so future updates can trigger new banners. Depends on the Lucky Number Year Timing Correction being deployed first.

### Partner Comparison View

**Story:** As a visitor in a relationship, I want to enter my partner's birth data and see how our cycles interact year by year, so that I can understand which years our luck strengthens or challenges each other.

**Priority:** Medium
**Effort:** L

**Acceptance Criteria:**
- [ ] A "Compare with partner" button below the user's cycle chart reveals a second birth data form (reusing the existing BirthDataForm component in partner mode — the form submits partner data to local state without triggering the main cycle re-computation)
- [ ] Before partner data is entered, the comparison section shows a prompt: "Enter your partner's birth date to see compatibility"
- [ ] Both cycles are computed independently and displayed side by side: the user's 12-pillar chart on the left, the partner's on the right, aligned to calendar years. On viewports below 768px, the charts stack vertically (user on top, partner below) instead of side by side
- [ ] Each shared year is annotated with the interaction result: stabilized, amplified, risk, unstable, or neutral
- [ ] Compatibility uses the tier system: 1–3 = low, 4–6 = moderate, 7–11 = high (merging high and very high for interaction purposes). **Zero (value = 0) is a dedicated override: any pair containing a 0 is always "unstable", regardless of the other person's tier — this takes precedence over all tier-based rules**
- [ ] Complete non-zero interaction rules — all 6 unique tier pairs are defined: low+low = risk, low+moderate = neutral, low+high = stabilized, moderate+moderate = neutral, moderate+high = stabilized, high+high = amplified
- [ ] Visual annotations for each interaction type use both a color AND a text label or icon — color is never the sole indicator (WCAG SC 1.4.1). Specifically: stabilized = green + ▲ label, amplified = gold + ★ label, risk = red-brown + ▼ label, unstable = charcoal + ⊙ label, neutral = muted + — label. Verify contrast of annotation colors against background during verification with tooling.
- [ ] Total scores for both people are displayed with a relationship stability assessment: "Strong stability" if both totals ≥ 68, "Moderate stability" if both ≥ 60, "Mixed stability" if one is ≥ 68 and the other < 60, "Challenging" if both < 60
- [ ] A "Remove comparison" button hides the partner section and returns the page to single-person view, clearing partner state but preserving the user's own cycle
- [ ] The comparison view is shareable via URL: two birth dates encoded as `/r/YYYY-MM-DD+YYYY-MM-DD` (user date first, partner date second). Existing single-person share URLs (`/r/YYYY-MM-DD`) remain valid — the presence of a `+` distinguishes one-person from two-person URLs

**Tasks:**
- [ ] Add "Compare with partner" button below the user's cycle chart that reveals the partner form section (animated slide-down, consistent with detail panel)
- [ ] Parameterize BirthDataForm to accept a `mode` prop: `'primary'` (current behavior — triggers main cycle computation) or `'partner'` (submits to partner-specific state handler without affecting main cycle). Verify existing form tests still pass after parameterization
- [ ] Define `CompatibilityResult` type: `{ year: number; userValue: number; partnerValue: number; userTier: Tier; partnerTier: Tier; interaction: 'stabilized' | 'amplified' | 'risk' | 'unstable' | 'neutral' }`
- [ ] Define compatibility tier mapping: 0 = zero (override), 1–3 = low, 4–6 = moderate, 7–11 = high (merging high and very high for interaction purposes)
- [ ] Implement `computeCompatibility(cycleA: number[], cycleB: number[], birthYearA: number, birthYearB: number): CompatibilityResult[]` with zero-override rule applied first, then the 6 tier-based interaction types
- [ ] Build side-by-side chart showing both cycles aligned to calendar years; implement responsive stacking (vertical on mobile < 768px)
- [ ] Implement visual annotations for each interaction type using color + text label (not color alone): stabilized (green + ▲), amplified (gold + ★), risk (red-brown + ▼), unstable (charcoal + ⊙), neutral (muted + —)
- [ ] Implement total-score relationship stability assessment with 4 defined thresholds
- [ ] Add "Remove comparison" button that clears partner state and returns to single-person view
- [ ] Extend URL encoding: add `decodeTwoPersonUrl(dateStr: string)` that splits on `+` to parse two dates; existing single-date decoding remains unchanged. Add `buildComparisonSharePath(userDate, partnerDate)` → `/r/YYYY-MM-DD+YYYY-MM-DD`
- [ ] Update `/r/[date]/page.tsx` to detect `+` in the date param: if present, decode both dates and render the comparison view; if absent, use existing single-person flow. Existing single-person share URLs must not break.
- [ ] Write unit tests for zero-override precedence: 0+high → unstable, 0+low → unstable, 0+moderate → unstable, 0+0 → unstable
- [ ] Write unit tests for all 6 non-zero tier pairs: low+low → risk, low+moderate → neutral, low+high → stabilized, moderate+moderate → neutral, moderate+high → stabilized, high+high → amplified
- [ ] Test with edge cases: same birthday, opposite cycles, both contain zero in same year, both moderate (5+5), low+high (2+9), high+high (8+10), low+moderate (2+5), moderate+high (5+8)
- [ ] Test URL encoding: `/r/1997-07-24+2000-03-15` decodes both dates correctly; `/r/1997-07-24` still works as single-person; `/r/invalid+also-invalid` falls back gracefully

**Notes:** Depends on Numerology Calculation Core, Interactive Cycle Chart, and URL State Encoding (all complete). The `+` separator in the URL encoding is safe because ISO dates never contain `+`; it's visually readable and doesn't require percent-encoding. The BirthDataForm parameterization (primary vs. partner mode) is a prerequisite — do not attempt to reuse the form before adding the mode prop. The complete 6-pair interaction matrix resolves the domain gap identified during story review.

### Compatibility Summary Card

**Story:** As a visitor comparing with my partner, I want a summary card showing our overall compatibility, so that I get a quick read without studying the full chart.

**Priority:** Low
**Effort:** S

**Acceptance Criteria:**
- [ ] Card displays both people's total scores and the combined assessment
- [ ] Card shows the count of stabilized, amplified, risk, unstable, and neutral years
- [ ] Card highlights the current year's interaction
- [ ] Card renders correctly when isolated from the page context (no external layout dependencies)
- [ ] Card is exportable as a PNG image at 1200x628px (optimized for social sharing)

**Tasks:**
- [ ] Build summary card component as a self-contained React component with fixed dimensions
- [ ] Implement year-type counting from compatibility results (all 5 types)
- [ ] Add current-year highlight
- [ ] Implement PNG export at 1200x628px via html-to-canvas or Satori

**Notes:** Depends on Partner Comparison View.

### Shareable Results Card

> Part of this may already exist: the `/r/[date]` share route and its OG image shipped with Page Metadata & SEO. Check before building.

**Story:** As a visitor who has received my reading, I want to share my cycle as a visual card on social media, so that I can show friends and invite them to try the app.

**Priority:** Low
**Effort:** M

**Acceptance Criteria:**
- [ ] A "Share" button generates a visual card image containing: the 12-number cycle, the current year highlight, and the total score interpretation
- [ ] The card includes the app URL as a subtle watermark or footer
- [ ] Cycle data is encoded in the URL so the server can generate correct OG meta tags without client-side JavaScript
- [ ] OG meta tags produce a correct preview card on Twitter, Facebook, iMessage, and Discord
- [ ] The share flow supports: copy link, download image, native share (on mobile)
- [ ] Generated image is under 500KB for a standard 12-number cycle in English (baseline scenario)

**Tasks:**
- [ ] Integrate URL State Encoding to produce shareable links with embedded cycle data
- [ ] Implement server-side OG image generation using the encoded URL data (Satori / @vercel/og)
- [ ] Set dynamic OG meta tags (`og:image`, `og:title`, `og:description`) on the share route
- [ ] Build share button with copy-link, download, and native share options
- [ ] Implement fallback OG image for invalid/missing URL data
- [ ] Test OG preview on Twitter, Facebook, iMessage, Discord
- [ ] Optimize generated image size

**Notes:** Depends on Interactive Cycle Chart and URL State Encoding. OG image generation requires server-side rendering — the URL must contain enough data for the server to recompute the cycle.

## Blocked

### Khmer Language Toggle

> Blocked on a native Khmer speaker to translate and culturally review the interpretation text.

**Story:** As a Khmer-speaking visitor, I want to view the app in Khmer script, so that the cultural context of the system is preserved in its original language.

**Priority:** Low
**Effort:** M

**Acceptance Criteria:**
- [ ] A language toggle switches between English and Khmer
- [ ] All interpretation text, labels, navigation, and guidance display in Khmer when selected
- [ ] Cycle numbers display in Western Arabic numerals (0–9) in both languages, not Khmer numerals — this keeps the numerology system consistent and avoids confusion
- [ ] Khmer typography uses Noto Serif Khmer (not Noto Sans Khmer) to match the serif aesthetic of Cormorant Garamond
- [ ] When Khmer is selected, any text rendered in Cormorant Garamond that contains Khmer script switches to Noto Serif Khmer automatically via CSS font-stack fallback
- [ ] Line height and spacing are adjusted for Khmer script (Khmer glyphs are taller — requires increased line-height)
- [ ] Language preference persists across sessions via localStorage
- [ ] The toggle is accessible and discoverable (header area)
- [ ] Zodiac animal names display in Khmer

**Tasks:**
- [ ] Set up i18n framework (next-intl or react-i18next)
- [ ] Extract all user-facing strings into translation files (English as default)
- [ ] Add Khmer web font (Noto Serif Khmer) via next/font with correct weight matching
- [ ] Implement CSS font-stack so Khmer script falls through from Cormorant Garamond to Noto Serif Khmer
- [ ] Adjust line-height and vertical spacing when Khmer locale is active
- [ ] Build language toggle component
- [ ] Implement localStorage persistence for language preference
- [ ] Test Khmer rendering across all pages and components

**Tasks (blocked — require external input):**
- [ ] **DEPENDENCY:** Acquire Khmer translation from a native Khmer speaker — this is a blocker for shipping this story
- [ ] **DEPENDENCY:** Cultural review of translated interpretation text by a native speaker to ensure meaning is preserved, not just literally translated

**Notes:** The translation dependency is a hard blocker, not a nice-to-have. The i18n infrastructure can be built and tested with placeholder Khmer text, but the story cannot be marked complete until real translations are reviewed and integrated.

### Manual checks

These need real devices or a public URL and can't be automated here.

- [ ] Fonts render correctly on macOS, Windows, iOS and Android (Design Token Setup)
- [ ] Sharing the root URL on Discord, iMessage, X and Facebook shows the OG title and image (Page Metadata & SEO)
- [ ] Screen reader pass with VoiceOver and one other screen reader (Accessibility)
- [ ] Cross-browser pass on real iOS Safari and Android Chrome (Responsive Layout)

## Done

- Margasir Month Mapping Data
- Chinese Lunar New Year Lookup Table
- Design Token Setup
- URL State Encoding
- CI/CD Pipeline Setup
- Vercel Production Deployment
- Page Metadata & SEO Basics
- Numerology Calculation Core
- Year Lookup
- Interpretation Engine
- Birth Data Form
- Interactive Cycle Chart
- Current Year Widget
- Responsive Layout System
- Accessibility
- Error Boundary & Graceful Degradation
- Visual Rebranding: Title & Subtitle
- External Reference Migration
- Internal Reference Preservation
- Restore Hero Tagline
- Hero Typography Refinement
- Roadmap Hygiene: Check Off Completed Stories
- Lucky Number Year Timing Correction
- Read each year by life area and number together

# Backlog

Open work for Solini. Each story has a user story, acceptance criteria (ACs) and notes. Use `/story` to add or refine a story here and `/build` to implement one.

Check off ACs in the same commit that satisfies them. When every AC in a story is checked, move its title to **Done** and delete its body; git history keeps the detail.

The full story-by-story history up to October 2026 is in `docs/dev/product-roadmap.md` at commit `7ce1379`.

## Now

Stories from **Next** are being built in order, one PR at a time.

## Next

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
- Year Timeline Explorer
- Update notice for returning visitors
- Partner Comparison View
- Compatibility Summary Card

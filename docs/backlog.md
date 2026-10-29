# Backlog

Open work for Solini. Each story has a user story, acceptance criteria (ACs) and notes. Use `/story` to add or refine a story here and `/build` to implement one.

Check off ACs in the same commit that satisfies them. When every AC in a story is checked, move its title to **Done** and delete its body; git history keeps the detail.

The full story-by-story history up to October 2026 is in `docs/dev/product-roadmap.md` at commit `7ce1379`.

## Now

Nothing in progress.

## Next

Empty. Add the next story with `/story`.

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
- [ ] Sharing the root URL, a reading link (`/r/YYYY-MM-DD`) and a comparison link (`/r/A+B`) on Discord, iMessage, X and Facebook shows the right title, description and card (Page Metadata & SEO, Shareable Results Card)
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
- Shareable Results Card
- Birth day and zodiac animal readings
- Shared-link and brand copy pass (shared readings say "their", "See your own cycle", one brand line, personal share text, next reading's date, comparison for anyone close, gentler comparison labels, product events, the story behind the name on About)

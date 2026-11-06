# ADR-003: Adopt the methods of the BIO DIGITAL design language

## Status

Accepted (phase 1). Later phases are proposed below and each lands in its own PR.

## Context

BIO DIGITAL (version 1.0, November 2026) is a design language for interfaces that feel organic, physical and alive: a material system, depth levels, radius and motion tokens, spring physics for interaction, adaptive information density, mandatory reduced-motion support and performance budgets. Solini's owner asked to use it to improve Solini's design while keeping Solini's identity: the temple lantern theme, the woven flame, Khmer numerology's character, and Solini's palette and type.

Solini already practices much of it. Its "Living" principle and the Living surfaces table are BIO DIGITAL's Continuous Vitality, written earlier and with tighter limits. Scroll weight and the flame's response are critically damped springs. Morph and travel is its Fluidity and Propagation. Familiar behavior, 44px targets, a visible focus ring, Reduce Motion and Reduce Transparency are its accessibility baseline. So the work is mostly to name what exists in the spec's terms, close the real gaps, and say plainly where Solini departs from the spec.

## Audit

How Solini measures against each part of the spec today.

| Spec area | Solini today | Verdict |
|-----------|--------------|---------|
| Pillars: fluidity, reactivity, serenity, vitality | Principles 1, 3 and 6, Living surfaces, Transitions | Already met |
| Continuous Vitality (3.7, 14) | Living surfaces table, each with limits, tested by `reduced-motion.test.ts` | Already met, and stricter: no loop without a registered row |
| Materials (5) | One surface, `.glass`, on every card; the menu panel is opaque | Gap: no named roles, and the spec's default is inverted (see Conflicts) |
| Depth (8) | Three shadows (`--shadow-card`, `--shadow-raised`, `--shadow-glow`), no named levels | Gap: levels not named |
| Radius (7.2) | Tailwind's `rounded-md`, `-xl`, `-2xl`, `-full` by convention | Close: the values match R1–R3 and Pill; R4–R6 have no use yet; three outliers (`rounded-sm`, `-lg`, `-3xl`) move onto the scale in phase 5 |
| Color (6) | Lantern palette, tier light, symbols beside every tier | Met in method; palette kept (see Conflicts) |
| Type (9) | Marcellus, Hanken Grotesk, Cormorant italic, Noto Serif Khmer | Met in method; faces kept (see Conflicts) |
| Physics (10, 11) | Springs for scroll weight and the flame; press and transitions on timed Material 3 curves | Gap: press feedback was a timed curve in CSS and a different spring in Motion; and in CSS it did not ease at all, because `.pressable` transitioned `transform` while Tailwind 4's `active:scale-[0.97]` sets `scale`, so every press jumped |
| Interaction (12) | Familiar controls, press scale, roving tabs, dialogs with Escape and focus return | Met; no drag gestures, so velocity-aware dismissal has nothing to apply to yet |
| Adaptive density (15) | This year's card, the reading's Year and Cycle views, Reveal disclosures, companion pages | Met in practice; levels not named |
| Reduced motion (18.2) | Everything stops and every change is an instant cut | Partly met: the spec asks for restrained transitions, not cuts |
| Performance (20) | Compositor-only motion, enforced by tests; scroll weight profiled on a 4× throttled phone; Speed Insights collects field vitals | Gap: no written budget, and backdrop blur sits under every card |
| Component contract (16.6) | States table for all controls; component specs in `docs/design-spec.md` | Close: states and motion are specified, material and depth are not |

## Decision

Solini adopts BIO DIGITAL's methods, its structure and its rules of restraint, expressed in Solini's own lantern identity. It does not adopt the spec's palette, typefaces or day environment.

### Mapping

| BIO DIGITAL | Solini |
|-------------|--------|
| Carbon | The page: `parchment` under the dusk sky, and the unlit niche of a zero year |
| Porcelain | Opaque `manuscript` surfaces: the menu panel, inner panels in `manuscript-alt`, and every card under Reduce Transparency |
| Membrane | `.glass`: cards over the sky, the follow flame's disc |
| Crystal | Gold-edged light that marks meaning: the primary button, the threaded orb's gold edge, this year's lit thread |
| Living gradient | The dusk sky's glows and the tier light behind orbs and the reading |
| Organic form | The woven flame and its threads, and the hand-dyed threads under each orb |
| D0 to D4 | Sky and page, content on the page, glass cards, the menu and the follow flame, the open reading |
| R1, R2, R3, Pill | `rounded-md`, `rounded-xl`, `rounded-2xl`, `rounded-full` |
| Spring tokens | `SPRING` in `src/lib/motion.ts`, played in CSS through `springCurve()` |
| Ambient, Engaged, Immersed | First visit and this year's card; the reading; the Cycle view, the comparison and the companion pages |

### Conflicts and choices

Each place the spec and Solini disagree, and what Solini does.

1. **Palette.** The spec's Cloud, Mist, Sage and organic accents are a daylight palette. Solini keeps its lantern palette, because the night temple is its identity and the tier lights carry meaning the spec's accents would not. The spec's color rules (neutrals as the foundation, accents for meaning, never color alone, AA contrast, no absolute black) are already Solini's.
2. **Functional colors.** The spec's red Critical conflicts with Solini's rule that errors are ember, in words, with no red. Solini keeps ember: a numerology reading is not an emergency.
3. **Typography.** The spec prefers system fonts. Solini keeps Marcellus, Hanken Grotesk and its Khmer face, which are open fonts with system fallbacks, so the identity does not depend on a proprietary typeface, which is the spec's actual concern. Body text stays 17px rather than 16px, for the older readers on phones that Solini writes for.
4. **Day environment.** The spec defines light and dark environments. Solini stays dark only. A day mode would be a second identity to design and maintain, and the lantern light only reads at night.
5. **Elastic recovery.** The spec asks a pressed button to recover elastically. Solini's controls compress by 3%, and at that travel any overshoot a spring can add is a fraction of a pixel: invisible, but it would break Solini's no-overshoot rule. So the press is now a true spring (phase 1), critically damped. Elasticity stays where it can be seen, in the flame.
6. **Hover.** The spec gives cards a "proximity response" on hover; Solini's rule is that hover never moves anything. Solini keeps the rule, and any hover response is light (a brighter edge), never movement.
7. **Membrane as the default.** The spec says porcelain is the default and translucency is for floating surfaces. Solini does the reverse: glass is on every card and the floating menu is opaque. The dusk sky showing through the cards is part of the look, so this is not changed by decree; phase 3 measured what the blur costs and found no measurable cost, so the cards stay glass (see Phase 3 results below).
8. **Stack.** The spec suggests CSS Modules. Solini keeps Tailwind with tokens, which already centralizes design intent in tokens, and already uses Motion for React.

### Phases

Each phase is one PR, reviewed and checked on mobile, tablet and desktop.

1. **Foundations (this PR).** Name materials, depth, radius and density in the design language. Add spring tokens (`SPRING`, `springCurve()`) and play the press spring in CSS and Motion alike, with tests that keep the two equal and forbid overshoot. Add a performance budget to the shipping standard. The one visible change is the press: it used to jump to 0.97 in one frame (see the audit), and now compresses and recovers on one spring everywhere.
2. **Restrained Reduce Motion (shipped).** With Reduce Motion on, changes of state crossfade briefly in place instead of cutting, as Apple's platforms do; nothing moves, scales or loops. This follows the spec's "replace large movements with restrained transitions" and keeps state changes legible.
3. **Materials, measured (done: glass stays).** Profile the glass cards' backdrop blur over the moving sky. Results below.
4. **Spring transitions.** Move the remaining interactive motion that is still timed (the selection glide, the menu, the Year and Cycle switch) onto named springs where a spring describes it better, keeping choreographed sequences on their curves.
5. **Component contracts.** Give each component in `docs/design-spec.md` its material, depth and motion beside the states it already lists.

## Phase 3 results

Measured on a production build of the shared reading (`/r/1997-07-24`) in headless Chromium, emulating a 390×844 phone at 3× density with 4× CPU throttling. Each run compared the page as it is with the same page where every `.glass` card and the follow flame's disc is solid `manuscript` with no backdrop blur. Two to three runs each.

| Measure | Glass | Solid | Difference |
|---------|-------|-------|------------|
| Scrolling the whole page twice: frame interval, median and 95th percentile | 16.7ms, 16.7ms | 16.7ms, 16.8ms | None |
| Scrolling: compositor and display thread busy time | 683–705ms | 674–689ms | Within run-to-run noise |
| Idle for 3s: display thread busy time | 1181–1268ms | 1183–1288ms | Within run-to-run noise |

**Decision.** The blur shows no measurable cost, so in-flow cards stay membrane (glass) and the spec's porcelain-by-default is not adopted. The reason is identity: the dusk sky showing through the cards is part of Solini's look, and nothing measured argues against it.

**Limits of the evidence.** Headless Chromium composites in software, so this does not measure a phone's GPU, where blur cost lives. A real-device check needs Safari's Web Inspector on a Mac with an iPhone attached (Timeline, "Rendering Frames"). If that ever shows dropped frames while scrolling, revisit this choice.

**What the profile did find.** At rest, the page is not idle. With 4× throttling the main thread is busy about 18% of the time (about 530ms in 3s) and the display thread about 40%, all of it from living surfaces: with Reduce Motion both fall to almost nothing. Two pieces stand out:

- The woven flame's sway and drift run on SVG elements, which Chromium cannot animate on the compositor (the trace reports SVG targets with independent transform properties). Every sway frame goes through style, paint and commit on the main thread. Stopping the SVG animations saves about a fifth of the idle main-thread time.
- The drifting dust canvas redraws every frame by design.

This is the price of Continuous Vitality, which BIO DIGITAL asks to keep low-frequency and cheap. It is within budget here, since frames still land on time, but it costs battery on a phone left open.

**Follow-up: the flame moved to HTML.** `SoliniMark` now draws its threads as HTML elements on the same 64-unit grid, so the sway, drift and glow run on the compositor; it looks the same side by side. Measured the same way (3s at rest on the shared reading, old and new builds alternated over two rounds):

| Main-thread busy time at rest | Before | After |
|-------------------------------|--------|-------|
| As shipped | 744–797ms | 625–676ms |
| With the dust canvas's frame loop stopped | 586–667ms | 225–247ms |

The second row shows what the flame cost on its own. What remains at rest is mostly the dust canvas, which redraws on the main thread every frame.

**Follow-up: the dust moved to a worker.** `LanternSky` now hands its canvas to a worker (`dust.worker.ts`) as an OffscreenCanvas, and its own scroll-weight loop runs only while something is still moving, woken by a passive scroll listener. Measured the same way:

| Busy time at rest, per 3s | Before | After |
|---------------------------|--------|-------|
| Main thread | 625–695ms | 167–199ms |
| Dust worker | none | about 385ms |

The main thread is now nearly free at rest, so taps and scrolls never wait behind the dust. Total CPU fell less, about 650ms to 560ms: the drawing mostly moved rather than shrank, so the battery saving is modest. Browsers without OffscreenCanvas in workers draw on the main thread as before.

## Consequences

### Positive

- One vocabulary for surfaces, depth and motion, so a new component's treatment is chosen from a list rather than invented.
- Press feedback is physics, defined once and identical in CSS and Motion, with a test that fails if they drift or overshoot.
- The places Solini departs from the spec are written down, so they are deliberate rather than accidental, as the spec's own governance asks.

### Negative

- The design language grows longer. The mapping is kept to tables so it stays scannable.
- `linear()` easing needs Safari 17.2 or later; older browsers keep the previous timed curve, so the press feels as it did before.

## Related ADRs

- None. The rules themselves live in [the design language](../standards/design-language.md).

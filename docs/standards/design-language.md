# Design Language: Temple Lantern

Solini looks like a temple at night, lit by lanterns. The page is a deep violet dark, text is warm candle white, gold marks what matters, and each luck tier glows with its own light. It should feel calm and alive at once: slow light and drift in the background, quick and familiar responses under the finger.

This document holds the rules. Token values live in [`src/app/globals.css`](../../src/app/globals.css) (CSS) and [`src/lib/motion.ts`](../../src/lib/motion.ts) (Motion). Component specs live in [docs/design-spec.md](../design-spec.md).

## Principles

1. **Calm before clever.** Restraint is the style. One or two cultural motifs used consistently (the diamond ◇, lantern light, engraved line art) beat many used loosely.
2. **Familiar behavior.** Controls behave like their counterparts on iOS, Android and the web: tabs, radio groups, buttons, dialogs. No novel gestures that need explaining.
3. **Looks interactive if and only if it is.** Every control has a pointer cursor, a hover state on devices that hover, a visible focus ring and a pressed state. Static cards have none of these.
4. **One meaning per visual.** Gold-deep means "now" or "primary". An ink outline means "selected". The focus ring means "keyboard focus". Never reuse one for another.
5. **Light carries the tier.** Luck tiers are shown by the color of their lantern light, and always also by a symbol, so color is never the only signal.
6. **Living surfaces.** Anything that looks like a light, or like it floats, behaves like it. Glows breathe slowly, and the sky and the glass cards carry a little weight when the page scrolls: they trail a fast scroll and settle. The motion stays slow and small enough that a visitor notices calm, not movement, and it all stops with Reduce Motion. See [Living surfaces](#living-surfaces).

## Color

Use tokens through Tailwind classes (`text-ink`, `bg-manuscript`, `border-border`). Never write a raw hex value in a component; ESLint rejects it. The token names come from an earlier parchment palette, so "parchment" is the page and "ink" is the text.

| Token | Value | Role | Contrast |
|-------|-------|------|----------|
| `parchment` | `#17131C` | Page background, under the dusk sky | |
| `manuscript` | `#221C28` | Card surface (72% over the sky in `.glass`) | |
| `manuscript-alt` | `#2B2431` | Subtle separation inside a card | |
| `ink` | `#F1E8D8` | Primary text | 15:1 on the page |
| `ink-light` | `#B4A894` | Secondary text, labels, captions | 7.8:1 page, 7.1:1 card |
| `ink-faint` | `#85796B` | Placeholders and decoration only | 4.3:1, below AA for text |
| `gold` | `#C99A3E` | Decorative gold: the ◇ diamond, hairlines, hover borders | |
| `gold-deep` | `#E2B65A` | Gold that carries meaning: now, primary actions, focus ring, gold text | 9.7:1 |
| `gold-light` | `#F0CD8C` | Highlights inside gold glows | |
| `border` | `#3B3242` | Card edges, dividers, secondary button outlines | |
| `border-light` | `#2E2734` | Faint inner dividers | |

**Tier light.** Each tier has a solid color token for its symbol, text and thread, and a `--lamp` glow set by `data-tier` for the light inside orbs, the timeline's dots and the open reading.

| Tier | Numbers | Token | Value | Symbol |
|------|---------|-------|-------|--------|
| Very strong | 10–11 | `tier-very-strong` | `#BFE0A5` pale sage | ● |
| Strong | 7–9 | `tier-strong` | `#A9CC93` sage | ◕ |
| Moderate | 4–6 | `tier-moderate` | `#E2B65A` lamp gold | ◑ |
| Weak | 1–3 | `tier-weak` | `#D98A62` ember, also used for form errors | ◔ |
| Reset | 0 | `tier-zero` | `#0E0B11` an unlit niche | ⊙ |

**Weekday colors.** The cloth traditionally worn on each day, used only as a small swatch beside the color's name in the birth day panel. Never for text or surfaces.

| Token | Value | Day |
|-------|-------|-----|
| `day-sunday` | `#C4553F` | Red |
| `day-monday` | `#DB8F3C` | Orange |
| `day-tuesday` | `#9C6DC2` | Purple |
| `day-wednesday` | `#A8C66C` | Light green |
| `day-thursday` | `#3F8B56` | Dark green |
| `day-friday` | `#5182C6` | Blue |
| `day-saturday` | `#6B4B88` | Dark purple |

**Rules**

- Meaningful text uses `ink`, `ink-light` or `gold-deep`. `ink-faint` and `gold` are never used for text a reader needs.
- Gold is precious. Use `gold-deep` for "now", the primary action on a screen, the total score and section headings on companion pages. Do not fill large surfaces with gold.
- Errors use the ember tier color (`tier-weak`) with a message in words. No red, no shaking, no modals.
- Colors that cannot read CSS variables (link-preview images, the browser theme color, the web manifest) repeat the token values in [`src/lib/og-theme.ts`](../../src/lib/og-theme.ts), `layout.tsx` and `manifest.ts`. A test keeps them equal to the tokens.

## Typography

| Role | Face | Size and spacing | Where |
|------|------|------------------|-------|
| Display | Marcellus (`font-display`) | Title 36–72px, `tracking-[0.08em]`–`0.14em`, with `.title-glow` | Site and page titles, section headings, tier labels, the total score |
| Body | Hanken Grotesk (default sans) | 17px, line height 1.65 | Everything else |
| Label | Hanken Grotesk, uppercase | 14px (`text-sm`), `tracking-[0.12em]`–`0.18em` | Eyebrow text and short captions |
| Field label | Hanken Grotesk, sentence case | 16px (`text-base`) | Form field labels |
| Button | Hanken Grotesk 500–600, sentence case | 16–18px (`text-base`/`text-lg`) | Primary and pill buttons |
| Numbers | Hanken Grotesk 500, tabular lining figures | Varies | Every cycle number (the wheel, this year's number, threaded orbs, the worked example on How your cycle is made), dates, form fields |
| Khmer | Noto Serif Khmer | Matches its context | Any Khmer script (in both font stacks) |

- Marcellus draws 0 like the letter O and 11 like "ll", so any number from 0 to 11 uses the sans face with `tabular-nums`, even where it sits beside display type. The total score (52, 64 or 76) is the one number set in Marcellus, since none of its digits can be misread.
- Guidance and quiet asides may be italic body text. Do not add new typefaces.
- Keep letter spacing to the values above, so labels and buttons share one rhythm.
- Running text, notes and links on the home page and the reading are at least 14px. Many visitors are older readers on phones; reserve 12px, and nothing smaller, for labels inside the wheel, the timeline and the worked rows on How your cycle is made, where space is fixed.

## Spacing, layout and shape

- **Spacing** follows Tailwind's 4px scale, used in 8px steps for layout: 8, 16, 24, 32, 48, 64, 96. Sections breathe; cramped feels anxious.
- **Gutters** come from `.safe-gutter`: 16px on phones and 32px from 640px, widened to clear the notch in landscape.
- **Widths.** The form card is at most 480px, reading text at most 640px, the cycle card at most 900px (1200px from `xl`).
- **Radii.** Cards and panels `rounded-2xl`. Buttons, pills, toggles and orbs `rounded-full`. Small cells and inputs `rounded-md` to `rounded-xl`. Nothing square-cornered, nothing bubbly.
- **Surfaces.** Cards are `.glass`: the manuscript color at 72% over the sky, a 14px backdrop blur, a 1px `border` edge and `--shadow-card`. A faint gold glint slides along each card's rim as it scrolls, and cards trail a fast scroll by up to 3px (see Living surfaces). With Reduce Transparency the card is solid manuscript with no blur and no glint. Raised overlays use `--shadow-raised`; gold glows use `--shadow-glow`, and a glow that is always on breathes (`.breathe-glow`).
- **Dividers** are a hairline that fades out at both ends with a gold ◇ in the middle (`SectionDivider`).
- **Breakpoints.** Every screen must work from 320px wide up. Check at least 320px (small phone), 768px (tablet) and 1280px (desktop). No horizontal page scroll and no clipped or truncated text at any width.

## Iconography

- **Zodiac animals** are the custom `ZodiacIcon` set in [`src/components/ui/zodiac-icon.tsx`](../../src/components/ui/zodiac-icon.tsx): engraved line marks on a 32-unit grid, 1.5 stroke, round caps and joins, colored by `currentColor`. They appear around the wheel, in the wheel's center, in the reading, on the form and on share images (through `ZODIAC_ICON_PATHS`). Keep them wherever an animal is named. A new animal mark must follow the same grid and stroke.
- Icons are decorative by default (`aria-hidden`), because the animal's name is always written beside them. Pass `title` only when an icon stands alone.
- Selected or "now" animals are `text-gold-deep`; others are `text-ink-light` or `text-gold`.
- **Tier symbols** (● ◕ ◑ ◔ ⊙) are drawn with `TierIcon` (`components/ui/tier-icon.tsx`), an SVG that is always `aria-hidden="true"`, with the meaning carried by the parent's `aria-label` or visible text. Don't render the Unicode glyphs on the page: each comes from whichever font has it, so they show at different sizes side by side (on iOS, ● is about half the size of ◑). The Satori preview images are the exception, since they can't use the component.
- Interface glyphs (close, share, arrows) are simple inline SVG strokes that match the zodiac line weight. Do not add an icon library.
- **The app icon** (`src/app/icon.svg`, with `favicon.ico` and `apple-icon.png` rendered from it) is the woven flame: twelve gold threads, one for each year of the cycle, laid one above the next so that together they make a flame leaning right, with one thread lit for "now". The threads follow *chong kiet*, Khmer ikat, in which the pattern is dyed into the weft before the cloth is woven. Keep exactly twelve threads with rounded ends, and keep the lit one the eighth from the top. Change all three files together; the Apple icon fills its square with the page color, since iOS rounds the corners itself.

### The lantern motif

A lantern is Solini's one central image: each year of the cycle is a light, and the app itself is a lantern lit in thanks to Solini and in memory of those lost in the Khmer Rouge genocide. Carry it through light, not through pictures of lanterns.

- **A year's number, shown as a mark, is a threaded orb** (`.wheel-orb` with `data-tier`, and a `.wheel-thread` inside): a dark orb shaded as a sphere lit from above, holding its tier's lantern light low inside it and backlit by the same light, which glows close around its edge from behind; a warm gold hairline edge; and, under the number, one hand-dyed thread in its tier's color, like the threads of the woven flame. Threads fade at both ends and neighbors differ a little in length and place, so the ring reads as woven by hand, not as a gauge. The backlight stays close to the orb rather than washing the wheel. This year's thread is lit `gold-light`, as the flame's lit thread is. It is used on the cycle wheel, on What the numbers mean and on the share images (`threadedOrb()` in `og-theme.ts`). Zero is an unlit niche with a short, faint thread. Numbers inside running text, tables and the worked rows on How your cycle is made stay plain, because they are arithmetic, not readings.
- **The setting is lantern light:** the dusk sky's glows, the lit input wells, the three lantern stops of the total score, and gold glows that breathe.
- **In words,** "lantern" appears in the brand line, on About and in the home page's closing line. Don't add it to buttons, labels or headings that must say plainly what they do: "Reveal my cycle" stays plain. The not-found page ("No lantern here") is the one playful use.
- **The woven flame is the only drawn image of the lantern's light.** It appears as the app icon, above the title on the home page (`SoliniMark woven reactive`, which weaves itself in, bottom thread first, as the title kindles, then keeps drifting and swaying and answers the pointer, the phone's tilt and the scroll) and beside the Solini link at the top of the other pages. Don't add other lantern or flame illustrations or icons; one image used everywhere stops meaning anything.

## Interaction

**States every control has**

| State | Treatment |
|-------|-----------|
| Rest | Clear affordance: an outline, a pill or an orb. Pointer cursor (set globally for buttons, tabs and options). |
| Hover | Only on devices that hover (Tailwind 4's `hover:` already applies only there). Brighten or fill; never move. |
| Focus | 2px `gold-deep` outline, 2px offset, from the global `:focus-visible` rule. Do not remove it or restyle it per component. |
| Pressed | Scale to 0.97 on a quick, no-bounce response: `pressable active:scale-[0.97]` in CSS, or `whileTap={{ scale: PRESS.scale, transition: PRESS.spring }}` in Motion. Inline text links dim instead of scaling. |
| Selected | A 1px ink outline (`ring-1 ring-ink`) that glides to the new choice with a shared `<ViewTransition>`. Gold is never used for "selected". |
| Disabled | Lower opacity, default cursor, no hover or press. |

**Buttons**

- **Primary** (one per screen at most): a solid `gold-deep` pill with `parchment` text, sentence case, at least 56px tall, with a breathing gold glow (`.breathe-glow`). On hover it lightens to `gold-light`. It is the one filled shape on its screen, so the next step is never in doubt.
- **Accent**: `gold-deep` outline pill, at least 44px tall, for the main action of a section that is not the screen's next step (Share). On hover it fills with `gold-deep` and text turns `parchment`.
- **Secondary**: `border` outline pill, `ink-light` text, at least 44px tall. On hover the text turns `ink` and the border `gold`.
- **Text links**: `ink-light` or `gold-deep` text, underline or color change on hover, dim when pressed.

**Patterns**

- Selection changes run inside `startTransition`, so React `<ViewTransition>` glides the selection outline and crossfades the content. The wheel, the timeline and the New Year toggle all work this way, and new choosers must too.
- Groups of choices use the platform pattern: `tablist`/`tab` for the wheel and timeline, `radiogroup`/`radio` for the toggle. One Tab stop per group (roving `tabindex`), arrow keys to move, Home and End to jump.
- Dialogs and expanded readings move focus to their close button, close on Escape, on Close and on a tap outside, and return focus to what opened them. The content behind is `inert`.
- Touch targets are at least 44×44px.

## Motion

Motion explains a change or gives a surface slow, ambient life. It is never a spectacle and never blocks reading or tapping.

**Tokens** (CSS custom properties in `globals.css`, the same values in `MOTION`, `EASE` and `PRESS` in `src/lib/motion.ts`; a test keeps them in step)

| Token | Value | Use |
|-------|-------|-----|
| `--duration-press` / `MOTION.press` | 100ms | Pressed feedback |
| `--duration-quick` / `MOTION.quick` | 150ms | Hover, focus, color changes, content leaving |
| `--duration-standard` / `MOTION.standard` | 250ms | Selection changes, content swaps |
| `--duration-gentle` / `MOTION.gentle` | 400ms | Entrances |
| `--duration-morph` | 520ms | A card changing into another in place, and the blocks that move with it (CSS only) |
| `--ease-enter` / `EASE.enter` | `cubic-bezier(0.05, 0.7, 0.1, 1)` | Things arriving |
| `--ease-standard` / `EASE.standard` | `cubic-bezier(0.2, 0, 0, 1)` | Things changing in place |
| `--ease-exit` / `EASE.exit` | `cubic-bezier(0.3, 0, 0.8, 0.15)` | Things leaving |
| `--ease-sine` | `cubic-bezier(0.37, 0, 0.63, 1)` | Ambient breathing that runs back and forth (CSS only) |
| `PRESS` | scale 0.97, spring with no bounce | Pressed feedback in Motion |
| `--breathe-duration` | 6.5s each way | One breath of a living glow |
| `--breathe-low` / `--breathe-rest` | 0.64 / 0.82 | A glow's dimmest point, and where it rests with Reduce Motion |
| `SCROLL_WEIGHT` | 0.09s lag, at most 120px of trail, cards at most 3px | Scroll weight (JavaScript only) |

The curves are Material 3's. They sit close to Apple's no-overshoot springs, which is what makes the app feel familiar.

**Rules**

1. Use the tokens. Do not write raw durations or curves for interface motion. Longer one-off choreography (the 1.6s title "kindle", the woven flame's weave, the 900ms `.rise`, the 1.6s gold arc trace) is defined once in `globals.css` and reused by class.
2. Interface movement stays small: 10px or less of travel, scale between 0.97 and 1. No bounce or overshoot.
3. Animate `transform`, `translate`, `opacity` and `filter` only, so the compositor does the work. Never animate a property that changes layout (`height`, grid rows, `letter-spacing`, margins): every frame would lay out and repaint the page, glass blur included, and on a phone that shows as jitter. When content must change size, lay it out once and glide what moved, as `<Reveal>` does; its rounded `clip-path` sweep is the one allowed paint-only property. Scroll-linked effects use CSS scroll-driven animation (`animation-timeline`) where the motion is tied to the scroll position. The exceptions are scroll weight, which needs a spring and so runs in `LanternSky`'s existing frame loop, and the home page's woven flame, which follows the scroll with a spring of its own while the page moves (see below). No other scroll listeners.
4. Entrances fade and settle (`.rise`, `.animate-settle-in`, `.scroll-settle`). Exits are quicker than entrances.
5. **Loops are for living surfaces only.** A loop must be one of the living surfaces below: slow, small, symmetric (`--ease-sine`, or linear for a turning ring), decorative and fully off with Reduce Motion. Script-driven loops (canvas, timers) also pause while the tab is hidden; browsers already do this for CSS animation. Tailwind's `animate-pulse`, `animate-spin`, `animate-bounce` and `animate-ping` are too fast and too large, and ESLint rejects them.
6. **Every state change is a transition.** Nothing appears, disappears or jumps in one frame. Use the shared transitions below; do not invent new ones for a single component.
7. **Reduce Motion** turns everything off: nothing moves, scales or loops, and changes are instant. Glows rest at `--breathe-rest`, so the page looks the same, only still. CSS is covered by the global rule in `globals.css`; JavaScript animation uses `<MotionConfig reducedMotion="user">` at the root or `useReducedMotion()`.

### Living surfaces

Glows breathe and floating things carry weight. Add a new living surface to this table, with its limits, in the PR that introduces it.

**Breathing glows.** Every gold glow is a light of its own behind the element (an `::after` layer), and only its opacity moves, between `--breathe-low` and full over `--breathe-duration` each way on `--ease-sine`. The glow is drawn about 22% brighter than its old static look, so on average it sits where it was. Each kind of glow starts at a different point in the breath (`--breathe-delay`), so neighbors never pulse together. Glows that show a state (the focused date field, a hovered button) hold steady, because a pulse there would read as a warning.

**Scroll weight.** One critically damped spring (`stepScrollSpring` in `src/lib/motion.ts`) trails the scroll position with a 0.09s time constant. The sky's glows trail it by 15–55% of the lag, nearer lights more; glass cards on screen drift with a softer copy of it, up to 3px. The trail is capped at 120px, and a jump over 600px (an anchor link, a route change) snaps instead of swinging. It never overshoots. Only `translate` moves, through paused Web Animations that each frame seeks, and only while something is moving. On a 4× throttled phone profile it adds about 7% to scroll frame time; check a real phone when changing it.

| Living surface | Where | Limits |
|--------|-------|--------|
| Title and number glow | `.title-glow` (site and page titles, this year's number, the wheel's center number, the total score) | A pool of `gold-deep` light behind the lettering breathes; the lettering's own text shadow holds still. |
| Primary and current glow | `.breathe-glow` (the primary button, the timeline's current year) | The `--shadow-glow` light around the shape breathes, 2.2s out of step with the titles. |
| Sky glows | `.sky-glow` | Each breathes at its own pace (5.8–7.4s). Scroll-linked parallax as well: about 0.4× and 0.15× the page speed over the first 1300px, plus scroll weight. Still with Reduce Motion; without scroll-driven animation support they breathe and trail but do not rise. |
| Glass weight | `.glass` | Scroll weight only: cards on screen drift up to 3px behind a fast scroll, every third card a touch more, then settle. |
| Drifting dust | `LanternSky` canvas, behind every page | 38 specks rising over 20–60s with a slow flicker, sliding a little with the scroll. Paused while the tab is hidden. Drawn once, still, with Reduce Motion. |
| Glass light | `.glass::before`, `.glass::after` | Scroll-linked (`view()` timeline), not time-based: as a card crosses the viewport a gold glint (`gold-light` at 45%) slides along its rim from right to left and a 3.5% candle-white glow crosses its face. `background-position` on the card's own pseudo-elements only. Hidden with Reduce Motion, Reduce Transparency, or without scroll-driven animation support. |
| Current-year pulse | Cycle wheel, this year's orb (`.wheel-orb-current::after`) | A small gold halo (12px) that breathes in and out, 1.8s each way, on the current year only. Faster than other glows on purpose: it marks "now". |
| Lit thread | Cycle wheel, this year's thread (`.wheel-orb-current .wheel-thread::after`) | The gold light around the lit thread breathes with the woven flame's glow timing (6.5s each way, 4.4s into the breath). |
| Month dial | Cycle wheel, this month's arc around this year's orb (`.wheel-month-now`) | The arc for the current month of the year breathes between half and full light, 2.4s each way, in step with "now" rather than with the slower lanterns. |
| Backlight and number float | Every threaded orb (`.wheel-orb::before`, `.wheel-orb-number`): the wheel and the number orbs on What the numbers mean | The light behind each orb breathes between `--breathe-low` and full and swells from 0.98 to 1.06 of the orb's size, at its own pace (5–8.6s), while a wheel orb's number floats about 1px. |
| Tick ring | `.wheel-ticks` | A fine tick ring turns once every 3 minutes. |
| Tap ripple | `.wheel-ripple-run` | One ring spreads from a tapped orb (600ms). Runs once per tap, not a loop. |
| Wheel depth | `.wheel-depth-ring`, `.wheel-depth-hub` | Scroll-linked (`view()` timeline): the ring and the center shift up to 6px apart as the wheel scrolls through the viewport. |
| Woven flame glow, drift and sway | `.mark-glow`, `.mark-drift`, `.mark-sway` in `SoliniMark` (home title, page headers) | Never quite still. The light behind the lit thread breathes with the title glow's timing, 4.4s out of step. The whole flame drifts, leaning 2.5° each way and reaching up 1.5%, over 5.5s each way, pivoting on its base. Each thread sways side to side (2.6–3.3s each way, `--ease-sine`), at most about 2 units of the 64-unit mark at the tip and a quarter unit at the base, in a ripple that climbs from base to tip (`threadSway()`). |
| Flame response | The home page's `SoliniMark reactive` | The flame leans toward a mouse or pen, up to 10° when it is half a screen away. On a phone it stays upright as the phone tilts, so on screen it leans against the tilt, reaching 10° at 30° of tilt (`flameTilt`). Where the browser must ask before sharing the tilt (iPhone, recent Chrome), an invisible 44px button over the flame, labeled "Let the flame follow your phone's tilt", asks once on tap. The flame also squats or stretches up to 12% as the page scrolls down or up. Both follow one slow spring (`FLAME_MOTION`, 0.28s, no overshoot) and pivot on the flame's base. Written by seeking paused animations, only while something moves. A finger moves it only through the scroll and the tilt. Off with Reduce Motion. |
| Return to now | Cycle wheel selection (`RETURN_TO_CURRENT_MS`) | After 9s with no tap, key, scroll or wheel anywhere on the page, the selection glides back to the current year. Never while a reading is open, while a mouse hovers the wheel, or while keyboard focus is inside it. |

Looping rules live only under `@media (prefers-reduced-motion: no-preference)` on the selectors above (`.wheel-`, `.sky-glow`, `.title-glow`, `.breathe-glow`, `.mark-glow`, `.mark-drift`, `.mark-sway`), use `--ease-sine` or linear, and the shared breath lasts at least 4s and never dims below half. `reduced-motion.test.ts` fails the build otherwise. A new living surface needs a row here and its selector added to that test.

### Transitions

Every change of state uses one of these. Old content leaves quickly (`--duration-quick`, `--ease-exit`) so it never competes with the new; new content arrives more gently (`--duration-gentle`, `--ease-enter`), rising a few pixels as it fades in. With Reduce Motion each is an instant cut.

| Transition | Where | Behavior |
|------------|-------|----------|
| Page change | Every route change (`src/app/template.tsx`) | The page being left fades out in 150ms; the new page rises 8px and fades in over 400ms. Named elements inside a page keep their own transitions. The new page lands already at its top, or at the linked section, inside the transition: `data-scroll-behavior="smooth"` on `<html>` tells Next.js to switch smooth scrolling off during navigation, so the page never glides there afterward. |
| Menu | The site menu (`SiteMenu`, `.menu-panel` in globals.css) | The list grows from the Menu button's corner (scale 0.96 to 1, rising 6px) and fades in; each line then settles in 35ms after the one above it, over 400ms. The icon's lines turn into a close mark. It folds away in 150ms, all at once. |
| Reveal | Disclosures and anything that appears in the flow of the page: the New Year toggle's "Change" and its summary line, the total score's scale, the date form's derived zodiac line and its error messages, the comparison's "How to read this", and the one-time update note (`<Reveal>` in `components/ui/reveal.tsx`) | The page takes its new shape in one layout. Content below then slides from where it was to its new place (`transform`), every card around the disclosure grows by sweeping its bottom edge with a rounded `clip-path`, and the content is wiped open with the same sweep while it fades and settles in. Opening takes 400ms, closing 250ms, both on `--ease-standard` so the motion starts gently instead of leaping. Closing plays the glide back and only then lets the page shrink; toggling mid-way reverses it from where it is. Closed content takes no space and is inert. Content that goes away when closed (a fixed error) keeps showing while it folds, through `useLastPresent`. |
| Settle in | Status messages in a line that already holds their space: share and copy messages (`.animate-settle-in`) | Fades in and rises 4px over 250ms. A status message is keyed so each new one settles in. Anything that would push content down uses Reveal instead. |
| Hint crossfade | Text that changes with a state, such as the hint under the wheel | Every version shares one grid cell, so the line keeps the height of the longest and nothing below moves; the versions crossfade over 250ms. |
| Selection glide | The wheel, the timeline, the New Year toggle, and the reading's "Year / Cycle" switch; the partner comparison's cycle stepper crossfades its table the same way without an outline | The ink outline glides to the new choice; the content beneath crossfades (out in 150ms, in over 250ms, class `panel-swap`). |
| Wheel bloom | The cycle wheel | Tapping the wheel's center, or the selected orb again, grows the full reading out of the center with a shared-element view transition and folds it back the same way. |
| Form morph ("Bloom") | The birth date form | Submitting the birth date form morphs the form card into the reading in place instead of scrolling down the page. A shared-element view transition (`reading-card`, class `reading-bloom`) grows the card over 520ms (`--ease-standard`); the form fades out in 320ms and the reading scales up from 0.96 over 520ms (`--ease-enter`). A gold glow swells and fades inside the card over 900ms. A quiet "Someone else?" text link beside the date folds it back the same way with a quick fade-out (`--duration-quick`), and "Back to the reading" returns. "Forget my date" crossfades the form back to the first-visit form the same way. The partner comparison morphs between its button, its form and its result on the same transition (`compare-card`). The group clips to the card's rounded edge, so nothing is drawn outside the card while it grows. The page scrolls only if the card's top would sit above the viewport. |
| Follow | The blocks below the reading card on the home page (timeline, comparison, share, links, footer) | Each sits in its own `<ViewTransition>`. When a card above them changes size they glide to their new place on the card's clock (`--duration-morph` during a morph) so they track its edge; as the reading blooms in or folds away they rise in or fade out with it (`rise-in` and `fade-out`, the same classes as a page change). |
| Scroll settle | Sections entering the viewport (`.scroll-settle`) | Scroll-linked: fades in and rises 12px over the first 60% of its entry. |
| Smooth scroll | In-page anchors and recentering | `scroll-behavior: smooth`; instant with Reduce Motion. |

## Accessibility

Accessibility is part of the design language, not a separate pass.

- Text contrast meets WCAG AA (4.5:1 for body text, 3:1 for large text and focus indicators). The token table above says which tokens qualify.
- Color is never the only signal: tiers have symbols, errors have words, selection has an outline.
- Every interactive element is reachable and operable by keyboard, with the focus ring visible.
- Icons and symbols that repeat nearby text are `aria-hidden`; the accessible name is on the control.
- Live changes that matter are announced: notes and confirmations with `aria-live="polite"` or `role="status"`, form errors with `role="alert"`.
- Reduce Motion is honored everywhere, as above. Reduce Transparency makes cards solid and removes the glass light.

# Writing Standard

Words are part of the design. This covers the copy visitors read, and the commit messages and PR descriptions collaborators read.

## Voice

Solini speaks like a calm, knowledgeable guide to a family tradition: warm, plain and unhurried.

- **Reflective, not predictive.** Readings are for reflection. Say "a year to build", not "you will succeed". Never promise outcomes about health, money or relationships.
- **Plain words, short sentences.** Explain Khmer terms the first time they appear (Margasir, the twelve animals) and then use them consistently.
- **Open about the method.** Say where a reading comes from and how sure it is. When a result rests on a choice Solini made rather than a family rule (a gap in the rules, a default between traditions), say so in one or two plain sentences and name it as Solini's choice, so the visitor can weigh it: "The family's rules don't cover … Solini reads that as mixed too, because … That part is our choice, not a family rule." Put it where the method is explained and link the result there, rather than adding a caveat under the result. Don't hide uncertainty behind confident copy, and don't bury it in a footnote.
- **Respectful of the tradition.** Describe the method as one Cambodian practice among several, and say where families differ (for example, Khmer New Year versus Chinese New Year).
- **Calm in every state.** Errors say what happened and what to do next, in one sentence, without blame or alarm: "Enter a month from 1 to 12."
- **Direct address.** Talk to the visitor as "you". Buttons say what they do ("Reveal My Cycle", "Copy link"), not "Submit" or "OK".

## Spelling and style

- **American English everywhere**: user-facing copy, code, comments, tests and docs. Write color, center, behavior, favorite, gray, personalize, recognize, organize, analyze, canceled, traveling. A test (`src/lib/__tests__/standards.test.ts`) fails the build on common British spellings in `src/`, `docs/` and the top-level Markdown files.
- Use digits for cycle numbers, years and anything a visitor compares ("cycle number 8", "every 12 years").
- Dates in copy read naturally ("July 24, 1997"). Dates in URLs and code are ISO (`1997-07-24`).
- Use the en dash for ranges (10–11). In running copy, prefer a comma, colon or new sentence to an em dash; page titles use "Page — Solini".

## Names

- The product is **Solini** in anything a visitor sees: titles, metadata, share text, help text. "Khmer numerology" is the descriptive subtitle, and "A lantern for every year in your cycle" is the one brand line (`SITE_TAGLINE` in `site-copy.ts`). Don't coin other taglines.
- A reading opened from someone else's share link isn't the visitor's. Say "their" or "this reading" there, never "your".
- The repo, package and internal identifiers keep `numerology-app`, `numerology` and `cycle`. Do not rename them for branding.
- Use the app's own terms consistently: cycle, cycle number, luck tier (very strong, strong, moderate, weak, reset), life area, zodiac animal, New Year rule, reading.
- Shared copy (site title, descriptions, share text) lives in `src/lib/site-copy.ts`, so it is written once.

## Commit messages

Commits are the project's history. Write them for a teammate reading `git log` a year from now.

- Use a conventional prefix: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`, or `copy:` for copy-only changes.
- Subject line: imperative mood, at most about 72 characters, no trailing period. "fix: close the reading on taps outside it", not "fixed bug".
- Body (when the change is not obvious): what changed and why, wrapped at about 72 characters. Mention the user-visible effect and any trade-off.
- Doc, backlog and test updates go in the same commit as the code they describe.
- Include the `Co-Authored-By:` trailer when the work was AI-assisted.

## Pull request titles and descriptions

Write like a technical writer: describe what changed, why, and how it was verified.

- **Title**: a clear sentence-case summary of the change, in the same style as a commit subject.
- **Description**: start with a short summary, then the changes grouped by area, then verification (commands run, viewports checked, screenshots). Fill in the PR template.
- Describe the change on its own merits. Do not narrate the conversation that produced it: no "Danny said", "as requested", "per the thread" or similar. The required attribution header at the top of a PR body is the only exception.
- Call out anything a reviewer must decide or check by hand, such as testing on a real iPhone in Safari, in its own short section.
- Keep it factual. No marketing language, no filler, no emoji in headings.

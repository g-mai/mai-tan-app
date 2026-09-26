# Homepage visual refresh implementation plan

## Status

- **State:** Ready for implementation
- **Scope:** Public homepage, shared visual tokens, and regression checks for authenticated screens
- **Primary route:** `/`
- **Primary files:** `src/styles.css`, `src/routes/index.tsx`, and `src/components/home/*`
- **Out of scope:** New product features, a new marketing CMS, a full authenticated-app redesign, and new visual-regression infrastructure

## Objective

Make the public homepage feel calmer, more polished, and easier to scan while preserving its technical character. The refresh should:

1. establish a clear hierarchy instead of giving every element equal emphasis;
2. reduce the number of sections, cards, pills, borders, and decorative effects;
3. use a readable sans-serif stack for normal interface text and reserve monospace for technical details;
4. give dark mode distinct, legible surface levels and accessible text/accent contrast;
5. simplify the hero and navigation on narrow screens;
6. ensure every marketing claim matches the product that exists today; and
7. avoid regressions in authenticated pages that share the global theme tokens.

## Success criteria

The work is complete when all of the following are true:

- The homepage has four primary content stages: hero, benefits, capabilities, and final CTA.
- The technology list is a quiet supporting row rather than a prominent cloud of pills.
- The detailed roadmap is no longer rendered on the homepage.
- The body, headings, navigation, and buttons use a proportional sans-serif stack.
- Monospace is limited to code, URLs, compact metadata, and occasional technical eyebrow labels.
- Light and dark modes both have an obvious background/surface/border hierarchy.
- All normal-sized text has a contrast ratio of at least `4.5:1` against its rendered background.
- Large text has a contrast ratio of at least `3:1`.
- Focus indicators and meaningful non-text control boundaries meet `3:1` where WCAG requires it.
- The homepage has no horizontal overflow at `320px` viewport width.
- The hero preview remains understandable at `320px`, `390px`, `768px`, and desktop widths.
- Header controls fit without overlap at `320px` and do not require a hamburger menu.
- The page has one primary action at each decision point.
- `pnpm check`, `pnpm typecheck`, `pnpm test`, and `pnpm build` pass.
- The authenticated shell, login, registration, onboarding, dashboard, and settings screens remain readable in both themes.

## Current-state findings

### 1. Too many elements receive the same emphasis

The homepage currently renders six successive sections:

1. hero;
2. technology stack;
3. “why” benefits;
4. feature cards;
5. detailed roadmap; and
6. final CTA.

The “why,” feature, and roadmap sections all use grids of bordered cards. Most sections also have a border, an eyebrow label, a heading, and a similar vertical rhythm. This creates repetition without a strong narrative progression.

### 2. Decorative treatments are repeated instead of prioritized

The current visual language includes:

- offset black shadows;
- card borders;
- pill tags;
- monospace labels;
- teal and orange accents;
- background grids;
- hover translation; and
- rounded containers.

These can remain part of the brand, but each should have a specific job. The homepage currently uses several of them in nearly every section, so none of them feels intentional.

### 3. The default “sans” font is monospace

Both theme blocks in `src/styles.css` currently set `--font-sans` to `Geist Mono`. The root document applies `font-sans` to the entire body, which means the app is effectively monospace by default even before individual `font-mono` classes are considered.

### 4. Dark surfaces do not communicate elevation

The current dark tokens use a card color that is slightly darker than the page background. The border is only marginally lighter than the background. Approximate current contrasts are:

| Pair | Approximate ratio | Finding |
| --- | ---: | --- |
| Dark card / dark background | `1.08:1` | Surface boundary is difficult to perceive |
| Dark border / dark background | `1.09:1` | Border is effectively invisible |
| Dark primary text / dark background | `3.38:1` | Fails normal-text target |
| Dark secondary text / dark background | `4.11:1` | Fails normal-text target |
| Light muted text / light background | `4.20:1` | Fails normal-text target |
| Light text / solid dark secondary | `4.00:1` | Fails normal-text target |

The implementation must recalculate contrast after compositing alpha colors over their actual backgrounds; comparing raw token values alone is not sufficient.

### 5. The hero contains competing actions

The header already provides Login and Get started actions. The hero repeats account creation, an “already have an account” block, Login, GitHub, two technical proof points, a badge, and a detailed product mock. The quantity of useful information makes the primary conversion path less obvious.

### 6. The mock dashboard is fragile on small screens

The preview always uses a fixed `150px` sidebar. On a `320px` viewport, after page padding and the preview border, too little room remains for the member list. Tiny type down to `10.5px` further reduces legibility.

### 7. Marketing copy is not fully aligned with the repository roadmap

Examples to verify during implementation:

- The hero says billing is already wired, while `docs/dev/roadmap.md` describes billing as future work.
- The public roadmap says guided onboarding is coming next, while the repository roadmap says onboarding is complete.
- “No half-finished screens” conflicts with the documented work-in-progress notices.

Use working routes and `docs/dev/roadmap.md` as the source of truth. Do not make the product sound more complete than it is.

## Design direction

Use a **quiet technical** direction:

- clean proportional typography for reading;
- monospace used sparingly to signal technical detail;
- teal as the primary interactive/brand color;
- orange reserved for status, highlights, and small moments of warmth;
- neutral surfaces with clear elevation;
- one detailed visual centerpiece rather than many decorated cards; and
- generous negative space around important content.

This is an evolution of the current identity, not a switch to a generic corporate landing page.

## Target homepage structure

The final route should render this sequence:

```text
HomeHeader
main
  HomeHero
  HomeTechStack       (compact supporting row)
  HomeWhy             (three unboxed benefits)
  HomeFeatures        (capabilities presentation)
  HomeCta
Footer
```

`HomeRoadmap` should be removed from the route. Do not add a new public roadmap route during this work. The maintained product roadmap remains `docs/dev/roadmap.md`. If `HomeRoadmap` has no remaining imports after the route change, delete `src/components/home/home-roadmap.tsx` in the same change rather than leaving an orphan.

## Implementation sequence

Implement in the following order so each phase can be evaluated independently.

### Phase 0 — Record the baseline

#### Tasks

1. Start the app with `pnpm dev` and record screenshots before changing code.
2. Capture the following viewport sizes in light and dark mode:
   - `1440 × 900` desktop;
   - `1024 × 768` small desktop/tablet landscape;
   - `768 × 1024` tablet portrait;
   - `390 × 844` common mobile; and
   - `320 × 568` minimum supported mobile check.
3. Capture at least these routes:
   - `/`;
   - `/login`;
   - `/register`;
   - `/onboarding` or the first accessible onboarding step;
   - `/dashboard`; and
   - one organization/settings screen.
4. Note visible problems separately from intended differences. In particular, record:
   - header wrapping;
   - horizontal overflow;
   - text that becomes hard to read;
   - cards that disappear into the background;
   - overly dense sections; and
   - components that rely on the current shadow shape.

#### Verification

- A before-state reference exists for every viewport/theme combination used in final QA.
- No code is changed during this phase.

### Phase 1 — Correct typography and global theme foundations

#### Files

- `src/styles.css`
- `src/routes/__root.tsx` only if a body-level class or metadata adjustment is required

#### Typography tasks

1. Replace the current `--font-sans` value in both light and dark token blocks with a proportional system stack:

   ```css
   ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
   ```

   Use the system stack for this pass to avoid a font download, layout shift, privacy dependency, or new package. A branded webfont can be evaluated separately after layout and contrast are stable.

2. Replace `--font-mono` with a resilient system monospace stack if JetBrains Mono is not actually loaded:

   ```css
   ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace
   ```

3. Remove duplicate font declarations from `.dark`. Font families are theme-independent and should be declared once under `:root`.
4. Keep `font-sans` on the root body.
5. Audit homepage `font-mono` usage. Retain it only for:
   - eyebrow labels;
   - URL/code fragments;
   - compact mock-application metadata; and
   - technical stack names if the result remains readable.
6. Remove monospace from normal navigation, card titles, buttons, explanatory copy, and the footer sentence.
7. Keep normal body copy at `14px` or larger, with `15–16px` preferred for marketing copy. Do not use text below `12px` in the public page or product preview.

#### Color-token tasks

1. Preserve semantic token usage. Components should use `background`, `card`, `muted`, `border`, `foreground`, `muted-foreground`, `primary`, `secondary`, and their foreground pairs instead of raw light/dark colors.
2. Adjust the light theme so `muted-foreground` reaches at least `4.5:1` on both `background` and `card`.
3. Rebuild the dark surface ladder in this order:
   - `background`: darkest page layer;
   - `card`/`popover`/`sidebar`: slightly lighter raised layer;
   - `muted`/`accent`: a further visible state or inset layer;
   - `border`/`input`: lighter than the adjacent surface; and
   - `foreground`/`muted-foreground`: readable text levels.
4. Use the following as starting ranges rather than immutable values:

   | Token | Suggested dark-mode OKLCH lightness |
   | --- | ---: |
   | `background` | `0.15–0.17` |
   | `card` / `popover` / `sidebar` | `0.21–0.23` |
   | `muted` / `accent` | `0.25–0.28` |
   | `border` / `input` | `0.32–0.36` |
   | `foreground` | `0.92–0.95` |
   | `muted-foreground` | `0.68–0.72` |

5. In dark mode, make the teal primary brighter and use a dark `primary-foreground`. This allows:
   - teal text/icons to be readable on a dark page;
   - dark text to be readable on a bright teal button; and
   - a clearer active state in the authenticated shell.
6. Apply the same principle to the orange secondary color: brighter orange in dark mode with a dark foreground when it is used as a solid fill.
7. Do not use `text-primary` as a decorative low-contrast color on tiny text. If an accent cannot meet `4.5:1`, use it for a non-text flourish and keep the text neutral.
8. Check destructive colors, focus rings, inputs, disabled states, selection color, sidebar tokens, and popovers after changing the shared palette.

#### Shadow tasks

1. Stop introducing new arbitrary shadow declarations such as `shadow-[2px_2px_...]`.
2. Replace homepage arbitrary shadows with `shadow-xs`, `shadow-sm`, or `shadow-md` according to elevation.
3. Reserve the offset-shadow treatment for one signature element: the hero product preview.
4. Tune the global shadow tokens so:
   - light mode uses soft neutral shadows with low opacity;
   - dark mode uses a subtle shadow plus the visible border/surface ladder; and
   - cards remain distinguishable even when shadows are imperceptible.
5. Do not add per-component `dark:` color overrides. Resolve theme differences in semantic tokens.

#### Phase 1 verification

- Check `/`, auth, onboarding, dashboard, sidebar, dropdown, dialog, form inputs, cards, badges, and destructive actions in both themes.
- Confirm text contrast with browser accessibility tooling or a contrast calculator using the final composited color.
- Compare the authenticated pages to baseline screenshots before continuing.
- Run `pnpm check` and `pnpm typecheck`.

### Phase 2 — Simplify route structure and content hierarchy

#### Files

- `src/routes/index.tsx`
- `src/components/home/home-header.tsx`
- `src/components/home/home-tech-stack.tsx`
- `src/components/home/home-why.tsx`
- `src/components/home/home-features.tsx`
- `src/components/home/home-roadmap.tsx` (remove if unused)
- `src/components/home/icon-card.tsx` (simplify or remove if unused)

#### Route tasks

1. Remove `HomeRoadmap` from `src/routes/index.tsx`.
2. Remove the `#roadmap` navigation link from `HomeHeader`.
3. Keep the order `Hero → Stack → Why → Features → CTA`.
4. Remove unused imports and delete any homepage component made unreachable by this restructuring.

#### Content-audit tasks

1. Create a short inventory of claims on the homepage before rewriting copy.
2. Verify each claim against:
   - implemented routes and flows;
   - current authentication/organization behavior; and
   - `docs/dev/roadmap.md`.
3. Remove billing from the “already wired” list until it is implemented.
4. Describe onboarding as shipped if its documented flow is still operational.
5. Replace absolute claims such as “no half-finished screens” with factual language that does not conflict with visible WIP notices.
6. Prefer user outcomes over library names in headlines and descriptions. Keep implementation details in the stack row or smaller supporting text.
7. Make terminology consistent:
   - use either “Log in” or “Sign in” everywhere;
   - use either “Create account” or “Get started” for the primary registration action; and
   - use one description for organizations/teams across sections.

#### Information-density rules

- No section should contain more than one eyebrow, one heading, and one supporting paragraph before its primary content.
- No homepage section should show more than four peer items without a strong reason.
- Avoid a card inside a card.
- Avoid using a pill solely as decoration.
- Do not repeat the same benefit in both `HomeWhy` and `HomeFeatures`.
- Every section must have a distinct job:
  - Hero: explain the product and provide the primary action.
  - Stack: provide technical credibility quietly.
  - Why: communicate outcomes.
  - Features: show concrete capabilities.
  - CTA: close the page with one decision.

#### Phase 2 verification

- Read only the headings and confirm they tell a coherent story.
- Read only the body copy and confirm no feature claim contradicts the roadmap.
- Confirm there is no unused `HomeRoadmap` or `IconCard` export.
- Run `pnpm knip` and evaluate only findings caused by this change; do not clean up unrelated existing findings.

### Phase 3 — Refine the header and hero

#### Files

- `src/components/home/home-header.tsx`
- `src/components/home/home-hero.tsx`
- `src/features/layout/components/theme-toggle.tsx` only if a reusable compact size is needed
- `src/components/shared/logo-title.tsx` only if a responsive wordmark option is needed

#### Header tasks

1. Preserve the sticky, translucent header and derive its color from the existing background token with `bg-background/85`.
2. Keep desktop navigation short: `Overview`/`Features` are sufficient; do not retain a link for every section.
3. Use proportional sans-serif navigation text.
4. Make the theme toggle an icon-sized control with a clear accessible name and tooltip/title.
5. Use responsive spacing:
   - `px-4` on narrow screens;
   - `px-6` from the small breakpoint upward;
   - compact gaps between actions.
6. At `320px`, show only controls that fit without wrapping. Preferred order:
   - logo/compact wordmark;
   - theme toggle;
   - small Login action; and
   - small primary registration action.
7. If all four cannot fit at `320px`, hide only the wordmark text and retain the logo mark and all actions. Do not add a Sheet/hamburger menu solely for two links.
8. Ensure every interactive control has a minimum practical pointer target of about `36px`; aim for `44px` when layout permits.

#### Hero-content tasks

1. Keep a single eyebrow badge, but use an existing Badge variant without overriding its typography or color semantics.
2. Retain the current value proposition concept, but ensure the supporting paragraph describes only shipped capabilities.
3. Keep one primary CTA: registration/get started.
4. Keep one secondary action: GitHub or “View the source.” Style it as a quiet link or outline button.
5. Remove the full-width “Already have an account?” block and its top border. Login remains available in the header.
6. Reduce technical proof points under the mock from two or more items to at most two short items, or incorporate them into the capabilities section.
7. Use a comfortable measure for text: approximately `55–65ch` for body copy.
8. Keep the headline’s visual distinction, but avoid highlighting more than one phrase.

#### Hero-preview tasks

1. Keep the product preview as the page’s primary visual centerpiece.
2. Replace most arbitrary shadows inside the preview with borders and semantic surfaces.
3. Keep the stronger signature shadow only on the outer preview frame.
4. Raise all preview text to at least `12px`.
5. Desktop behavior:
   - retain a two-column mini application;
   - use a narrower sidebar only if content remains legible; and
   - show no more than two representative member rows.
6. Mobile behavior below the small breakpoint:
   - hide the preview sidebar and organization selector;
   - render only the main content pane;
   - keep one member row and one pending invitation/status row; and
   - remove low-value browser chrome text if it causes overflow.
7. Use responsive classes to alter presentation; do not create a second independent data structure unless the markup becomes less complex as a result.
8. Mark decorative browser dots and non-informational icons as hidden from assistive technology when appropriate.
9. Use real `Badge`, `Card`, and `Separator` components where their semantics/composition match. Do not replace every layout container with a component mechanically.

#### shadcn composition checks

- Use built-in Button and Badge variants before adding class overrides.
- Button icons should use `data-icon="inline-start"` or `data-icon="inline-end"` and should not carry redundant size classes.
- Use `Separator` instead of a hand-built one-pixel divider.
- Use `CardHeader`, `CardTitle`, `CardDescription`, and `CardContent` if a shadcn Card is introduced.
- Use semantic colors rather than raw teal/orange/gray utilities.

#### Phase 3 verification

- Test keyboard tab order from logo through all hero actions.
- Verify visible focus states in both themes.
- Verify there is one unmistakable primary action.
- Test at `320px`, `390px`, `640px`, `768px`, `1024px`, and `1440px`.
- Confirm the preview has no clipped text or horizontal scrollbar.

### Phase 4 — Simplify the supporting sections

#### `HomeTechStack`

1. Keep it immediately below the hero as a low-emphasis credibility row.
2. Reduce the visible list from thirteen technologies to five or six core technologies, for example:
   - TanStack Start;
   - React;
   - Better Auth;
   - Drizzle;
   - Cloudflare Workers; and
   - shadcn/ui.
3. Remove pill borders and per-item shadows.
4. Present items as plain text, restrained wordmarks, or a wrapping inline list separated by bullets/dots.
5. Use muted text and sufficient spacing so the row reads as supporting evidence rather than another feature section.
6. Do not introduce external logo assets in this pass.

#### `HomeWhy`

1. Reduce four points to three outcomes:
   - start with a working multi-tenant foundation;
   - inherit secure organization/session patterns; and
   - extend a consistent codebase.
2. Render the items as unboxed icon-and-text groups.
3. Use either:
   - a three-column desktop layout; or
   - one short introduction beside a three-item vertical list.
4. Remove per-item shadows, borders, hover lifts, and pills.
5. Keep icons small and neutral; use the primary accent on one controlled detail rather than every icon container.

#### `HomeFeatures`

1. Make this the concrete capabilities section rather than a second benefits grid.
2. Lead with the strongest shipped capability: multi-tenant organizations and teams.
3. Show three or four additional shipped capabilities. Candidate categories:
   - authentication and session handling;
   - organizations, membership, and teams;
   - guided onboarding;
   - transactional email flows; and
   - typed server/form patterns.
4. Do not advertise Sentry as complete while integration remains pending.
5. Do not describe the theme toggle itself as a primary product feature; it is interface polish, not customer value.
6. Prefer one larger composition with a clear featured capability and a simple checklist/list beside it. Avoid six equal cards.
7. If tags are useful for technical context, show at most three and use the existing Badge component.
8. Avoid hover movement on non-interactive feature containers. Motion should signal interactivity, not decorate static content.

#### `HomeCta`

1. Keep a visually distinctive final CTA, but simplify it:
   - one eyebrow or none;
   - one concise heading;
   - one short supporting sentence; and
   - one primary action plus an optional quiet Login link.
2. Use the grid texture here only if it is removed from the hero; do not use the same texture in both locations.
3. Ensure the primary fill/foreground pair passes contrast in both themes.
4. Replace the arbitrary offset shadow with a semantic shadow unless the hero preview no longer uses the signature offset treatment.
5. Avoid overriding Button colors with `!important`. If the inverted CTA button needs a reusable appearance, add an intentional Button variant or use a supported existing variant whose semantic tokens meet contrast.

#### `Footer`

1. Remove `font-mono` from the whole footer.
2. Keep the GitHub URL/action technical if desired, but use proportional text for the copyright sentence.
3. Align the footer content to the same maximum width and horizontal padding as the homepage sections.
4. Keep the footer quiet; it should not introduce a new card, background texture, or accent color.

#### Phase 4 verification

- Scroll the page quickly and confirm each section has a visibly different role.
- Confirm the page does not become a repeated sequence of card grids.
- Confirm no static content moves on hover.
- Confirm the CTA is the strongest element after the hero.

### Phase 5 — Accessibility, responsive, and regression hardening

#### Accessibility checks

1. Navigate the complete page by keyboard.
2. Confirm focus order follows visual order.
3. Confirm every icon-only button has an accessible name.
4. Confirm heading hierarchy contains one `h1`, with section headings using `h2`.
5. Confirm navigation landmarks, main content, sections, and footer remain semantic.
6. Confirm decorative icons/backgrounds do not add noisy accessible names.
7. Check contrast for:
   - normal and muted body text;
   - links at rest and hover;
   - button foreground/fill pairs;
   - badge foreground/fill pairs;
   - focus rings;
   - input borders and placeholders on auth pages;
   - sidebar active/inactive states; and
   - destructive actions.
8. Test at `200%` browser zoom and confirm content reflows without loss.
9. Respect `prefers-reduced-motion`. If hover transforms remain on interactive controls, ensure they are subtle and nonessential.

#### Responsive checks

At each target width, verify:

| Width | Required behavior |
| --- | --- |
| `320px` | No horizontal scroll; compact header fits; mock sidebar hidden; CTAs do not clip |
| `390px` | Comfortable single-column flow; body text remains at least `14px` |
| `640px` | Benefit/capability layouts may begin using two columns where natural |
| `768px` | Header navigation can appear if it does not crowd actions |
| `1024px` | Hero becomes two columns with balanced proportions |
| `1440px` | Content remains constrained; line lengths do not become excessive |

#### Shared-token regression matrix

Because `src/styles.css` affects the whole app, manually inspect:

- Buttons: default, outline, secondary, ghost, link, destructive, disabled.
- Forms: input, textarea, select, invalid, disabled, placeholder, focus.
- Overlays: dropdown, dialog, sheet, tooltip, toast.
- Data surfaces: cards, tables/lists, badges, avatars, separators.
- Sidebar: background, active item, hover, border, organization selector, user menu.
- Auth/onboarding: panels, progress indicators, verification/code fields.
- Dashboard/settings: muted labels, code blocks, WIP notices, destructive actions.

Fix regressions through semantic tokens first. Add component-specific styling only when the component genuinely represents a different semantic role.

#### Automated verification

Run, in order:

```bash
pnpm check
pnpm typecheck
pnpm test
pnpm build
pnpm knip
```

`pnpm knip` is diagnostic for this task. Fix unused files, exports, or imports created by the homepage refactor, but do not expand scope to unrelated pre-existing findings.

### Phase 6 — Final visual review and cleanup

#### Tasks

1. Recreate every Phase 0 screenshot using the same viewport and theme.
2. Compare before/after for hierarchy, legibility, page length, and responsive behavior.
3. Review the implementation against these “restraint” questions:
   - Is more than one element using the signature shadow?
   - Are both the hero and CTA using a grid texture?
   - Are more than three peer items boxed in the same section?
   - Is orange used for anything that is neither status nor a deliberate highlight?
   - Is monospace applied to a full paragraph or navigation group?
   - Is a static element moving on hover?
   - Is the same claim repeated in multiple sections?
4. Remove commented-out classes and stale comments encountered in changed homepage files.
5. Remove only files/imports made obsolete by this implementation.
6. Do not refactor unrelated authenticated features during cleanup.

#### Final acceptance review

- Compare the implementation with every success criterion at the top of this document.
- Confirm there are no unreviewed global-token regressions.
- Confirm the final homepage copy is accurate as of the implementation date.
- Confirm all automated checks pass.

## Intended file-by-file outcome

| File | Intended outcome |
| --- | --- |
| `src/styles.css` | Proportional sans default, resilient mono stack, accessible light/dark tokens, useful dark surface ladder, semantic shadows |
| `src/routes/__root.tsx` | Continues to apply the global sans stack; no theme flash regression |
| `src/routes/index.tsx` | Five-component homepage flow with no detailed roadmap |
| `src/components/home/home-header.tsx` | Compact responsive header, shorter nav, accessible theme/login/register controls |
| `src/components/home/home-hero.tsx` | One primary CTA, one secondary action, simpler copy, responsive preview |
| `src/components/home/home-tech-stack.tsx` | Five-to-six-item quiet credibility row without pills/shadows |
| `src/components/home/home-why.tsx` | Three outcome-focused, unboxed benefit items |
| `src/components/home/home-features.tsx` | One clear capabilities composition with only shipped functionality |
| `src/components/home/home-cta.tsx` | Simplified, accessible closing CTA without `!important` color overrides |
| `src/components/home/icon-card.tsx` | Simplified only if still needed; otherwise removed |
| `src/components/home/home-roadmap.tsx` | Removed if no longer imported |
| `src/features/layout/components/footer.tsx` | Quiet proportional footer aligned to homepage container |
| `src/features/layout/components/theme-toggle.tsx` | Optional compact reusable size without redundant icon sizing classes |

## Testing strategy notes

- Do not add snapshot tests for Tailwind class strings; they are brittle and provide little confidence in the visual result.
- Add a component test only if the refactor introduces conditional behavior worth protecting, such as responsive content represented by different accessible markup or a new theme-toggle variant.
- Prefer manual visual and accessibility checks for layout, contrast, reflow, and hierarchy.
- If this page becomes business-critical later, treat automated screenshot testing as a separate scoped project rather than silently adding a browser-testing dependency here.

## Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Global token changes regress authenticated screens | Perform Phase 1 independently and use the shared-token regression matrix before homepage restructuring |
| Brighter dark accents break filled-button contrast | Pair bright dark-mode accents with dark foreground tokens and measure both states |
| Removing cards makes content feel unfinished | Use typography, spacing, alignment, and one featured surface to provide structure |
| Header remains crowded at `320px` | Hide wordmark text before hiding actions; keep controls compact; avoid adding a menu unnecessarily |
| Product preview becomes complex due to responsive variants | Hide low-value regions on mobile instead of maintaining two fully separate mocks |
| Marketing copy becomes stale again | Phrase claims around verified shipped flows and use the repository roadmap as the review source |
| Reduced tech list appears incomplete | Treat it as representative credibility and avoid wording that implies an exhaustive list |
| Visual cleanup expands into a full design-system rewrite | Touch shared tokens only where required for typography, contrast, surfaces, and shadows; leave unrelated component architecture alone |

## Suggested commit boundaries

Keep implementation commits small enough to review visually:

1. `style: improve typography and theme contrast`
2. `refactor: simplify homepage content structure`
3. `style: refine homepage hero and responsive header`
4. `style: simplify homepage supporting sections`
5. `fix: address homepage accessibility and visual regressions`

Do not mix product-feature work into these commits.

## Definition of done

This plan is done only when the homepage is visually calmer **and** the shared application remains usable. Passing lint and build checks alone is insufficient. Completion requires:

- verified content accuracy;
- measured contrast;
- keyboard and zoom testing;
- responsive review down to `320px`;
- comparison against baseline screenshots;
- regression review of shared components in both themes; and
- all required repository checks passing.

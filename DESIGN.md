# DelightLoop — How we design UI

The judgement behind the DelightLoop redesigns: the outreach-loop builder (the assignment) and the in-product screens that followed (manual email/LinkedIn, surfaces, gift step, channel configs and presets). It's written from the review rounds, so each rule is something that was rejected or kept on purpose.

## The bar

- **Never fall back to basic UI.** "Basic", "flat", "fallback", "scattered" and "crowded" are the rejections. If a screen looks like a component-library default, it isn't done: make a crafted variant.
- **Reference-level craft.** lemlist, Lantern-style builders and the reference screenshots in Paper set the level: clean, spaced out, every card, action and line of type considered.
- **Hierarchy first.** Most "it looks off" comes down to no clear primary → secondary, or parts that belong to one item not reading as one. Fix structure before styling.
- **Generous whitespace, no wasted space.** Air inside cards; tight side padding on laptops (24px inside an inner sidebar, 48px page sides, content capped ~1344px, centred).

## The product logic comes first

- **Discuss before designing a whole flow** when the logic is unclear. Ask; don't invent product behaviour.
- **Audit the flow as a third-party designer** for the ICP: does each step follow from the last, does a draft show only what's knowable before launch?
- **One source of truth per decision.** Picking a step or channel happens in one place (the "Add step" menu on the canvas); the right panel only configures the chosen step.
- **Keep what was in scope.** Check how it worked before the redesign; don't add features that weren't there, and don't remove options (like "Change") that were.
- **Defaults are visible but changeable.** Pre-selected gifts, default rules and presets should never look locked.
- **Gifty does the work.** It finds addresses, picks gifts and drafts the loop; the user reviews and overrides. Never ask the recipient for anything.
- **No assumptions in the UI.** Don't hard-code a campaign ("Diwali gift") where the user should pick a preset from a dropdown.

## Design for real use

- **Every state.** Empty, hover, expanded, open dropdown, connected / not connected, errors, and "fix" cards with a proper CTA (e.g. email has no sender → add sender).
- **Interaction states, always, unasked.** Every clickable thing (cards, buttons, tiles, inputs, selects) gets rest, hover, pressed and disabled, plus selected / focus / open where they apply, on a "States" frame beside the screen. Hover lifts, pressed sinks, disabled fades with no shadow.
- **Scale.** Ask "what if there are 50?": 50 presets per channel, 50 people who know someone. Show 2–3, then "View all", search or a collapse.
- **Hover actions** carry secondary actions (edit, delete, favourite, behavioural profile) instead of permanent button rows.
- **Remove what confuses.** If a state can mislead someone, cut it.
- **Nothing looks cut off.** Give the last element in a panel real bottom padding.

## Look and feel

- **Colour means something.** Confirmed/opened/goal = green, not opened = red, brand purple for the one primary action. No black buttons, bars or tooltips.
- **Icons match their text colour** (never a grey icon beside a purple label). Buttons get icons. Solid icons where a card needs to read as distinct (channel cards).
- **Real objects over abstract tiles.** Faces, the gift photo, the postcard, real brand marks (exact HubSpot sprocket, LinkedIn, X). Not pastel icon tiles or "icon + title + description" option cards.
- **One component language.** The add-step button, right panels (rounded), cards and radii look the same everywhere.
- **Every number has a unit and a direction** ("spent on gifts", "+12 on last quarter").

## What reads as AI slop (refuse on sight)

- Uppercase letter-spaced labels; sentence case only.
- Glowing backgrounds, halos and coloured glow shadows.
- Status pills with dots or pulses; tinted-circle ✓/! icons. Plain coloured word instead.
- Coloured left-edge bars on selected rows; use a soft fill.
- Accent-tinted callout panels; use a neutral grey surface.
- Black bottom/bulk-action bars; use the soft lilac tint with coloured action text.
- Flat stacked lists as a summary card.

## Build and layout

- **Flexbox with `gap` and padding, never margins** for spacing; layouts must flow on laptop screens, not just the design width.
- **A prototype behaves like the real app:** one stateful flow, a two-finger pannable canvas, sticky header, animated right panels, every button working, simulated live events, no pre-typed user input.

## How we work in Paper

- **Don't modify the original screens.** Duplicate and redesign beside them.
- **Show variants** (usually 3, genuinely different) and let the user pick; keep the chosen one.
- **Lay flows out horizontally** in the order they happen; variants and states of a screen go directly below it.
- **Read the comments** on the canvas and answer each one, including questions the user doesn't know the answer to.

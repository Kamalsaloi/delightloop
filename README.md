# DelightLoop: outreach loop builder (prototype)

A clickable, high-fidelity prototype of a redesigned campaign ("loop") builder for DelightLoop, built from the Paper design file *Festive unity* (page "Builder — 3 directions"). It runs entirely in the browser on mock data, with no backend.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc -b && vite build
npm run lint
```

Stack: Vite, React 18, TypeScript (strict), Tailwind CSS v3, react-router v6, and Geist (via @fontsource).
The layout is desktop only, built for a 1440px viewport.

## Getting around

- `/` is the **screen index**, a reviewer-only list of every screen and state. It isn't linked from the product UI. Press `\` on any screen to come back to it.
- To try the real flow, start at **`/home`** and click through. Primary buttons lead to the next screen. The top-bar tabs (Audience / Build / Preview / Results) switch between screens.
- Variants are states of their parent screen, driven by the query string. Each one can be opened from a link and also reached by interacting with the screen, e.g. hovering a person row and clicking "Behavioural profile" writes `?profile=kenji`.

## Screen map

| Code | Screen | Route | Paper |
|---|---|---|---|
| **Path A: Gifty drafts the loop** ||||
| 01 | Home, with what Gifty spotted | `/home` | `86E-0` |
| 02 | Start a new loop (describe it) | `/new` | `14B-0` |
| 03 | Audience check | `/loop/audience` | `1AA-0` |
| 04 | Review the draft, gift step open | `/loop/build/gift` | `LS-0` |
| 05 | Review the draft, email step open | `/loop/build/email` | `1FN-0` |
| 06 | Preview, one person end to end | `/loop/preview` | `72Z-0` |
| 07 | Review & launch | `/loop/launch` | `1ZR-0` |
| **Live** ||||
| 09 | Results with replies | `/live/results` | `6R0-0` |
| 08 | Build tab with counts | `/live/build` | `2KW-0` |
| 12 | Home, Diwali loop running | `/home?state=live` | `CUX-0` |
| 13 | Loop finished, what worked | `/live/results?state=finished` | `D3Y-0` |
| **Paused** ||||
| 10 | Paused, editing a live loop | `/paused/build` | `7LP-0` |
| 11 | Review changes before resuming | `/paused/review` | `7Y5-0` |
| **Path B: start blank** ||||
| B0 | Pick who it's for | `/blank/list` | `9HR-0` |
| B0a | Check the people | `/blank/people` | `A4K-0` |
| B1–B7 | Build step by step | `/blank/build/1` … `/blank/build/7` | `3V8-0` `49X-0` `3Q6-0` `3KK-0` `3E8-0` `36R-0` `2X7-0` |
| B8 | Loop rules (joins Path A at 06) | `/blank/rules` | `4G8-0` |
| **Variants** ||||
| 01a | Home without suggestions | `/home?suggestions=none` | `102-0` |
| 02c | Typing @ to pull in a list | `/new?mention=1` (or type `@`) | `9AA-0` |
| 03a | Always-on audience, a rule not a list | `/loop/audience/always-on` | `8QU-0` |
| 03c | "How" opened, Gifty's funnel | `/loop/audience?how=1` | `9XE-0` |
| 03d | Behavioural profile open | `/loop/audience?profile=kenji` | `B94-0` |
| 03e | Add the missing addresses | `/loop/audience?sheet=addresses` | `BRK-0` |
| 04a | Swap one person's gift | `/loop/build/gift?swap=1` | `1Q6-0` |
| 04b | Gift panel states | `/loop/build/gift?panel=gifts\|hover\|gift\|everyone\|addresses\|note` | `23M-0` |
| 05 (bump) | Gentle bump email | `/loop/build/email?step=bump` | – |
| 05a | Loop rules Gifty drafted (the "Rules 4" button on 04/04a/05) | `/loop/build/email?panel=rules` (sub-states `&rules=trigger\|actions\|review\|off\|reply`) | `DGL-0` |
| 07a | Launch blocked: LinkedIn + budget | `/loop/launch?blocked=1` | `CCR-0` |
| 08a | A delivery fails, Gifty handles most | `/live/build?step=gift` | `CHQ-0` |
| 09a | Page visits in Results | `/live/results?tab=visits` | `CNL-0` |
| B0b | Behavioural profile (start blank) | `/blank/people?profile=kenji` | `BDQ-0` |
| B0c | "When something happens" tab | `/blank/list?tab=trigger` | `BXY-0` |
| B0d | "Ask Gifty to find them" tab | `/blank/list?tab=gifty` | `C2M-0` |
| B1a | Configure: Intro email, written by hand | `/blank/build/2?step=intro` | `DWY-0` |
| B2a | Configure: Wait and check | `/blank/build/3?step=check` | `DRH-0` |
| B3a | Configure: LinkedIn step | `/blank/build/4?step=linkedin` | `E6X-0` |
| B4a | Configure: Bump email | `/blank/build/5?step=bump` | `ECJ-0` |
| B5a | Configure: Postcard | `/blank/build/6?step=postcard` | `EIV-0` |
| B6a | Configure: The gift | `/blank/build/7?step=gift` | `EPY-0` |
| B7a | Configure: The goal | `/blank/rules?step=goal` | `EXP-0` |
| B8a | Rules panel states | `/blank/rules?panel=defaults\|trigger\|actions\|review\|off\|reply` | `5B1-0` |

**Flows**
- Path A: 01 → 02 → 03 → 04 ⇄ 05 → 06 → 07 → 09. "Rules" in the 04/05 top bar opens Gifty's drafted rules (05a), which use the same panel as B8.
- Live: 09 → Pause → 10 → 11 → Resume → 09, with 09 ⇄ 09a and 08 → 08a
- Path B: 02 "Start blank" → B0 → B0a → B1 … B7 → B8 → 06. On any Path B canvas, clicking a placed step opens its config panel (`?step=<id>`, B1a–B7a), and "Rules" opens the loop rules panel (`?panel=rules`).
- B0c "Use this signal" leads to the always-on audience (03a). B0d "Use these 64 people" leads to B0a.

## Code layout

```
src/
  components/ui/        Button, Card, Segmented, Chip, Avatar, Toggle, Stepper, Sheet, Icon, Logo, BrandMark (HubSpot/LinkedIn/X/Gmail)
  components/shell/     AppHeader (Home), BuilderHeader (loop top bar + tabs)
  components/canvas/    builder canvas kit: layout, step cards, branches, inspector panels (API documented in index.ts)
  components/audience/  people table, behavioural profile panel, checks card, add-addresses sheet
  data/people.ts        shared mock people
  screens/              one folder per area; registry.ts holds every route
public/assets/          images exported from the Paper file (scripts/fetch-asset.sh <asset-id> pulls more)
```

Design tokens (ink, greys, lines, violet primary, amber, green, LinkedIn, HubSpot) live in `tailwind.config.js`.

## Where this differs from Paper

- **States Paper doesn't draw.** Paper shows one state per interaction, so a few were designed here using existing styles:
  - after-action states: resolved checks with Undo, "You handled", "Changes discarded"
  - the second tab of each Path B step menu
  - the Card note tab in the gift panel and the Timing tab in the email panel
  - the LinkedIn, postcard, gift and page renders in Preview (Paper only shows the email)
- **Results tabs.** 09 now has the Replies / Page visits switch so it can toggle with 09a. In Paper, 09 and 09a are different days, so the header date and "Day n of 9" change with the tab.
- **Inspector headers.** All inspectors share one header. On 04 this puts the text about 1–2px off Paper.
- **Composer token (02c).** The @-mention token is drawn under a transparent textarea, so the token sits about 7px left of Paper.
- **No in-app entry for two states.** Nothing in Paper's 07 is unresolved, so 07a is only reachable by URL. 13 is reached from Home's "Finished" card ("See what worked").
- **Copy kept as Paper has it.** Some copy differs between artboards, e.g. the gift is "Brass diya set" on 06 and "Soy candle" on 07, and Sofia's company changes. Each screen keeps its own artboard's text.
- **Hover states.** Hover affordances such as light fills and stronger shadows were added where Paper only shows the resting state.

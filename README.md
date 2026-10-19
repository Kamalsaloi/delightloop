# DelightLoop: outreach loop builder (prototype)

A working, stateful prototype of the redesigned loop builder for DelightLoop, built from the Paper file *Festive unity*. It runs entirely in the browser. There's no backend; a simulated clock plays the part of the world.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc -b && vite build
npm run lint
```

Stack: Vite, React 18, TypeScript (strict), Tailwind CSS v3, react-router v6, zustand, and Geist plus Newsreader (via @fontsource, no network needed).
The layout is desktop only and built for a 1440px viewport. `vercel.json` rewrites every path to `index.html`, so deep links work.

## The app

`/` is Home. Everything else lives under a loop:

| Route | What it is |
|---|---|
| `/loops/:id/audience` | Pick who it's for (lists · a signal · ask Gifty), check the people, or tune an always-on signal |
| `/loops/:id/build` | The canvas: draft, live (read-only, with counts) or paused (editable, changes tracked) |
| `/loops/:id/preview` | One person end to end, desktop or phone |
| `/loops/:id/launch` | Storyboard, live launch checks, rules, start time |
| `/loops/:id/results` | Replies, page visits, the loop so far; "what worked" once it's finished |

The top tabs navigate between these. A tab that doesn't apply yet is disabled; for example, Results stays disabled until launch. Unknown routes go to `/`.

### Ways in
- **Draft with Gifty.** The New loop modal starts empty. As you type, Gifty reads the words (debounced about 300ms) and links a CRM list, a sender, a moment and a budget as removable chips. `@` opens a picker for lists, people and budgets. Drafting stays disabled until there's a description of at least 15 characters and an audience. The draft uses what you typed: the audience comes from the list, the sender from the person, the timing and loop name from the moment, and the steps from words like *gift*, *letter* or *LinkedIn*. Gifty's steps then appear one by one on the canvas before you land on Audience.
- **A Gifty suggestion** on Home ("View the loop") drafts the same way from that suggestion's brief.
- **A recipe** creates the recipe's steps with empty copy, then asks you to pick the list.
- **Start blank** goes to the list picker, then "Check the people", then an empty canvas.

Copy the user would write is never pre-filled. On blank and recipe steps the subject, message, LinkedIn note, postcard note and card note all start empty. The card says **Needs copy** and launch is blocked until it's written. "Ask Gifty to write it" types the copy in, and "Let Gifty finish" fills every empty step and sets a goal.

### Canvas
- Two-finger scroll pans. Pinch or ⌘/ctrl + wheel zooms around the cursor, between 50% and 200%. Space-drag, middle-drag and dragging empty canvas also pan. The canvas never scrolls the page.
- The zoom control (bottom left) has −, a % readout (click it for 100%), + and fit.
- The graph is laid out from the loop's data. Connectors are SVG paths computed from measured node positions, and only one layer is transformed.
- **Add steps** from the end slot, from an empty branch, or from the "+" that appears when you hover any connector. The step menu has Reach out and Timing & logic tabs, plus Gifty's suggestion for that spot. A split creates two branches.
- **Select** a node to give it the violet ring and open its inspector. Esc or a click on empty canvas deselects it. The canvas pans so the node isn't hidden under the panel.
- **Hover a node** for its toolbar: edit, duplicate, delete. Delete shows a toast with Undo.

### Panels
Right panels float 48px from the right, below the header: inspectors, Rules, the behavioural profile, Add addresses, the goal and gift delivery. They slide and fade in and out and close with × or Esc. Only the panel body scrolls: the header and footer stay pinned, and neither the page nor the canvas moves. Edits write straight to the store, so the canvas card updates as you type.

## The simulation
- **Clock.** The demo starts on Mon 19 Oct 2026, 18:40. The clock only runs while a loop you launched is live. At 1× speed, one loop-day takes 25 seconds. If you launch with a future start, the clock skips ahead to it.
- **Events.** A live loop's steps turn into events on their day:
  - the intro goes out and opens ramp up
  - the bump and LinkedIn notes send, and connections accept
  - postcards print and land, and page visits follow
  - gifts ship and land, and one comes back as a delivery issue ("1 needs you" on the gift node)
- **Replies.** They arrive in Results with a highlight and a badge on the Results tab. Gifty drafts an answer for each. "Send as Sam" removes the reply from the list, and some answered replies turn into booked meetings a little later.
- **Launch checks.** They're live:
  - a budget over your limit needs Arjun's approval
  - a loop with a LinkedIn step needs Sam's LinkedIn
  - steps without copy block launch
  - missing addresses never block it

  "Nudge Arjun" and "Ask Sam to connect" resolve themselves 4 to 5 seconds later, with a toast.
- **Pause and finish.** Pausing snapshots the graph. Steps that already went out are locked, edits are marked, and "Review & resume" lists the changes. When the loop reaches its end day it's finished: Results shows what worked, and Home moves the loop to Finished.
- **Seed data.** The always-on loops (*Stalled deals*, *New VP Sales*) post a new activity line on their Home cards every 1.3 loop-days.

State lives in one zustand store (`src/store/`). It's persisted to `localStorage` (debounced, and wrapped so a blocked storage still works in memory). It starts from seed data: *Stalled deals* and *New VP Sales* running, *SaaSBoomi follow-up* finished, and *Year-end thanks* as a draft.

## Demo shortcuts
In the avatar menu on Home, under **Demo**: speed 1× / 4× / 10×, skip ahead a day, answer pending approvals now, and **Reset demo**.

Keyboard shortcuts work anywhere:

| Keys | Does |
|---|---|
| ⌥⇧1 / ⌥⇧2 / ⌥⇧3 | Speed 1× / 4× / 10× |
| ⌥⇧D | Skip ahead one loop-day |
| ⌥⇧R | Answer pending approvals now (budget, LinkedIn) |
| ⌥⇧E | End the loop you're looking at now |

## Code layout

```
src/
  store/       types, seed data, templates (drafting, copy, recipes), entities (reading a brief),
               graph (edit, days, diff), sim (events), selectors, store (zustand + persistence)
  canvas/      viewport (pan/zoom), layout (graph → boxes + SVG paths), Canvas, nodes, step menu + catalog, copy helpers
  pages/       home/ (Home, New loop modal) · loop/ audience, build (inspectors, rules, delivery, paused), preview, launch, results
  components/  ui/ primitives · shell/ (headers, Page, Toaster) · panels/ (FloatingPanel, PanelFrame) · audience/ · canvas/ (visual kit)
  data/        people and the account catalog (lists, teammates, gifts, moments)
```

Design tokens live in `tailwind.config.js`.

## Where this differs from Paper
- **States Paper doesn't draw.** These were designed here using existing styles:
  - empty states (no audience, no steps, no replies, no visits)
  - "Needs copy"
  - the hover insert "+"
  - the paused "Your changes" list
  - finished summaries for any loop
- **Dates and counts come from the data and the clock**, so they won't match a Paper artboard word for word. For example, gift price ranges come from the picks, and "Day n of N" comes from the graph.
- **The canvas** lays nodes out with 16px connectors and 24px split brackets, as in Paper. It also adds a 16px line before every merge, so branches of different lengths join cleanly.

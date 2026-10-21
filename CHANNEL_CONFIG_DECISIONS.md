# Channel config redesign · decisions

Paper: page "Channel config redesign". Each row is one channel, prod on the left, redesign on the right, states sheet last.

## Across all panels
- Same right panel everywhere: filled channel tile, body, pinned footer with a summary, Cancel and Save.
- Every clickable thing has a states sheet: rest, hover, pressed, disabled, plus selected, focus, open.
- Long lists show a few, with View all and Collapse at the top right of the list.
- Selected is a soft lilac fill with a tick or radio. Focus is a purple border, never a glow.
- One purple primary per screen. No black buttons, no uppercase labels.
- Links to other pages open a new tab, so the panel isn't lost.
- No edge-case UI unless asked.

## Channel configs page
- Each channel is a card: default first, then starred and recent, its own search and View all.
- A channel with many presets (gift, 52) gets its own view with filters, bulk actions and pages.
- Sentence-case nav. Status is a coloured word, not a dot.

## Gift preset
- Order: Name, Gift type, Gifts, Sent by, Sticker.
- Gift type is a dropdown with icons: One gift, or Delight choice (they pick 1 of up to 3).
- Gifts are cards, three across. View all opens a modal with search and sort by price.
- Everything comes from the preset. A step only picks among the preset's gifts.
- On-demand gifts are labelled and charged at launch.
- No gift descriptions; the photo says enough.

## Letter preset
- Three templates: Brand envelope, Postcard, Signed postcard. No "V2".
- Each template has a thumbnail; the picked one shows a full sample.
- Stickers show only once "Add a sticker" is ticked. No "No sticker" tile.
- Signer only for Signed postcard: a workspace member (photo, else initials) or someone else.
- Someone else: name, and a title from a list or Other to type one.
- No return address.
- No members: Add member opens the members page; Save waits for a signer.

## Email config
- Email senders is one card: search, Picked, Active, Inactive, and Add sender as the last row.
- Picking a person uses all their mailboxes.
- Inactive people can be picked: send manually from that account, or make it active.
- Zero senders is allowed: export the emails with details after the play runs, and send them yourself.
- No mailboxes: two options, Add sender or Send them yourself.
- Sending window: Workspace window selected by default; Custom sets days, hours and a fallback time zone.

## LinkedIn config
- Same senders card and rules as email, with each person's LinkedIn handle.
- Each action shows its daily cap on its row. Caps are set in Settings, Budget.
- React and Comment sit under Engagement: they wait for approval and need Engagement on.
- Follow and Visit stay visible but greyed out: not available yet.
- No accounts: Add sender, or Do them yourself.

## Still open
- Add member and Add sender: new tab, or same tab with an unsaved-changes step?
- LinkedIn with zero senders assumed to export like email.
- LinkedIn handles beyond hrbuilds and test-account12 are placeholders.

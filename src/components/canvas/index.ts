/**
 * Builder canvas kit — dotted canvas, flow nodes, inspector panels. Mock-only, matches Paper 04/05/08/10/B*.
 *
 * Page
 *   CanvasLayout { header, children (flow), inspector?, railTop?, overlay?, flowClassName?, flowStyle?, initialZoom? }
 *     Dotted body (48px side / 24px vertical padding), zoom rail bottom-left, flow centred in the space left over,
 *     right rail 384 wide when `inspector` is set. Zoom − / + / fit scales the flow. `railTop` pins a card top-left (10).
 *     `flowStyle={{ top: -150 }}` shows a scrolled flow (B5).
 *   DraftActions { note?, before?, secondary?, primary? }  top-bar right slot: "Saved just now" · faces · Send test · Review & launch→/loop/preview
 *   Collaborators { ids? }                        30px overlapping faces
 *
 * Flow nodes (stack them in order inside CanvasLayout; put <FlowLine/> between nodes)
 *   FlowLine { h=16 }                             1.5px #CFCFD6 connector
 *   AudiencePill { count, source, faces, icon?, onClick? }
 *   StepCard { icon, title, titleAdornment?, subtitle?, subtitleIcon?, day?, date?, footerLeft?, footerRight?,
 *              selected?, selectedGlow?, onClick?, width=320 (280 in branches), hint?, className? }
 *     icon slots: GmailTile · LinkedInTile · PostcardThumb { id? } · GiftStack { ids? }
 *     titleAdornment: RuleMarker { active? }      footer: StepChip { tone: neutral|muted|green|amber|violet|red } ·
 *     SenderChip { face?, name? } · FooterNote { tone: grey|amber }
 *     selected = 1.5px violet ring; hover = darker hairline (only when onClick).
 *   ConditionPill { lead, question, icon?, selected? (white + violet glow), onClick? }
 *   Branches { left: {label, tone?, node}, right: {…}, merge=true, width=592, column=280, gap=32 }
 *   BranchLabel { tone: green|red|neutral }       solid pill heading a branch ("Opened · 31")
 *   GoalPill { children='Goal · a meeting booked', selected?, onClick? }
 *   StepRow { left?, right?, children }           688-wide row with 184px side slots (toolbar / cursor)
 *   StepToolbar { active='edit', onEdit?, onCopy?, onDelete? }
 *   GiftyCursor { label='Gifty' } · HintCard { title, children, width=212, onClick? }
 *   AddStepButton { children='Add step', onClick? } · EmptySlot { children, width=320 } (dashed violet slot)
 *   CanvasMenu { children }                       368px floating menu shell for the step picker (Path B)
 *   ZoomControl { value, onChange }               (CanvasLayout already renders one)
 *
 * Ready-made flow
 *   DiwaliFlow { audience?, selected?, onSelect?, selectable?, footers?, subtitles?, branchLabels?, toolbar?, cursor?, postcardHint?, onHintClick?, cards?, tightMerge?, check?, goal? }
 *     The drafted Diwali loop. ids: intro | linkedin | bump | postcard | gift. Footers default to DRAFT_FOOTERS (04);
 *     pass e.g. footers={{ intro: { right: <StepChip tone="green">5 replied →</StepChip> } }} for live counts.
 *
 * Inspector
 *   Inspector { children, fill?, gap=16 }        384 panel, radius 20, shadow-panel, 24px padding
 *   InspectorHeader { media?, title, subtitle?, onClose? } · InspectorBack { label, onBack?, onClose? } · InspectorClose
 *   InspectorTabs { tabs:[{value,label}], value, onChange } · PanelSection { title, meta?, action?, size } · PanelLink
 *   PanelSegmented { options:[{value,label,count?,countTone?,grow?}], value, onChange } · ProgressSplit { found, missing }
 *   InspectorFooter { row? } · SaveButton · PanelSecondaryButton · MiniButton { leading? } · RowAction { icon?, children }
 *   GiftInspector { panel: gifts|hover|gift|everyone|addresses|note, onPanel(p, giftId?), giftId?, onClose?, onSwap?, fill? }
 *   EmailInspector { draft=INTRO_EMAIL|BUMP_EMAIL, onClose?, fill=true } · FieldToken
 *   SwapGiftModal { onClose, onCommit(optionId) }  (04a)
 */
export * from './CanvasLayout'
export * from './Flow'
export * from './StepCard'
export * from './Overlays'
export * from './Inspector'
export * from './GiftInspector'
export * from './EmailInspector'
export * from './SwapGiftModal'
export * from './DiwaliFlow'
export * from './HeaderActions'

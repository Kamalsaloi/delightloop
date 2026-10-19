/** Placed Path B steps that open a config panel via ?step=<id>. */
export const CONFIG_STEPS = ['intro', 'check', 'linkedin', 'bump', 'postcard', 'gift', 'goal'] as const
export type ConfigStepId = (typeof CONFIG_STEPS)[number]

export type ConfigPanelProps = { onClose: () => void }

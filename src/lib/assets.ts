// Paper file-assets, stored locally as public/assets/<id>.jpg (see scripts/fetch-asset.sh).
export const asset = (id: string) => `/assets/${id}.jpg`

export const FACE = {
  priya: '01M57SW4WTA1TNCZEMV6PH4V4C', // signed-in user
  sam: '01M57SW4WTMA8VVWD8DEZMES2A', // Sam Rivera, sender
  f3: '01M57SW4WTJQ14W83NJJV5G6N1',
  f4: '01M57SW4WTF7R83VF4JVQ4NW8B',
  f5: '01M57SW4WVYW10HAH7493CVDWC',
} as const

export const GIFT = {
  g1: '01M57SW4WP6JAPT9TYN46DBY5N',
  g2: '01M57SW4WRDA2BJRRRFSEA39XW',
  g3: '01M57SW4WSV6Y31TWD9N8H11Y1',
  g4: '01M57SW4WSYDX90JFB5FQWS854',
  postcard: '01M57SW4WST47NDZJDZGBFJP9Z',
  g5: '01M57TX8JC2T89E2MKZPZJ1DBJ',
  g6: '01M57TX8JDS6QN414TVTM0GMCM',
} as const

/** Plain postcard stock. */
export const CREAM = '#EDE7DD'
/** A postcard design: Paper asset id, uploaded data URL, or null for plain cream. */
export const designUrl = (d: string | null | undefined) => (d ? (d.startsWith('data:') ? d : asset(d)) : null)

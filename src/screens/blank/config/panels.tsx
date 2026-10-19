import type { ComponentType } from 'react'
import BumpConfig from './BumpConfig'
import CheckConfig from './CheckConfig'
import GiftConfig from './GiftConfig'
import GoalConfig from './GoalConfig'
import IntroConfig from './IntroConfig'
import LinkedInConfig from './LinkedInConfig'
import PostcardConfig from './PostcardConfig'
import type { ConfigPanelProps, ConfigStepId } from './types'

// Step id → its config panel (B1a–B7a).
export const CONFIG_PANELS: Record<ConfigStepId, ComponentType<ConfigPanelProps>> = {
  intro: IntroConfig, // B1a DWY-0
  check: CheckConfig, // B2a DRH-0
  linkedin: LinkedInConfig, // B3a E6X-0
  bump: BumpConfig, // B4a ECJ-0
  postcard: PostcardConfig, // B5a EIV-0
  gift: GiftConfig, // B6a EPY-0
  goal: GoalConfig, // B7a EXP-0
}

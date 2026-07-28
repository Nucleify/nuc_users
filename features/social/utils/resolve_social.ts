import { labelFromKey } from './label_from_key'

import { FALLBACK_ICON, SOCIAL_PRESETS } from '../constants/social_presets'
import type {
  SocialItemInterface,
  SocialLinkInputInterface,
} from '../types/interfaces'

export function resolveSocial(
  item: SocialLinkInputInterface
): SocialItemInterface {
  const preset = SOCIAL_PRESETS[item.key]
  return {
    key: item.key,
    url: item.url.trim(),
    icon: item.icon ?? preset?.icon ?? FALLBACK_ICON,
    label: item.label ?? preset?.label ?? labelFromKey(item.key),
  }
}

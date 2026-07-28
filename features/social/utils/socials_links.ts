import { type ComputedRef, computed } from 'vue'

import { resolveSocial } from './resolve_social'

import { DEFAULT_SOCIAL_LINKS } from '../constants/default_social_links'
import type { SocialItemInterface } from '../types/interfaces'

export function useSocialsLinks(
  getItems: () => SocialItemInterface[] | undefined
): ComputedRef<SocialItemInterface[]> {
  return computed((): SocialItemInterface[] =>
    (getItems() ?? DEFAULT_SOCIAL_LINKS)
      .filter((item) => item.url.trim().length > 0)
      .map(resolveSocial)
  )
}

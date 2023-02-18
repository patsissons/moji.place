import type { PageLoad } from './$types'
import type { EmojiPackName } from '$lib/client/emoji'

const packs: EmojiPackName[] = ['epk-emoji-store']

export const load = (() => {
  return {
    packs,
  }
}) satisfies PageLoad

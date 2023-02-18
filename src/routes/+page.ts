import type { PageLoad } from './$types'
import type { EmojiSetName } from '$lib/client/emoji'

const sets: EmojiSetName[] = ['epk-emoji-store']

export const load = (() => {
  return {
    sets,
  }
}) satisfies PageLoad

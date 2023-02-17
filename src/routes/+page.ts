import type { PageLoad } from './$types'
import {
  fetchEmojiSet,
  type EmojiSetName,
  type EmojiSet,
} from '$lib/client/emoji'

const sets: EmojiSetName[] = ['epk-emoji-store']

export const load = (async ({ fetch }) => {
  const emojis = {} as Record<EmojiSetName, EmojiSet>

  for (const set of sets) {
    const emojiSet = await fetchEmojiSet(set, { fetch })
    emojis[set] = emojiSet
  }

  return {
    sets,
    emojis,
  }
}) satisfies PageLoad

export const packs = {
  // 'https://storage.googleapis.com/epk-emoji-store/index.json',
  'epk-emoji-store': '/emojis/epk-emoji-store/2023-02-17.json',
} as const

export type EmojiPackName = keyof typeof packs

export const packNames = Object.keys(packs) as EmojiPackName[]
export const defaultPackName: EmojiPackName = 'epk-emoji-store'

interface EmojiPackItem {
  name: string
  url: string
}

type EmojiSet = Record<string, Omit<EmojiPackItem, 'name'>>

export function validateItem(item: unknown): item is EmojiPackItem {
  if (!item || typeof item !== 'object') return false
  if (!('name' in item) || typeof item.name !== 'string') return false
  if (!('url' in item) || typeof item.url !== 'string') return false
  if (!item.url.startsWith('http')) return false

  return true
}

export function reduceItem(set: EmojiSet, { name, url }: EmojiPackItem) {
  set[name] = { url }
  return set
}

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

type EmojiSetItem = Omit<EmojiPackItem, 'name'>
type EmojiSet = Record<string, EmojiSetItem>

export function validateItem(item: unknown): item is EmojiPackItem {
  if (!item || typeof item !== 'object') return false
  if (!('name' in item) || typeof item.name !== 'string') return false
  if (!('url' in item) || typeof item.url !== 'string') return false

  return true
}

export function reduceItem(set: EmojiSet, { name, url }: EmojiPackItem) {
  set[name] = { url }
  return set
}

export function hydrateUrl(
  set: EmojiSet,
  item?: EmojiSetItem,
): EmojiSetItem | undefined {
  if (!item || !item.url) return
  if (item.url.startsWith('http')) return item
  if (!item.url.startsWith('alias:')) return

  const name = item.url.slice(6)
  const alias = set[name]
  if (!alias) return

  return hydrateUrl(set, alias)
}

export function hydrateSet(set: EmojiSet) {
  Object.values(set).filter((item) => {
    const hydrated = hydrateUrl(set, item)
    if (hydrated === item) return true
    if (!hydrated) {
      console.warn(`${item.url} has no source item`)
      return false
    }

    item.url = hydrated.url
    return true
  })

  return set
}

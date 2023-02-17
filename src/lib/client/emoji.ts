import { fetchJson, type FetchOptions } from './json'

const sets = {
  'epk-emoji-store': '2023-02-17',
} as const

export type EmojiSetName = keyof typeof sets

export interface EmojiSetItem {
  name: string
  url: string
  backup_url?: string
}

export type EmojiList = EmojiSetItem[]

export type EmojiSet = Record<string, Omit<EmojiSetItem, 'name'>>

export const basePath = '/emojis'

export async function fetchEmojiSet(
  name: EmojiSetName,
  options?: FetchOptions,
) {
  const list = await fetchJson<EmojiList>(
    `${basePath}/${name}/${sets[name]}.json`,
    options,
  )

  return list.reduce((map, { name, ...item }) => {
    map[name] = item
    return map
  }, {} as EmojiSet)
}

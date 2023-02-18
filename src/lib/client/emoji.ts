import { fetchJson, type FetchOptions } from './json'

const packs = {
  'epk-emoji-store': '2023-02-17',
} as const

export type EmojiPackName = keyof typeof packs

export interface EmojiPackItem {
  name: string
  url: string
  backup_url?: string
}

export type EmojiList = EmojiPackItem[]

export type EmojiSet = Record<string, Omit<EmojiPackItem, 'name'>>

export const basePath = '/emojis'

export async function fetchEmojiPack(
  nameOrEndpoint: string,
  options?: FetchOptions,
) {
  const endpoint = packEndpoint(nameOrEndpoint)
  if (!endpoint) return {}

  const list = await fetchJson<EmojiList>(endpoint, options)

  return list
    .filter(({ url }) => url.startsWith('http'))
    .reduce((map, { name, ...item }) => {
      map[name] = item
      return map
    }, {} as EmojiSet)
}

function packEndpoint(nameOrEndpoint: string) {
  if (/^https?:/.test(nameOrEndpoint)) return nameOrEndpoint
  if (nameOrEndpoint in packs)
    return `${basePath}/${nameOrEndpoint}/${
      packs[nameOrEndpoint as EmojiPackName]
    }.json`
}

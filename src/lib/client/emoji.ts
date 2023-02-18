import { fetchJson, type FetchOptions } from './json'

export interface EmojiPackItem {
  url: string
  backup_url?: string
}

export type EmojiSet = Record<string, EmojiPackItem>

export const basePath = '/emojis'

export async function fetchEmojiPack(
  nameOrEndpoint: string,
  options?: FetchOptions,
) {
  return /^https?/.test(nameOrEndpoint)
    ? fetchJson<EmojiSet>(`/api/pack?url=${nameOrEndpoint}`, options)
    : fetchJson<EmojiSet>(`/api/pack/${nameOrEndpoint}`, options)
}

import { fetchJson, type FetchOptions } from './json'
import {
  hydrateSet,
  packs,
  reduceItem,
  validateItem,
  type EmojiPackName,
} from './packs'

export interface EmojiPackItem {
  url: string
  backup_url?: string
}

export type EmojiSet = Record<string, EmojiPackItem>

function packEndpoint(nameOrEndpoint: string) {
  if (/^https?/.test(nameOrEndpoint)) return nameOrEndpoint
  if (nameOrEndpoint in packs) return packs[nameOrEndpoint as EmojiPackName]
}

export async function fetchEmojiPack(
  nameOrEndpoint: string,
  options?: FetchOptions,
) {
  const endpoint = packEndpoint(nameOrEndpoint)
  if (!endpoint) throw new Error(`invalid emoji pack: ${nameOrEndpoint}`)

  const list = await fetchJson(endpoint, options)
  if (!Array.isArray(list))
    throw new Error(`invalid endpoint response: ${typeof list}`)

  return hydrateSet(
    list.filter(validateItem).reduce(reduceItem, {} as EmojiSet),
  )
}

import type { EmojiSet } from '$lib/client/emoji'
import { fetchJson } from '$lib/client/json'
import {
  defaultPackName,
  packs,
  reduceItem,
  validateItem,
  type EmojiPackName,
} from '$lib/server/packs'
import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

function packName(pack: string): EmojiPackName | undefined {
  if (pack === 'default') return defaultPackName
  if (pack in packs) return pack as EmojiPackName
}

function packEndpoint(pack: string) {
  const name = packName(pack)
  if (name) return packs[name]
}

export const GET = (async ({ fetch, params: { pack } }) => {
  const endpoint = packEndpoint(pack)
  if (!endpoint) throw error(404, `${pack} is not a valid emoji pack`)

  console.log(`fetching emoji pack ${pack}:`, endpoint)
  const list = await fetchJson(endpoint, { fetch })
  if (!Array.isArray(list))
    throw error(422, `invalid endpoint response: ${typeof list}`)

  const set = list.filter(validateItem).reduce(reduceItem, {} as EmojiSet)

  return json(set)
}) satisfies RequestHandler

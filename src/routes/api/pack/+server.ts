import type { EmojiSet } from '$lib/client/emoji'
import { fetchJson } from '$lib/client/json'
import { reduceItem, validateItem } from '$lib/server/packs'
import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET = (async ({ fetch, url }) => {
  const endpoint = url.searchParams.get('url')
  if (!endpoint) throw error(404, `missing pack url`)

  if (!/^https?:/.test(endpoint))
    throw error(422, `invalid pack url: ${endpoint}`)

  console.log('fetching emoji pack:', endpoint)
  const list = await fetchJson(endpoint, { fetch })
  if (!Array.isArray(list))
    throw error(422, `invalid endpoint response: ${typeof list}`)

  const set = list.filter(validateItem).reduce(reduceItem, {} as EmojiSet)

  return json(set)
}) satisfies RequestHandler

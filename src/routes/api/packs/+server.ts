import { packNames } from '$lib/server/packs'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET = (() => {
  return json(packNames)
}) satisfies RequestHandler

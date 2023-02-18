import { defaultPackName, packNames } from '$lib/server/packs'
import type { PageServerLoad } from './$types'

export const load = (() => {
  return {
    defaultPackName,
    packNames,
  }
}) satisfies PageServerLoad

import { defaultPackName, packs, packNames } from '$lib/client/packs'
import type { PageServerLoad } from './$types'

export const load = (() => {
  return {
    defaultPackName,
    packs,
    packNames,
  }
}) satisfies PageServerLoad

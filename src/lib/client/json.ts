export interface FetchOptions {
  fetch?: typeof fetch
}

export async function fetchJson<T = unknown>(
  path: string,
  { fetch = window.fetch }: FetchOptions = {},
): Promise<T> {
  const response = await fetch(path, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const body = await response.text()

    throw new Error(body)
  }

  return response.json() as Promise<T>
}

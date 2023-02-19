<script lang="ts">
  import debounce from 'lodash/debounce'
  import shuffle from 'lodash/shuffle'
  import { onMount } from 'svelte'
  import {
    fetchEmojiPack,
    type EmojiPackItem,
    type EmojiSet,
  } from '$lib/client/emoji'
  import { page } from '$app/stores'
  import type { PageData } from './$types'

  export let data: PageData

  const { defaultPackName, packNames } = data

  let documentElement: HTMLElement | undefined
  let max: number | undefined
  let pack: string | undefined
  let emoji: string | undefined
  let filter: string | undefined
  let dark = true
  let emojis: EmojiSet | undefined
  let emojiNames: string[] | undefined
  let filteredNames: string[] | undefined
  let visibleNames: string[] | undefined
  let selectedEmoji: EmojiPackItem | undefined
  let showModal = false
  let error: string | undefined

  $: if (documentElement && pack) {
    loadEmojis(pack)
  }

  $: if (emojis) {
    selectedEmoji = emoji ? emojis[emoji] : undefined
  }

  $: if (emoji) {
    showModal = true
  }

  $: if (emojiNames) {
    if (filter) {
      try {
        const regex = new RegExp(filter, 'i')
        filteredNames = emojiNames.filter((name) => regex.test(name))
      } catch {
        filteredNames = emojiNames.filter(
          (name) => name.indexOf(filter as string) >= 0,
        )
      }
    } else {
      filteredNames = emojiNames
    }

    visibleNames = filteredNames.slice(0, max)
  }

  $: if (documentElement) {
    documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    if (dark) {
      documentElement.classList.add('dark')
    } else {
      documentElement.classList.remove('dark')
    }
  }

  const handleFilterInput = debounce((e: Event) => {
    filter = (e.target as HTMLInputElement).value
  }, 300)

  const showMore = () => {
    if (!max || !visibleNames || !filteredNames) return
    if (visibleNames.length === filteredNames.length) return

    visibleNames = filteredNames.slice(0, visibleNames.length + max)
  }

  const handleEmojiSelect = (name: string) => {
    if (!emojis) return

    emoji = name
  }

  const handleModalToggle = (e: Event) => {
    if (!(e.target as HTMLInputElement).checked) {
      emoji = undefined
    }
  }

  const handleShare = (data: ShareData) => {
    if (!navigator.share) return

    navigator.share(data)
  }

  const loadEmojis = async (nameOrEndpoint: string) => {
    try {
      console.log(`loading ${nameOrEndpoint}`)
      emojis = await fetchEmojiPack(nameOrEndpoint)
      emojiNames = shuffle(Object.keys(emojis))
    } catch (err) {
      error = err instanceof Error ? err.message : String(err)
    }
  }

  onMount(() => {
    dark = window.matchMedia('(prefers-color-scheme: dark)').matches
    documentElement = document.documentElement

    max = Number($page.url.searchParams.get('max') || 100)
    emoji = $page.url.searchParams.get('emoji') || undefined
    filter = $page.url.searchParams.get('filter') || ''
    pack = $page.url.searchParams.get('pack') || defaultPackName
  })
</script>

<svelte:head>
  <title>{emoji ? `moji - ${emoji}` : 'moji'}</title>
</svelte:head>

<div class="w-screen h-screen min-w-[352px]">
  <div class="drawer">
    <input id="drawer" type="checkbox" class="drawer-toggle" />
    <div class="drawer-content">
      <div class="navbar bg-base-100">
        <div class="navbar-start">
          <label
            for="drawer"
            class="btn btn-ghost drawer-button text-xl font-bold"
          >
            <div class="flex items-center">
              <div class="w-12 h-12 p-1">
                <img src="/favicon.svg" alt="moji.place logo" />
              </div>
              <span class="hidden sm:inline">moji.place</span>
            </div>
          </label>
        </div>
        <div class="navbar-center lg:min-w-[512px] md:min-w-[384px]">
          <div class="form-control w-full">
            <input
              class="input input-bordered"
              type="text"
              placeholder="Search for emojis..."
              value={filter}
              on:input={handleFilterInput}
            />
          </div>
        </div>
        <div class="navbar-end">
          <label class="btn btn-circle btn-ghost swap swap-rotate">
            <input type="checkbox" bind:checked={dark} />
            <p class="swap-on">🌙</p>
            <p class="swap-off">🌞</p>
          </label>
        </div>
      </div>
      <div class="w-full h-full">
        <div class="container mx-auto py-5">
          {#if visibleNames && emojis}
            <div class="flex flex-wrap justify-center gap-5">
              {#each visibleNames as name}
                <button on:click={() => handleEmojiSelect(name)}>
                  <div class="flex flex-col gap-2 w-16">
                    <div class="tooltip" data-tip={name}>
                      <div
                        class="w-full h-16 bg-slate-200 dark:bg-slate-600 rounded aspect-square"
                      >
                        <img
                          class="w-full h-full object-contain"
                          src={emojis[name].url}
                          alt={`${name} emoji`}
                        />
                      </div>
                      <p
                        class="text-center text-xs whitespace-nowrap overflow-hidden text-ellipsis"
                      >
                        {name}
                      </p>
                    </div>
                  </div>
                </button>
              {/each}
            </div>
            {#if max && visibleNames && filteredNames && filteredNames.length > visibleNames.length}
              <div class="text-center p-5">
                <button class="btn btn-ghost btn-xs" on:click={showMore}>
                  <p class="text-orange-500 dark:text-yellow-500 normal-case">
                    Load the next {Math.min(
                      max,
                      filteredNames.length - visibleNames.length,
                    ).toLocaleString()} of {(
                      filteredNames.length - visibleNames.length
                    ).toLocaleString()} emojis
                  </p>
                </button>
              </div>
            {/if}
          {/if}
        </div>
        {#if error}
          <div class="flex justify-center">
            <div class="alert alert-error shadow-lg w-auto">
              <div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="stroke-current flex-shrink-0 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  ><path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>
    <div class="drawer-side">
      <label for="drawer" class="drawer-overlay" />
      <ul class="menu p-4 w-80 bg-base-100 text-base-content">
        <li class="menu-title" style="opacity: 1;">
          <p class="flex items-center gap-2 text-xl font-bold">
            <a class="btn btn-ghost" href={$page.url.origin}>
              <svg
                class="w-8 h-8"
                stroke="currentColor"
                fill="currentColor"
                stroke-width="0"
                viewBox="0 0 512 512"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M261.56 101.28a8 8 0 00-11.06 0L66.4 277.15a8 8 0 00-2.47 5.79L63.9 448a32 32 0 0032 32H192a16 16 0 0016-16V328a8 8 0 018-8h80a8 8 0 018 8v136a16 16 0 0016 16h96.06a32 32 0 0032-32V282.94a8 8 0 00-2.47-5.79z"
                />
                <path
                  d="M490.91 244.15l-74.8-71.56V64a16 16 0 00-16-16h-48a16 16 0 00-16 16v32l-57.92-55.38C272.77 35.14 264.71 32 256 32c-8.68 0-16.72 3.14-22.14 8.63l-212.7 203.5c-6.22 6-7 15.87-1.34 22.37A16 16 0 0043 267.56L250.5 69.28a8 8 0 0111.06 0l207.52 198.28a16 16 0 0022.59-.44c6.14-6.36 5.63-16.86-.76-22.97z"
                />
              </svg>
            </a>
            <span>moji packs</span>
          </p>
        </li>
        <div class="divider" />
        {#each packNames as packName}
          <li class="bordered text-lg">
            <a class="" href={`?pack=${packName}`}>{packName}</a>
          </li>
        {/each}
      </ul>
    </div>
  </div>
</div>

<!-- modal handling -->
<input
  type="checkbox"
  id="emoji-modal"
  class="modal-toggle"
  bind:checked={showModal}
  on:change={handleModalToggle}
/>
<label for="emoji-modal" class="modal cursor-pointer">
  <label class="modal-box relative w-auto" for="">
    {#if pack && emoji && selectedEmoji}
      <div class="flex flex-col items-center justify-between gap-2">
        <div class="tooltip tooltip-bottom w-full" data-tip={emoji}>
          <a
            class="btn btn-link btn-sm text-info w-full"
            href={`${$page.url.origin}?emoji=${emoji}&filter=${
              filter || ''
            }&pack=${pack}`}
          >
            <h3
              class="text-xl font-bold text-center overflow-hidden whitespace-nowrap text-ellipsis mr-4"
            >
              {emoji}
            </h3>
          </a>
        </div>
        {#if navigator.canShare?.( { url: `${$page.url.origin}?emoji=${emoji}&filter=${filter}&pack=${pack}` }, )}
          <div class="absolute top-6 right-6">
            <button
              class="btn bt-ghost btn-square btn-sm"
              on:click={() =>
                emoji &&
                selectedEmoji &&
                handleShare({
                  text: emoji,
                  title: `moji - ${emoji}`,
                  url: `${$page.url.origin}?emoji=${emoji}&filter=${filter}&pack=${pack}`,
                })}
            >
              <svg
                class="w-full h-full p-1"
                stroke="currentColor"
                fill="currentColor"
                stroke-width="0"
                viewBox="0 0 512 512"
                xmlns="http://www.w3.org/2000/svg"
                ><path
                  fill="none"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="32"
                  d="M336 192h40a40 40 0 0140 40v192a40 40 0 01-40 40H136a40 40 0 01-40-40V232a40 40 0 0140-40h40m160-64l-80-80-80 80m80 193V48"
                />
              </svg>
            </button>
          </div>
        {/if}
        <div class="flex gap-2">
          <a href={selectedEmoji.url}>
            <button class="btn btn-accent items-center justify-between gap-2">
              Download
              <svg
                class="w-auto h-6"
                stroke="currentColor"
                fill="currentColor"
                stroke-width="0"
                viewBox="0 0 512 512"
                xmlns="http://www.w3.org/2000/svg"
                ><path
                  d="M472.7 189.5c-13.26-8.43-29.83-14.56-48.08-17.93A16 16 0 01412 159.28c-7.86-34.51-24.6-64.13-49.15-86.58C334.15 46.45 296.21 32 256 32c-35.35 0-68 11.08-94.37 32a150.13 150.13 0 00-41.95 52.83A16.05 16.05 0 01108 125.8c-27.13 4.9-50.53 14.68-68.41 28.7C13.7 174.83 0 203.56 0 237.6 0 305 55.93 352 136 352h104V224.45c0-8.61 6.62-16 15.23-16.43A16 16 0 01272 224v128h124c72.64 0 116-34.24 116-91.6 0-30.05-13.59-54.57-39.3-70.9zM240 425.42l-36.7-36.64a16 16 0 00-22.6 22.65l64 63.89a16 16 0 0022.6 0l64-63.89a16 16 0 00-22.6-22.65L272 425.42V352h-32z"
                />
              </svg>
            </button>
          </a>
          {#if selectedEmoji.backup_url}
            <a href={selectedEmoji.backup_url}>
              <button
                class="btn btn-secondary items-center justify-between gap-2"
              >
                Alternate
                <svg
                  class="w-auto h-6"
                  stroke="currentColor"
                  fill="currentColor"
                  stroke-width="0"
                  viewBox="0 0 512 512"
                  xmlns="http://www.w3.org/2000/svg"
                  ><path
                    fill="none"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="32"
                    d="M320 336h76c55 0 100-21.21 100-75.6s-53-73.47-96-75.6C391.11 99.74 329 48 256 48c-69 0-113.44 45.79-128 91.2-60 5.7-112 35.88-112 98.4S70 336 136 336h56m0 64.1l64 63.9 64-63.9M256 224v224.03"
                  />
                </svg>
              </button>
            </a>
          {/if}
        </div>
        <div
          class="flex items-center justify-center w-64 h-64 border border-slate-400 rounded-lg"
        >
          {#if navigator.canShare?.({ url: selectedEmoji.url })}
            <button
              class="btn bt-ghost btn-square w-fit h-fit"
              on:click={() =>
                emoji &&
                selectedEmoji &&
                handleShare({
                  text: emoji,
                  title: emoji,
                  url: selectedEmoji.url,
                })}
            >
              <img
                class="w-full h-full object-scale-down"
                src={selectedEmoji.url}
                alt={`${emoji} emoji`}
              />
            </button>
          {:else}
            <img
              class="w-full h-full object-scale-down"
              src={selectedEmoji.url}
              alt={`${emoji} emoji`}
            />
          {/if}
        </div>
        {#if navigator.canShare?.({ url: selectedEmoji.url })}
          <p class="text-info-focus text-center">👆 click to share</p>
        {/if}
      </div>
    {/if}
  </label>
</label>

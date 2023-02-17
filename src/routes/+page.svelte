<script lang="ts">
  import debounce from 'lodash/debounce'
  import shuffle from 'lodash/shuffle'
  import { onMount } from 'svelte'
  import type { EmojiSetItem } from '$lib/client/emoji'
  import type { PageData } from './$types'
  import { page } from '$app/stores'

  export let data: PageData

  let documentElement: HTMLElement | undefined = undefined
  let max = Number($page.url.searchParams.get('max') || 100)
  let dark = true
  let filter = ''
  let emojiSet = data.sets[0]
  let emojis = data.emojis[emojiSet]
  let emojiNames = shuffle(Object.keys(emojis))
  let visibleNames = emojiNames
  let selectedEmoji: EmojiSetItem | undefined
  let showModal = false

  $: if (filter) {
    const regex = new RegExp(filter, 'i')
    visibleNames = emojiNames.filter((name) => regex.test(name))
  }

  $: if (documentElement) {
    documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    if (dark) {
      documentElement.classList.add('dark')
    } else {
      documentElement.classList.remove('dark')
    }
  }

  onMount(() => {
    dark = window.matchMedia('(prefers-color-scheme: dark)').matches
    documentElement = document.documentElement
  })

  const handleFilterInput = debounce((e: Event) => {
    filter = (e.target as HTMLInputElement).value
  }, 300)

  const handleEmojiSelect = (name: string) => {
    if (!emojis) return

    selectedEmoji = {
      ...emojis[name],
      name,
    }
    showModal = true
  }

  const handleModalToggle = (e: Event) => {
    if (!(e.target as HTMLInputElement).value) {
      selectedEmoji = undefined
      showModal = false
    }
  }
</script>

<div class="w-screen h-screen min-w-[352px]">
  <div class="navbar bg-base-100">
    <div class="navbar-start">
      <a class="btn btn-ghost text-xl font-bold" href="https://moji.place">
        <span class="hidden sm:inline">moji.place</span>
        <span class="inline sm:hidden">moji</span>
      </a>
    </div>
    <div class="navbar-center lg:min-w-[512px] md:min-w-[384px]">
      <div class="form-control w-full">
        <input
          class="input input-bordered"
          type="text"
          placeholder="Search for emojis..."
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
      {#if visibleNames && documentElement}
        <div class="flex flex-wrap justify-center gap-5">
          {#each visibleNames.slice(0, max) as name}
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
        {#if emojiNames.length > max}
          <div class="text-center p-5">
            <p class="text-orange-500 dark:text-yellow-500">
              ...{emojiNames.length - max} more emojis
            </p>
          </div>
        {/if}
      {/if}
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
    {#if selectedEmoji}
      <div class="flex flex-col items-center gap-2">
        <h3 class="text-xl font-bold">{selectedEmoji.name}</h3>
        <div class="flex gap-2">
          <a href={selectedEmoji.url}>
            <button class="btn btn-accent gap-2">
              Download
              <svg
                stroke="currentColor"
                fill="currentColor"
                stroke-width="0"
                viewBox="0 0 512 512"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
                ><path
                  d="M472.7 189.5c-13.26-8.43-29.83-14.56-48.08-17.93A16 16 0 01412 159.28c-7.86-34.51-24.6-64.13-49.15-86.58C334.15 46.45 296.21 32 256 32c-35.35 0-68 11.08-94.37 32a150.13 150.13 0 00-41.95 52.83A16.05 16.05 0 01108 125.8c-27.13 4.9-50.53 14.68-68.41 28.7C13.7 174.83 0 203.56 0 237.6 0 305 55.93 352 136 352h104V224.45c0-8.61 6.62-16 15.23-16.43A16 16 0 01272 224v128h124c72.64 0 116-34.24 116-91.6 0-30.05-13.59-54.57-39.3-70.9zM240 425.42l-36.7-36.64a16 16 0 00-22.6 22.65l64 63.89a16 16 0 0022.6 0l64-63.89a16 16 0 00-22.6-22.65L272 425.42V352h-32z"
                /></svg
              >
            </button>
          </a>
          {#if selectedEmoji.backup_url}
            <a href={selectedEmoji.backup_url}>
              <button class="btn btn-secondary gap-2">
                Alternate
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  stroke-width="0"
                  viewBox="0 0 512 512"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                  ><path
                    fill="none"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="32"
                    d="M320 336h76c55 0 100-21.21 100-75.6s-53-73.47-96-75.6C391.11 99.74 329 48 256 48c-69 0-113.44 45.79-128 91.2-60 5.7-112 35.88-112 98.4S70 336 136 336h56m0 64.1l64 63.9 64-63.9M256 224v224.03"
                  /></svg
                >
              </button>
            </a>
          {/if}
        </div>
        <div class="w-64 h-64">
          <img
            class="w-full h-full object-scale-down"
            src={selectedEmoji.url}
            alt={`${selectedEmoji.name} emoji`}
          />
        </div>
      </div>
    {/if}
  </label>
</label>

<template>
  <header class="navbar fixed left-0 right-0 top-0 z-50 flex h-14 items-center justify-between border-b border-neutral-200 bg-white/95 px-4 shadow-sm backdrop-blur">
    <div class="flex min-w-0 items-center gap-3">
      <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-base font-bold text-white shadow-sm">
        E
      </div>

      <div class="min-w-0">
        <h1 class="truncate text-lg font-semibold leading-5 text-neutral-900">TokShop</h1>
        <div class="mt-0.5 inline-flex h-4 items-center rounded-full bg-violet-50 px-2 text-[0.68rem] font-semibold capitalize text-violet-700">
          {{ accountType }} mode
        </div>
      </div>
    </div>

    <button
      v-if="!this.$global.isSidebarOpen"
      type="button"
      class="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 text-neutral-700 transition-colors hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 lg:hidden"
      @click="toggleSidebarOpen"
      @click.stop
      aria-label="Open sidebar">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="23"
        height="23"
        fill="currentColor"
        viewBox="0 0 16 16">
        <path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"/>
      </svg>
    </button>

    <button
      v-if="this.$global.isSidebarOpen"
      type="button"
      class="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 text-neutral-700 transition-colors hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 lg:hidden"
      @click="toggleSidebarOpen"
      @click.stop
      aria-label="Close sidebar">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="25"
        height="25"
        fill="currentColor"
        viewBox="0 0 16 16">
        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
      </svg>
    </button>
  </header>
</template>

<script>
export default {
  computed: {
    accountType() {
      return this.$store.getters.activeAccountMode;
    }
  },

  methods: {
    toggleSidebarOpen() {
      this.$global.isSidebarOpen = !this.$global.isSidebarOpen;
    }
  }
}
</script>

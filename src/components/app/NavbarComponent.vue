<template>
  <header class="navbar bg-violet-500 flex justify-between items-center h-14 px-3 fixed top-0 left-0 right-0 z-50 shadow-lg">
    <div class="text-white flex items-center gap-2">
      <h1 class="text-2xl">Ecommerce</h1>
      <h5 class="text-[0.8rem] font-bold mt-1 italic tracking-widest capitalize">({{ this.$store.getters.user.account_type }})</h5>
    </div>
    <svg 
      v-if="!this.$global.isSidebarOpen"
      @click="toggleSidebarOpen"
      @click.stop
      xmlns="http://www.w3.org/2000/svg" 
      width="25" 
      height="25" 
      fill="currentColor" 
      class="bi bi-list text-white lg:hidden" 
      viewBox="0 0 16 16">
      <path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"/>
    </svg>
    <svg 
      v-if="this.$global.isSidebarOpen"
      @click="toggleSidebarOpen"
      @click.stop
      xmlns="http://www.w3.org/2000/svg" 
      width="30" 
      height="30" 
      fill="currentColor" 
      class="bi bi-x text-white lg:hidden" 
      viewBox="0 0 16 16">
      <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
    </svg>
  </header>
</template>

<script>
export default {
  methods: {
    toggleSidebarOpen() {
      this.$global.isSidebarOpen = !this.$global.isSidebarOpen;
    }
  }
}
</script>
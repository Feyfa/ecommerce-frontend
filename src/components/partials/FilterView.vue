<template>
  <div class="relative">
    <div id="filter" class="relative cursor-pointer">
      <button 
        class="w-32 border border-neutral-400 rounded-md text-black py-1 font-medium text-start pl-3"
        @click.stop="toggleFilter">Filter</button>
      <i class="fa-solid fa-caret-down absolute right-3 top-2 bottom-2"></i>
    </div>
    <ul 
      class="absolute w-full bg-white mt-1 rounded-md shadow-md h-0 overflow-auto z-30"
      :class="{'h-max p-1 border border-neutral-400': this.$global.isFilterOpen}"
      @click.stop>
      <li class="flex justify-between items-center h-6 text-sm">
        <label class="cursor-pointer w-full" for="done">Done</label>
        <input type="radio" name="filter" id="done">
      </li>
      <li class="flex justify-between items-center h-6 text-sm">
        <label class="cursor-pointer w-full" for="pending">Pending</label>
        <input type="radio" name="filter" id="pending">
      </li>
      <li class="flex justify-between items-center h-6 text-sm">
        <label class="cursor-pointer w-full" for="latest">Latest</label>
        <input type="radio" name="filter" id="latest">
      </li>
      <li class="flex justify-between items-center h-6 text-sm">
        <label class="cursor-pointer w-full" for="oldest">Oldest</label>
        <input type="radio" name="filter" id="oldest">
      </li>
      <li class="flex justify-between items-center text-sm mt-1">
        <button
          class="w-full bg-blue-500 border border-neutral-400 rounded text-white h-6 font-medium"
          @click="this.$global.isFilterOpen = false">
          Save
        </button>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  mounted() {
    this.$global.isFilterOpen = false;
  },

  methods: {
    toggleFilter() {
      this.$global.isFilterOpen = !this.$global.isFilterOpen
    }
  }
}
</script>
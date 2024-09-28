<template>
  <div class="relative">
    <div id="filter" class="relative cursor-pointer">
      <button 
        class="w-32 border border-neutral-400 rounded-md text-black py-1 font-medium text-start pl-3"
        @click.stop="toggleFilter">Filter</button>
      <i class="fa-solid fa-caret-down absolute right-3 top-2 bottom-2" :class="{'rotate-180': this.$global.isFilterOpen}"></i>
    </div>
    <ul 
      class="absolute w-full bg-white mt-1 rounded-md shadow-md h-0 overflow-auto z-30"
      :class="{'h-max p-1 border border-neutral-400': this.$global.isFilterOpen}"
      @click.stop>
      <li class="flex justify-between items-center h-6 text-sm">
        <input type="radio" name="filter" id="latest" value="latest" v-model="filter">
        <label class="cursor-pointer w-full pl-1.5" for="latest">Latest</label>
      </li>
      <li class="flex justify-between items-center h-6 text-sm">
        <input type="radio" name="filter" id="oldest" value="oldest" v-model="filter">
        <label class="cursor-pointer w-full pl-1.5" for="oldest">Oldest</label>
      </li>
      <li class="flex justify-between items-center h-6 text-sm">
        <input type="radio" name="filter" id="done" value="done" v-model="filter">
        <label class="cursor-pointer w-full pl-1.5" for="done">Done</label>
      </li>
      <li class="flex justify-between items-center h-6 text-sm">
        <input type="radio" name="filter" id="pending" value="pending" v-model="filter">
        <label class="cursor-pointer w-full pl-1.5" for="pending">Pending</label>
      </li>
      <li class="flex justify-between items-center h-6 text-sm">
        <input type="radio" name="filter" id="expired" value="expired" v-model="filter">
        <label class="cursor-pointer w-full pl-1.5" for="expired">Expired</label>
      </li>
      <li class="flex justify-between items-center text-sm mt-1">
        <button
          class="w-full bg-blue-500 border border-neutral-400 rounded text-white h-6 font-medium"
          @click="saveFilter">
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

  data() {
    return {
      filter: 'latest',
    }
  },

  methods: {
    saveFilter() {
      this.$emit('onSave', this.filter);
      this.$global.isFilterOpen = false;
    },

    toggleFilter() {
      this.$global.isFilterOpen = !this.$global.isFilterOpen
    }
  }
}
</script>
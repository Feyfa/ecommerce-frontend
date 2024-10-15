<template>
  <h3 
    class="font-semibold text-[0.7rem] sm:text-[0.8rem] border border-neutral-300 w-[4rem] sm:w-[4.5rem] text-center rounded-xl text-white shadow"
    :class="{
      'bg-blue-500': type == 'pending',
      'bg-green-500': type == 'done',
      'bg-green-500': type == 'success',
      'bg-red-500': type == 'expire',
      'bg-red-500': type == 'failed'
    }">
    {{ text }}
  </h3>
</template>

<script>
export default {
  props: {
    type: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: true
    }
  }
}
</script>
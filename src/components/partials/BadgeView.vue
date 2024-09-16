<template>
  <h3 
    class="font-semibold text-[0.8rem] border border-neutral-300 w-[4.5rem] text-center rounded-xl text-white shadow"
    :class="{
      'bg-blue-500': type == 'pending',
      'bg-green-500': type == 'done',
      'bg-red-500': type == 'expire'
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
<template>
    <div
        v-if="show"
        @click.self="closeModal" 
        class="border border-black fixed inset-0 bg-[rgba(0,0,0,.7)] z-[60] flex justify-center items-center">
        <div 
        class="border border-neutral-500 shadow mx-auto w-[95%] sm:w-[80%] md:w-[75%] lg:w-[65%] xl:w-[55%] min-h-[150px] bg-white rounded-lg">
            <slot></slot>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        show: {
            type: [Boolean],
            default: false,
        }
    },

    methods: {
        closeModal() {
            this.$emit('update:show', false);
        }   
    }
}
</script>
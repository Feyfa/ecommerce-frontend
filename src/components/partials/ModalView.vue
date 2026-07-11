<template>
    <div
        v-if="show"
        @click.self="closeModal" 
        class="fixed inset-0 bg-[rgba(15,23,42,.64)] z-[60] flex justify-center items-center px-4">
        <div
        :class="[
            'modal-panel mx-auto w-[95%] sm:w-[80%] md:w-[75%] lg:w-[65%] xl:w-[55%] min-h-[150px] bg-white',
            panelClass,
        ]">
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
        },
        panelClass: {
            type: [String, Array, Object],
            default: '',
        }
    },

    methods: {
        closeModal() {
            this.$emit('update:show', false);
        }   
    }
}
</script>

<style scoped>
.modal-panel {
    max-width: min(980px, calc(100vw - 32px));
    max-height: calc(100vh - 48px);
    overflow: auto;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: 0 24px 70px rgba(15, 23, 42, 0.28);
}
</style>

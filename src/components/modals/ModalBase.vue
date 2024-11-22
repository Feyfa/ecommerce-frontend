<template>
    <div class="fixed inset-0 z-[100] bg-[rgba(0,0,0,.4)] pt-14 flex justify-center items-start" @click="closeModal">
        <slot></slot>
    </div>
</template>

<script>
export default {
    methods: {
        closeModal() {
            this.$global.modals.changePassword = false
        }
    }
}
</script>
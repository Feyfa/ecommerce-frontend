<template>
    <div class="flex flex-col gap-1">
        <span class="text-xs font-medium text-neutral-500">{{ label }}</span>
        <span class="break-words font-semibold text-neutral-900">{{ value || '-' }}</span>
    </div>
</template>

<script>
export default {
    props: {
        label: {
            type: String,
            required: true
        },
        value: {
            type: [String, Number],
            default: '-'
        }
    }
}
</script>

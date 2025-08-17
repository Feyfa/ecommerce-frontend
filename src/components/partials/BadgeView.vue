<template>
    <h3 
        class="font-normal text-[12px] border border-neutral-300 shadow-sm w-max text-center rounded-xl text-white py-0.5 px-2"
        :class="background">
        {{ text }}
    </h3>
</template>

<script>
export default {
    props: {
        color: {
            type: String,
        },
        text: {
            type: String,
            required: true
        }
    },

    computed: {
        background() {
            switch (this.color) {
                case 'yellow':
                    return 'bg-[#e6a23c]';
                case 'green':
                    return 'bg-[#008000]';
                default:
                    return 'bg-gray-400';
            }
        }
    }
}
</script>
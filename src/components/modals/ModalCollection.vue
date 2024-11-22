<template>
    <ChangePassword :show="this.$global.modals.changePassword" />
</template>

<script>
import ChangePassword from './ChangePassword.vue';

export default {
    components: {
        ChangePassword
    },
}

</script>
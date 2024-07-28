<template>
  <header class="navbar bg-violet-500 flex justify-between items-center h-14 px-10 fixed top-0 left-0 right-0 z-50">
    <h1 class="text-2xl text-white">My Ecommerce</h1>
    <form>
        <button
            type="button"
            name="logout_submit"
            class="text-white border-2 border-neutral-300 w-24 py-1.5 rounded bg-red-500 hover:bg-[#ff4d4d]"
            @click="logoutSubmit">Logout</button>
    </form>
  </header>
</template>

<script>
export default {
  methods: {
    logoutSubmit() {
      this.$store.dispatch('logoutSubmit')
                 .then(response => {
                  // console.log(response);

                  if(response.data.status == 200) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');

                    this.$router.push('/login');
                  }

                 })
                 .catch(error => {
                  console.error(error);
                 });
    }
  }
}
</script>
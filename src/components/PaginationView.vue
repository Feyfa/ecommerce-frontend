<template>
    <nav v-if="pagination.total > 0" class="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <span class="text-neutral-600">
            {{ pagination.from }}-{{ pagination.to }} dari {{ pagination.total }} transaksi
        </span>

        <div class="flex items-center justify-end gap-1">
            <button
                class="inline-flex h-9 w-9 items-center justify-center rounded-md text-neutral-500 transition hover:bg-neutral-100 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
                :disabled="currentPage <= 1"
                aria-label="Halaman sebelumnya"
                @click="changePage(currentPage - 1)">
                <i class="fa-solid fa-chevron-left"></i>
            </button>

            <template v-for="(page, index) in paginationPages" :key="`${page}-${index}`">
                <span v-if="page == 'ellipsis'" class="inline-flex h-9 min-w-9 items-center justify-center px-2 text-neutral-500">...</span>
                <button
                    v-else
                    class="inline-flex h-9 min-w-9 items-center justify-center rounded-md px-3 text-sm font-semibold transition"
                    :class="page == currentPage ? 'border-b-2 border-violet-600 text-violet-700' : 'text-neutral-600 hover:bg-neutral-100 hover:text-violet-700'"
                    :aria-current="page == currentPage ? 'page' : null"
                    @click="changePage(page)">
                    {{ page }}
                </button>
            </template>

            <button
                class="inline-flex h-9 w-9 items-center justify-center rounded-md text-neutral-500 transition hover:bg-neutral-100 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
                :disabled="currentPage >= lastPage"
                aria-label="Halaman berikutnya"
                @click="changePage(currentPage + 1)">
                <i class="fa-solid fa-chevron-right"></i>
            </button>
        </div>
    </nav>
</template>

<script>
export default {
    props: {
        pagination: {
            type: Object,
            required: true
        }
    },

    emits: ['change-page'],

    computed: {
        currentPage() {
            return Number(this.pagination.current_page || 1);
        },

        lastPage() {
            return Number(this.pagination.last_page || 1);
        },

        paginationPages() {
            if(this.lastPage <= 7)
                return Array.from({ length: this.lastPage }, (_, index) => index + 1);

            if(this.currentPage <= 4)
                return [1, 2, 3, 4, 5, 6, 7, 'ellipsis', this.lastPage];

            if(this.currentPage >= this.lastPage - 3)
                return [1, 'ellipsis', ...Array.from({ length: 7 }, (_, index) => this.lastPage - 6 + index)];

            return [1, 'ellipsis', this.currentPage - 2, this.currentPage - 1, this.currentPage, this.currentPage + 1, this.currentPage + 2, 'ellipsis', this.lastPage];
        }
    },

    methods: {
        changePage(page) {
            if(page < 1 || page > this.lastPage || page == this.currentPage)
                return;

            this.$emit('change-page', page);
        }
    }
}
</script>

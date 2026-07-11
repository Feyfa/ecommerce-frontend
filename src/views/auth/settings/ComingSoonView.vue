<template>
    <section class="coming-soon-view">
        <div class="coming-soon-badge">Segera</div>
        <h2>Segera tersedia</h2>
        <p>Halaman ini sedang disiapkan dan akan tersedia pada pembaruan berikutnya.</p>
    </section>
</template>

<style scoped>
.coming-soon-view {
    display: flex;
    min-height: 320px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 1px dashed #cbd5e1;
    border-radius: 8px;
    background: #f8fafc;
    padding: 34px 24px;
    text-align: center;
    opacity: 0.72;
    filter: grayscale(0.18);
    box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.1);
    cursor: default;
}

.coming-soon-badge {
    display: inline-flex;
    align-items: center;
    height: 28px;
    margin-bottom: 14px;
    border-radius: 999px;
    background: #e2e8f0;
    color: #64748b;
    font-size: 12px;
    font-weight: 700;
    padding: 0 12px;
}

.coming-soon-view h2 {
    color: #334155;
    font-size: 24px;
    font-weight: 700;
}

.coming-soon-view p {
    max-width: 520px;
    margin-top: 8px;
    color: #94a3b8;
    font-size: 15px;
    line-height: 1.6;
}
</style>

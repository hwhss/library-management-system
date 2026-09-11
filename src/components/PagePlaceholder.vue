<script setup>
defineProps({ title: { type: String, required: true }, description: { type: String, required: true } })
</script>

<template>
  <section class="placeholder-card">
    <p class="placeholder-card__eyebrow">智慧图书馆</p>
    <h1>{{ title }}</h1>
    <p>{{ description }}</p>
  </section>
</template>

<style scoped>
.placeholder-card {
  padding: 48px 40px;
  background: var(--card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border);
  text-align: center;
}
.placeholder-card__eyebrow {
  margin: 0 0 12px;
  color: var(--primary);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.placeholder-card h1 {
  margin: 0 0 12px;
  font-size: 26px;
  font-weight: 700;
  letter-spacing: var(--tracking-tight);
  color: var(--foreground);
}
.placeholder-card p:last-child {
  margin: 0;
  color: var(--muted-foreground);
  font-size: 15px;
  line-height: 1.6;
}
</style>

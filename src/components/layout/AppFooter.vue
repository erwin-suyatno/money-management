<template>
  <footer class="app-footer">
    <div class="app-footer__container">
      <p class="app-footer__text">
        <span class="app-footer__version">v{{ version }}</span>
        <span class="app-footer__dot">·</span>
        <span class="app-footer__credit">
          Dibuat oleh 
          <a href="https://www.instagram.com/erwin.suyatno/" target="_blank" class="app-footer__link">
            Erwin Suyatno
          </a>
        </span>
      </p>
      <p class="app-footer__copyright">&copy; {{ year }} MoneyCap</p>
    </div>
  </footer>
</template>

<script setup>
const version = '2.0.0'
const year = new Date().getFullYear()
</script>

<style scoped>
.app-footer {
  width: 100%;
  padding: var(--space-xl) var(--space-md) var(--space-2xl);
  border-top: 1px solid var(--color-border);
  margin-top: auto;
}

@media (max-width: 639.9px) {
  .app-footer {
    padding-bottom: calc(var(--space-2xl) + 80px); /* Leave room for BottomNav */
  }
}

.app-footer__container {
  max-width: 7xl;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  text-align: center;
}

.app-footer__text {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-muted);
}

.app-footer__version {
  background-color: var(--color-bg-base);
  padding: 2px 8px;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border-strong);
}

.app-footer__dot {
  margin: 0 var(--space-sm);
}

.app-footer__link {
  color: var(--color-primary-600);
  font-weight: var(--font-weight-semibold);
  transition: opacity var(--transition-fast);
}

.app-footer__link:hover {
  text-decoration: underline;
  opacity: 0.8;
}

.app-footer__copyright {
  font-size: 10px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
</style>

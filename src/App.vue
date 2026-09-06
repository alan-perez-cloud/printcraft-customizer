<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AuthStatus from './components/AuthStatus.vue'
import KeyboardPreview from './components/KeyboardPreview.vue'
import AlphabetControls from './components/AlphabetControls.vue'
import PurchasePanel from './components/PurchasePanel.vue'
import { useAuthStore } from './stores/auth'

const auth = useAuthStore()
onMounted(() => auth.autoLoginDev())

// Ref al Paso 2, para poder desplazarnos ahí desde el botón "Falta tu pedido".
const orderStep = ref<HTMLElement | null>(null)
function scrollToOrder() {
  orderStep.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <div class="app-shell">
    <div class="floating-logo"><!-- logo --></div>
    <div class="floating-auth"><AuthStatus /></div>

    <main class="builder">
      <section class="step">
        <header class="step-header">
          <span class="step-figure" aria-hidden="true">01</span>
          <div class="step-copy">
            <p class="step-kicker">Paso 1 de 2</p>
            <h2 class="step-title">Elige tus alfabetos y personaliza</h2>
          </div>
        </header>

        <div class="step-1-grid">
          <AlphabetControls />
          <KeyboardPreview />
        </div>

        <button type="button" class="scroll-cue" @click="scrollToOrder">
          <span>Falta tu pedido</span>
          <svg class="scroll-cue-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 6l5 5 5-5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </section>

      <section class="step" ref="orderStep">
        <header class="step-header">
          <span class="step-figure" aria-hidden="true">02</span>
          <div class="step-copy">
            <p class="step-kicker">Paso 2 de 2</p>
            <h2 class="step-title">Realiza tu pedido</h2>
          </div>
        </header>

        <div class="step-2-inner">
          <PurchasePanel />
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  position: relative;
  min-height: 100svh;
}

.floating-logo {
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 10;
}

.floating-auth {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 10;
}

/* Columna con los 2 pasos. --debug-border se define en theme.css (por defecto "none"). */
.builder {
  max-width: 1120px;
  margin: 0 auto;
  padding: 88px 24px 72px;
  display: flex;
  flex-direction: column;
}

.step {
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-block: 48px;
  border: var(--debug-border);
}

/* Solo el Paso 1 ocupa el alto completo de la pantalla: eso es lo que
   obliga a hacer scroll y le avisa al usuario que falta un paso más. */
.step + .step {
  min-height: auto;
  justify-content: flex-start;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 32px;
}

.step-figure {
  font-family: var(--font-display-family);
  font-size: clamp(2.2rem, 6vw, 3.2rem);
  font-weight: 700;
  color: var(--accent);
  opacity: 0.35;
  line-height: 1;
}

.step-copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.step-kicker {
  margin: 0;
  font-family: var(--font-body);
  font-size: 0.78em;
  font-weight: 600;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.step-title {
  margin: 0;
  font-family: var(--font-display-family);
  font-size: clamp(1.25rem, 2.4vw, 1.6rem);
  font-weight: 700;
  color: var(--ink);
}

.step-1-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  align-items: start;
}

@media (min-width: 641px) {
  .step-1-grid {
    grid-template-columns: minmax(260px, 320px) 1fr;
    gap: 28px;
  }
}

@media (min-width: 961px) {
  .step-1-grid {
    grid-template-columns: minmax(300px, 360px) 1fr;
    gap: 36px;
  }
}

.scroll-cue {
  align-self: center;
  margin-top: 40px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  color: var(--accent);
  font-family: var(--font-body);
  font-size: 0.82em;
  font-weight: 600;
  cursor: pointer;
  padding: 10px 6px;
}

.scroll-cue-arrow {
  animation: scroll-bounce 1.6s ease-in-out infinite;
}

@keyframes scroll-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(5px); }
}

@media (prefers-reduced-motion: reduce) {
  .scroll-cue-arrow { animation: none; }
}

.step-2-inner {
  width: 100%;
  max-width: 460px;
  margin: 0 auto;
}

@media (max-width: 640px) {
  .builder { padding: 76px 16px 56px; }
  .step { padding-block: 32px; }
  .step-header { gap: 14px; margin-bottom: 24px; }
}
</style>
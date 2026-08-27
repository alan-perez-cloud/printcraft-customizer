<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { PRICES, useCustomizationStore, type ProductType } from '../stores/customization'
import { useAuthStore } from '../stores/auth'

const store = useCustomizationStore()
const { alphabetSummary, keycapLabel, hasSecondary, secondaryColor, designConfig } = storeToRefs(store)
const auth = useAuthStore()

const selectedProduct = ref<ProductType>('pdf')
const status = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
const errorMessage = ref('')

const products: { type: ProductType; title: string; description: string }[] = [
  { type: 'pdf', title: 'PDF digital', description: 'Descarga el archivo listo para imprimir en casa.' },
  { type: 'print', title: 'Impresión bajo demanda', description: 'Te lo enviamos ya impreso y recortado, listo para pegar.' },
]

const price = computed(() => PRICES[selectedProduct.value])
const ctaLabel = computed(() =>
  status.value === 'loading'
    ? 'Procesando…'
    : `${selectedProduct.value === 'pdf' ? 'Comprar PDF' : 'Pedir impreso'} · $${price.value}`
)

// API_BASE / el header de auth son un supuesto: ajústalo si tu cliente real
// (api.ts, el shape de tu store de auth) es distinto a esto.
const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

async function placeOrder() {
  status.value = 'loading'
  errorMessage.value = ''
  try {
    const authHeaders = auth.token ? { Authorization: `Bearer ${auth.token}` } : {}

    const designRes = await fetch(`${API_BASE}/api/v1/designs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ config: designConfig.value }),
    })
    if (!designRes.ok) throw new Error('No se pudo guardar el diseño')
    const design = await designRes.json()

    const orderRes = await fetch(`${API_BASE}/api/v1/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ design_id: design.id, product: selectedProduct.value }),
    })
    if (!orderRes.ok) throw new Error('No se pudo crear el pedido')

    status.value = 'success'
  } catch (err) {
    status.value = 'error'
    errorMessage.value = err instanceof Error ? err.message : 'Algo salió mal'
  }
}
</script>

<template>
  <div class="purchase-panel">
    <h2 class="panel-title">Tu pedido</h2>

    <ul class="summary-list">
      <li class="summary-row">
        <span class="summary-label">Alfabeto</span>
        <span class="summary-value">{{ alphabetSummary }}</span>
      </li>
      <li class="summary-row">
        <span class="summary-label">Estilo de tecla</span>
        <span class="summary-value">{{ keycapLabel }}</span>
      </li>
      <li class="summary-row" v-if="hasSecondary">
        <span class="summary-label">Color secundario</span>
        <span class="summary-value color-value">
          <span class="swatch" :style="{ background: secondaryColor }"></span>
          {{ secondaryColor }}
        </span>
      </li>
    </ul>

    <div class="divider"></div>

    <div class="product-options">
      <button
        v-for="p in products"
        :key="p.type"
        class="product-option"
        :class="{ active: selectedProduct === p.type }"
        @click="selectedProduct = p.type"
      >
        <span class="option-top">
          <span class="option-title">{{ p.title }}</span>
          <span class="option-price">${{ PRICES[p.type] }}</span>
        </span>
        <span class="option-description">{{ p.description }}</span>
      </button>
    </div>

    <button class="cta-btn" :disabled="status === 'loading'" @click="placeOrder">
      {{ ctaLabel }}
    </button>

    <p class="status-note success" v-if="status === 'success'">
      ¡Listo! Te avisamos por correo en cuanto esté disponible.
    </p>
    <p class="status-note error" v-else-if="status === 'error'">
      {{ errorMessage }}. Inténtalo de nuevo.
    </p>
  </div>
</template>

<style scoped>
/* Panel 3 — variables en theme.css bajo "PANEL 3 — Resumen y compra" */
.purchase-panel {
  background: var(--purchase-bg);
  border: var(--purchase-border);
  box-shadow: var(--purchase-shadow);
  border-radius: var(--purchase-radius);
  font-size: var(--purchase-font-size);
  font-family: var(--font-body);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  width: var(--purchase-width);
}

.panel-title {
  font-family: var(--font-heading);
  font-size: 1.15em;
  font-weight: 600;
  color: #2a2a2a;
  margin: 0;
}

.summary-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: var(--purchase-summary-height, 80px);
}

.summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 0.85em;
}

.summary-label {
  color: #a39a85;
  font-size: 0.85em;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 600;
}

.summary-value {
  color: #2a2a2a;
  font-weight: 600;
  text-align: right;
}

.color-value {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.swatch {
  width: 14px;
  height: 14px;
  border-radius: 4px;
  border: 1px solid #eae6da;
  flex-shrink: 0;
}

.divider {
  height: 1px;
  background: #eae6da;
}

.product-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.product-option {
  text-align: left;
  background: #fff;
  border: 1.5px solid #eae6da;
  border-radius: 12px;
  padding: 12px 14px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: border-color 0.15s, background 0.15s;
  font-family: inherit;
}

.product-option:hover {
  border-color: #d9b48f;
}

.product-option.active {
  border-color: #c17a3d;
  background: #fbf3ea;
}

.option-top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.option-title {
  font-size: 0.9em;
  font-weight: 700;
  color: #2a2a2a;
}

.option-price {
  font-size: 0.9em;
  font-weight: 700;
  color: #c17a3d;
}

.option-description {
  font-size: 0.75em;
  color: #a39a85;
  line-height: 1.4;
}

.cta-btn {
  background: #c17a3d;
  color: #fdfcf9;
  border: none;
  border-radius: 12px;
  padding: 14px;
  font-size: 0.9em;
  font-weight: 700;
  cursor: pointer;
  transition: filter 0.15s;
  font-family: inherit;
}

.cta-btn:hover:not(:disabled) {
  filter: brightness(0.93);
}

.cta-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.status-note {
  text-align: center;
  font-size: 0.72em;
  margin: 0;
}

.status-note.success {
  color: #4a7c4e;
}

.status-note.error {
  color: #b3523d;
}
</style>
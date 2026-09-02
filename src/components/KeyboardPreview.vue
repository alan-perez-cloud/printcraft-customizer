<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useCustomizationStore, fetchLayout, type LayoutKey } from '../stores/customization'

const store = useCustomizationStore()
const { primaryAlphabet, secondaryAlphabet, hasSecondary, primaryLabel, secondaryLabel, secondaryColor } = storeToRefs(store)

const primaryKeys = ref<LayoutKey[]>([])
const secondaryKeys = ref<LayoutKey[]>([])

async function loadKeys() {
  primaryKeys.value = primaryAlphabet.value ? await fetchLayout(primaryAlphabet.value) : []
  secondaryKeys.value = hasSecondary.value ? await fetchLayout(secondaryAlphabet.value) : []
}

onMounted(loadKeys)
watch([primaryAlphabet, secondaryAlphabet, hasSecondary], loadKeys)
</script>

<template>
  <div class="keyboard-preview">
    <div class="alphabet-label">
      {{ hasSecondary ? `${primaryLabel} · ${secondaryLabel}` : primaryLabel }}
    </div>

    <div class="keyboard-frame">
      <div class="key" v-for="(k, i) in primaryKeys" :key="k.key_code || i">
        <span class="corner shift" v-if="k.shift">{{ k.shift }}</span>
        <span class="corner secondary" v-if="secondaryKeys[i]?.base" :style="{ color: secondaryColor }">{{ secondaryKeys[i].base }}</span>
        <span class="center">{{ k.base }}</span>
        <span class="corner altgr" v-if="k.altgr">{{ k.altgr }}</span>
        <span class="corner secondary-altgr" v-if="secondaryKeys[i]?.altgr" :style="{ color: secondaryColor }">{{ secondaryKeys[i].altgr }}</span>
      </div>
    </div>

    <p class="reference-note">Vista de referencia · no es el archivo final</p>
  </div>
</template>

<style scoped>
.keyboard-preview {
  background: var(--panel);
  border: var(--border-component);
  box-shadow: var(--preview-shadow);
  border-radius: var(--r-xl);
  width: var(--preview-width);
  padding: 40px;
  box-sizing: border-box;
}

.alphabet-label {
  font-size: 0.75em;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin-bottom: 28px;
  font-weight: 600;
  text-align: center;
}

.keyboard-frame {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.key {
  width: 56px;
  height: 56px;
  padding: 5px;
  background: #fdfcf9;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-family: var(--font-heading);
  font-size: var(--preview-key-font-size);
  color: var(--text-dark);
  box-shadow: 0 6px 14px rgba(0,0,0,0.14), 0 1px 2px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.7);
  border: 1px solid #eae6da;
  position: relative;
  flex-shrink: 0;
}

.center {
  font-size: 1.2em;
}

.corner {
  position: absolute;
  font-size: 0.6em;
  font-weight: 400;
  font-family: system-ui, sans-serif;
  color: #999;
}

.corner.shift { top: 5px; left: 7px; }
.corner.secondary { top: 5px; right: 7px; }
.corner.altgr { bottom: 5px; right: 7px; color: #c17a3d; }
.corner.secondary-altgr { bottom: 5px; left: 7px; }

.reference-note {
  text-align: center;
  font-size: 0.7em;
  color: var(--text-muted);
  margin-top: 28px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
</style>
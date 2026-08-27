<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ALPHABETS, useCustomizationStore } from '../stores/customization'

const store = useCustomizationStore()
const {
  dualAlphabet,
  primaryAlphabet,
  secondaryAlphabet,
  defaultSecondaryColor,
  secondaryColor,
  keycapMode,
  secondaryOptions,
} = storeToRefs(store)
</script>

<template>
  <div class="controls-panel">
    <div class="control-group">
      <label class="field-label">Alfabetos</label>
      <div class="segmented">
        <div class="segment-thumb" :class="{ 'is-second': dualAlphabet }"></div>
        <button
          type="button"
          class="segment"
          :class="{ active: !dualAlphabet }"
          @click="dualAlphabet = false"
        >Uno</button>
        <button
          type="button"
          class="segment"
          :class="{ active: dualAlphabet }"
          @click="dualAlphabet = true"
        >Dos</button>
      </div>
    </div>

    <div class="control-group">
      <label class="field-label">Alfabeto principal</label>
      <select v-model="primaryAlphabet" class="select-field">
        <option v-for="a in ALPHABETS" :key="a.value" :value="a.value">{{ a.label }}</option>
      </select>
    </div>

    <div class="control-group">
      <label class="field-label">Alfabeto secundario</label>
      <div class="secondary-row">
        <select v-model="secondaryAlphabet" class="select-field secondary-select" :disabled="!dualAlphabet">
          <option value="">—</option>
          <option v-for="a in secondaryOptions" :key="a.value" :value="a.value">{{ a.label }}</option>
        </select>

        <button
          type="button"
          class="color-circle default"
          :class="{ active: secondaryColor === defaultSecondaryColor }"
          :style="{ background: defaultSecondaryColor }"
          :disabled="!dualAlphabet"
          title="Color por defecto"
          @click="store.resetSecondaryColor"
        ></button>

        <label
          class="color-circle custom"
          :class="{ active: secondaryColor !== defaultSecondaryColor, 'is-disabled': !dualAlphabet }"
          title="Personalizar color"
        >
          <input type="color" v-model="secondaryColor" class="color-input-hidden" :disabled="!dualAlphabet" />
        </label>
      </div>
    </div>

    <div class="control-group">
      <label class="field-label">Estilo de tecla</label>
      <div class="mode-buttons">
        <button
          v-for="mode in ['white','black','gray']"
          :key="mode"
          :class="['mode-btn', mode, { active: keycapMode === mode }]"
          @click="keycapMode = mode as any"
        ></button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Panel 1 — variables en theme.css bajo "PANEL 1 — Controles de alfabeto" */
.controls-panel {
  background: var(--controls-bg);
  border: var(--controls-border);
  box-shadow: var(--controls-shadow);
  border-radius: var(--controls-radius);
  font-size: var(--controls-font-size);
  font-family: var(--font-body);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 22px;
  width: var(--controls-width);
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: 0.72em;
  color: #a39a85;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
}

.segmented {
  position: relative;
  display: flex;
  background: #ece7da;
  border-radius: 14px;
  padding: 4px;
  gap: 4px;
}

.segment-thumb {
  position: absolute;
  top: 4px;
  left: 4px;
  width: calc(50% - 6px);
  height: calc(100% - 8px);
  background: #fdfcf9;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
}

.segment-thumb.is-second {
  transform: translateX(calc(100% + 4px));
}

.segment {
  position: relative;
  z-index: 1;
  flex: 1;
  border: none;
  background: transparent;
  border-radius: 10px;
  padding: 9px 0;
  font-size: 0.85em;
  font-weight: 600;
  color: #a39a85;
  cursor: pointer;
  font-family: inherit;
  transition: color 0.2s;
}

.segment.active {
  color: #2a2a2a;
}

.select-field {
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid #eae6da;
  background: #fff;
  font-size: 0.9em;
  color: #2a2a2a;
  font-family: inherit;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23a39a85' stroke-width='1.5' fill='none'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
}

.select-field:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.secondary-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.secondary-select {
  flex: 1;
  min-width: 0;
}

.color-circle {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 2px solid #eae6da;
  cursor: pointer;
  flex-shrink: 0;
  padding: 0;
  position: relative;
  overflow: hidden;
  display: block;
  transition: border-color 0.15s, transform 0.12s;
}

.color-circle:hover:not(:disabled):not(.is-disabled) {
  transform: scale(1.06);
}

.color-circle:disabled,
.color-circle.is-disabled {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
}

.color-circle.custom {
  background: conic-gradient(from 180deg, #ff6161, #ffd35f, #7fe38a, #5fc6ff, #7a7dff, #e070e0, #ff6161);
  border-color: transparent;
}

.color-circle.active {
  border-color: #c17a3d;
}

.color-input-hidden {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  padding: 0;
  border: none;
}

.mode-buttons {
  display: flex;
  gap: 10px;
}

.mode-btn {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  cursor: pointer;
  border: 2px solid transparent;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.mode-btn.white { background: #fdfcf9; }
.mode-btn.black { background: #2a2a2a; }
.mode-btn.gray { background: #8a8a85; }

.mode-btn.active {
  border-color: #c17a3d;
}
</style>
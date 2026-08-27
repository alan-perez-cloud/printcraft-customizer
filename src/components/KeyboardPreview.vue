<script setup lang="ts">
const numberRow = [
  { base: 'é', shift: '2', altgr: '~' },
  { base: '"', shift: '3', altgr: '#' },
  { base: 'è', shift: '7', altgr: '' },
  { base: 'ç', shift: '9', altgr: '^' },
  { base: 'à', shift: '0', altgr: '@' },
]

const topLetters = ['A','Z','E','R','T','Y','U']
const midLetters = ['Q','S','D','F','G','H']

const bottomLetters = [
  { base: 'W', altgr: '' },
  { base: 'X', altgr: '' },
  { base: 'C', altgr: '' },
  { base: 'V', altgr: '' },
  { base: 'N', altgr: '€' },
]
</script>
<template>
  <div class="keyboard-preview">
    <div class="alphabet-label">Русский · AZERTY FR</div>

    <div class="keyboard-frame">
      <div class="row blurred">
        <div class="key" v-for="k in topLetters" :key="k">{{ k }}</div>
      </div>

      <div class="row row-focus stagger-even">
        <div class="key key-complex" v-for="(k, i) in numberRow" :key="'num'+i">
          <span class="corner shift">{{ k.shift }}</span>
          <span class="center">{{ k.base }}</span>
          <span class="corner altgr">{{ k.altgr }}</span>
        </div>
      </div>

      <div class="row row-focus stagger-odd">
        <div class="key key-complex" v-for="(k, i) in bottomLetters" :key="'bot'+i">
          <span class="center">{{ k.base }}</span>
          <span class="corner altgr">{{ k.altgr }}</span>
        </div>
      </div>

      <div class="row blurred">
        <div class="key" v-for="k in midLetters" :key="k">{{ k }}</div>
      </div>
    </div>

    <p class="reference-note">Vista de referencia · no es el archivo final</p>
  </div>
</template>

<style scoped>
/* Panel 2 — variables en theme.css bajo "PANEL 2 — Vista previa del teclado" */
.keyboard-preview {
  background: var(--preview-bg);
  border: var(--preview-border);
  box-shadow: var(--preview-shadow);
  border-radius: var(--preview-radius);
  width: var(--preview-width);
  padding: 40px;
  position: relative;
  overflow: hidden;
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
  flex-direction: column;
  gap: 12px;
}

.row {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.stagger-even {
  transform: translateX(-14px);
}

.stagger-odd {
  transform: translateX(14px);
}

.key {
  width: 56px;
  height: 56px;
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

.row-focus .key {
  width: 58px;
  height: 58px;
  border-radius: 12px;
}

.key-complex {
  padding: 5px;
}

.key-complex .center {
  font-size: 1.2em;
}

.key-complex .corner {
  position: absolute;
  font-size: 0.6em;
  font-weight: 400;
  font-family: system-ui, sans-serif;
  color: #999;
}

.key-complex .corner.shift {
  top: 5px;
  left: 7px;
}

.key-complex .corner.altgr {
  bottom: 5px;
  right: 7px;
  color: #c17a3d;
}

.blurred .key {
  filter: blur(2px);
  opacity: 0.55;
}

.reference-note {
  text-align: center;
  font-size: 0.7em;
  color: var(--text-muted);
  margin-top: 28px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
</style>
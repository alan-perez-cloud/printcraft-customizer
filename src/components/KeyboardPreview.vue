<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useCustomizationStore, fetchLayout, type LayoutKey } from '../stores/customization'

const store = useCustomizationStore()
const { primaryAlphabet, secondaryAlphabet, hasSecondary, primaryLabel, secondaryLabel, secondaryColor, keycapMode } = storeToRefs(store)

const primaryKeys = ref<LayoutKey[]>([])
const secondaryKeys = ref<LayoutKey[]>([])

// Cuando la tecla queda fuera de la zona desbloqueada, se muestra el
// carácter de OTRA tecla del mismo alfabeto (rotación sin puntos fijos)
// en vez del real. fakeOffset se re-sortea cada vez que se cargan datos.
const fakeOffset = ref(1)
function randomizeFakeOffset(length: number) {
  fakeOffset.value = length > 1 ? 1 + Math.floor(Math.random() * (length - 1)) : 0
}

async function loadKeys() {
  primaryKeys.value = primaryAlphabet.value ? await fetchLayout(primaryAlphabet.value) : []
  secondaryKeys.value = hasSecondary.value ? await fetchLayout(secondaryAlphabet.value) : []
  randomizeFakeOffset(primaryKeys.value.length)
  // Al cambiar de alfabeto reiniciamos la posición de la vista.
  await nextTick()
  pan.x = 0
  pan.y = 0
  layoutTick.value++
  clampPan()
}

onMounted(loadKeys)
watch([primaryAlphabet, secondaryAlphabet, hasSecondary], loadKeys)

/* ------------------------------------------------------------------
 * Viewport arrastrable
 * ------------------------------------------------------------------
 * El teclado completo vive dentro de un "frame" más grande que la
 * ventana visible (.keyboard-viewport, overflow hidden). El usuario
 * arrastra (mouse o touch, vía Pointer Events) para desplazarlo;
 * clampPan() evita que el frame se despegue de los bordes del
 * contenedor, así nunca se ve un hueco vacío dentro del div.
 * ------------------------------------------------------------------ */

const viewportEl = ref<HTMLElement | null>(null)
const frameEl = ref<HTMLElement | null>(null)
const pan = reactive({ x: 0, y: 0 })
const isDragging = ref(false)
const dragStart = reactive({ x: 0, y: 0, panX: 0, panY: 0 })

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function clampPan() {
  const viewport = viewportEl.value
  const frame = frameEl.value
  if (!viewport || !frame) return
  const minX = Math.min(0, viewport.clientWidth - frame.scrollWidth)
  const minY = Math.min(0, viewport.clientHeight - frame.scrollHeight)
  pan.x = clamp(pan.x, minX, 0)
  pan.y = clamp(pan.y, minY, 0)
}

function onPointerDown(e: PointerEvent) {
  isDragging.value = true
  dragStart.x = e.clientX
  dragStart.y = e.clientY
  dragStart.panX = pan.x
  dragStart.panY = pan.y
  viewportEl.value?.setPointerCapture(e.pointerId)
}

function onPointerMove(e: PointerEvent) {
  if (!isDragging.value) return
  pan.x = dragStart.panX + (e.clientX - dragStart.x)
  pan.y = dragStart.panY + (e.clientY - dragStart.y)
  clampPan()
}

function onPointerUp() {
  isDragging.value = false
}

function handleResize() {
  layoutTick.value++
  clampPan()
}

onMounted(() => window.addEventListener('resize', handleResize))
onBeforeUnmount(() => window.removeEventListener('resize', handleResize))

/* ------------------------------------------------------------------
 * Nivel 1 de protección: blur + datos rotados en el DOM
 * ------------------------------------------------------------------
 * Estas constantes deben coincidir con el CSS de .keyboard-frame/.key
 * más abajo (padding, gap y tamaño de tecla) — con eso alcanza para
 * calcular la posición de cada tecla sin medir el DOM en cada frame.
 *
 * NIVEL 2 (pendiente, requiere backend): esto sigue siendo una cortina
 * — el layout completo real ya llegó al navegador en primaryKeys/
 * secondaryKeys. Alguien con devtools puede leerlo del store/Network,
 * aunque el DOM nunca lo muestre. La protección real implica que el
 * backend jamás mande los caracteres reales de las teclas bloqueadas
 * (endpoint por "ventana" en vez de por alfabeto completo).
 * ------------------------------------------------------------------ */
const FRAME_PADDING = 16
const KEY_GAP = 10
const KEY_SIZE = 56

const layoutTick = ref(0)

const visibleWindow = computed(() => {
  void layoutTick.value // fuerza recálculo tras resize/carga, aunque pan no cambie
  const viewport = viewportEl.value
  const frame = frameEl.value
  if (!viewport || !frame) return null
  return {
    x0: -pan.x,
    x1: -pan.x + viewport.clientWidth,
    y0: -pan.y,
    y1: -pan.y + viewport.clientHeight,
    frameWidth: frame.clientWidth,
  }
})

function isUnlocked(index: number): boolean {
  const win = visibleWindow.value
  if (!win) return false
  const columns = Math.max(1, Math.floor((win.frameWidth - FRAME_PADDING * 2 + KEY_GAP) / (KEY_SIZE + KEY_GAP)))
  const col = index % columns
  const row = Math.floor(index / columns)
  const centerX = FRAME_PADDING + col * (KEY_SIZE + KEY_GAP) + KEY_SIZE / 2
  const centerY = FRAME_PADDING + row * (KEY_SIZE + KEY_GAP) + KEY_SIZE / 2
  return centerX >= win.x0 && centerX <= win.x1 && centerY >= win.y0 && centerY <= win.y1
}

function maskedKey(list: LayoutKey[], index: number): LayoutKey | undefined {
  if (!list.length) return undefined
  if (isUnlocked(index)) return list[index]
  const fakeIndex = (index + fakeOffset.value) % list.length
  return list[fakeIndex]
}

const maskedPrimaryKeys = computed(() => primaryKeys.value.map((_, i) => maskedKey(primaryKeys.value, i)))
const maskedSecondaryKeys = computed(() => secondaryKeys.value.map((_, i) => maskedKey(secondaryKeys.value, i)))
</script>

<template>
  <div class="keyboard-preview">
    <div class="alphabet-label">
      {{ hasSecondary ? `${primaryLabel} · ${secondaryLabel}` : primaryLabel }}
    </div>

    <div
      class="keyboard-viewport"
      ref="viewportEl"
      :class="{ dragging: isDragging }"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointerleave="onPointerUp"
      @pointercancel="onPointerUp"
    >
      <div
        class="keyboard-frame"
        ref="frameEl"
        :style="{ transform: `translate3d(${pan.x}px, ${pan.y}px, 0)` }"
      >
        <div
          class="key"
          :class="[keycapMode, { locked: !isUnlocked(i) }]"
          v-for="(k, i) in primaryKeys"
          :key="k.key_code || i"
        >
          <span class="corner shift" v-if="maskedPrimaryKeys[i]?.shift">{{ maskedPrimaryKeys[i]?.shift }}</span>
          <span class="corner secondary-shift" v-if="maskedSecondaryKeys[i]?.shift" :style="{ color: secondaryColor }">{{ maskedSecondaryKeys[i]?.shift }}</span>
          <span class="corner secondary" v-if="maskedSecondaryKeys[i]?.base" :style="{ color: secondaryColor }">{{ maskedSecondaryKeys[i]?.base }}</span>
          <span class="center">{{ maskedPrimaryKeys[i]?.base }}</span>
          <span class="corner altgr" v-if="maskedPrimaryKeys[i]?.altgr">{{ maskedPrimaryKeys[i]?.altgr }}</span>
          <span class="corner secondary-altgr" v-if="maskedSecondaryKeys[i]?.altgr" :style="{ color: secondaryColor }">{{ maskedSecondaryKeys[i]?.altgr }}</span>
        </div>
      </div>

      <span class="drag-hint">Arrastra para explorar</span>
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
  padding: 24px;
  box-sizing: border-box;
}

.alphabet-label {
  font-size: 0.75em;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin-bottom: 16px;
  font-weight: 600;
  text-align: center;
}

/* Ventana visible: overflow hidden recorta todo lo que quede fuera. */
.keyboard-viewport {
  position: relative;
  overflow: hidden;
  border-radius: var(--r-lg);
  background: var(--stage);
  height: 200px;
  touch-action: none;
  user-select: none;
  cursor: grab;
}

.keyboard-viewport.dragging {
  cursor: grabbing;
}

@media (min-width: 641px) {
  .keyboard-viewport { height: 240px; }
}

@media (min-width: 961px) {
  .keyboard-viewport { height: 280px; }
}

/* El frame es más ancho/alto que el viewport a propósito: eso es lo
   que se recorre al arrastrar. clampPan() en el script impide que se
   despegue de los bordes, así el contenido nunca se desborda del div. */
.keyboard-frame {
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 10px;
  padding: 16px;
  width: 460px;
  will-change: transform;
}

@media (min-width: 641px) {
  .keyboard-frame { width: 560px; }
}

@media (min-width: 961px) {
  .keyboard-frame { width: 680px; }
}

.key {
  width: 56px;
  height: 56px;
  padding: 5px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-family: var(--font-body);
  font-size: var(--preview-key-font-size);
  box-shadow: 0 6px 14px rgba(0,0,0,0.14), 0 1px 2px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.7);
  border: 1px solid #eae6da;
  position: relative;
  flex-shrink: 0;
  transition: filter 0.12s ease-out, opacity 0.12s ease-out;
}

/* Teclas fuera de la zona desbloqueada: además de mostrar un dato
   rotado (ver maskedKey() en el script), se difuminan visualmente. */
.key.locked {
  filter: blur(3.4px);
  opacity: 0.6;
  pointer-events: none;
  user-select: none;
}

.key.white {
  background: #fdfcf9;
  color: var(--text-dark);
}

.key.black {
  background: #1f1f1f;
  color: #f0f0f0;
  border-color: #000;
  box-shadow: 0 6px 14px rgba(0,0,0,0.35), 0 1px 2px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06);
}

.key.gray {
  background: #d6d6d8;
  color: #2a2a2a;
  border-color: #b8b8ba;
}

.key.black .corner { color: #999; }
.key.gray .corner { color: #6b6b6b; }

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
.corner.secondary-shift { top: 5px; left: 16px; }
.corner.secondary { top: 5px; right: 7px; }
.corner.altgr { bottom: 5px; right: 16px; padding: 2px 4px; background-color: rgba(0, 255, 255, 0); }
.corner.secondary-altgr { bottom: 5px; right: 7px; }

.corner.secondary {
  top: 5px;
  right: 7px;
  font-size: 0.85em;
  font-weight: 700;
  font-family: var(--font-body);
}

.drag-hint {
  position: absolute;
  right: 10px;
  bottom: 10px;
  font-size: 0.62em;
  font-family: var(--font-body);
  font-weight: 600;
  color: var(--muted);
  background: color-mix(in oklab, var(--panel) 88%, transparent);
  border: 1px solid rgba(63, 74, 52, 0.14);
  padding: 4px 10px;
  border-radius: 999px;
  pointer-events: none;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.reference-note {
  text-align: center;
  font-size: 0.7em;
  color: var(--text-muted);
  margin-top: 16px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
</style>
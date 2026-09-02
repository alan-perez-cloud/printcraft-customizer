import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export type KeycapMode = 'white' | 'black' | 'gray'
export type ProductType = 'pdf' | 'print'

export interface AlphabetOption {
  value: string
  label: string
}

function formatLabel(name: string): string {
  return name
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

const KEYCAP_LABELS: Record<KeycapMode, string> = {
  white: 'Blanco',
  black: 'Negro',
  gray: 'Plomo',
}

export const PRICES: Record<ProductType, number> = {
  pdf: 5,
  print: 18,
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

export const useCustomizationStore = defineStore('customization', () => {
  const alphabets = ref<AlphabetOption[]>([])

  async function fetchAlphabets() {
    const res = await fetch(`${API_BASE}/api/v1/alphabets`)
    if (!res.ok) return
    const names: string[] = await res.json()
    alphabets.value = names.map(name => ({ value: name, label: formatLabel(name) }))
    if (!primaryAlphabet.value && alphabets.value.length > 0) {
      primaryAlphabet.value = alphabets.value[0].value
    }
  }

  const dualAlphabet = ref(false)
  const primaryAlphabet = ref('')
  const secondaryAlphabet = ref('')

  const DEFAULT_SECONDARY_COLORS: Record<KeycapMode, string> = {
    white: '#2f6fed',  // azul brillante
    gray: '#2f9e44',   // verde
    black: '#e0995e',  // naranja tenue
  }

  const keycapMode = ref<KeycapMode>('white')
  const defaultSecondaryColor = computed(() => DEFAULT_SECONDARY_COLORS[keycapMode.value])
  const secondaryColor = ref(defaultSecondaryColor.value)

  watch(keycapMode, () => {
    secondaryColor.value = defaultSecondaryColor.value
  })

  function resetSecondaryColor() {
    secondaryColor.value = defaultSecondaryColor.value
  }

  const secondaryOptions = computed(() =>
    alphabets.value.filter(a => a.value !== primaryAlphabet.value)
  )

  watch(primaryAlphabet, () => {
  if (secondaryAlphabet.value === primaryAlphabet.value) {
    secondaryAlphabet.value = secondaryOptions.value[0]?.value || ''
  }
})

  watch(dualAlphabet, (enabled) => {
  if (enabled && !secondaryAlphabet.value && secondaryOptions.value.length > 0) {
    secondaryAlphabet.value = secondaryOptions.value[0].value
  }
})

  const primaryLabel = computed(
    () => alphabets.value.find(a => a.value === primaryAlphabet.value)?.label ?? primaryAlphabet.value
  )
  const secondaryLabel = computed(
    () => alphabets.value.find(a => a.value === secondaryAlphabet.value)?.label ?? ''
  )
  const keycapLabel = computed(() => KEYCAP_LABELS[keycapMode.value])

  const hasSecondary = computed(() => dualAlphabet.value && !!secondaryAlphabet.value)

  const alphabetSummary = computed(() =>
    hasSecondary.value ? `${primaryLabel.value} + ${secondaryLabel.value}` : primaryLabel.value
  )

  const designConfig = computed(() => ({
    primary_alphabet: primaryAlphabet.value,
    secondary_alphabet: hasSecondary.value ? secondaryAlphabet.value : null,
    secondary_color: hasSecondary.value ? secondaryColor.value : null,
    keycap_mode: keycapMode.value,
  }))

  return {
    alphabets,
    fetchAlphabets,
    dualAlphabet,
    primaryAlphabet,
    secondaryAlphabet,
    defaultSecondaryColor,
    secondaryColor,
    keycapMode,
    resetSecondaryColor,
    secondaryOptions,
    primaryLabel,
    secondaryLabel,
    keycapLabel,
    hasSecondary,
    alphabetSummary,
    designConfig,
  }
})

export interface LayoutKey {
  key_code: string
  base: string
  shift?: string | null
  altgr?: string | null
  altgr_shift?: string | null
}

export async function fetchLayout(alphabetName: string): Promise<LayoutKey[]> {
  const res = await fetch(`${API_BASE}/api/v1/keyboard-layouts/${alphabetName}`)
  if (!res.ok) return []
  return res.json()
}
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type KeycapMode = 'white' | 'black' | 'gray'
export type ProductType = 'pdf' | 'print'

export interface AlphabetOption {
  value: string
  label: string
}

export const ALPHABETS: AlphabetOption[] = [
  { value: 'russian', label: 'Русский' },
  { value: 'hiragana', label: 'ひらがな' },
  { value: 'arabic', label: 'العربية' },
  { value: 'azerty_fr', label: 'AZERTY FR' },
]

const KEYCAP_LABELS: Record<KeycapMode, string> = {
  white: 'Blanco',
  black: 'Negro',
  gray: 'Plomo',
}

export const PRICES: Record<ProductType, number> = {
  pdf: 5,
  print: 18,
}

export const useCustomizationStore = defineStore('customization', () => {
  // --- estado que antes vivía local en AlphabetControls ---
  const dualAlphabet = ref(false)
  const primaryAlphabet = ref('russian')
  const secondaryAlphabet = ref('')
  const defaultSecondaryColor = '#2a2a2a'
  const secondaryColor = ref(defaultSecondaryColor)
  const keycapMode = ref<KeycapMode>('white')

  function resetSecondaryColor() {
    secondaryColor.value = defaultSecondaryColor
  }

  const secondaryOptions = computed(() =>
    ALPHABETS.filter(a => a.value !== primaryAlphabet.value)
  )

  const primaryLabel = computed(
    () => ALPHABETS.find(a => a.value === primaryAlphabet.value)?.label ?? primaryAlphabet.value
  )
  const secondaryLabel = computed(
    () => ALPHABETS.find(a => a.value === secondaryAlphabet.value)?.label ?? ''
  )
  const keycapLabel = computed(() => KEYCAP_LABELS[keycapMode.value])

  const hasSecondary = computed(() => dualAlphabet.value && !!secondaryAlphabet.value)

  const alphabetSummary = computed(() =>
    hasSecondary.value ? `${primaryLabel.value} + ${secondaryLabel.value}` : primaryLabel.value
  )

  // snapshot que se guarda como `config` del design (mismo shape que espera el backend)
  const designConfig = computed(() => ({
    primary_alphabet: primaryAlphabet.value,
    secondary_alphabet: hasSecondary.value ? secondaryAlphabet.value : null,
    secondary_color: hasSecondary.value ? secondaryColor.value : null,
    keycap_mode: keycapMode.value,
  }))

  return {
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

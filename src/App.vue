<script setup lang="ts">
import { onMounted } from 'vue'
import AuthStatus from './components/AuthStatus.vue'
import KeyboardPreview from './components/KeyboardPreview.vue'
import AlphabetControls from './components/AlphabetControls.vue'
import PurchasePanel from './components/PurchasePanel.vue'
import { useAuthStore } from './stores/auth'


const auth = useAuthStore()
onMounted(() => auth.autoLoginDev())



</script>

<template>
  <div class="app-shell">
    <div class="floating-logo"><!-- logo --></div>
    <div class="floating-auth"><AuthStatus /></div>

    <div class="workspace">
      <AlphabetControls />
      <KeyboardPreview />
      <PurchasePanel />
    </div>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 24px;
}

.floating-logo {
  position: fixed;
  top: 16px;
  left: 16px;
}

.floating-auth {
  position: fixed;
  top: 16px;
  right: 16px;
}

/* Este es el contenedor que agrupa los 3 paneles.
   --debug-border se define en theme.css (por defecto "none"). */
.workspace {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  flex-wrap: wrap;
  gap: var(--panel-gap, 32px);
  border: var(--debug-border);
}

@media (max-width: 860px) {
  .workspace {
    flex-direction: column;
    align-items: center;
  }
}
</style>
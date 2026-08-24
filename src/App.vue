<script setup lang="ts">
import AuthStatus from './components/AuthStatus.vue'
</script>

<template>
  <div class="app-shell">
    <div class="floating-logo">
      <!-- logo -->
    </div>

    <div class="floating-auth">
      <AuthStatus />
    </div>

    <div class="canvas-area">
      <!-- KeyboardCanvas -->
    </div>
  </div>
</template>

<style scoped>
</style>
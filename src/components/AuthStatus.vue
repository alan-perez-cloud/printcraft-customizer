<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const showModal = ref(false)
const isRegisterMode = ref(false)
const email = ref('')
const password = ref('')
const fullName = ref('')
const error = ref('')

async function submit() {
  error.value = ''
  try {
    if (isRegisterMode.value) {
      await auth.register(email.value, password.value, fullName.value)
    } else {
      await auth.login(email.value, password.value)
    }
    showModal.value = false
  } catch (e: any) {
    error.value = e.message || 'Error al procesar'
  }
}
</script>

<template>
  <div class="auth-status">
    <button v-if="!auth.isLoggedIn" @click="showModal = true" class="icon-btn">
      👤
    </button>
    <button v-else @click="auth.logout()" class="icon-btn">
      {{ auth.userEmail?.[0]?.toUpperCase() }}
    </button>

    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <h3>{{ isRegisterMode ? 'Crear cuenta' : 'Iniciar sesión' }}</h3>
        <input v-if="isRegisterMode" v-model="fullName" placeholder="Nombre" />
        <input v-model="email" placeholder="Email" type="email" />
        <input v-model="password" placeholder="Contraseña" type="password" />
        <p v-if="error" class="error">{{ error }}</p>
        <button @click="submit">{{ isRegisterMode ? 'Registrarme' : 'Entrar' }}</button>
        <p class="switch" @click="isRegisterMode = !isRegisterMode">
          {{ isRegisterMode ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate' }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.icon-btn {
  width: 36px; height: 36px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
}
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 100;
}
.modal {
  background: white;
  padding: 24px;
  border-radius: 8px;
  display: flex; flex-direction: column; gap: 10px;
  width: 300px;
}
.error { color: red; font-size: 0.85em; }
.switch { font-size: 0.85em; cursor: pointer; text-decoration: underline; }
</style>
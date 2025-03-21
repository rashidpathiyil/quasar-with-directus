<template>
  <q-page class="flex flex-center">
    <div class="column items-center q-pa-md text-center">
      <div class="text-h3 q-mb-md">Welcome to Quasar + Directus</div>
      
      <q-img
        src="~assets/quasar-logo-vertical.svg"
        style="width: 200px; height: 200px"
        class="q-mb-lg"
      />
      
      <p class="text-subtitle1 q-mb-lg">
        This is a demonstration of integrating Quasar Framework with Directus CMS
      </p>
      
      <div class="row q-gutter-md justify-center">
        <div v-if="authStore.isAuthenticated">
          <q-btn
            color="primary"
            icon="list"
            label="View Items"
            to="/items"
            size="lg"
            unelevated
          />
        </div>
        <div v-else>
          <q-btn
            color="primary"
            icon="login"
            label="Login"
            to="/login"
            size="lg"
            unelevated
          />
        </div>
      </div>
      
      <q-card v-if="authStore.isAuthenticated" class="q-mt-xl" style="max-width: 500px">
        <q-card-section>
          <div class="text-h6">You are logged in</div>
          <div v-if="authStore.user" class="q-mt-sm">
            <p class="q-mb-xs">
              <strong>Email:</strong> {{ authStore.user.email }}
            </p>
            <p v-if="authStore.user.first_name || authStore.user.last_name" class="q-mb-xs">
              <strong>Name:</strong> {{ `${authStore.user.first_name || ''} ${authStore.user.last_name || ''}`.trim() }}
            </p>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useAuthStore } from 'src/stores/auth-store';

const authStore = useAuthStore();
</script>

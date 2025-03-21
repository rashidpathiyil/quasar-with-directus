<template>
  <q-page class="flex flex-center">
    <q-card class="login-card">
      <q-card-section class="text-center q-pt-lg">
        <div class="text-h5 q-mb-md">Login</div>
        <div class="text-subtitle2 q-mb-lg">Sign in with your Directus account</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <q-input
            v-model="email"
            type="email"
            label="Email"
            outlined
            :error="!!emailError"
            :error-message="emailError"
            @update:model-value="emailError = ''"
          />
          
          <q-input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            label="Password"
            outlined
            :error="!!passwordError"
            :error-message="passwordError"
            @update:model-value="passwordError = ''"
          >
            <template v-slot:append>
              <q-icon
                :name="showPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>

          <div class="full-width q-pt-md">
            <q-btn
              type="submit"
              label="Sign In"
              color="primary"
              class="full-width"
              :loading="loading"
            />
          </div>
          
          <div class="text-center q-pt-md">
            Don't have an account?
            <router-link to="/signup" class="text-primary">Sign Up</router-link>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'src/stores/auth-store';

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const loading = ref(false);
const emailError = ref('');
const passwordError = ref('');

const onSubmit = async () => {
  // Reset errors
  emailError.value = '';
  passwordError.value = '';
  
  // Validate
  let isValid = true;
  
  if (!email.value) {
    emailError.value = 'Email is required';
    isValid = false;
  } else if (!validateEmail(email.value)) {
    emailError.value = 'Please enter a valid email';
    isValid = false;
  }
  
  if (!password.value) {
    passwordError.value = 'Password is required';
    isValid = false;
  }
  
  if (!isValid) return;
  
  loading.value = true;
  
  try {
    const success = await authStore.login({
      email: email.value,
      password: password.value
    });
    
    if (success) {
      $q.notify({
        type: 'positive',
        message: 'Login successful!'
      });
      
      // Redirect to home page
      void router.push({ name: 'index' });
    } else {
      $q.notify({
        type: 'negative',
        message: 'Login failed. Please check your credentials.'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    $q.notify({
      type: 'negative',
      message: 'Login failed. Please try again.'
    });
  } finally {
    loading.value = false;
  }
};

const validateEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
</script>

<style lang="scss" scoped>
.login-card {
  width: 100%;
  max-width: 400px;
  padding: 20px;
}
</style> 

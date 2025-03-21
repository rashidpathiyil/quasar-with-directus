<template>
  <q-page class="flex flex-center">
    <q-card class="signup-card">
      <q-card-section class="text-center q-pt-lg">
        <div class="text-h5 q-mb-md">Create an Account</div>
        <div class="text-subtitle2 q-mb-lg">Sign up to get started</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <div class="row q-qutter-md">
            <div class="col-12 col-sm-6">
              <q-input
                v-model="first_name"
                label="First Name"
                outlined
                :rules="[val => !!val || 'First name is required']"
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-input
                v-model="last_name"
                label="Last Name"
                outlined
              />
            </div>
          </div>

          <q-input
            v-model="email"
            type="email"
            label="Email"
            outlined
            :rules="[
              val => !!val || 'Email is required',
              val => validateEmail(val) || 'Please enter a valid email'
            ]"
          />
          
          <q-input
            v-model="password"
            type="password"
            label="Password"
            outlined
            :rules="[
              val => !!val || 'Password is required',
              val => val.length >= 8 || 'Password must be at least 8 characters'
            ]"
          >
            <template v-slot:append>
              <q-icon
                :name="showPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>

          <q-input
            v-model="passwordConfirm"
            :type="showPassword ? 'text' : 'password'"
            label="Confirm Password"
            outlined
            :rules="[
              val => !!val || 'Please confirm your password',
              val => val === password || 'Passwords do not match'
            ]"
          />

          <div class="full-width q-pt-md">
            <q-btn
              type="submit"
              label="Sign Up"
              color="primary"
              class="full-width"
              :loading="loading"
            />
          </div>

          <div class="text-center q-pt-md">
            Already have an account?
            <router-link to="/login" class="text-primary">Login</router-link>
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
import { directus, createItem } from 'src/boot/directus';

const router = useRouter();
const $q = useQuasar();

const first_name = ref('');
const last_name = ref('');
const email = ref('');
const password = ref('');
const passwordConfirm = ref('');
const showPassword = ref(false);
const loading = ref(false);

const validateEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const onSubmit = async () => {
  if (password.value !== passwordConfirm.value) {
    $q.notify({
      type: 'negative',
      message: 'Passwords do not match'
    });
    return;
  }

  loading.value = true;

  try {
    // Create a new user in Directus
    await directus.request(
      createItem('directus_users', {
        first_name: first_name.value,
        last_name: last_name.value,
        email: email.value,
        password: password.value,
        role: '3' // Assuming '3' is the default authenticated user role
      })
    );

    $q.notify({
      type: 'positive',
      message: 'Account created successfully! Please login.'
    });

    // Redirect to login page
    void router.push('/login');
  } catch (error) {
    console.error('Signup error:', error);
    
    let errorMessage = 'Failed to create account';
    if (error instanceof Error) {
      // Handle specific error cases
      if (error.message.includes('duplicate') || error.message.includes('exists')) {
        errorMessage = 'Email already exists';
      } else {
        errorMessage = `Error: ${error.message}`;
      }
    }
    
    $q.notify({
      type: 'negative',
      message: errorMessage
    });
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.signup-card {
  width: 100%;
  max-width: 500px;
  padding: 20px;
}
</style> 

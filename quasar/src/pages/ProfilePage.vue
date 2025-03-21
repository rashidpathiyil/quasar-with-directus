<template>
  <q-page padding>
    <div class="column items-center">
      <div class="row justify-center full-width q-mb-lg">
        <q-card style="max-width: 800px; width: 100%">
          <q-tabs
            v-model="activeTab"
            class="text-primary"
            indicator-color="primary"
            align="justify"
            narrow-indicator
          >
            <q-tab name="profile" label="Profile" icon="person" />
            <q-tab name="security" label="Security" icon="lock" />
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="activeTab" animated>
            <!-- Profile Tab -->
            <q-tab-panel name="profile">
              <div class="text-h6 q-mb-md">Profile Information</div>
              <q-form @submit="updateProfile" class="q-gutter-md">
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="profileForm.first_name"
                      label="First Name"
                      outlined
                      :rules="[val => !!val || 'First name is required']"
                    />
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="profileForm.last_name"
                      label="Last Name"
                      outlined
                    />
                  </div>
                </div>

                <q-input
                  v-model="profileForm.email"
                  type="email"
                  label="Email"
                  outlined
                  :rules="[
                    val => !!val || 'Email is required',
                    val => validateEmail(val) || 'Please enter a valid email'
                  ]"
                  disable
                />

                <q-input
                  v-model="profileForm.avatar"
                  label="Avatar URL"
                  outlined
                />

                <q-btn
                  type="submit"
                  label="Save Changes"
                  color="primary"
                  :loading="loading"
                />
              </q-form>
            </q-tab-panel>

            <!-- Security Tab -->
            <q-tab-panel name="security">
              <div class="text-h6 q-mb-md">Change Password</div>
              <q-form @submit="changePassword" class="q-gutter-md">
                <q-input
                  v-model="passwordForm.current_password"
                  type="password"
                  label="Current Password"
                  outlined
                  :rules="[val => !!val || 'Current password is required']"
                />
                
                <q-input
                  v-model="passwordForm.new_password"
                  :type="showPassword ? 'text' : 'password'"
                  label="New Password"
                  outlined
                  :rules="[
                    val => !!val || 'New password is required',
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
                  v-model="passwordForm.confirm_password"
                  :type="showPassword ? 'text' : 'password'"
                  label="Confirm New Password"
                  outlined
                  :rules="[
                    val => !!val || 'Please confirm your password',
                    val => val === passwordForm.new_password || 'Passwords do not match'
                  ]"
                />

                <q-btn
                  type="submit"
                  label="Change Password"
                  color="primary"
                  :loading="passwordLoading"
                />
              </q-form>
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'src/stores/auth-store';
import { directus, updateItem } from 'src/boot/directus';

const $q = useQuasar();
const authStore = useAuthStore();

const activeTab = ref('profile');
const loading = ref(false);
const passwordLoading = ref(false);
const showPassword = ref(false);

// Profile form data
const profileForm = ref({
  first_name: '',
  last_name: '',
  email: '',
  avatar: ''
});

// Password form data
const passwordForm = ref({
  current_password: '',
  new_password: '',
  confirm_password: ''
});

// Fetch user data on component mount
onMounted(async () => {
  // Force type assertion to help TypeScript understand the user type
  const currentUser = authStore.user as {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    avatar?: string;
  } | null;

  if (currentUser) {
    profileForm.value = {
      first_name: currentUser.first_name || '',
      last_name: currentUser.last_name || '',
      email: currentUser.email,
      avatar: currentUser.avatar || ''
    };
  } else {
    await authStore.fetchCurrentUser();
    
    // Check again after fetching
    const updatedUser = authStore.user as {
      id: string;
      email: string;
      first_name?: string;
      last_name?: string;
      avatar?: string;
    } | null;
    
    if (updatedUser) {
      profileForm.value = {
        first_name: updatedUser.first_name || '',
        last_name: updatedUser.last_name || '',
        email: updatedUser.email,
        avatar: updatedUser.avatar || ''
      };
    }
  }
});

const validateEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const updateProfile = async () => {
  loading.value = true;

  try {
    const userData = {
      first_name: profileForm.value.first_name,
      last_name: profileForm.value.last_name,
      // Exclude email as it might require special permissions to change
      avatar: profileForm.value.avatar || null
    };

    // Update user in Directus using the updateMe operation
    await directus.request(
      updateItem('directus_users', 'me', userData)
    );

    // Update local user data
    await authStore.fetchCurrentUser();

    $q.notify({
      type: 'positive',
      message: 'Profile updated successfully!'
    });
  } catch (error) {
    console.error('Profile update error:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to update profile'
    });
  } finally {
    loading.value = false;
  }
};

const changePassword = async () => {
  if (passwordForm.value.new_password !== passwordForm.value.confirm_password) {
    $q.notify({
      type: 'negative',
      message: 'Passwords do not match'
    });
    return;
  }

  passwordLoading.value = true;

  try {
    // Change password in Directus
    await directus.request(
      updateItem('directus_users', 'me', {
        password: passwordForm.value.new_password
      })
    );

    // Reset form
    passwordForm.value = {
      current_password: '',
      new_password: '',
      confirm_password: ''
    };

    $q.notify({
      type: 'positive',
      message: 'Password changed successfully!'
    });
  } catch (error) {
    console.error('Password change error:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to change password'
    });
  } finally {
    passwordLoading.value = false;
  }
};
</script> 

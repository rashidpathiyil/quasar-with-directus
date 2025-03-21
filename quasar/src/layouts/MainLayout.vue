<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          Quasar Directus
        </q-toolbar-title>

        <div v-if="authStore.isAuthenticated">
          <q-btn-dropdown flat no-caps>
            <template v-slot:label>
              <div class="row items-center no-wrap">
                <q-avatar size="28px">
                  <q-icon name="person" />
                </q-avatar>
                <div class="q-ml-xs">{{ currentUser?.first_name || 'User' }}</div>
              </div>
            </template>
            <q-list>
              <q-item to="/profile" clickable v-close-popup>
                <q-item-section avatar>
                  <q-icon name="settings" />
                </q-item-section>
                <q-item-section>Profile</q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable v-close-popup @click="logout">
                <q-item-section avatar>
                  <q-icon name="logout" />
                </q-item-section>
                <q-item-section>Logout</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </div>
        <div v-else>
          <q-btn flat label="Login" to="/login" />
          <q-btn flat label="Sign Up" to="/signup" />
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-list>
        <q-item-label header>
          Navigation
        </q-item-label>

        <q-item to="/" exact clickable v-ripple>
          <q-item-section avatar>
            <q-icon name="home" />
          </q-item-section>
          <q-item-section>Home</q-item-section>
        </q-item>

        <q-item v-if="authStore.isAuthenticated" to="/items" exact clickable v-ripple>
          <q-item-section avatar>
            <q-icon name="list" />
          </q-item-section>
          <q-item-section>Items</q-item-section>
        </q-item>
        
        <q-item v-if="authStore.isAuthenticated" to="/profile" exact clickable v-ripple>
          <q-item-section avatar>
            <q-icon name="person" />
          </q-item-section>
          <q-item-section>Profile</q-item-section>
        </q-item>

        <q-item v-if="!authStore.isAuthenticated" to="/login" exact clickable v-ripple>
          <q-item-section avatar>
            <q-icon name="login" />
          </q-item-section>
          <q-item-section>Login</q-item-section>
        </q-item>
        
        <q-item v-if="!authStore.isAuthenticated" to="/signup" exact clickable v-ripple>
          <q-item-section avatar>
            <q-icon name="person_add" />
          </q-item-section>
          <q-item-section>Sign Up</q-item-section>
        </q-item>

        <q-item v-if="authStore.isAuthenticated" clickable v-ripple @click="logout">
          <q-item-section avatar>
            <q-icon name="logout" />
          </q-item-section>
          <q-item-section>Logout</q-item-section>
        </q-item>

        <q-separator class="q-my-md" />

        <q-item-label header>
          External Links
        </q-item-label>

        <EssentialLink
          v-for="link in externalLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'src/stores/auth-store';
import EssentialLink, { type EssentialLinkProps } from 'components/EssentialLink.vue';

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();

// Add a computed property to safely access the user
const currentUser = computed(() => authStore.user);

const externalLinks: EssentialLinkProps[] = [
  {
    title: 'Quasar Docs',
    caption: 'quasar.dev',
    icon: 'school',
    link: 'https://quasar.dev'
  },
  {
    title: 'Directus Docs',
    caption: 'docs.directus.io',
    icon: 'help',
    link: 'https://docs.directus.io'
  }
];

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

async function logout() {
  try {
    await authStore.logout();
    $q.notify({
      type: 'positive',
      message: 'Logged out successfully'
    });
    void router.push('/login');
  } catch (error) {
    console.error('Logout error:', error);
    $q.notify({
      type: 'negative',
      message: 'Error during logout'
    });
  }
}
</script>

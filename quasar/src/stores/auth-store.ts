import { defineStore } from 'pinia';
import type { User } from 'src/boot/directus';
import { directus, readMe } from 'src/boot/directus';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const isAuthenticated = ref(false);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const isInitialized = ref(false);

  async function login(credentials: { email: string; password: string }) {
    loading.value = true;
    error.value = null;
    
    try {
      // The directus.login() method will handle token storage automatically
      // via the LocalStorage class we defined in directus.ts
      const response = await directus.login(credentials.email, credentials.password);
      if (response?.access_token) {
        isAuthenticated.value = true;
        
        // Fetch current user data
        await fetchCurrentUser();
        
        return true;
      }
      throw new Error('No access token received');
    } catch (err) {
      console.error('Login error:', err);
      error.value = err instanceof Error ? err.message : 'Authentication failed';
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function fetchCurrentUser() {
    try {
      // getToken will return null if no valid token exists
      const token = await directus.getToken();
      isAuthenticated.value = !!token;
      
      if (!isAuthenticated.value) return null;
      
      const me = await directus.request(readMe());
      
      // Ensure type safety for the user object
      if (me && typeof me === 'object' && 'email' in me) {
        // Set user properties with proper typing
        user.value = {
          id: me.id,
          email: me.email || '', // Handle potential null with empty string default
          first_name: me.first_name || undefined,
          last_name: me.last_name || undefined,
          avatar: me.avatar || undefined // Avatar can be string, object or undefined
        };
        return user.value;
      }
      
      throw new Error('Invalid user data received');
    } catch (err) {
      console.error('Error fetching current user:', err);
      await logout();
      return null;
    }
  }

  async function logout() {
    try {
      // The SDK will clear tokens automatically
      await directus.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear local state even if the API call fails
      user.value = null;
      isAuthenticated.value = false;
    }
  }

  // Initialize - check if user has a valid token
  async function init() {
    if (!isInitialized.value) {
      try {
        // Check if we have a valid token
        const token = await directus.getToken();
        isAuthenticated.value = !!token;
        
        if (isAuthenticated.value) {
          await fetchCurrentUser();
        }
      } catch (err) {
        console.error('Token validation error:', err);
        await logout();
      } finally {
        isInitialized.value = true;
      }
    }
  }

  return {
    user,
    isAuthenticated,
    loading,
    error,
    isInitialized,
    login,
    logout,
    fetchCurrentUser,
    init
  };
}); 

import {
  authentication,
  createDirectus,
  createItem as createItemOperation,
  deleteItem as deleteItemOperation,
  readItems,
  readMe,
  rest,
  updateItem as updateItemOperation,
  type AuthenticationData
} from '@directus/sdk';
import { boot } from 'quasar/wrappers';
import { DIRECTUS_URL } from 'src/config/directus';

// Define your Directus types
export interface User {
  id: string;
  email: string;
  password?: string;
  first_name?: string | undefined;
  last_name?: string | undefined;
  avatar?: string | object | undefined;
  role?: string;
}

export interface Item {
  id: string;
  title: string;
  description?: string | undefined;
  // Add more fields as needed
}

// Custom storage to integrate with localStorage
class LocalStorage {
  get(): AuthenticationData | null {
    const authData = localStorage.getItem('directus_auth_data');
    return authData ? JSON.parse(authData) : null;
  }
  
  set(data: AuthenticationData | null): void {
    if (data) {
      localStorage.setItem('directus_auth_data', JSON.stringify(data));
    } else {
      localStorage.removeItem('directus_auth_data');
    }
  }
}

// Create a Directus client with authentication that persists tokens
const directus = createDirectus<{
  directus_users: User[];
  items: Item[];
}>(DIRECTUS_URL)
  .with(rest())
  .with(authentication('json', { 
    storage: new LocalStorage(),
    autoRefresh: true, // Enable automatic token refreshing
  }));

export default boot(({ app }) => {
  console.log('directus', directus);
  // Make directus available as $directus
  app.config.globalProperties.$directus = directus;
});

// Re-export the methods we need
export {
  createItemOperation as createItem, deleteItemOperation as deleteItem, directus,
  readItems, readMe, updateItemOperation as updateItem
};


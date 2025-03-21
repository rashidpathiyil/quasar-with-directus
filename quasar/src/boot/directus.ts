import {
  authentication,
  createDirectus,
  createItem as createItemOperation,
  deleteItem as deleteItemOperation,
  readItems,
  readMe,
  rest,
  updateItem as updateItemOperation
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

// Create a Directus client
const directus = createDirectus<{
  directus_users: User[];
  items: Item[];
}>(DIRECTUS_URL)
  .with(rest())
  .with(authentication());

export default boot(({ app }) => {
  // Make directus available as $directus
  app.config.globalProperties.$directus = directus;
});

// Re-export the methods we need
export {
  createItemOperation as createItem, deleteItemOperation as deleteItem, directus,
  readItems, readMe, updateItemOperation as updateItem
};


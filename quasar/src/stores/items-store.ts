import { defineStore } from 'pinia';
import type { Item } from 'src/boot/directus';
import { createItem, deleteItem, directus, readItems, updateItem } from 'src/boot/directus';
import { ref } from 'vue';

export const useItemsStore = defineStore('items', () => {
  const items = ref<Item[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchItems() {
    loading.value = true;
    error.value = null;
    
    try {
      const fetchedItems = await directus.request(
        readItems('items', {
          sort: ['id'],
          // You can add filters, pagination, etc. here
        })
      );
      
      items.value = fetchedItems as Item[];
      return fetchedItems;
    } catch (err) {
      console.error('Error fetching items:', err);
      error.value = err instanceof Error ? err.message : 'Failed to fetch items';
      return [];
    } finally {
      loading.value = false;
    }
  }

  async function getItemById(id: string) {
    loading.value = true;
    error.value = null;
    
    try {
      const item = await directus.request(
        readItems('items', {
          filter: {
            id: {
              _eq: id
            }
          }
        })
      );
      
      return (item.length > 0 ? item[0] : null) as Item | null;
    } catch (err) {
      console.error(`Error fetching item with id ${id}:`, err);
      error.value = err instanceof Error ? err.message : `Failed to fetch item with id ${id}`;
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function addItem(newItem: Omit<Item, 'id'>) {
    loading.value = true;
    error.value = null;
    
    try {
      const createdItem = await directus.request(
        createItem('items', newItem)
      );
      
      // Update local state
      if (createdItem) {
        items.value.push(createdItem as Item);
      }
      
      return createdItem as Item;
    } catch (err) {
      console.error('Error creating item:', err);
      error.value = err instanceof Error ? err.message : 'Failed to create item';
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function updateItemById(id: string, updates: Partial<Item>) {
    loading.value = true;
    error.value = null;
    
    try {
      const updatedItem = await directus.request(
        updateItem('items', id, updates)
      );
      
      // Update local state
      if (updatedItem) {
        const index = items.value.findIndex(item => item.id === id);
        if (index !== -1) {
          items.value[index] = { 
            ...items.value[index], 
            ...updatedItem as Partial<Item>
          } as Item;
        }
      }
      
      return updatedItem as Item;
    } catch (err) {
      console.error(`Error updating item with id ${id}:`, err);
      error.value = err instanceof Error ? err.message : `Failed to update item with id ${id}`;
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function deleteItemById(id: string) {
    loading.value = true;
    error.value = null;
    
    try {
      await directus.request(
        deleteItem('items', id)
      );
      
      // Update local state
      items.value = items.value.filter(item => item.id !== id);
      
      return true;
    } catch (err) {
      console.error(`Error deleting item with id ${id}:`, err);
      error.value = err instanceof Error ? err.message : `Failed to delete item with id ${id}`;
      return false;
    } finally {
      loading.value = false;
    }
  }

  return {
    items,
    loading,
    error,
    fetchItems,
    getItemById,
    addItem,
    updateItemById,
    deleteItemById
  };
}); 

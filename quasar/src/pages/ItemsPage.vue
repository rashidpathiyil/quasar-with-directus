<template>
  <q-page padding>
    <div class="q-pa-md">
      <div class="row q-mb-md items-center">
        <div class="text-h5">Items</div>
        <q-space />
        <q-btn
          color="primary"
          label="Add Item"
          icon="add"
          @click="openAddItemDialog"
        />
      </div>
      
      <q-table
        :rows="itemsStore.items"
        :columns="columns"
        row-key="id"
        :loading="itemsStore.loading"
        :filter="filter"
        v-model:pagination="pagination"
        flat
        bordered
      >
        <template v-slot:top-right>
          <q-input
            v-model="filter"
            placeholder="Search"
            dense
            outlined
            class="q-ml-md"
            clearable
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </template>
        
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn
              flat
              round
              dense
              icon="edit"
              color="primary"
              @click="openEditItemDialog(props.row)"
            />
            <q-btn
              flat
              round
              dense
              icon="delete"
              color="negative"
              @click="confirmDelete(props.row)"
            />
          </q-td>
        </template>
      </q-table>
    </div>
    
    <!-- Add/Edit Item Dialog -->
    <q-dialog v-model="itemDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">{{ isEditing ? 'Edit Item' : 'Add Item' }}</div>
        </q-card-section>
        
        <q-card-section>
          <q-form @submit="submitItemForm" class="q-gutter-md">
            <q-input
              v-model="itemForm.title"
              label="Title"
              outlined
              :rules="[val => !!val || 'Title is required']"
            />
            
            <q-input
              v-model="itemForm.description"
              label="Description"
              outlined
              type="textarea"
            />
          </q-form>
        </q-card-section>
        
        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn
            flat
            :label="isEditing ? 'Update' : 'Add'"
            @click="submitItemForm"
            :loading="formLoading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useItemsStore } from 'src/stores/items-store';
import type { Item } from 'src/boot/directus';

const $q = useQuasar();
const itemsStore = useItemsStore();

// Table setup
const filter = ref('');
const pagination = ref({
  rowsPerPage: 10
});

const columns = [
  { name: 'id', label: 'ID', field: 'id', sortable: true },
  { name: 'title', label: 'Title', field: 'title', sortable: true },
  { name: 'description', label: 'Description', field: 'description', sortable: true },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' as const }
];

// Form setup
const itemDialog = ref(false);
const formLoading = ref(false);
const isEditing = ref(false);
const itemForm = ref<{
  id: string;
  title: string;
  description: string;
}>({
  id: '',
  title: '',
  description: ''
});

// Load items on component mount
onMounted(() => {
  void loadItems();
});

const loadItems = async () => {
  await itemsStore.fetchItems();
};

// Open dialog for adding a new item
const openAddItemDialog = () => {
  isEditing.value = false;
  itemForm.value = {
    id: '',
    title: '',
    description: ''
  };
  itemDialog.value = true;
};

// Open dialog for editing an existing item
const openEditItemDialog = (item: Item) => {
  isEditing.value = true;
  itemForm.value = { 
    id: item.id,
    title: item.title,
    description: item.description || '' 
  };
  itemDialog.value = true;
};

// Submit form for adding/updating item
const submitItemForm = async () => {
  if (!itemForm.value.title) {
    $q.notify({
      type: 'negative',
      message: 'Title is required'
    });
    return;
  }
  
  formLoading.value = true;
  
  try {
    if (isEditing.value) {
      // Update existing item
      const { id, ...updates } = itemForm.value;
      await itemsStore.updateItemById(id, updates);
      $q.notify({
        type: 'positive',
        message: 'Item updated successfully'
      });
    } else {
      // Add new item
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _, ...newItem } = itemForm.value;
      await itemsStore.addItem(newItem);
      $q.notify({
        type: 'positive',
        message: 'Item added successfully'
      });
    }
    
    // Close dialog and reset form
    itemDialog.value = false;
  } catch (error) {
    console.error('Error submitting item:', error);
    $q.notify({
      type: 'negative',
      message: `Failed to ${isEditing.value ? 'update' : 'add'} item`
    });
  } finally {
    formLoading.value = false;
  }
};

// Confirm and handle item deletion
const confirmDelete = (item: Item) => {
  $q.dialog({
    title: 'Confirm',
    message: `Are you sure you want to delete "${item.title}"?`,
    cancel: true,
    persistent: true
  }).onOk(() => {
    void (async () => {
      try {
        await itemsStore.deleteItemById(item.id);
        $q.notify({
          type: 'positive',
          message: 'Item deleted successfully'
        });
      } catch (error) {
        console.error('Error deleting item:', error);
        $q.notify({
          type: 'negative',
          message: 'Failed to delete item'
        });
      }
    })();
  });
};
</script> 

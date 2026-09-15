<script setup>
import { ref, onMounted } from 'vue'
import { useHttp } from '../composables/useHttp'

const { httpRequest } = useHttp()

const advertisements = ref([])
const isLoading = ref(false)
const showForm = ref(false)
const editingAd = ref(null)

const formData = ref({
  title: '',
  description: '',
  image_url: '',
  link_url: '',
  is_active: true,
  display_order: 0,
  start_date: '',
  end_date: ''
})

const fetchAdvertisements = async () => {
  try {
    isLoading.value = true
    const response = await httpRequest('GET', '/admin/advertisements')
    advertisements.value = response.data.data || []
  } catch (error) {
    console.error('Failed to fetch advertisements:', error)
  } finally {
    isLoading.value = false
  }
}

const createAdvertisement = async () => {
  try {
    isLoading.value = true
    await httpRequest('POST', '/admin/advertisements', formData.value)
    await fetchAdvertisements()
    resetForm()
    showForm.value = false
  } catch (error) {
    console.error('Failed to create advertisement:', error)
  } finally {
    isLoading.value = false
  }
}

const updateAdvertisement = async () => {
  try {
    isLoading.value = true
    await httpRequest('PUT', `/admin/advertisements/${editingAd.value.id}`, formData.value)
    await fetchAdvertisements()
    resetForm()
    showForm.value = false
    editingAd.value = null
  } catch (error) {
    console.error('Failed to update advertisement:', error)
  } finally {
    isLoading.value = false
  }
}

const deleteAdvertisement = async (id) => {
  if (!confirm('Are you sure you want to delete this advertisement?')) return
  
  try {
    isLoading.value = true
    await httpRequest('DELETE', `/admin/advertisements/${id}`)
    await fetchAdvertisements()
  } catch (error) {
    console.error('Failed to delete advertisement:', error)
  } finally {
    isLoading.value = false
  }
}

const editAdvertisement = (ad) => {
  editingAd.value = ad
  formData.value = { ...ad }
  showForm.value = true
}

const resetForm = () => {
  formData.value = {
    title: '',
    description: '',
    image_url: '',
    link_url: '',
    is_active: true,
    display_order: 0,
    start_date: '',
    end_date: ''
  }
}

onMounted(() => {
  fetchAdvertisements()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <div class="max-w-4xl mx-auto">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Advertisement Management</h1>
        <div class="flex gap-3">
          <router-link 
            to="/admin/profile"
            class="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            Settings
          </router-link>
          <button 
            @click="showForm = true; resetForm()"
            class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Add New Advertisement
          </button>
        </div>
      </div>

      <!-- Advertisement List -->
      <div v-if="isLoading" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
        <p class="mt-2 text-gray-600">Loading advertisements...</p>
      </div>

      <div v-else-if="advertisements.length === 0" class="text-center py-8">
        <p class="text-gray-600">No advertisements found. Create your first one!</p>
      </div>

      <div v-else class="grid gap-4">
        <div 
          v-for="ad in advertisements" 
          :key="ad.id"
          class="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
        >
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-900">{{ ad.title }}</h3>
              <p class="text-gray-600 mt-1">{{ ad.description }}</p>
              <div class="mt-2 flex items-center gap-4 text-sm text-gray-500">
                <span :class="ad.is_active ? 'text-green-600' : 'text-red-600'">
                  {{ ad.is_active ? 'Active' : 'Inactive' }}
                </span>
                <span>Order: {{ ad.display_order }}</span>
                <span v-if="ad.start_date">Start: {{ new Date(ad.start_date).toLocaleDateString() }}</span>
                <span v-if="ad.end_date">End: {{ new Date(ad.end_date).toLocaleDateString() }}</span>
              </div>
            </div>
            <div class="flex gap-2 ml-4">
              <button 
                @click="editAdvertisement(ad)"
                class="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Edit
              </button>
              <button 
                @click="deleteAdvertisement(ad.id)"
                class="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Form Modal -->
      <div v-if="showForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-md">
          <h2 class="text-xl font-bold mb-4">
            {{ editingAd ? 'Edit Advertisement' : 'Create Advertisement' }}
          </h2>
          
          <form @submit.prevent="editingAd ? updateAdvertisement() : createAdvertisement()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input 
                v-model="formData.title"
                type="text" 
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea 
                v-model="formData.description"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                rows="3"
              ></textarea>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input 
                v-model="formData.image_url"
                type="url" 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Link URL</label>
              <input 
                v-model="formData.link_url"
                type="url" 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
              <input 
                v-model.number="formData.display_order"
                type="number" 
                min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            
            <div class="flex items-center">
              <input 
                v-model="formData.is_active"
                type="checkbox" 
                id="is_active"
                class="mr-2"
              />
              <label for="is_active" class="text-sm font-medium text-gray-700">Active</label>
            </div>
            
            <div class="flex gap-3 pt-4">
              <button 
                type="submit"
                :disabled="isLoading"
                class="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {{ isLoading ? 'Saving...' : (editingAd ? 'Update' : 'Create') }}
              </button>
              <button 
                type="button"
                @click="showForm = false; resetForm(); editingAd = null"
                class="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Additional styles if needed */
</style>





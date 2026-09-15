<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useHttp } from '../composables/useHttp'
import { Preferences } from '@capacitor/preferences'
import { 
  ArrowLeftIcon, 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const { httpRequest } = useHttp()

const isLoading = ref(false)
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const formData = reactive({
  current_password: '',
  new_password: '',
  confirm_password: ''
})

const goBack = () => {
  router.back()
}

const togglePasswordVisibility = (field) => {
  switch (field) {
    case 'current':
      showCurrentPassword.value = !showCurrentPassword.value
      break
    case 'new':
      showNewPassword.value = !showNewPassword.value
      break
    case 'confirm':
      showConfirmPassword.value = !showConfirmPassword.value
      break
  }
}

const changePassword = async () => {
  // Clear previous messages
  successMessage.value = ''
  errorMessage.value = ''

  // Basic validation
  if (!formData.current_password) {
    errorMessage.value = 'Current password is required'
    return
  }

  if (!formData.new_password) {
    errorMessage.value = 'New password is required'
    return
  }

  if (formData.new_password.length < 6) {
    errorMessage.value = 'New password must be at least 6 characters'
    return
  }

  if (formData.new_password !== formData.confirm_password) {
    errorMessage.value = 'New passwords do not match'
    return
  }

  if (formData.current_password === formData.new_password) {
    errorMessage.value = 'New password must be different from current password'
    return
  }

  try {
    isLoading.value = true
    
    const response = await httpRequest('POST', '/admin/change-password', {
      current_password: formData.current_password,
      new_password: formData.new_password,
      confirm_password: formData.confirm_password
    })

    if (response.data.success) {
      successMessage.value = 'Password changed successfully!'
      // Reset form
      formData.current_password = ''
      formData.new_password = ''
      formData.confirm_password = ''
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        successMessage.value = ''
      }, 3000)
    } else {
      errorMessage.value = response.data.message || 'Failed to change password'
    }
  } catch (error) {
    console.error('Password change error:', error)
    errorMessage.value = error.response?.data?.message || 'An error occurred while changing password'
  } finally {
    isLoading.value = false
  }
}

const logout = async () => {
  try {
    await httpRequest('POST', '/admin/logout')
    await Preferences.remove({ key: 'token' })
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
    // Still redirect even if logout fails
    await Preferences.remove({ key: 'token' })
    router.push('/login')
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="flex items-center justify-between p-4 bg-white safe-area-top border-b">
      <div class="flex items-center gap-4">
        <button @click="goBack" class="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeftIcon class="w-6 h-6" />
        </button>
        <h1 class="font-semibold text-lg">Admin Settings</h1>
      </div>
    </header>

    <main class="p-4 max-w-2xl mx-auto space-y-6">
      <!-- Success Message -->
      <div v-if="successMessage" class="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
        <CheckCircleIcon class="w-5 h-5 text-green-600 flex-shrink-0" />
        <p class="text-green-800 text-sm">{{ successMessage }}</p>
      </div>

      <!-- Error Message -->
      <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
        <ExclamationTriangleIcon class="w-5 h-5 text-red-600 flex-shrink-0" />
        <p class="text-red-800 text-sm">{{ errorMessage }}</p>
      </div>

      <!-- Change Password Section -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <div class="flex items-center gap-3 mb-6">
          <div class="p-2 bg-blue-100 rounded-lg">
            <LockClosedIcon class="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 class="font-semibold text-lg text-gray-900">Change Password</h2>
            <p class="text-sm text-gray-600">Update your admin account password</p>
          </div>
        </div>

        <form @submit.prevent="changePassword" class="space-y-4">
          <!-- Current Password -->
          <div>
            <label for="current_password" class="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <div class="relative">
              <input
                :type="showCurrentPassword ? 'text' : 'password'"
                id="current_password"
                v-model="formData.current_password"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                placeholder="Enter current password"
                required
              />
              <button
                type="button"
                @click="togglePasswordVisibility('current')"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <EyeIcon v-if="!showCurrentPassword" class="w-5 h-5" />
                <EyeSlashIcon v-else class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- New Password -->
          <div>
            <label for="new_password" class="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div class="relative">
              <input
                :type="showNewPassword ? 'text' : 'password'"
                id="new_password"
                v-model="formData.new_password"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                placeholder="Enter new password (min 6 characters)"
                required
                minlength="6"
              />
              <button
                type="button"
                @click="togglePasswordVisibility('new')"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <EyeIcon v-if="!showNewPassword" class="w-5 h-5" />
                <EyeSlashIcon v-else class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Confirm Password -->
          <div>
            <label for="confirm_password" class="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <div class="relative">
              <input
                :type="showConfirmPassword ? 'text' : 'password'"
                id="confirm_password"
                v-model="formData.confirm_password"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                placeholder="Confirm new password"
                required
                minlength="6"
              />
              <button
                type="button"
                @click="togglePasswordVisibility('confirm')"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <EyeIcon v-if="!showConfirmPassword" class="w-5 h-5" />
                <EyeSlashIcon v-else class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <div v-if="isLoading" class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            {{ isLoading ? 'Changing Password...' : 'Change Password' }}
          </button>
        </form>
      </div>

      <!-- Other Admin Actions -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h3 class="font-semibold text-lg text-gray-900 mb-4">Account Actions</h3>
        
        <div class="space-y-3">
          <button
            @click="logout"
            class="w-full flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors duration-200"
          >
            <span class="font-medium">Logout</span>
            <ArrowLeftIcon class="w-5 h-5" />
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Custom styles if needed */
</style>




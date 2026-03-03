<template>
  <nuc-settings-card heading="Account details">
    <div class="profile-settings">
      <section class="profile-section">
        <h4 class="profile-section-title">Your organizational account details, activity status</h4>
      </section>

      <section class="profile-surface">
        <div class="profile-picture-row">
          <div class="profile-picture-left">
            <div class="profile-avatar-wrap">
              <ad-avatar
                v-if="avatarPreview"
                :image="avatarPreview"
                size="xlarge"
                shape="square"
                class="profile-avatar-clickable"
                @click="triggerFileInput"
              />
              <ad-avatar
                v-else
                :label="avatarLabel"
                size="xlarge"
                shape="square"
                class="profile-avatar-clickable"
                @click="triggerFileInput"
              />
              <div
                class="avatar-edit-corner"
                @click="triggerFileInput"
              >
                <ad-icon icon="prime:pencil" />
              </div>
            </div>

            <div>
              <div class="profile-account-line">
                <p class="profile-picture-title">{{ fullName }}</p>
                <span class="profile-status">Active</span>
              </div>
              <p class="profile-picture-subtitle">{{ form.email }}</p>
              <p class="profile-picture-subtitle">{{ accountPhone }}</p>
              <p class="profile-picture-meta">
                Account active since
                <strong>{{ accountSinceLabel }}</strong>
              </p>
            </div>
          </div>

          <div class="avatar-actions">
            <ad-button
              :label="isSavingProfile ? 'Saving...' : 'Edit'"
              ad-type="main"
              outlined
              size="small"
              :disabled="isSavingProfile"
              @click="saveProfile"
            />
            <ad-button
              label="Cancel account"
              ad-type="main"
              outlined
              size="small"
              severity="danger"
              disabled
            />
          </div>
        </div>

        <div class="avatar-upload-actions">
          <ad-button
            v-if="avatarPreview"
            :label="isDeletingAvatar ? 'Deleting...' : 'Delete'"
            ad-type="main"
            outlined
            size="small"
            :disabled="isDeletingAvatar || isUploadingAvatar"
            @click="removeAvatar"
          />
        </div>

        <input
          ref="fileInputRef"
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          class="hidden-file-input"
          @change="onFileSelected"
        />

        <hr class="settings-card-divider">

        <div class="profile-export-row">
          <div>
            <h4 class="profile-section-title">Export account data</h4>
            <p class="profile-section-subtitle">
              Create with XML/JSON file all your account data
            </p>
          </div>
          <ad-button
            label="Export data"
            ad-type="main"
            text
            size="small"
            disabled
          />
        </div>
      </section>

      <section class="profile-section">
        <h4 class="profile-section-title">Account preference</h4>
        <p class="profile-section-subtitle">
          Your organizational account interface, language and localization.
        </p>
      </section>

      <section class="profile-surface">
        <div class="preference-row">
          <div class="preference-left">
            <span class="integration-icon">A</span>
            <div>
              <p class="integration-title">Language</p>
              <p class="integration-subtitle">Your organizational language</p>
            </div>
          </div>
          <ad-select
            v-model="preferences.language"
            :options="languageOptions"
            option-label="label"
            option-value="value"
            ad-type="main"
            class="profile-select"
          />
        </div>

        <hr class="settings-card-divider">

        <div class="preference-row">
          <div class="preference-left">
            <span class="integration-icon">G</span>
            <div>
              <p class="integration-title">Country</p>
              <p class="integration-subtitle">Country preference</p>
            </div>
          </div>
          <ad-select
            v-model="preferences.country"
            :options="countryOptions"
            option-label="label"
            option-value="value"
            ad-type="main"
            class="profile-select"
          />
        </div>
      </section>
    </div>
  </nuc-settings-card>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'

import type { UseToastInterface } from 'atomic'
import {
  apiRequest,
  getAndSetUser,
  sessionStorageGetItem,
  useAtomicToast,
} from 'atomic'

import type { NucUserObjectInterface } from '../../../atomic/bosons/types/object/User/interfaces'
import { userRequests } from '../../../atomic/bosons/utils/api/user_requests'

const MAX_AVATAR_SIZE_BYTES = 15 * 1024 * 1024
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
]

const fileInputRef = ref<HTMLInputElement | null>(null)
const avatarPreview = ref<string | null>(null)
const isUploadingAvatar = ref(false)
const isDeletingAvatar = ref(false)
const isSavingProfile = ref(false)

const userId = Number(sessionStorageGetItem('user_id'))

const { flashToast }: UseToastInterface = useAtomicToast()

const form = reactive({
  firstName: '',
  lastName: '',
  email: sessionStorageGetItem('user_email') ?? '',
})

const preferences = reactive({
  language: 'en',
  country: 'netherlands',
})

const languageOptions = [
  { label: 'English', value: 'en' },
  { label: 'Polish', value: 'pl' },
  { label: 'Vietnamese', value: 'vn' },
]

const countryOptions = [
  { label: 'Netherlands', value: 'netherlands' },
  { label: 'Poland', value: 'poland' },
  { label: 'Germany', value: 'germany' },
]

const avatarLabel = computed(() => {
  const first = form.firstName.trim().charAt(0)
  const last = form.lastName.trim().charAt(0)
  return `${first}${last}`.trim().toUpperCase() || '?'
})

const fullName = computed(() => {
  return `${form.firstName} ${form.lastName}`.trim() || 'Unknown user'
})

const accountPhone = computed(
  () => sessionStorageGetItem('user_phone') ?? '+44 20 7323 4667'
)

const accountSinceLabel = computed(() => {
  const createdAt = sessionStorageGetItem('user_created_at')

  if (!createdAt) return 'Unknown'

  const createdDate = new Date(createdAt)
  if (Number.isNaN(createdDate.getTime())) return 'Unknown'

  return createdDate.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
})

function splitName(name: string): void {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  form.firstName = parts[0] ?? ''
  form.lastName = parts.slice(1).join(' ')
}

async function refreshAvatarPreview(): Promise<void> {
  try {
    const response = await apiRequest<NucUserObjectInterface>(
      `${apiUrl()}/user`
    )
    const avatarPath = (response as NucUserObjectInterface)?.avatar
    const appBaseUrl = appUrl().replace(/\/$/, '')

    avatarPreview.value = avatarPath
      ? `${appBaseUrl}/storage/${avatarPath}`
      : null
  } catch {
    avatarPreview.value = null
  }
}

onMounted(async () => {
  splitName(sessionStorageGetItem('user_name') ?? '')
  await refreshAvatarPreview()
})

function triggerFileInput(): void {
  fileInputRef.value?.click()
}

function onFileSelected(event: Event): void {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    flashToast('Unsupported file type. Use PNG, JPEG, GIF or WEBP.', 'error')
    target.value = ''
    return
  }

  if (file.size > MAX_AVATAR_SIZE_BYTES) {
    flashToast('Image is too large. Maximum allowed size is 15MB.', 'error')
    target.value = ''
    return
  }

  avatarPreview.value = URL.createObjectURL(file)
  void uploadAvatar(file)
}

async function uploadAvatar(file: File): Promise<void> {
  const formData = new FormData()
  formData.append('avatar', file)

  try {
    isUploadingAvatar.value = true
    await apiRequest(`${apiUrl()}/users/${userId}/avatar`, 'POST', formData)
    await refreshAvatarPreview()
    await getAndSetUser()
    flashToast('Profile picture updated successfully.', 'success')
  } catch {
    flashToast('Avatar upload failed. Please try again.', 'error')
    await refreshAvatarPreview()
  } finally {
    isUploadingAvatar.value = false
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
  }
}

async function removeAvatar(): Promise<void> {
  try {
    isDeletingAvatar.value = true
    await apiRequest(`${apiUrl()}/users/${userId}/avatar`, 'DELETE')
    avatarPreview.value = null
    await refreshAvatarPreview()
    await getAndSetUser()
    flashToast('Profile picture removed.', 'success')
  } catch {
    flashToast('Failed to remove profile picture.', 'error')
  } finally {
    isDeletingAvatar.value = false
  }
}

async function saveProfile(): Promise<void> {
  if (!form.firstName.trim() || !form.email.trim()) {
    flashToast('First name and email are required.', 'error')
    return
  }

  const { editUser } = userRequests()
  const fullName = `${form.firstName} ${form.lastName}`.trim()

  const data: NucUserObjectInterface = {
    id: userId,
    name: fullName,
    email: form.email.trim(),
    role: sessionStorageGetItem('user_role') ?? 'user',
  }

  try {
    isSavingProfile.value = true
    await editUser(data, async () => {
      await getAndSetUser()
    })
    flashToast('Profile details saved.', 'success')
  } finally {
    isSavingProfile.value = false
  }
}
</script>

<template>
  <nuc-settings-card :heading="t('profile-account-details')">
    <div class="profile-settings">
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
              <div
                v-if="avatarPreview"
                class="avatar-delete-corner"
                :class="{ disabled: isDeletingAvatar || isUploadingAvatar }"
                @click="onRemoveAvatarClick"
              >
                <ad-icon icon="prime:trash" />
              </div>
            </div>

            <div>
              <div class="profile-account-line">
                <p class="profile-picture-title">{{ fullName }}</p>
                <span class="profile-status">{{ t('common-active') }}</span>
              </div>
              <p class="profile-picture-subtitle">{{ form.email }}</p>
              <p class="profile-picture-subtitle">{{ accountPhone }}</p>
            </div>
          </div>

          <nuc-profile-actions
            :user-id="userId"
            :current-lang="currentLang"
            :account-since-label="accountSinceLabel"
            :edit-profile-data="editProfileData"
            :profile-edit-fields="profileEditFields"
            @profile-saved="onProfileSaved"
          />
        </div>

        <input
          ref="fileInputRef"
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          class="hidden-file-input"
          @change="onFileSelected"
        />

      </section>

      <h4 class="profile-section-title">{{ t('profile-account-preference') }}</h4>

      <section class="profile-surface">
        <div class="preference-row">
          <div class="preference-left">
            <span class="integration-icon">
              <ad-icon icon="prime:language" />
            </span>
            <div>
              <p class="integration-title">{{ t('profile-language') }}</p>
              <p class="integration-subtitle">{{ t('profile-language-desc') }}</p>
            </div>
          </div>
          <ad-select
            v-model="preferences.language"
            :options="languageOptions"
            option-label="label"
            option-value="value"
            ad-type="main"
            class="profile-select"
            @update:model-value="onLanguageChange"
          />
        </div>

        <hr class="settings-card-divider">

        <div class="preference-row">
          <div class="preference-left">
            <span class="integration-icon">
              <ad-icon icon="prime:globe" />
            </span>
            <div>
              <p class="integration-title">{{ t('profile-country') }}</p>
              <p class="integration-subtitle">{{ t('profile-country-desc') }}</p>
            </div>
          </div>
          <ad-select
            v-model="preferences.country"
            :options="countries"
            option-label="label"
            option-value="value"
            ad-type="main"
            class="profile-select"
            @update:model-value="onCountryChange"
          />
        </div>
      </section>

      <h4 class="profile-section-title">{{ t('profile-security') }}</h4>

      <section class="profile-surface">
        <div class="preference-row">
          <div class="preference-left">
            <span class="integration-icon">
              <ad-icon icon="prime:lock" />
            </span>
            <div>
              <p class="integration-title">{{ t('profile-password') }}</p>
              <p class="integration-subtitle">{{ t('profile-password-desc') }}</p>
            </div>
          </div>
          <ad-button
            :label="t('profile-change-password')"
            ad-type="main"
            outlined
            size="small"
            @click="isPasswordDialogVisible = true"
          />
        </div>

        <hr class="settings-card-divider">

        <div class="preference-row">
          <div class="preference-left">
            <span class="integration-icon">
              <ad-icon icon="prime:shield" />
            </span>
            <div>
              <p class="integration-title">{{ t('profile-2fa') }}</p>
              <p class="integration-subtitle">{{ t('profile-2fa-desc') }}</p>
            </div>
          </div>
          <span class="coming-soon-badge">{{ t('common-coming-soon') }}</span>
        </div>
      </section>
    </div>

    <nuc-dialog
      :visible="isPasswordDialogVisible"
      :modal="true"
      :draggable="false"
      entity="user"
      action="edit"
      :title="t('profile-change-password')"
      :cancel-button-label="t('common-cancel')"
      :confirm-button-label="t('profile-update-password')"
      :confirm-button-disabled="isChangingPassword || !isPasswordFormValid"
      :confirm="onChangePassword"
      :close="closePasswordDialog"
      @update:visible="isPasswordDialogVisible = $event"
    >
      <template #content>
        <div class="password-dialog-fields">
          <div class="password-dialog-field">
            <label for="current-password">{{ t('profile-current-password') }}</label>
            <ad-password
              id="nuc-pwd-cur"
              v-model="passwordForm.currentPassword"
              ad-type="main"
              :feedback="false"
              toggle-mask
              autocomplete="one-time-code"
            />
          </div>
          <div class="password-dialog-field">
            <label for="nuc-pwd-new">{{ t('profile-new-password') }}</label>
            <ad-password
              id="nuc-pwd-new"
              v-model="passwordForm.newPassword"
              ad-type="main"
              toggle-mask
              autocomplete="one-time-code"
            />
          </div>
          <div class="password-dialog-field">
            <label for="nuc-pwd-confirm">{{ t('profile-confirm-password') }}</label>
            <ad-password
              id="nuc-pwd-confirm"
              v-model="passwordForm.confirmPassword"
              ad-type="main"
              toggle-mask
              autocomplete="one-time-code"
              :passwords-match="doPasswordsMatch"
              :empty-password="isEmpty(passwordForm.newPassword)"
              :empty-confirm-password="isEmpty(passwordForm.confirmPassword)"
            />
          </div>
        </div>
      </template>
    </nuc-dialog>

  </nuc-settings-card>
</template>

<script setup lang="ts">
import { useNuxtApp, useRoute, useRouter } from 'nuxt/app'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import {
  ACCEPTED_IMAGE_TYPES,
  countries,
  isEmpty,
  NucProfileActions,
  passwordsMatch,
  sessionStorageGetItem,
  sessionStorageSetItem,
  useAtomicToast,
  userRequests,
} from 'atomic'

const { t } = useI18n()

const MAX_AVATAR_SIZE_BYTES = 15 * 1024 * 1024
const DEFAULT_LANGUAGE = 'en'
const DEFAULT_COUNTRY = 'poland'

const fileInputRef = ref<HTMLInputElement | null>(null)
const avatarPreview = ref<string | null>(null)
const isUploadingAvatar = ref(false)
const isDeletingAvatar = ref(false)

const userId = Number(sessionStorageGetItem('user_id'))
const route = useRoute()
const router = useRouter()
const nuxtApp = useNuxtApp()
const currentLang = computed(
  () => (route.params.lang as string) || DEFAULT_LANGUAGE
)

const { flashToast } = useAtomicToast()
const {
  handleRemoveAvatar,
  handleUploadAvatar,
  handleChangePassword,
  savePreferences,
  refreshAvatarPreview,
} = userRequests()

const isChangingPassword = ref(false)
const isPasswordDialogVisible = ref(false)

watch(isPasswordDialogVisible, (visible) => {
  if (visible) {
    setTimeout(() => resetPasswordForm(), 50)
  }
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const doPasswordsMatch = computed(() =>
  passwordsMatch(passwordForm.newPassword, passwordForm.confirmPassword)
)

const isPasswordFormValid = computed(
  () =>
    passwordForm.currentPassword.length > 0 &&
    passwordForm.newPassword.length >= 8 &&
    doPasswordsMatch.value
)

function resetPasswordForm(): void {
  passwordForm.currentPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
}

function closePasswordDialog(): void {
  isPasswordDialogVisible.value = false
  resetPasswordForm()
}

async function onChangePassword(): Promise<void> {
  await handleChangePassword(
    userId,
    passwordForm.currentPassword,
    passwordForm.newPassword,
    passwordForm.confirmPassword,
    isChangingPassword
  )
  closePasswordDialog()
}

const onRemoveAvatarClick = (): Promise<void> =>
  handleRemoveAvatar(userId, isDeletingAvatar, avatarPreview)

const form = reactive({
  firstName: '',
  lastName: '',
  email: sessionStorageGetItem('user_email') ?? '',
})

const preferences = reactive({
  language: sessionStorageGetItem('user_language') || currentLang.value,
  country: sessionStorageGetItem('user_country') || DEFAULT_COUNTRY,
})

const editProfileData = computed(() => ({
  firstName: form.firstName,
  lastName: form.lastName,
  email: form.email,
  phone_number:
    accountPhone.value === 'No phone specified' ? '' : accountPhone.value,
}))

const profileEditFields = [
  {
    name: 'firstName',
    key: 'firstName',
    label: 'profile-first-name',
    type: 'input-text',
  },
  {
    name: 'lastName',
    key: 'lastName',
    label: 'profile-last-name',
    type: 'input-text',
  },
  { name: 'email', key: 'email', label: 'profile-email', type: 'input-text' },
  {
    name: 'phone_number',
    key: 'phone_number',
    label: 'profile-phone-number',
    type: 'input-text',
  },
]

function onProfileSaved(data: {
  firstName: string
  lastName: string
  email: string
  phone_number: string
}): void {
  form.firstName = data.firstName
  form.lastName = data.lastName
  form.email = data.email
  sessionStorageSetItem('user_phone_number', data.phone_number || '')
}

const languageOptions = [
  { label: 'English', value: 'en' },
  { label: 'Polski', value: 'pl' },
  { label: 'Tiếng Việt', value: 'vn' },
]

const avatarLabel = computed(() => {
  const first = form.firstName.trim().charAt(0)
  const last = form.lastName.trim().charAt(0)
  return `${first}${last}`.trim().toUpperCase() || '?'
})

const fullName = computed(() => {
  return (
    `${form.firstName} ${form.lastName}`.trim() || t('profile-unknown-user')
  )
})

const accountPhone = computed(
  () => sessionStorageGetItem('user_phone_number') || t('profile-no-phone')
)

const accountSinceLabel = computed(() => {
  const createdAt = sessionStorageGetItem('user_created_at')

  if (!createdAt) return t('common-unknown')

  const createdDate = new Date(createdAt)
  if (Number.isNaN(createdDate.getTime())) return t('common-unknown')

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

async function loadAvatarPreview(): Promise<void> {
  try {
    avatarPreview.value = await refreshAvatarPreview(userId)
  } catch {
    avatarPreview.value = null
  }
}

onMounted(async () => {
  splitName(sessionStorageGetItem('user_name') ?? '')
  await loadAvatarPreview()
})

watch(currentLang, (newLang) => {
  preferences.language = newLang
})

function triggerFileInput(): void {
  fileInputRef.value?.click()
}

function validateAvatarFile(file: File, target: HTMLInputElement): boolean {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    flashToast(t('toast-unsupported-file-type'), 'error')
    target.value = ''
    return false
  }

  if (file.size > MAX_AVATAR_SIZE_BYTES) {
    flashToast(t('toast-image-too-large'), 'error')
    target.value = ''
    return false
  }

  return true
}

function onFileSelected(event: Event): void {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return
  if (!validateAvatarFile(file, target)) return

  avatarPreview.value = URL.createObjectURL(file)
  void handleUploadAvatar(
    userId,
    file,
    isUploadingAvatar,
    fileInputRef,
    avatarPreview
  )
}

async function onLanguageChange(newLang: string): Promise<void> {
  if (!newLang || newLang === currentLang.value) return

  // biome-ignore lint/suspicious/noExplicitAny: $i18n is provided by @nuxtjs/i18n
  const i18n = nuxtApp.$i18n as any
  if (i18n) {
    i18n.locale.value = newLang
  }

  const newPath = route.fullPath.replace(
    `/${currentLang.value}/`,
    `/${newLang}/`
  )

  await savePreferences(userId, { language: newLang })
  await router.push(newPath)
}

async function onCountryChange(newCountry: string): Promise<void> {
  if (!newCountry) return

  try {
    await savePreferences(userId, { country: newCountry })
  } catch {
    flashToast(t('toast-country-save-failed'), 'error')
  }
}
</script>

<style lang="scss">
@import 'index';
</style>

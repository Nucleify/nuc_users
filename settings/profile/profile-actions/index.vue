<template>
  <div class="profile-actions-wrap">
    <p class="profile-actions-meta">
      {{ t('profile-account-since') }}
      <strong>{{ props.accountSinceLabel }}</strong>
    </p>

    <div class="profile-actions">
      <ad-button
        :label="t('profile-edit-account')"
        ad-type="main"
        outlined
        size="small"
        :disabled="isSavingProfile"
        @click="isEditProfileDialogVisible = true"
      />
      <ad-button
        :label="t('profile-delete-account')"
        outlined
        size="small"
        severity="danger"
        :disabled="isDeletingAccount"
        @click="isDeleteAccountDialogVisible = true"
      />
    </div>
  </div>

  <nuc-dialog
    :visible="isEditProfileDialogVisible"
    :modal="true"
    :draggable="false"
    entity="user"
    action="edit"
    :title="t('profile-edit-profile')"
    :data="editDialogData"
    :selected-object="editDialogData"
    :fields="props.profileEditFields"
    :cancel-button-label="t('common-cancel')"
    :confirm-button-label="t('common-save')"
    :confirm-button-disabled="isSavingProfile"
    :confirm="confirmEditProfile"
    :close="closeEditDialog"
    @update:visible="isEditProfileDialogVisible = $event"
  />

  <nuc-dialog
    :visible="isDeleteAccountDialogVisible"
    :modal="true"
    :draggable="false"
    action="delete"
    :title="t('profile-delete-account')"
    :selected-object="{ id: props.userId }"
    :cancel-button-label="t('common-cancel')"
    :confirm-button-label="t('common-delete')"
    :confirm-button-disabled="isDeletingAccount"
    :confirm="confirmDeleteAccount"
    :close="closeDeleteDialog"
    @update:visible="isDeleteAccountDialogVisible = $event"
  >
    <template #content>
      <p>
        {{ t('profile-delete-confirm') }}
      </p>
    </template>
  </nuc-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import type { UseToastInterface } from 'atomic'
import { useAtomicToast, userRequests } from 'atomic'

const { t } = useI18n()

type ProfileEditDataType = {
  firstName: string
  lastName: string
  email: string
  phone_number: string
}

type ProfileEditFieldType = {
  name: string
  key: string
  label: string
  type: string
}

const props = defineProps<{
  userId: number
  currentLang: string
  accountSinceLabel: string
  editProfileData: ProfileEditDataType
  profileEditFields: ProfileEditFieldType[]
}>()

const { flashToast }: UseToastInterface = useAtomicToast()
const { handleDeleteAccount, handleSaveProfile } = userRequests()

const isSavingProfile = ref(false)
const isDeletingAccount = ref(false)
const isEditProfileDialogVisible = ref(false)
const isDeleteAccountDialogVisible = ref(false)
const editDialogData = ref<ProfileEditDataType>({
  firstName: '',
  lastName: '',
  email: '',
  phone_number: '',
})

const emit = defineEmits<{
  profileSaved: [value: ProfileEditDataType]
}>()

const closeEditDialog = (): void => {
  isEditProfileDialogVisible.value = false
}

const closeDeleteDialog = (): void => {
  isDeleteAccountDialogVisible.value = false
}

watch(
  () => isEditProfileDialogVisible.value,
  (visible) => {
    if (visible) {
      editDialogData.value = { ...props.editProfileData }
    }
  }
)

async function confirmEditProfile(data?: ProfileEditDataType): Promise<void> {
  const firstName = data?.firstName ?? ''
  const lastName = data?.lastName ?? ''
  const email = data?.email ?? ''
  const phoneNumber = data?.phone_number ?? ''

  if (!firstName.trim() || !email.trim()) {
    flashToast(t('toast-name-email-required'), 'error')
    return
  }

  await handleSaveProfile(
    props.userId,
    firstName,
    lastName,
    email,
    phoneNumber,
    isSavingProfile
  )
  emit('profileSaved', {
    firstName,
    lastName,
    email,
    phone_number: phoneNumber,
  })
  isEditProfileDialogVisible.value = false
}

async function confirmDeleteAccount(): Promise<void> {
  await handleDeleteAccount(
    props.userId,
    props.currentLang,
    isDeleteAccountDialogVisible,
    isDeletingAccount
  )
}
</script>

<style lang="scss">
@import 'index';
</style>

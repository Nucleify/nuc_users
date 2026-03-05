<template>
  <div class="profile-actions-wrap">
    <p class="profile-actions-meta">
      Account active since
      <strong>{{ props.accountSinceLabel }}</strong>
    </p>

    <div class="profile-actions">
      <ad-button
        label="Edit account"
        ad-type="main"
        outlined
        size="small"
        :disabled="isSavingProfile"
        @click="isEditProfileDialogVisible = true"
      />
      <ad-button
        label="Delete account"
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
    title="Edit profile"
    :data="editDialogData"
    :selected-object="editDialogData"
    :fields="props.profileEditFields"
    cancel-button-label="Cancel"
    confirm-button-label="Save"
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
    title="Delete account"
    :selected-object="{ id: props.userId }"
    cancel-button-label="Cancel"
    confirm-button-label="Delete"
    :confirm-button-disabled="isDeletingAccount"
    :confirm="confirmDeleteAccount"
    :close="closeDeleteDialog"
    @update:visible="isDeleteAccountDialogVisible = $event"
  >
    <template #content>
      <p>
        Are you sure you want to delete your account? This action cannot be undone.
      </p>
    </template>
  </nuc-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

import type { UseToastInterface } from 'atomic'
import { useAtomicToast, userRequests } from 'atomic'

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
    flashToast('First name and email are required.', 'error')
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

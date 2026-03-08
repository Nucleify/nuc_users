import { navigateTo } from 'nuxt/app'
import type { Ref } from 'vue'
import { ref } from 'vue'

import type {
  ApiResponseType,
  CloseDialogType,
  EntityCountResultsType,
  EntityResultsType,
  UseLoadingInterface,
} from 'nucleify'
import {
  apiHandle,
  apiRequest,
  getAndSetUser,
  removeUserFromSessionStorage,
  sessionStorageGetItem,
  useApiSuccess,
  useAtomicToast,
  useLoading,
} from 'nucleify'

import type { NucUserRequestsInterface } from '../../types/api/User/interfaces'
import type { NucUserObjectInterface } from '../../types/object/User/interfaces'

export function userRequests(
  close?: CloseDialogType
): NucUserRequestsInterface {
  const results: EntityResultsType<NucUserObjectInterface> = ref([])
  const createdLastWeek: EntityCountResultsType = ref(0)

  const { loading, setLoading }: UseLoadingInterface = useLoading()
  const { apiSuccess } = useApiSuccess()
  const { flashToast } = useAtomicToast()

  async function getAllUsers(loading?: boolean): Promise<void> {
    await apiHandle<NucUserObjectInterface[]>({
      url: apiUrl() + '/users',
      setLoading: loading ? setLoading : undefined,
      onSuccess: (response: NucUserObjectInterface[]) => {
        results.value = response
      },
    })
  }

  async function getCountUsersByCreatedLastWeek(
    loading?: boolean
  ): Promise<void> {
    await apiHandle<number>({
      url: apiUrl() + '/users/count-by-created-last-week',
      setLoading: loading ? setLoading : undefined,
      onSuccess: (response: number) => {
        createdLastWeek.value = response
      },
    })
  }

  async function getUser(loading?: boolean): Promise<void> {
    await apiHandle<NucUserObjectInterface>({
      url: apiUrl() + '/user',
      setLoading: loading ? setLoading : undefined,
      onSuccess: (response: NucUserObjectInterface) => {
        // @ts-expect-error TODO: fix this later
        results.value = response
      },
    })
  }

  async function storeUser(
    data: NucUserObjectInterface,
    getData: () => Promise<void>
  ): Promise<void> {
    await apiHandle<NucUserObjectInterface>({
      url: apiUrl() + '/users',
      method: 'POST',
      data,
      onSuccess: (response: NucUserObjectInterface) => {
        apiSuccess(response, getData, close, 'create')
      },
    })
  }

  async function editUser(
    data: NucUserObjectInterface,
    getData: () => Promise<void>
  ): Promise<void> {
    await apiHandle<NucUserObjectInterface>({
      url: apiUrl() + '/users',
      method: 'PUT',
      data,
      id: data.id,
      onSuccess: (response: NucUserObjectInterface) => {
        apiSuccess(response, getData, close, 'edit')
      },
    })
  }

  async function deleteUser(
    id: number,
    getData: () => Promise<void>
  ): Promise<void> {
    await apiHandle<NucUserObjectInterface>({
      url: apiUrl() + '/users',
      method: 'DELETE',
      id,
      onSuccess: (response: NucUserObjectInterface) => {
        apiSuccess(response, getData, close, 'delete')
      },
    })
  }

  async function getAuthenticatedUser(): Promise<NucUserObjectInterface> {
    const response = await apiRequest<NucUserObjectInterface>(
      `${apiUrl()}/user`
    )
    const payload = response as ApiResponseType<NucUserObjectInterface>

    return 'data' in payload ? payload.data : payload
  }

  async function uploadUserAvatar(id: number, file: File): Promise<void> {
    const formData = new FormData()
    formData.append('avatar', file)

    await apiRequest(`${apiUrl()}/users/${id}/avatar`, 'POST', formData)
  }

  async function deleteUserAvatar(id: number): Promise<void> {
    await apiRequest(`${apiUrl()}/users/${id}/avatar`, 'DELETE')
  }

  async function refreshAvatarPreview(id: number): Promise<string | null> {
    const user = await getAuthenticatedUser()
    const avatarPath = user?.avatar

    if (!avatarPath) return null

    const apiBaseUrl = apiUrl().replace(/\/$/, '')
    return `${apiBaseUrl}/users/${id}/avatar/show?v=${Date.now()}`
  }

  async function saveProfile(
    id: number,
    firstName: string,
    lastName: string,
    email: string,
    phoneNumber: string
  ): Promise<void> {
    const fullName = `${firstName} ${lastName}`.trim()
    const data: NucUserObjectInterface = {
      id,
      name: fullName,
      email: email.trim(),
      phone_number: phoneNumber.trim() || undefined,
      role: sessionStorageGetItem('user_role') ?? 'user',
    }

    await editUser(data, getAndSetUser)
  }

  async function uploadAvatar(id: number, file: File): Promise<string | null> {
    await uploadUserAvatar(id, file)
    await getAndSetUser()

    return await refreshAvatarPreview(id)
  }

  async function removeAvatar(id: number): Promise<string | null> {
    await deleteUserAvatar(id)
    await getAndSetUser()

    return await refreshAvatarPreview(id)
  }

  async function savePreferences(
    id: number,
    data: { language?: string; country?: string }
  ): Promise<void> {
    await apiRequest(`${apiUrl()}/users/${id}/preferences`, 'PATCH', data)
    await getAndSetUser()
  }

  async function deleteAccount(id: number): Promise<void> {
    await deleteUser(id, () => Promise.resolve())
  }

  async function changePassword(
    id: number,
    currentPassword: string,
    newPassword: string,
    newPasswordConfirmation: string
  ): Promise<void> {
    await apiRequest(`${apiUrl()}/users/${id}/password`, 'PUT', {
      current_password: currentPassword,
      password: newPassword,
      password_confirmation: newPasswordConfirmation,
    })
  }

  async function handleChangePassword(
    id: number,
    currentPassword: string,
    newPassword: string,
    newPasswordConfirmation: string,
    isChangingPassword: Ref<boolean>
  ): Promise<void> {
    try {
      isChangingPassword.value = true
      await changePassword(
        id,
        currentPassword,
        newPassword,
        newPasswordConfirmation
      )
      flashToast('Password updated successfully.', 'success')
    } catch {
      flashToast(
        'Failed to update password. Check your current password.',
        'error'
      )
    } finally {
      isChangingPassword.value = false
    }
  }

  async function handleUploadAvatar(
    id: number,
    file: File,
    isUploadingAvatar: Ref<boolean>,
    fileInputRef: Ref<HTMLInputElement | null>,
    avatarPreview: Ref<string | null>
  ): Promise<void> {
    try {
      isUploadingAvatar.value = true
      avatarPreview.value = await uploadAvatar(id, file)
      flashToast('Profile picture updated successfully.', 'success')
    } catch {
      flashToast('Avatar upload failed. Please try again.', 'error')
      avatarPreview.value = await refreshAvatarPreview(id)
    } finally {
      isUploadingAvatar.value = false
      if (fileInputRef.value) {
        fileInputRef.value.value = ''
      }
    }
  }

  async function handleRemoveAvatar(
    id: number,
    isDeletingAvatar: Ref<boolean>,
    avatarPreview: Ref<string | null>
  ): Promise<void> {
    try {
      isDeletingAvatar.value = true
      avatarPreview.value = await removeAvatar(id)
      flashToast('Profile picture removed.', 'success')
    } catch {
      flashToast('Failed to remove profile picture.', 'error')
    } finally {
      isDeletingAvatar.value = false
    }
  }

  async function handleSaveProfile(
    id: number,
    firstName: string,
    lastName: string,
    email: string,
    phoneNumber: string,
    isSavingProfile: Ref<boolean>
  ): Promise<void> {
    if (!firstName.trim() || !email.trim()) {
      flashToast('First name and email are required.', 'error')
      return
    }

    try {
      isSavingProfile.value = true
      await saveProfile(id, firstName, lastName, email, phoneNumber)
      flashToast('Profile details saved.', 'success')
    } finally {
      isSavingProfile.value = false
    }
  }

  async function handleDeleteAccount(
    id: number,
    lang: string,
    isDeleteAccountDialogVisible: Ref<boolean>,
    isDeletingAccount: Ref<boolean>
  ): Promise<void> {
    try {
      isDeletingAccount.value = true
      await deleteAccount(id)

      removeUserFromSessionStorage()
      flashToast('Account deleted successfully.', 'success')
      isDeleteAccountDialogVisible.value = false

      await navigateTo(`/${lang}/login`)
    } catch {
      flashToast('Failed to delete account. Please try again.', 'error')
    } finally {
      isDeletingAccount.value = false
    }
  }

  return {
    results,
    createdLastWeek,
    loading,
    getAllUsers,
    getCountUsersByCreatedLastWeek,
    getUser,
    storeUser,
    editUser,
    deleteUser,
    getAuthenticatedUser,
    uploadUserAvatar,
    deleteUserAvatar,
    refreshAvatarPreview,
    saveProfile,
    uploadAvatar,
    removeAvatar,
    deleteAccount,
    savePreferences,
    changePassword,
    handleChangePassword,
    handleUploadAvatar,
    handleRemoveAvatar,
    handleSaveProfile,
    handleDeleteAccount,
  }
}

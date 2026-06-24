'use client'

import type {
  ApiResponseType,
  AppFramework,
  CloseDialogType,
  NucUserObjectInterface,
  NucUserRequestsInterface,
  UseLoadingInterface,
} from 'nucleify'
import {
  apiHandle,
  apiRequest,
  createEntityRequestState,
  createEntityRequestsCore,
  flashToast,
  getAndSetUser,
  removeUserFromSessionStorage,
  sessionStorageGetItem,
  useApiSuccess,
  useLoading,
} from 'nucleify'

const USERS_URL = '/users'
const USER_URL = '/user'

type MutableRef<T> = { value: T }

function createUserEntityRequests(options: {
  close?: CloseDialogType
  apiSuccess: Parameters<
    typeof createEntityRequestsCore<NucUserObjectInterface>
  >[0]['apiSuccess']
  setResults: (response: NucUserObjectInterface[]) => void
  setCreatedLastWeek: (count: number) => void
  setLoading?: (loading: boolean) => void
}) {
  const { getAll, getCountByCreatedLastWeek, store, edit, remove } =
    createEntityRequestsCore<NucUserObjectInterface>({
      baseUrl: USERS_URL,
      ...options,
    })

  const { setResults, setLoading } = options

  async function getUser(showLoading?: boolean): Promise<void> {
    await apiHandle<NucUserObjectInterface>({
      url: USER_URL,
      setLoading: showLoading ? setLoading : undefined,
      onSuccess: (response) => {
        // @ts-expect-error TODO: fix this later
        setResults(response)
      },
    })
  }

  async function getAuthenticatedUser(): Promise<NucUserObjectInterface> {
    const response = await apiRequest<NucUserObjectInterface>(USER_URL)
    const payload = response as ApiResponseType<NucUserObjectInterface>

    return 'data' in payload ? payload.data : payload
  }

  async function uploadUserAvatar(id: number, file: File): Promise<void> {
    const formData = new FormData()
    formData.append('avatar', file)

    await apiRequest(`${USERS_URL}/${id}/avatar`, 'POST', formData)
  }

  async function deleteUserAvatar(id: number): Promise<void> {
    await apiRequest(`${USERS_URL}/${id}/avatar`, 'DELETE')
  }

  async function refreshAvatarPreview(id: number): Promise<string | null> {
    const user = await getAuthenticatedUser()
    const avatarPath = user?.avatar

    if (!avatarPath) return null

    return `/api/users/${id}/avatar/show?v=${Date.now()}`
  }

  async function saveProfile(
    id: number,
    firstName: string,
    lastName: string,
    email: string,
    phoneNumber: string,
    editUser: (
      data: NucUserObjectInterface,
      getData: () => Promise<void>
    ) => Promise<void>,
    getData: () => Promise<void>
  ): Promise<void> {
    const fullName = `${firstName} ${lastName}`.trim()
    const data: NucUserObjectInterface = {
      id,
      name: fullName,
      email: email.trim(),
      phone_number: phoneNumber.trim() || undefined,
      role: sessionStorageGetItem('user_role') ?? 'user',
    }

    await edit(data, getData)
  }

  async function uploadAvatar(
    id: number,
    file: File,
    getData: () => Promise<void>
  ): Promise<string | null> {
    await uploadUserAvatar(id, file)
    await getData()

    return await refreshAvatarPreview(id)
  }

  async function removeAvatar(
    id: number,
    getData: () => Promise<void>
  ): Promise<string | null> {
    await deleteUserAvatar(id)
    await getData()

    return await refreshAvatarPreview(id)
  }

  async function savePreferences(
    id: number,
    data: { language?: string; country?: string },
    getData: () => Promise<void>
  ): Promise<void> {
    await apiRequest(`${USERS_URL}/${id}/preferences`, 'PATCH', data)
    await getData()
  }

  async function changePassword(
    id: number,
    currentPassword: string,
    newPassword: string,
    newPasswordConfirmation: string
  ): Promise<void> {
    await apiRequest(`${USERS_URL}/${id}/password`, 'PUT', {
      current_password: currentPassword,
      password: newPassword,
      password_confirmation: newPasswordConfirmation,
    })
  }

  return {
    getAllUsers: getAll,
    getCountUsersByCreatedLastWeek: getCountByCreatedLastWeek,
    getUser,
    storeUser: store,
    editUser: edit,
    deleteUser: remove,
    getAuthenticatedUser,
    uploadUserAvatar,
    deleteUserAvatar,
    refreshAvatarPreview,
    saveProfile,
    uploadAvatar,
    removeAvatar,
    savePreferences,
    changePassword,
  }
}

export function userRequests(
  close?: CloseDialogType,
  framework: AppFramework = 'nuxt'
): NucUserRequestsInterface {
  const { results, createdLastWeek, setResults, setCreatedLastWeek } =
    createEntityRequestState<NucUserObjectInterface>(framework)

  const { loading, setLoading }: UseLoadingInterface = useLoading()
  const { apiSuccess } = useApiSuccess()

  const core = createUserEntityRequests({
    close,
    apiSuccess,
    setResults,
    setCreatedLastWeek,
    setLoading,
  })

  async function saveProfile(
    id: number,
    firstName: string,
    lastName: string,
    email: string,
    phoneNumber: string
  ): Promise<void> {
    await core.saveProfile(
      id,
      firstName,
      lastName,
      email,
      phoneNumber,
      core.editUser,
      getAndSetUser
    )
  }

  async function uploadAvatar(id: number, file: File): Promise<string | null> {
    return core.uploadAvatar(id, file, getAndSetUser)
  }

  async function removeAvatar(id: number): Promise<string | null> {
    return core.removeAvatar(id, getAndSetUser)
  }

  async function deleteAccount(id: number): Promise<void> {
    await core.deleteUser(id, () => Promise.resolve())
  }

  async function savePreferences(
    id: number,
    data: { language?: string; country?: string }
  ): Promise<void> {
    await core.savePreferences(id, data, getAndSetUser)
  }

  async function handleChangePassword(
    id: number,
    currentPassword: string,
    newPassword: string,
    newPasswordConfirmation: string,
    isChangingPassword: MutableRef<boolean>
  ): Promise<void> {
    try {
      isChangingPassword.value = true
      await core.changePassword(
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
    isUploadingAvatar: MutableRef<boolean>,
    fileInputRef: MutableRef<HTMLInputElement | null>,
    avatarPreview: MutableRef<string | null>
  ): Promise<void> {
    try {
      isUploadingAvatar.value = true
      avatarPreview.value = await uploadAvatar(id, file)
      flashToast('Profile picture updated successfully.', 'success')
    } catch {
      flashToast('Avatar upload failed. Please try again.', 'error')
      avatarPreview.value = await core.refreshAvatarPreview(id)
    } finally {
      isUploadingAvatar.value = false
      if (fileInputRef.value) {
        fileInputRef.value.value = ''
      }
    }
  }

  async function handleRemoveAvatar(
    id: number,
    isDeletingAvatar: MutableRef<boolean>,
    avatarPreview: MutableRef<string | null>
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
    isSavingProfile: MutableRef<boolean>
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
    isDeleteAccountDialogVisible: MutableRef<boolean>,
    isDeletingAccount: MutableRef<boolean>
  ): Promise<void> {
    try {
      isDeletingAccount.value = true
      await deleteAccount(id)

      removeUserFromSessionStorage()
      flashToast('Account deleted successfully.', 'success')
      isDeleteAccountDialogVisible.value = false

      if (typeof window !== 'undefined') {
        window.location.href = `/${lang}/login`
      }
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
    getAllUsers: core.getAllUsers,
    getCountUsersByCreatedLastWeek: core.getCountUsersByCreatedLastWeek,
    getUser: core.getUser,
    storeUser: core.storeUser,
    editUser: core.editUser,
    deleteUser: core.deleteUser,
    getAuthenticatedUser: core.getAuthenticatedUser,
    uploadUserAvatar: core.uploadUserAvatar,
    deleteUserAvatar: core.deleteUserAvatar,
    refreshAvatarPreview: core.refreshAvatarPreview,
    saveProfile,
    uploadAvatar,
    removeAvatar,
    deleteAccount,
    savePreferences,
    changePassword: core.changePassword,
    handleChangePassword,
    handleUploadAvatar,
    handleRemoveAvatar,
    handleSaveProfile,
    handleDeleteAccount,
  }
}

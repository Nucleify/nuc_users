import type { Ref } from 'vue'

import type {
  DeleteEntityRequestType,
  EditEntityRequestType,
  EntityCountResultsType,
  EntityResultsType,
  GetAllEntitiesRequestType,
  GetEntityRequestType,
  LoadingRefType,
  StoreEntityRequestType,
} from 'nucleify'
import type { NucUserObjectInterface } from '../../object/User/interfaces'

export interface NucUserRequestsInterface {
  results: EntityResultsType<NucUserObjectInterface>
  createdLastWeek: EntityCountResultsType
  loading: LoadingRefType
  getAllUsers: GetAllEntitiesRequestType<NucUserObjectInterface>
  getCountUsersByCreatedLastWeek: GetEntityRequestType
  getUser: GetAllEntitiesRequestType<NucUserObjectInterface>
  storeUser: StoreEntityRequestType<NucUserObjectInterface>
  editUser: EditEntityRequestType<NucUserObjectInterface>
  deleteUser: DeleteEntityRequestType
  getAuthenticatedUser: () => Promise<NucUserObjectInterface>
  uploadUserAvatar: (id: number, file: File) => Promise<void>
  deleteUserAvatar: (id: number) => Promise<void>
  refreshAvatarPreview: (id: number) => Promise<string | null>
  saveProfile: (
    id: number,
    firstName: string,
    lastName: string,
    email: string,
    phoneNumber: string
  ) => Promise<void>
  uploadAvatar: (id: number, file: File) => Promise<string | null>
  removeAvatar: (id: number) => Promise<string | null>
  deleteAccount: (id: number) => Promise<void>
  savePreferences: (
    id: number,
    data: { language?: string; country?: string }
  ) => Promise<void>
  changePassword: (
    id: number,
    currentPassword: string,
    newPassword: string,
    newPasswordConfirmation: string
  ) => Promise<void>
  handleChangePassword: (
    id: number,
    currentPassword: string,
    newPassword: string,
    newPasswordConfirmation: string,
    isChangingPassword: Ref<boolean>
  ) => Promise<void>
  handleUploadAvatar: (
    id: number,
    file: File,
    isUploadingAvatar: Ref<boolean>,
    fileInputRef: Ref<HTMLInputElement | null>,
    avatarPreview: Ref<string | null>
  ) => Promise<void>
  handleRemoveAvatar: (
    id: number,
    isDeletingAvatar: Ref<boolean>,
    avatarPreview: Ref<string | null>
  ) => Promise<void>
  handleSaveProfile: (
    id: number,
    firstName: string,
    lastName: string,
    email: string,
    phoneNumber: string,
    isSavingProfile: Ref<boolean>
  ) => Promise<void>
  handleDeleteAccount: (
    id: number,
    lang: string,
    isDeleteAccountDialogVisible: Ref<boolean>,
    isDeletingAccount: Ref<boolean>
  ) => Promise<void>
}

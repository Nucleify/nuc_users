import type { Ref } from 'vue'

import type {
  LoginFieldsInterface,
  LoginInputInterface,
  RegisterFieldsInterface,
  RegisterInputInterface,
} from 'nucleify'

type SetFields<T> = (value: T | ((prev: T) => T)) => void

interface UseAuthFormBaseInterface {
  loginInputs: readonly LoginInputInterface[]
  registerInputs: readonly RegisterInputInterface[]
  submitForm: (
    data: LoginFieldsInterface | RegisterFieldsInterface
  ) => Promise<boolean>
  submitAndGo: (
    data: LoginFieldsInterface | RegisterFieldsInterface
  ) => Promise<void>
}

export interface UseAuthFormNuxtInterface extends UseAuthFormBaseInterface {
  loginFields: Ref<LoginFieldsInterface>
  setLoginFields: SetFields<LoginFieldsInterface>
  registerFields: Ref<RegisterFieldsInterface>
  setRegisterFields: SetFields<RegisterFieldsInterface>
}

export interface UseAuthFormNextInterface extends UseAuthFormBaseInterface {
  loginFields: LoginFieldsInterface
  setLoginFields: SetFields<LoginFieldsInterface>
  registerFields: RegisterFieldsInterface
  setRegisterFields: SetFields<RegisterFieldsInterface>
}

export type UseAuthFormInterface =
  | UseAuthFormNuxtInterface
  | UseAuthFormNextInterface

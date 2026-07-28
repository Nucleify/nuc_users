import type {
  InputInterface,
  LoginFieldKey,
  LoginFieldsInterface,
  LoginInputInterface,
} from 'nucleify'

export const initialLoginFields: LoginFieldsInterface = {
  email: '',
  password: '',
}

const inputData: readonly [LoginFieldKey, string, string, string, boolean][] = [
  ['email', 'email', 'email', 'auth-field-email', false],
  ['password', 'password', 'password', 'auth-field-password', false],
] as const

export const loginInputs: readonly LoginInputInterface[] = inputData.map(
  ([model, type, id, label, autofocus]): InputInterface<LoginFieldKey> => ({
    model,
    type,
    id,
    label,
    autofocus,
  })
)

import type {
  InputInterface,
  RegisterFieldKey,
  RegisterFieldsInterface,
  RegisterInputInterface,
} from 'nucleify'

export const initialRegisterFields: RegisterFieldsInterface = {
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
}

const registerInputData: readonly [
  RegisterFieldKey,
  string,
  string,
  string,
  boolean,
][] = [
  ['name', 'text', 'name', 'auth-field-full-name', true],
  ['email', 'email', 'email', 'auth-field-email', false],
  ['password', 'password', 'password', 'auth-field-password', false],
  [
    'password_confirmation',
    'password',
    'password_confirmation',
    'auth-field-confirm-password',
    false,
  ],
] as const

export const registerInputs: readonly RegisterInputInterface[] =
  registerInputData.map(
    ([
      model,
      type,
      id,
      label,
      autofocus,
    ]): InputInterface<RegisterFieldKey> => ({
      model,
      type,
      id,
      label,
      autofocus,
    })
  )

'use client'

import type {
  AppFramework,
  LoginFieldsInterface,
  RegisterFieldsInterface,
  UseAuthFormNextInterface,
  UseAuthFormNuxtInterface,
} from 'nucleify'
import {
  createAuthFormState,
  flashToast,
  navigateToUrl,
  syncColorsWithDatabase,
} from 'nucleify'

import { submitAuthForm } from './submit_auth_form'

import { initialLoginFields, loginInputs } from '../constants/login'
import { initialRegisterFields, registerInputs } from '../constants/register'

type LangSource = string | (() => string)

function resolveLang(lang: LangSource): string {
  return typeof lang === 'function' ? lang() : lang
}

export function useAuthForm(
  framework: 'next',
  lang?: LangSource
): UseAuthFormNextInterface
export function useAuthForm(
  framework?: 'nuxt',
  lang?: LangSource
): UseAuthFormNuxtInterface
export function useAuthForm(
  framework: AppFramework = 'nuxt',
  lang: LangSource = 'en'
): UseAuthFormNextInterface | UseAuthFormNuxtInterface {
  const { loginFields, setLoginFields, registerFields, setRegisterFields } =
    createAuthFormState<LoginFieldsInterface, RegisterFieldsInterface>(
      framework,
      initialLoginFields,
      initialRegisterFields
    )

  async function submitForm(
    data: LoginFieldsInterface | RegisterFieldsInterface
  ): Promise<boolean> {
    const ok = await submitAuthForm(data, (message, severity) => {
      flashToast(message, severity)
    })
    if (ok) await syncColorsWithDatabase()
    return ok
  }

  async function submitAndGo(
    data: LoginFieldsInterface | RegisterFieldsInterface
  ): Promise<void> {
    if (!(await submitForm(data))) return
    navigateToUrl(`/${resolveLang(lang)}/entities`)
  }

  return {
    submitForm,
    submitAndGo,
    loginFields,
    setLoginFields,
    loginInputs,
    registerFields,
    setRegisterFields,
    registerInputs,
  }
}

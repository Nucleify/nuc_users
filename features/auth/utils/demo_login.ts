'use client'

import type { SupabaseClient } from '@supabase/supabase-js'

import {
  apiRequest,
  flashToast,
  getSupabaseClient,
  navigateToUrl,
  resolveApiHandleData,
  syncColorsWithDatabase,
} from 'nucleify'

import { getAndSetUser } from './get_and_set_user'
import { getCurrentLang } from './get_current_lang'

export interface DemoLoginOptions {
  lang?: string
  supabase?: SupabaseClient
  t?: (key: string) => string
  flashToast?: (message: string, type: 'success' | 'error') => void
}

export async function demoLogin(options: DemoLoginOptions = {}): Promise<void> {
  const lang = options.lang ?? getCurrentLang()
  const t = options.t ?? ((key: string) => key)
  const toast = options.flashToast ?? flashToast
  const supabase = options.supabase ?? getSupabaseClient()

  let creds: { email: string; password: string }
  try {
    const response = await apiRequest<{ email: string; password: string }>(
      '/users/demo',
      'POST'
    )
    creds = resolveApiHandleData<{ email: string; password: string }>(response)
  } catch {
    toast(t('dev-check-demo-failed'), 'error')
    return
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: creds.email,
    password: creds.password,
  })
  if (error) {
    toast(t('dev-check-demo-failed'), 'error')
    return
  }

  await getAndSetUser(supabase)
  await syncColorsWithDatabase()
  navigateToUrl(`/${lang}/entities`)
}

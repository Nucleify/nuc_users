import { getSupabaseClient, navigateToUrl } from 'nucleify'

import { getCurrentLang } from './get_current_lang'
import { removeUserFromSessionStorage } from './remove_user_from_session_storage'

export async function logout(): Promise<void> {
  const lang = getCurrentLang()
  const supabase = getSupabaseClient()
  await supabase.auth.signOut()

  removeUserFromSessionStorage()

  navigateToUrl(`/${lang}/login`)
}

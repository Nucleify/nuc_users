import {
  flashToast,
  getSupabaseClient,
  humanizeSupabaseError,
  syncColorsWithDatabase,
} from 'nucleify'

import { getAndSetUser } from './get_and_set_user'

import type { UserRoleType } from '../../../types/api/User/variables'
import type { LoginFieldsInterface } from '../types/login/interfaces'

export async function testLogin(role: UserRoleType): Promise<void> {
  const credentials: Record<UserRoleType, LoginFieldsInterface | undefined> = {
    user: { email: 'test_user@nucleify.io', password: 'test_user123' },
    admin: { email: 'admin@nucleify.io', password: 'password' },
    test_user: { email: 'test_user@nucleify.io', password: 'test_user123' },
    test_admin: { email: 'test_admin@nucleify.io', password: 'test_admin123' },
    test_tech: { email: 'test_tech@nucleify.io', password: 'test_tech123' },
    tech: { email: 'test_tech@nucleify.io', password: 'test_tech123' },
    super_admin: { email: 's.radomski19@gmail.com', password: 'password' },
    demo: { email: '', password: '' },
  }

  const userCredentials = credentials[role]

  if (!userCredentials?.email) {
    console.error('Invalid role:', role)
    return
  }

  const supabase = getSupabaseClient()
  const { error } = await supabase.auth.signInWithPassword(userCredentials)
  if (error) {
    flashToast(humanizeSupabaseError(error), 'error')
    return
  }
  await getAndSetUser(supabase)
  await syncColorsWithDatabase()
}

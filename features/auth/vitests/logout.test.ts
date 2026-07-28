import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as nucleify from 'nucleify'

vi.mock('nuxt/app', async (importOriginal) => {
  const actual = await importOriginal<typeof import('nuxt/app')>()
  return {
    ...actual,
    navigateTo: vi.fn().mockResolvedValue(undefined),
    useRoute: vi.fn(() => ({ params: { lang: 'en' } })),
  }
})

describe('logout', (): void => {
  beforeEach((): void => {
    vi.clearAllMocks()
    nucleify.mockGlobalFetch(vi, {})

    vi.spyOn(nucleify, 'getSupabaseClient').mockReturnValue({
      auth: {
        signOut: vi.fn().mockResolvedValue(undefined),
      },
    } as never)
    vi.spyOn(nucleify, 'getCurrentLang').mockReturnValue('en')
    vi.spyOn(nucleify, 'navigateToUrl').mockImplementation()

    if (typeof window !== 'undefined') {
      window.sessionStorage.clear()
    }
  })

  it('should be a function that can be called', (): void => {
    expect(typeof nucleify.logout).toBe('function')
  })

  it('should execute without throwing errors', async (): Promise<void> => {
    await expect(nucleify.logout()).resolves.not.toThrow()
  })

  it('should handle the complete logout flow', async (): Promise<void> => {
    await expect(nucleify.logout()).resolves.not.toThrow()
  })

  it('should clear user data from session storage when logged out', async (): Promise<void> => {
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      role: 'user',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      email_verified_at: '2024-01-01T00:00:00Z',
    }

    nucleify.setUserToSessionStorage(mockUser)

    expect(window.sessionStorage.getItem('user_id')).toBe('1')
    expect(window.sessionStorage.getItem('user_name')).toBe('Test User')
    expect(window.sessionStorage.getItem('user_email')).toBe('test@example.com')

    await nucleify.logout()

    const sessionStorageKeys = Object.keys(window.sessionStorage)
    const userKeys = sessionStorageKeys.filter((key) => key.startsWith('user_'))

    userKeys.forEach((key) => {
      const value = window.sessionStorage.getItem(key)
      expect(value === '' || value === null).toBe(true)
    })
  })

  it('should handle logout when no user data exists', async (): Promise<void> => {
    expect(Object.keys(window.sessionStorage)).toHaveLength(0)

    await nucleify.logout()

    expect(Object.keys(window.sessionStorage)).toHaveLength(10)

    const userKeys = [
      'user_id',
      'user_name',
      'user_email',
      'user_role',
      'user_phone_number',
      'user_language',
      'user_country',
      'user_created_at',
      'user_updated_at',
      'user_email_verified_at',
    ]
    userKeys.forEach((key) => {
      expect(window.sessionStorage.getItem(key)).toBe('')
    })
  })

  it('should clear all user-related session storage keys', async (): Promise<void> => {
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      role: 'user',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      email_verified_at: '2024-01-01T00:00:00Z',
    }

    nucleify.setUserToSessionStorage(mockUser)

    window.sessionStorage.setItem('other_data', 'should_remain')

    await nucleify.logout()

    expect(window.sessionStorage.getItem('user_id')).toBe('')
    expect(window.sessionStorage.getItem('user_name')).toBe('')
    expect(window.sessionStorage.getItem('user_email')).toBe('')
    expect(window.sessionStorage.getItem('user_role')).toBe('')
    expect(window.sessionStorage.getItem('user_language')).toBe('')
    expect(window.sessionStorage.getItem('user_country')).toBe('')
    expect(window.sessionStorage.getItem('user_created_at')).toBe('')
    expect(window.sessionStorage.getItem('user_updated_at')).toBe('')
    expect(window.sessionStorage.getItem('user_email_verified_at')).toBe('')

    expect(window.sessionStorage.getItem('other_data')).toBe('should_remain')
  })

  it('should handle logout with partial user data', async (): Promise<void> => {
    window.sessionStorage.setItem('user_id', '1')
    window.sessionStorage.setItem('user_name', 'Test User')

    await nucleify.logout()

    expect(window.sessionStorage.getItem('user_id')).toBe('')
    expect(window.sessionStorage.getItem('user_name')).toBe('')
  })
})

import { beforeEach, describe, expect, it } from 'vitest'

import * as nucleify from 'nucleify'

describe('setUserToSessionStorage', (): void => {
  beforeEach((): void => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.clear()
    }
  })

  it('should store user data in sessionStorage', (): void => {
    nucleify.setUserToSessionStorage(nucleify.mockUser)

    Object.entries(nucleify.mockUser).forEach(([key, value]): void => {
      const sessionStorageValue = window.sessionStorage.getItem(`user_${key}`)
      if (typeof value === 'number') {
        expect(Number(sessionStorageValue)).toBe(value)
      } else {
        expect(sessionStorageValue).toBe(String(value))
      }
    })
  })

  it('should handle null user object', (): void => {
    expect(() => nucleify.setUserToSessionStorage(null)).not.toThrow()
  })

  it('should handle undefined user object', (): void => {
    expect(() => nucleify.setUserToSessionStorage(undefined)).not.toThrow()
  })

  it('should handle user object with null values', (): void => {
    const userWithNulls = {
      id: 1,
      name: null,
      email: 'test@example.com',
      role: 'user',
      created_at: null,
      updated_at: '2024-01-01T00:00:00Z',
      email_verified_at: null,
    }

    expect(() => nucleify.setUserToSessionStorage(userWithNulls)).not.toThrow()
  })

  it('should handle user object with undefined values', (): void => {
    const userWithUndefined = {
      id: 1,
      name: undefined,
      email: 'test@example.com',
      role: 'user',
      created_at: undefined,
      updated_at: '2024-01-01T00:00:00Z',
      email_verified_at: undefined,
    }

    expect(() =>
      nucleify.setUserToSessionStorage(userWithUndefined)
    ).not.toThrow()
  })

  it('should handle empty user object', (): void => {
    const emptyUser = {}

    expect(() => nucleify.setUserToSessionStorage(emptyUser)).not.toThrow()
  })

  it('should handle user object with mixed null/undefined/valid values', (): void => {
    const mixedUser = {
      id: null,
      name: 'Test User',
      email: undefined,
      role: 'user',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: null,
      email_verified_at: undefined,
    }

    expect(() => nucleify.setUserToSessionStorage(mixedUser)).not.toThrow()
  })
})

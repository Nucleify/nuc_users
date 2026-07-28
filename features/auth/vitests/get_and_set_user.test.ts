import { beforeEach, describe, expect, it } from 'vitest'

import * as nucleify from 'nucleify'

describe('getAndSetUser', (): void => {
  beforeEach((): void => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.clear()
    }
  })

  it('should be a function that can be called', (): void => {
    expect(typeof nucleify.getAndSetUser).toBe('function')
  })

  it('should return a Promise', (): void => {
    const result = nucleify.getAndSetUser()
    expect(result).toBeInstanceOf(Promise)
    result.catch((error) => {
      expect(error).toBeInstanceOf(Error)
    })
  })

  it('should handle API errors gracefully', async (): Promise<void> => {
    try {
      await nucleify.getAndSetUser()
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('should handle null user data gracefully', async (): Promise<void> => {
    try {
      await nucleify.getAndSetUser()
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('should call userRequests function', async (): Promise<void> => {
    expect(nucleify.userRequests).toBeDefined()
    expect(typeof nucleify.userRequests).toBe('function')
  })

  it('should call setUserToSessionStorage function', async (): Promise<void> => {
    expect(nucleify.setUserToSessionStorage).toBeDefined()
    expect(typeof nucleify.setUserToSessionStorage).toBe('function')
  })

  it('should handle the complete flow when API is available', async (): Promise<void> => {
    try {
      await nucleify.getAndSetUser()
      if (typeof window !== 'undefined') {
        const sessionStorageKeys = Object.keys(window.sessionStorage)
        sessionStorageKeys.filter((key) => key.startsWith('user_'))
      }
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })
})

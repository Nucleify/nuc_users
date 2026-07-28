import { beforeEach, expect, it } from 'vitest'

import * as nucleify from 'nucleify'

beforeEach((): void => {
  window.sessionStorage.clear()
})

it('should remove user data from sessionStorage', (): void => {
  Object.keys(nucleify.mockUser).forEach((key: string): void => {
    window.sessionStorage.setItem(
      `user_${key}`,
      nucleify.mockUser[key as keyof nucleify.NucUserObjectInterface] as string
    )
  })

  nucleify.removeUserFromSessionStorage()

  Object.keys(nucleify.mockUser).forEach((key: string): void => {
    expect(window.sessionStorage.getItem(`user_${key}`)).toBe('')
  })
})

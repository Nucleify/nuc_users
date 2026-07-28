import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest'

import * as nucleify from 'nucleify'

describe('friendshipRequests', (): void => {
  const requests: nucleify.NucFriendshipRequestsInterface =
    nucleify.friendshipRequests()
  const mockResponse = [nucleify.mockFriendship]

  beforeEach((): void => {
    vi.clearAllMocks()
    nucleify.mockGlobalFetch(vi, mockResponse)
  })

  it('getAllFriendships', async (): Promise<void> => {
    await requests.getAllFriendships()
    expect(globalThis.fetch as Mock).toHaveBeenCalledWith(
      expect.stringContaining('friendship'),
      expect.objectContaining({ method: 'GET' })
    )
    expect(requests.results.value).toEqual(mockResponse)
  })

  it('sendRequest', async (): Promise<void> => {
    await requests.sendRequest(1)
    expect(globalThis.fetch as Mock).toHaveBeenCalledWith(
      expect.stringContaining('friendship'),
      expect.objectContaining({ method: 'POST' })
    )
    expect(requests.results.value).toEqual(mockResponse)
  })

  it('acceptRequest', async (): Promise<void> => {
    await requests.acceptRequest(1)
    expect(globalThis.fetch as Mock).toHaveBeenCalledWith(
      expect.stringContaining('friendship'),
      expect.objectContaining({ method: 'POST' })
    )
    expect(requests.results.value).toEqual(mockResponse)
  })

  it('denyRequest', async (): Promise<void> => {
    await requests.denyRequest(1)
    expect(globalThis.fetch as Mock).toHaveBeenCalledWith(
      expect.stringContaining('friendship'),
      expect.objectContaining({ method: 'POST' })
    )
    expect(requests.results.value).toEqual(mockResponse)
  })

  it('removeFriend', async (): Promise<void> => {
    await requests.removeFriend(1)
    expect(globalThis.fetch as Mock).toHaveBeenCalledWith(
      expect.stringContaining('friendship'),
      expect.objectContaining({ method: 'DELETE' })
    )
    expect(requests.results.value).toEqual(mockResponse)
  })

  it('blockFriend', async (): Promise<void> => {
    await requests.blockFriend(1)
    expect(globalThis.fetch as Mock).toHaveBeenCalledWith(
      expect.stringContaining('friendship'),
      expect.objectContaining({ method: 'POST' })
    )
    expect(requests.results.value).toEqual(mockResponse)
  })

  it('unblockFriend', async (): Promise<void> => {
    await requests.unblockFriend(1)
    expect(globalThis.fetch as Mock).toHaveBeenCalledWith(
      expect.stringContaining('friendship'),
      expect.objectContaining({ method: 'DELETE' })
    )
    expect(requests.results.value).toEqual(mockResponse)
  })
})

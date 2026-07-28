'use client'

import type {
  AppFramework,
  NucFriendshipObjectInterface,
  NucFriendshipRequestsInterface,
} from 'nucleify'
import {
  apiHandle,
  createEntityRequestState,
  useApiSuccess,
  useLoading,
} from 'nucleify'

const FRIENDSHIP_URL = '/friendship'

export function friendshipRequests(
  framework: AppFramework = 'nuxt'
): NucFriendshipRequestsInterface {
  const { results, setResults } =
    createEntityRequestState<NucFriendshipObjectInterface>(framework)

  const { loading, setLoading } = useLoading()
  const { apiSuccess } = useApiSuccess()

  async function getAllFriendships(showLoading?: boolean): Promise<void> {
    await apiHandle<NucFriendshipObjectInterface[]>({
      url: `${FRIENDSHIP_URL}/all`,
      setLoading: showLoading ? setLoading : undefined,
      onSuccess: setResults,
    })
  }

  async function sendRequest(recipientId: number): Promise<void> {
    await apiHandle<{ message: string }>({
      url: `${FRIENDSHIP_URL}/send-request`,
      method: 'POST',
      id: recipientId,
      onSuccess: () => {
        apiSuccess(
          { message: 'Friend request sent successfully' },
          getAllFriendships,
          undefined,
          'create'
        )
      },
    })
  }

  async function acceptRequest(senderId: number): Promise<void> {
    await apiHandle<{ message: string }>({
      url: `${FRIENDSHIP_URL}/accept-request`,
      method: 'POST',
      id: senderId,
      onSuccess: () => {
        apiSuccess(
          { message: 'Friend request accepted successfully' },
          getAllFriendships,
          undefined,
          'edit'
        )
      },
    })
  }

  async function denyRequest(senderId: number): Promise<void> {
    await apiHandle<{ message: string }>({
      url: `${FRIENDSHIP_URL}/deny-request`,
      method: 'POST',
      id: senderId,
      onSuccess: () => {
        apiSuccess(
          { message: 'Friend request denied successfully' },
          getAllFriendships,
          undefined,
          'edit'
        )
      },
    })
  }

  async function removeFriend(friendId: number): Promise<void> {
    await apiHandle<{ message: string }>({
      url: `${FRIENDSHIP_URL}/remove`,
      method: 'DELETE',
      id: friendId,
      onSuccess: () => {
        apiSuccess(
          { message: 'Friend removed successfully' },
          getAllFriendships,
          undefined,
          'delete'
        )
      },
    })
  }

  async function blockFriend(friendId: number): Promise<void> {
    await apiHandle<{ message: string }>({
      url: `${FRIENDSHIP_URL}/block`,
      method: 'POST',
      id: friendId,
      onSuccess: () => {
        apiSuccess(
          { message: 'Friend blocked successfully' },
          getAllFriendships,
          undefined,
          'edit'
        )
      },
    })
  }

  async function unblockFriend(friendId: number): Promise<void> {
    await apiHandle<{ message: string }>({
      url: `${FRIENDSHIP_URL}/unblock`,
      method: 'DELETE',
      id: friendId,
      onSuccess: () => {
        apiSuccess(
          { message: 'Friend unblocked successfully' },
          getAllFriendships,
          undefined,
          'edit'
        )
      },
    })
  }

  return {
    results,
    loading,
    getAllFriendships,
    sendRequest,
    acceptRequest,
    denyRequest,
    removeFriend,
    blockFriend,
    unblockFriend,
  }
}

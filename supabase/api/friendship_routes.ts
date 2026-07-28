import type { ApiAuthRoute } from 'nuc_api'
import { whenAuth } from 'nuc_api'

import {
  handleAcceptRequest,
  handleBlockFriend,
  handleDenyRequest,
  handleListFriends,
  handleRemoveFriend,
  handleSendRequest,
  handleUnblockFriend,
} from './friendship_handlers'

/** GET /friendship/all */
export const routeListFriends = whenAuth(
  { method: 'GET', path: [undefined, 'all'] },
  handleListFriends
)

/** POST /friendship/send-request/:userId */
export const routeSendRequest = whenAuth(
  { method: 'POST', len: 3, path: [undefined, 'send-request'] },
  handleSendRequest
)

/** POST /friendship/accept-request/:userId */
export const routeAcceptRequest = whenAuth(
  { method: 'POST', len: 3, path: [undefined, 'accept-request'] },
  handleAcceptRequest
)

/** POST /friendship/deny-request/:userId */
export const routeDenyRequest = whenAuth(
  { method: 'POST', len: 3, path: [undefined, 'deny-request'] },
  handleDenyRequest
)

/** DELETE /friendship/remove/:userId */
export const routeRemoveFriend = whenAuth(
  { method: 'DELETE', len: 3, path: [undefined, 'remove'] },
  handleRemoveFriend
)

/** POST /friendship/block/:userId */
export const routeBlockFriend = whenAuth(
  { method: 'POST', len: 3, path: [undefined, 'block'] },
  handleBlockFriend
)

/** DELETE /friendship/unblock/:userId */
export const routeUnblockFriend = whenAuth(
  { method: 'DELETE', len: 3, path: [undefined, 'unblock'] },
  handleUnblockFriend
)

export const friendshipRoutes: ApiAuthRoute[] = [
  routeListFriends,
  routeSendRequest,
  routeAcceptRequest,
  routeDenyRequest,
  routeRemoveFriend,
  routeBlockFriend,
  routeUnblockFriend,
]

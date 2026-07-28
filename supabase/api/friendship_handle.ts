import {
  apiMethodNotAllowed,
  apiNotHandled,
  dispatchAuthRoutes,
  withGatewayUser,
} from 'nuc_api'
import type { ApiContext, ApiHandlerResult } from 'nuc_server'

import { friendshipRoutes } from './friendship_routes'

export async function handleFriendshipApi(
  ctx: ApiContext
): Promise<ApiHandlerResult> {
  if (ctx.segments[0] !== 'friendship') return apiNotHandled()

  return withGatewayUser(ctx, async (c, userId) => {
    const result = await dispatchAuthRoutes(friendshipRoutes, c, userId)
    return result ?? apiMethodNotAllowed()
  })
}

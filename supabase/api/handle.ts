import { apiNotHandled, dispatchRoutes } from 'nuc_api'
import type { ApiContext, ApiHandlerResult } from 'nuc_server'

import { handleUserProfilesCrud, usersCrudFallback } from './users_handlers'
import { usersRoutes } from './users_routes'

export async function handleUsersApi(
  ctx: ApiContext
): Promise<ApiHandlerResult> {
  const routed = await dispatchRoutes(usersRoutes, ctx)
  if (routed) return routed

  const crud = await handleUserProfilesCrud(ctx)
  if (crud) return crud

  if (ctx.segments[0] !== 'users') return apiNotHandled()

  return usersCrudFallback()
}

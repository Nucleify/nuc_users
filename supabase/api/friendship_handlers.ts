import type { ApiContext } from 'nuc_api'
import {
  apiError,
  apiMsg,
  apiOk,
  fetchUserProfiles,
  fromSupabaseError,
  normalizeUuid,
  nowIso,
  seg,
} from 'nuc_api'
import type { ApiHandlerResult } from 'nuc_server'

import {
  computeFriendUserId,
  deleteFriendshipsBetween,
  listRowsForUser,
  mapFriendshipListItem,
  pendingRequestIds,
  unblockFriendship,
  updateFriendshipsBetween,
} from './friendship_helpers'

const otherUserId = (ctx: ApiContext) => normalizeUuid(seg(ctx, 2)!)

export async function handleListFriends(
  ctx: ApiContext,
  userId: string
): Promise<ApiHandlerResult | null> {
  const { rows, error } = await listRowsForUser(ctx.supabase, userId)
  if (error) return fromSupabaseError({ message: error })

  const profiles = await fetchUserProfiles(
    ctx.supabase,
    rows.map((r) => computeFriendUserId(r, userId)),
    'id,name,email,role'
  )
  return apiOk(
    ctx,
    rows.map((r) => mapFriendshipListItem(r, userId, profiles))
  )
}

export async function handleSendRequest(
  ctx: ApiContext,
  userId: string
): Promise<ApiHandlerResult | null> {
  const recipientId = normalizeUuid(seg(ctx, 2))
  if (!recipientId || recipientId === userId)
    return apiError(422, 'Invalid recipient')

  const { data: target } = await ctx.supabase
    .from('user_profiles')
    .select('id')
    .eq('id', recipientId)
    .maybeSingle()
  if (!target) return apiError(404, 'User not found')

  const { rows } = await listRowsForUser(ctx.supabase, userId)
  if (rows.some((r) => computeFriendUserId(r, userId) === recipientId))
    return apiError(409, 'Friendship already exists')

  const { error } = await ctx.supabase.from('friendships').insert({
    recipient_id: recipientId,
    requester_id: userId,
    sender_id: userId,
    status: 'pending',
    created_at: nowIso(),
    updated_at: nowIso(),
  })
  return error
    ? fromSupabaseError(error, 400)
    : apiMsg('Friend request sent successfully')
}

export async function handleAcceptRequest(
  ctx: ApiContext,
  userId: string
): Promise<ApiHandlerResult | null> {
  return respondToPending(
    ctx,
    userId,
    'accept',
    'Friend request accepted successfully'
  )
}

export async function handleDenyRequest(
  ctx: ApiContext,
  userId: string
): Promise<ApiHandlerResult | null> {
  return respondToPending(
    ctx,
    userId,
    'deny',
    'Friend request denied successfully'
  )
}

export async function handleRemoveFriend(
  ctx: ApiContext,
  userId: string
): Promise<ApiHandlerResult | null> {
  const { error } = await deleteFriendshipsBetween(
    ctx.supabase,
    userId,
    otherUserId(ctx)
  )
  return error
    ? fromSupabaseError({ message: error }, 400)
    : apiMsg('Friend removed successfully')
}

export async function handleBlockFriend(
  ctx: ApiContext,
  userId: string
): Promise<ApiHandlerResult | null> {
  const { error } = await updateFriendshipsBetween(
    ctx.supabase,
    userId,
    otherUserId(ctx),
    {
      status: 'blocked',
      updated_at: nowIso(),
    }
  )
  return error
    ? fromSupabaseError({ message: error }, 400)
    : apiMsg('Friend blocked successfully')
}

export async function handleUnblockFriend(
  ctx: ApiContext,
  userId: string
): Promise<ApiHandlerResult | null> {
  const { error } = await unblockFriendship(
    ctx.supabase,
    userId,
    otherUserId(ctx)
  )
  return error
    ? fromSupabaseError({ message: error }, 400)
    : apiMsg('Friend unblocked successfully')
}

async function respondToPending(
  ctx: ApiContext,
  userId: string,
  action: 'accept' | 'deny',
  message: string
): Promise<ApiHandlerResult | null> {
  const { rows } = await listRowsForUser(ctx.supabase, userId)
  const ids = pendingRequestIds(rows, userId, otherUserId(ctx))
  if (!ids.length) return apiError(404, 'No pending request found')

  const q =
    action === 'accept'
      ? ctx.supabase
          .from('friendships')
          .update({ status: 'accepted', updated_at: nowIso() })
          .in('id', ids)
      : ctx.supabase.from('friendships').delete().in('id', ids)

  const { error } = await q
  return error ? fromSupabaseError(error, 400) : apiMsg(message)
}

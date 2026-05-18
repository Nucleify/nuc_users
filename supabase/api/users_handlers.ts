import { readMultipartFormData } from 'h3'

import {
  apiBody,
  apiError,
  apiOk,
  fromSupabaseError,
  fromThrown,
  nowIso,
  requireGatewayUser,
  tryScopedCrud,
} from 'nuc_api'
import type { ApiContext, ApiHandlerResult } from 'nuc_server'
import {
  formatRowResponseTimestamps,
  formatRowsResponseTimestamps,
} from 'nuc_server'

import { createDemoUser } from './users_demo'
import {
  AVATAR_MAX_BYTES,
  AVATAR_MIME,
  avatarExtension,
  mapProfileToPayload,
} from './users_helpers'

export async function handleCreateDemoUser(
  ctx: ApiContext
): Promise<ApiHandlerResult | null> {
  if (process.env.NODE_ENV === 'production') {
    return apiError(403, 'Demo user creation is disabled in production.')
  }
  try {
    const creds = await createDemoUser(ctx.supabase)
    return apiBody(creds, 201)
  } catch (e) {
    return fromThrown(e, 400)
  }
}

export async function handleCurrentUser(
  ctx: ApiContext
): Promise<ApiHandlerResult | null> {
  const auth = await requireGatewayUser(ctx)
  if ('handled' in auth) return auth
  const { data: profile, error } = await ctx.supabase
    .from('user_profiles')
    .select('*')
    .eq('id', auth.user.id)
    .maybeSingle()
  if (error) return fromSupabaseError(error)
  if (!profile) return apiError(404, 'Profile not found')
  return apiOk(
    ctx,
    formatRowResponseTimestamps(
      mapProfileToPayload(profile as Record<string, unknown>, auth.user)
    )
  )
}

export async function handleAvatar(
  ctx: ApiContext
): Promise<ApiHandlerResult | null> {
  const auth = await requireGatewayUser(ctx)
  if ('handled' in auth) return auth
  if (ctx.segments[1] !== auth.user.id) return apiError(403, 'Forbidden')

  if (ctx.method === 'DELETE') {
    const { data: listed, error: listErr } = await ctx.supabase.storage
      .from('avatars')
      .list(auth.user.id)
    if (!listErr && listed?.length) {
      await ctx.supabase.storage
        .from('avatars')
        .remove(
          listed.map((f: { name: string }) => `${auth.user.id}/${f.name}`)
        )
    }
    const { data, error } = await ctx.supabase
      .from('user_profiles')
      .update({ avatar: null, updated_at: nowIso() })
      .eq('id', auth.user.id)
      .select('*')
      .single()
    return error
      ? fromSupabaseError(error, 400)
      : apiOk(ctx, formatRowResponseTimestamps(data))
  }

  const filePart = (await readMultipartFormData(ctx.event))?.find(
    (p) => p.name === 'avatar' && p.data?.length
  )
  if (!filePart?.data?.length || !filePart.type)
    return apiError(400, 'Missing avatar file')
  if (!AVATAR_MIME.has(filePart.type))
    return apiError(400, 'Unsupported image type')
  if (filePart.data.length > AVATAR_MAX_BYTES)
    return apiError(400, 'File too large')

  const objectPath = `${auth.user.id}/avatar.${avatarExtension(filePart.type)}`
  const { error: upErr } = await ctx.supabase.storage
    .from('avatars')
    .upload(objectPath, filePart.data, {
      contentType: filePart.type,
      upsert: true,
    })
  if (upErr) return fromSupabaseError(upErr)

  const { data: pub } = ctx.supabase.storage
    .from('avatars')
    .getPublicUrl(objectPath)
  const { data, error } = await ctx.supabase
    .from('user_profiles')
    .update({ avatar: pub.publicUrl, updated_at: nowIso() })
    .eq('id', auth.user.id)
    .select('*')
    .single()
  return error
    ? fromSupabaseError(error, 400)
    : apiOk(ctx, formatRowResponseTimestamps(data))
}

export async function handleUserProfilesCrud(
  ctx: ApiContext
): Promise<ApiHandlerResult | null> {
  if (ctx.segments[0] !== 'users') return null

  return tryScopedCrud(ctx, {
    table: 'user_profiles',
    scopeColumn: 'id',
    formatRow: formatRowResponseTimestamps,
    formatRows: formatRowsResponseTimestamps,
    beforeUpdate: (_ctx, scope, id) =>
      scope.mode === 'own' && id !== scope.userId
        ? apiError(403, 'Forbidden')
        : null,
  })
}

export function usersCrudFallback(): ApiHandlerResult {
  return apiBody({ success: true })
}

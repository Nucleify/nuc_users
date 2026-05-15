import { readBody, readMultipartFormData } from 'h3'

import type { User } from '@supabase/supabase-js'
import type {
  ApiContext,
  ApiHandlerResult,
  Json,
} from '../../../../nuxt/server/api/_types'
import {
  formatRowResponseTimestamps,
  formatRowsResponseTimestamps,
} from '../../../../nuxt/server/api/format_timestamptz_response'
import {
  gatewayUserFromJwt,
  resolveGatewayListScope,
} from '../../../../nuxt/server/api/gateway_auth'

const AVATAR_MAX_BYTES = 15 * 1024 * 1024
const AVATAR_MIME = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
])

function mapProfileToPayload(
  profile: Record<string, unknown>,
  user: User
): Record<string, unknown> {
  return {
    id: profile.id,
    name: String(profile.name ?? ''),
    email: String(profile.email ?? user.email ?? ''),
    phone_number: profile.phone_number ?? undefined,
    avatar: profile.avatar ?? undefined,
    language: profile.language ?? undefined,
    country: profile.country ?? undefined,
    role: String(profile.role ?? 'user'),
    created_at: profile.created_at ?? undefined,
    updated_at: profile.updated_at ?? undefined,
    email_verified_at: user.email_confirmed_at ?? undefined,
  }
}

export async function handleUsersApi(
  ctx: ApiContext
): Promise<ApiHandlerResult> {
  const { segments, method, supabase, ok } = ctx

  if (segments[0] === 'user' && method === 'GET') {
    const auth = await gatewayUserFromJwt(supabase, ctx.event)
    if ('error' in auth)
      return { handled: true, status: auth.status, body: { error: auth.error } }

    const { data: profile, error: pErr } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', auth.user.id)
      .maybeSingle()
    if (pErr)
      return { handled: true, status: 500, body: { error: pErr.message } }
    if (!profile)
      return {
        handled: true,
        status: 404,
        body: { error: 'Profile not found' },
      }

    return {
      handled: true,
      body: ok(
        formatRowResponseTimestamps(
          mapProfileToPayload(profile as Record<string, unknown>, auth.user)
        )
      ),
    }
  }

  if (segments[0] !== 'users') return { handled: false }

  if (method === 'GET' && segments.length === 1) {
    const scope = await resolveGatewayListScope(supabase, ctx.event)
    if ('error' in scope)
      return {
        handled: true,
        status: scope.status,
        body: { error: scope.error },
      }

    let q = supabase.from('user_profiles').select('*')
    if (scope.mode === 'own') q = q.eq('id', scope.userId)
    const { data, error } = await q
    if (error)
      return { handled: true, status: 500, body: { error: error.message } }
    return {
      handled: true,
      body: ok(formatRowsResponseTimestamps(data || [])),
    }
  }

  if (
    method === 'GET' &&
    segments.length === 2 &&
    segments[1] === 'count-by-created-last-week'
  ) {
    const scope = await resolveGatewayListScope(supabase, ctx.event)
    if ('error' in scope)
      return {
        handled: true,
        status: scope.status,
        body: { error: scope.error },
      }

    const since = new Date()
    since.setDate(since.getDate() - 7)
    let q = supabase
      .from('user_profiles')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', since.toISOString())
    if (scope.mode === 'own') q = q.eq('id', scope.userId)
    const { count, error } = await q
    if (error)
      return { handled: true, status: 500, body: { error: error.message } }
    return { handled: true, body: ok(count ?? 0) }
  }

  if ((method === 'PUT' || method === 'PATCH') && segments.length === 2) {
    const scope = await resolveGatewayListScope(supabase, ctx.event)
    if ('error' in scope)
      return {
        handled: true,
        status: scope.status,
        body: { error: scope.error },
      }

    if (scope.mode === 'own' && segments[1] !== scope.userId) {
      return { handled: true, status: 403, body: { error: 'Forbidden' } }
    }

    const body = (await readBody(ctx.event)) as Json
    const { data, error } = await supabase
      .from('user_profiles')
      .update(body)
      .eq('id', segments[1])
      .select('*')
      .single()
    if (error)
      return { handled: true, status: 400, body: { error: error.message } }
    return { handled: true, body: ok(formatRowResponseTimestamps(data)) }
  }

  const isAvatarPath =
    segments.length === 3 &&
    segments[2] === 'avatar' &&
    (method === 'POST' || method === 'DELETE')

  if (isAvatarPath) {
    const auth = await gatewayUserFromJwt(supabase, ctx.event)
    if ('error' in auth)
      return { handled: true, status: auth.status, body: { error: auth.error } }

    const pathUserId = segments[1]
    if (!pathUserId || pathUserId !== auth.user.id) {
      return { handled: true, status: 403, body: { error: 'Forbidden' } }
    }

    if (method === 'DELETE') {
      const { data: listed, error: listErr } = await supabase.storage
        .from('avatars')
        .list(auth.user.id)
      if (!listErr && listed?.length) {
        const paths = listed.map((f) => `${auth.user.id}/${f.name}`)
        await supabase.storage.from('avatars').remove(paths)
      }

      const { data: updated, error } = await supabase
        .from('user_profiles')
        .update({ avatar: null, updated_at: new Date().toISOString() })
        .eq('id', auth.user.id)
        .select('*')
        .single()
      if (error)
        return { handled: true, status: 400, body: { error: error.message } }
      return {
        handled: true,
        body: ok(formatRowResponseTimestamps(updated)),
      }
    }

    const parts = await readMultipartFormData(ctx.event)
    const filePart = parts?.find((p) => p.name === 'avatar' && p.data?.length)
    if (!filePart?.data?.length || !filePart.type) {
      return {
        handled: true,
        status: 400,
        body: { error: 'Missing avatar file' },
      }
    }
    if (!AVATAR_MIME.has(filePart.type)) {
      return {
        handled: true,
        status: 400,
        body: { error: 'Unsupported image type' },
      }
    }
    if (filePart.data.length > AVATAR_MAX_BYTES) {
      return { handled: true, status: 400, body: { error: 'File too large' } }
    }

    const ext =
      filePart.type === 'image/jpeg' || filePart.type === 'image/jpg'
        ? 'jpg'
        : filePart.type === 'image/png'
          ? 'png'
          : filePart.type === 'image/webp'
            ? 'webp'
            : filePart.type === 'image/gif'
              ? 'gif'
              : 'bin'

    const objectPath = `${auth.user.id}/avatar.${ext}`
    const { error: upErr } = await supabase.storage
      .from('avatars')
      .upload(objectPath, filePart.data, {
        contentType: filePart.type,
        upsert: true,
      })
    if (upErr)
      return { handled: true, status: 500, body: { error: upErr.message } }

    const { data: pub } = supabase.storage
      .from('avatars')
      .getPublicUrl(objectPath)
    const publicUrl = pub.publicUrl

    const { data: updated, error } = await supabase
      .from('user_profiles')
      .update({ avatar: publicUrl, updated_at: new Date().toISOString() })
      .eq('id', auth.user.id)
      .select('*')
      .single()
    if (error)
      return { handled: true, status: 400, body: { error: error.message } }
    return {
      handled: true,
      body: ok(formatRowResponseTimestamps(updated)),
    }
  }

  return { handled: true, body: { success: true } }
}

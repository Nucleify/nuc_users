import type { User } from '@supabase/supabase-js'

export const AVATAR_MAX_BYTES = 15 * 1024 * 1024
export const AVATAR_MIME = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
])

export function mapProfileToPayload(
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

export function avatarExtension(mime: string): string {
  if (mime === 'image/jpeg' || mime === 'image/jpg') return 'jpg'
  if (mime === 'image/png') return 'png'
  if (mime === 'image/webp') return 'webp'
  if (mime === 'image/gif') return 'gif'
  return 'bin'
}

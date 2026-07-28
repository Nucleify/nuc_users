import { normalizeUuid } from 'nuc_api'
import type { ApiContext } from 'nuc_server'
import { formatRowResponseTimestamps } from 'nuc_server'

export type FriendshipRow = Record<string, unknown>

export function primaryParticipantId(row: FriendshipRow): string {
  const req = row.requester_id
  if (req != null && req !== '') return normalizeUuid(req)
  return normalizeUuid(row.sender_id)
}

export function recipientParticipantId(row: FriendshipRow): string {
  return normalizeUuid(row.recipient_id)
}

export function computeFriendUserId(
  row: FriendshipRow,
  selfId: string
): string {
  const self = normalizeUuid(selfId)
  const a = primaryParticipantId(row)
  const b = recipientParticipantId(row)
  if (a === self) return b
  if (b === self) return a
  return b || a
}

export function mapFriendshipListItem(
  row: FriendshipRow,
  userId: string,
  profiles: Map<string, Record<string, unknown>>
): Record<string, unknown> {
  const formatted = formatRowResponseTimestamps(row) as Record<string, unknown>
  const friendId = computeFriendUserId(row, userId)
  const prof = profiles.get(friendId) ?? {}
  const status = String(formatted.status ?? '')
  return {
    id: formatted.id,
    friend: {
      id: friendId,
      name: String(prof.name ?? ''),
      email: String(prof.email ?? ''),
      role: String(prof.role ?? 'user'),
    },
    status: formatted.status,
    incoming: recipientParticipantId(row) === userId && status === 'pending',
    created_at: formatted.created_at,
    updated_at: formatted.updated_at,
  }
}

export function pendingRequestIds(
  rows: FriendshipRow[],
  userId: string,
  senderId: string
): number[] {
  return rows
    .filter(
      (r) =>
        String(r.status) === 'pending' &&
        recipientParticipantId(r) === userId &&
        primaryParticipantId(r) === senderId
    )
    .map((r) => r.id)
    .filter((id) => id != null) as number[]
}

export async function listRowsForUser(
  supabase: ApiContext['supabase'],
  userId: string
): Promise<{ rows: FriendshipRow[]; error: string | null }> {
  const uid = normalizeUuid(userId)
  const orFilter = `recipient_id.eq.${uid},sender_id.eq.${uid},requester_id.eq.${uid}`
  const { data, error } = await supabase
    .from('friendships')
    .select('*')
    .or(orFilter)
    .order('created_at', { ascending: false })
  if (error) return { rows: [], error: error.message }
  return { rows: (data ?? []) as FriendshipRow[], error: null }
}

export async function deleteFriendshipsBetween(
  supabase: ApiContext['supabase'],
  userId: string,
  otherId: string
): Promise<{ error: string | null }> {
  const uid = normalizeUuid(userId)
  const oid = normalizeUuid(otherId)
  const { rows, error } = await listRowsForUser(supabase, uid)
  if (error) return { error }
  const ids = rows
    .filter((r) => computeFriendUserId(r, uid) === oid)
    .map((r) => r.id)
    .filter((id) => id != null)
  if (ids.length === 0) return { error: null }
  const { error: delErr } = await supabase
    .from('friendships')
    .delete()
    .in('id', ids as number[])
  return { error: delErr?.message ?? null }
}

export async function unblockFriendship(
  supabase: ApiContext['supabase'],
  userId: string,
  friendId: string
): Promise<{ error: string | null }> {
  const { rows, error } = await listRowsForUser(supabase, userId)
  if (error) return { error }
  const ids = rows
    .filter(
      (r) =>
        String(r.status) === 'blocked' &&
        computeFriendUserId(r, userId) === friendId
    )
    .map((r) => r.id)
    .filter((id) => id != null) as number[]
  if (!ids.length) return { error: 'No blocked friendship found' }
  const { error: delErr } = await supabase
    .from('friendships')
    .delete()
    .in('id', ids)
  return { error: delErr?.message ?? null }
}

export async function updateFriendshipsBetween(
  supabase: ApiContext['supabase'],
  userId: string,
  otherId: string,
  patch: Record<string, unknown>
): Promise<{ error: string | null }> {
  const uid = normalizeUuid(userId)
  const oid = normalizeUuid(otherId)
  const { rows, error } = await listRowsForUser(supabase, uid)
  if (error) return { error }
  const ids = rows
    .filter((r) => computeFriendUserId(r, uid) === oid)
    .map((r) => r.id)
    .filter((id) => id != null)
  if (ids.length === 0) return { error: null }
  const { error: upErr } = await supabase
    .from('friendships')
    .update(patch)
    .in('id', ids as number[])
  return { error: upErr?.message ?? null }
}

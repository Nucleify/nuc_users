import { normalizeUuid } from 'nuc_api'
import type { ApiContext } from 'nuc_server'

import {
  type EntityRecordRow,
  type EntityTypeRow,
  flattenRecord,
} from '../../../nuc_entities/supabase/api/registry_helpers'

export type ShareRow = Record<string, unknown>

export function asEntityIdsJson(v: unknown): unknown[] {
  if (!Array.isArray(v)) return []
  return v.map((x) => x)
}

export function asShareEntityNumericIds(v: unknown): number[] {
  if (!Array.isArray(v)) return []
  return v.map((x) => Number(x)).filter((n) => Number.isFinite(n) && n > 0)
}

/** Resolve registry entity type by slug owned by sender (or any matching slug). */
export async function resolveShareEntityType(
  supabase: ApiContext['supabase'],
  entityTypeSlug: unknown
): Promise<{ type: EntityTypeRow | null; error: string | null }> {
  const slug = String(entityTypeSlug ?? '')
    .trim()
    .toLowerCase()
  if (!slug) return { type: null, error: 'Missing entity type' }

  const { data, error } = await supabase
    .from('entity_types')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()
  if (error) return { type: null, error: error.message }
  return { type: (data as EntityTypeRow | null) ?? null, error: null }
}

export async function copySharedEntitiesToReceiver(
  supabase: ApiContext['supabase'],
  opts: {
    entityTypeSlug: string
    entityIds: number[]
    receiverId: string
  }
): Promise<{ error: string | null }> {
  const { entityTypeSlug, entityIds, receiverId } = opts
  if (entityIds.length === 0) return { error: null }

  const { type, error: typeErr } = await resolveShareEntityType(
    supabase,
    entityTypeSlug
  )
  if (typeErr) return { error: typeErr }
  if (!type) return { error: 'Entity type not found' }

  const { data: rows, error: selErr } = await supabase
    .from('entity_records')
    .select('*')
    .eq('entity_type_id', type.id)
    .in('id', entityIds)
  if (selErr) return { error: selErr.message }
  if (!rows?.length) return { error: 'No matching entities found to copy.' }
  if (rows.length !== entityIds.length)
    return { error: 'Some entity ids were not found.' }

  // Ensure receiver has a type with the same slug (create if missing)
  let receiverTypeId = type.id
  if (type.created_by !== receiverId) {
    const { data: existing } = await supabase
      .from('entity_types')
      .select('id')
      .eq('slug', type.slug)
      .eq('created_by', receiverId)
      .maybeSingle()
    if (existing?.id) {
      receiverTypeId = existing.id as string
    } else {
      const now = new Date().toISOString()
      const { data: created, error: createErr } = await supabase
        .from('entity_types')
        .insert({
          slug: type.slug,
          name: type.name,
          description: type.description,
          icon: type.icon,
          category: type.category,
          is_scoped: type.is_scoped,
          created_by: receiverId,
          created_at: now,
          updated_at: now,
        })
        .select('id')
        .single()
      if (createErr) return { error: createErr.message }
      receiverTypeId = created.id as string

      const { data: fields } = await supabase
        .from('entity_fields')
        .select(
          'name,label,field_type,sort_order,required,show_in_table,show_in_form,options'
        )
        .eq('entity_type_id', type.id)
      if (fields?.length) {
        await supabase.from('entity_fields').insert(
          fields.map((f) => ({
            ...f,
            entity_type_id: receiverTypeId,
            created_at: now,
            updated_at: now,
          }))
        )
      }
    }
  }

  const now = new Date().toISOString()
  const inserts = (rows as EntityRecordRow[]).map((row) => {
    const flat = flattenRecord(row)
    const { id: _id, created_at: _c, updated_at: _u, ...data } = flat
    return {
      entity_type_id: receiverTypeId,
      user_id: type.is_scoped ? receiverId : null,
      data,
      created_at: now,
      updated_at: now,
    }
  })

  const { error: insErr } = await supabase
    .from('entity_records')
    .insert(inserts)
  return { error: insErr?.message ?? null }
}

export function mapShareRowForClient(
  row: ShareRow,
  profiles: Map<string, Record<string, unknown>>
): ShareRow {
  const senderId = normalizeUuid(row.sender_id)
  const receiverId = normalizeUuid(row.receiver_id)
  const sp = profiles.get(senderId) ?? {}
  const rp = profiles.get(receiverId) ?? {}
  const entityIdsRaw = row.entity_ids
  const entity_ids = Array.isArray(entityIdsRaw)
    ? entityIdsRaw.map((x) => Number(x)).filter((n) => !Number.isNaN(n))
    : []
  return {
    ...row,
    entity_ids,
    sender: {
      id: senderId,
      name: String(sp.name ?? ''),
      email: String(sp.email ?? ''),
    },
    receiver: {
      id: receiverId,
      name: String(rp.name ?? ''),
      email: String(rp.email ?? ''),
    },
  }
}

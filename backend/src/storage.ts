import { createClient } from '@supabase/supabase-js'

// The backend treats objects as plain JSON; it only relies on every object having an id.
export type BoardObject = { id: string } & Record<string, unknown>

// Boards live in the Supabase table "boards", their objects in "objects".
// This module is the only place that knows about the database.
process.loadEnvFile(new URL('../.env', import.meta.url))
const db = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!)

// The frontend uses camelCase keys (fontSize), the table uses snake_case (font_size).
function toRow(object: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(object).map(([key, value]) => [key.replace(/[A-Z]/g, c => `_${c.toLowerCase()}`), value]),
  )
}

// Empty columns are left out, so objects look the same as before.
function fromRow(row: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(row)
      .filter(([, value]) => value !== null)
      .map(([key, value]) => [key.replace(/_([a-z])/g, (_, c) => c.toUpperCase()), value]),
  ) as BoardObject
}

export async function listBoards() {
  const { data, error } = await db.from('boards').select().order('created_at')
  if (error) throw error
  return data.map(fromRow)
}

// Without an id, the database generates one.
export async function insertBoard(board: { name: string, id?: string }) {
  const { data, error } = await db.from('boards').insert(board).select().single()
  if (error) throw error
  return fromRow(data)
}

// The database also deletes all objects of the board.
export async function deleteBoard(id: string) {
  const { data, error } = await db.from('boards').delete().eq('id', id).select()
  if (error) throw error
  return data.length > 0
}

export async function listObjects(boardId: string) {
  const { data, error } = await db.from('objects').select().eq('board_id', boardId).order('created_at')
  if (error) throw error
  return data.map(fromRow)
}

export async function insertObject(boardId: string, object: BoardObject) {
  const { data, error } = await db.from('objects').insert(toRow({ ...object, boardId })).select().single()
  if (error) throw error
  return fromRow(data)
}

// Objects keep their id and stay on their board.
export async function updateObject(id: string, changes: Record<string, unknown>) {
  const { id: _, boardId: __, ...rest } = changes
  const { data, error } = await db.from('objects').update(toRow(rest)).eq('id', id).select().maybeSingle()
  if (error) throw error
  return data ? fromRow(data) : undefined
}

export async function deleteObject(id: string) {
  const { data, error } = await db.from('objects').delete().eq('id', id).select()
  if (error) throw error
  return data.length > 0
}

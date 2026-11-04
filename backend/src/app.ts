import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { createObject, deleteObject, listObjects, updateObject } from './storage'
import type { BoardObject } from './types'

const NUMBERS = ['x', 'y', 'width', 'height'] as const

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isBoardObject(value: unknown): value is BoardObject {
  return (
    isObject(value) &&
    typeof value.id === 'string' &&
    typeof value.type === 'string' &&
    NUMBERS.every(key => typeof value[key] === 'number')
  )
}

export const app = new Hono()

app.use('*', cors({ origin: 'http://localhost:3000' }))

app.get('/objects', async c => c.json(await listObjects()))

app.post('/objects', async c => {
  const body = await c.req.json().catch(() => null)
  if (!isBoardObject(body)) return c.json({ error: 'Invalid object' }, 400)
  const created = await createObject(body)
  if (!created) return c.json({ error: 'Object already exists' }, 409)
  return c.json(created, 201)
})

app.patch('/objects/:id', async c => {
  const body = await c.req.json().catch(() => null)
  if (!isObject(body)) return c.json({ error: 'Invalid changes' }, 400)
  const updated = await updateObject(c.req.param('id'), body)
  if (!updated) return c.json({ error: 'Object not found' }, 404)
  return c.json(updated)
})

app.delete('/objects/:id', async c => {
  const deleted = await deleteObject(c.req.param('id'))
  if (!deleted) return c.json({ error: 'Object not found' }, 404)
  return c.body(null, 204)
})

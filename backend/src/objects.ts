import { Hono } from 'hono'
import { deleteObject, insertObject, listBoards, listObjects, updateObject } from './storage.js'

// REST routes for the objects on the board.
export const objects = new Hono()

// Temporary bridge until the API knows about boards: every route uses the oldest board.
async function firstBoardId() {
  return (await listBoards())[0].id
}

objects.get('/', async c => c.json(await listObjects(await firstBoardId())))

objects.post('/', async (c) => {
  const object = await c.req.json()
  if (typeof object.id !== 'string') return c.json({ error: 'Object needs an id' }, 400)
  const boardId = await firstBoardId()
  if ((await listObjects(boardId)).some(existing => existing.id === object.id)) {
    return c.json({ error: 'An object with this id already exists' }, 409)
  }
  return c.json(await insertObject(boardId, object), 201)
})

objects.patch('/:id', async (c) => {
  const updated = await updateObject(c.req.param('id'), await c.req.json())
  if (!updated) return c.json({ error: 'Object not found' }, 404)
  return c.json(updated)
})

objects.delete('/:id', async (c) => {
  const deleted = await deleteObject(c.req.param('id'))
  if (!deleted) return c.json({ error: 'Object not found' }, 404)
  return c.body(null, 204)
})

import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { BoardObject } from './types'

// The only place that knows where and how the board is stored.
const FILE = resolve(dirname(fileURLToPath(import.meta.url)), '../data/board.json')

async function read(): Promise<BoardObject[]> {
  try {
    return JSON.parse(await readFile(FILE, 'utf8'))
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []
    throw error
  }
}

// Write to a temp file first, so a crash never leaves a half-written board.json.
async function write(objects: BoardObject[]) {
  await mkdir(dirname(FILE), { recursive: true })
  const temp = `${FILE}.tmp`
  await writeFile(temp, JSON.stringify(objects, null, 2))
  await rename(temp, FILE)
}

// Changes run one after another, so two requests never read-modify-write at the same time.
let queue: Promise<unknown> = Promise.resolve()
function change<T>(task: () => Promise<T>): Promise<T> {
  const result = queue.then(task)
  queue = result.catch(() => {})
  return result
}

export function listObjects() {
  return queue.then(read)
}

// Returns null if an object with this id already exists.
export function createObject(object: BoardObject) {
  return change(async () => {
    const objects = await read()
    if (objects.some(existing => existing.id === object.id)) return null
    await write([...objects, object])
    return object
  })
}

// Returns null if the id is unknown. id and type can not be changed.
export function updateObject(id: string, changes: Partial<BoardObject>) {
  return change(async () => {
    const objects = await read()
    const index = objects.findIndex(object => object.id === id)
    if (index === -1) return null
    const updated = { ...objects[index], ...changes, id, type: objects[index].type }
    objects[index] = updated
    await write(objects)
    return updated
  })
}

// Returns false if the id is unknown.
export function deleteObject(id: string) {
  return change(async () => {
    const objects = await read()
    const remaining = objects.filter(object => object.id !== id)
    if (remaining.length === objects.length) return false
    await write(remaining)
    return true
  })
}

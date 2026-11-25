import type { Board, Member } from '~/types/board'

// The list of boards for the overview. Every change goes through one of the functions below,
// just like useBoard does for the objects on one board.
export function useBoards() {
  // credentials: the login cookie goes along, so the backend knows whose boards to list.
  const api = $fetch.create({ baseURL: useRuntimeConfig().public.apiBase, credentials: 'include' })
  const boards = useState<Board[]>('boards', () => [])

  async function load() {
    boards.value = await api<Board[]>('/boards')
  }

  // Returns undefined if the board does not exist.
  async function getBoard(id: string) {
    try {
      return await api<Board>(`/boards/${id}`)
    }
    catch (error) {
      if ((error as { statusCode?: number }).statusCode === 404) return undefined
      throw error
    }
  }

  // Waits for the backend, because the new board is opened right away and has to exist there.
  async function addBoard(name: string) {
    const board = await api<Board>('/boards', { method: 'POST', body: { id: crypto.randomUUID(), name } })
    boards.value = [board, ...boards.value]
    return board.id
  }

  function renameBoard(id: string, name: string) {
    boards.value = boards.value.map(board => (board.id === id ? { ...board, name } : board))
    api(`/boards/${id}`, { method: 'PATCH', body: { name } })
  }

  function removeBoard(id: string) {
    boards.value = boards.value.filter(board => board.id !== id)
    api(`/boards/${id}`, { method: 'DELETE' })
  }

  // Returns undefined if nobody with this email has logged in yet.
  async function addMember(boardId: string, email: string) {
    try {
      return await api<Member>(`/boards/${boardId}/members`, { method: 'POST', body: { email } })
    }
    catch (error) {
      if ((error as { statusCode?: number }).statusCode === 404) return undefined
      throw error
    }
  }

  return { boards: readonly(boards), load, getBoard, addBoard, renameBoard, removeBoard, addMember }
}

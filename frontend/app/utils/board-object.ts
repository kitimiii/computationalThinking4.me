export type BoardObjectKind = 'note' | 'text' | 'circle'

// One class for everything on the board; `kind` decides how it looks.
// Random ids stay unique even when the server already created some objects.
export class BoardObject {
  id = Math.random().toString(36).slice(2, 10)
  kind!: BoardObjectKind
  x!: number
  y!: number
  width!: number
  height!: number
  color!: string
  fontSize!: string
  bold!: boolean
  border!: boolean
  text!: string

  constructor(init: Omit<BoardObject, 'id'>) {
    Object.assign(this, init)
  }
}

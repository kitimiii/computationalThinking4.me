// What the backend knows about a board object: the common base. Variant-specific
// attributes (text, color, ...) are stored and returned as they come.
export interface BoardObject {
  id: string
  type: string
  x: number
  y: number
  width: number
  height: number
  [attribute: string]: unknown
}

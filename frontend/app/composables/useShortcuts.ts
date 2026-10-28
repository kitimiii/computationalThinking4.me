import type { Variant } from '~/utils/variants'

type Handler = (event: KeyboardEvent) => void

// Keyboard shortcuts for every board action. `add` places a new object in the middle of the screen.
export function useShortcuts(add: (variant: Variant) => void) {
  const board = useBoard()

  function withSelected(action: (object: BoardObject) => void) {
    const object = board.selectedObject.value
    if (object) action(object)
  }

  // Arrow keys move the selected object one grid cell, with Shift they resize it instead.
  function nudge(dx: number, dy: number): Handler {
    return (event) =>
      withSelected((object) => {
        if (!event.shiftKey) return board.updateObject(object.id, { x: object.x + dx, y: object.y + dy })
        board.updateObject(object.id, {
          width: Math.max(board.MIN_SIZE, object.width + dx),
          height: Math.max(board.MIN_SIZE, object.height + dy),
        })
      })
  }

  const SHORTCUTS: Record<string, Handler> = {
    Enter: () => withSelected((object) => board.startEditing(object.id)),
    Escape: () => board.select(null),
    Delete: () => withSelected((object) => board.deleteObject(object.id)),
    Backspace: () => withSelected((object) => board.deleteObject(object.id)),
    ArrowLeft: nudge(-GRID_SIZE, 0),
    ArrowRight: nudge(GRID_SIZE, 0),
    ArrowUp: nudge(0, -GRID_SIZE),
    ArrowDown: nudge(0, GRID_SIZE),
  }

  function toggleBold() {
    withSelected((object) => {
      if (KIND_ATTRIBUTES[object.kind].includes('bold')) board.updateObject(object.id, { bold: !object.bold })
    })
  }

  function onKeyDown(event: KeyboardEvent) {
    // While typing into an object, keys belong to the text.
    if (event.target instanceof HTMLTextAreaElement) return

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'b') {
      event.preventDefault()
      return toggleBold()
    }
    if (event.ctrlKey || event.metaKey || event.altKey) return

    const variant = VARIANTS.find((candidate) => variantKey(candidate) === event.key)
    const handler = variant ? () => add(variant) : SHORTCUTS[event.key]
    if (!handler) return
    event.preventDefault()
    handler(event)
  }

  onMounted(() => window.addEventListener('keydown', onKeyDown))
  onUnmounted(() => window.removeEventListener('keydown', onKeyDown))
}
